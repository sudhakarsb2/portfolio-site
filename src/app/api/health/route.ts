import { sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    await ensureSeeded();
    const result = (await db.execute(
      sql`select count(*)::int as total from projects`,
    )) as unknown as { rows: Array<{ total: number }> } | Array<{ total: number }>;
    const rows = Array.isArray(result) ? result : result.rows;
    return Response.json({ ok: true, projects: rows[0]?.total ?? 0 });
  } catch (error) {
    console.error("[health]", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
