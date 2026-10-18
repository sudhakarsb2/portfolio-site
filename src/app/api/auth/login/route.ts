import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { HttpError, handle, json } from "@/lib/api";
import { createSession, verifyPassword } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";
import { toText } from "@/lib/utils";

export const POST = async (req: Request) =>
  handle(async () => {
    await ensureSeeded();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const email = toText(body.email).toLowerCase();
    const password = toText(body.password);

    if (!email || !password) throw new HttpError("Email and password are both required.", 422);

    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = rows[0];

    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError("Those credentials do not match our records.", 401);
    }

    await createSession(user.id);

    return json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
