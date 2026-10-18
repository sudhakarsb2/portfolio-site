import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsPostgresqlDb?: Database;
};

function getDb(): Database {
  if (globalForDb.__arenaNextJsPostgresqlDb) return globalForDb.__arenaNextJsPostgresqlDb;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required. Add it in your hosting provider's environment variables.",
    );
  }

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ?? new Pool({ connectionString: databaseUrl });
  globalForDb.__arenaNextJsPostgresqlPool = pool;

  const instance = drizzle(pool, { schema });
  globalForDb.__arenaNextJsPostgresqlDb = instance;
  return instance;
}

export const db: Database = new Proxy({} as Database, {
  get(_target, property, receiver) {
    const value = Reflect.get(getDb(), property, receiver);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
