import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings, users } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { toText } from "@/lib/utils";

export const GET = async () =>
  handle(async () => {
    await requireApiUser();
    const rows = await db.select().from(siteSettings);
    return json(rows);
  });

export const PATCH = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const entries = Object.entries(body).filter(([key]) => key !== "password");
    if (!entries.length) throw new HttpError("Nothing to save.", 422);

    for (const [key, value] of entries) {
      const text = toText(value);
      const existing = await db
        .select({ id: siteSettings.id })
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);
      if (existing[0]) {
        await db.update(siteSettings).set({ value: text }).where(eq(siteSettings.id, existing[0].id));
      } else {
        await db.insert(siteSettings).values({ key, value: text, group: "general" });
      }
    }

    const rows = await db.select().from(siteSettings);
    return json(rows);
  });

export const PUT = async (req: Request) =>
  handle(async () => {
    const user = await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const password = toText(body.password);
    const currentPassword = toText(body.currentPassword);
    if (password || currentPassword) {
      if (!password || !currentPassword) {
        throw new HttpError("Both the current and the new password are required.", 422);
      }
      if (password.length < 8) throw new HttpError("Passwords need at least 8 characters.", 422);
      const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      const row = rows[0];
      if (!row || !verifyPassword(currentPassword, row.passwordHash)) {
        throw new HttpError("Your current password is not correct.", 401);
      }
      await db
        .update(users)
        .set({ passwordHash: hashPassword(password) })
        .where(eq(users.id, user.id));
      return json({ ok: true, passwordChanged: true });
    }

    const name = toText(body.name);
    if (!name) throw new HttpError("Your name cannot be empty.", 422);
    const email = toText(body.email).toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError("That email looks invalid.", 422);
    }

    const updated = (await db
      .update(users)
      .set({
        name,
        email: email || user.email,
        title: toText(body.title),
        bio: toText(body.bio),
        avatarUrl: toText(body.avatarUrl),
      })
      .where(eq(users.id, user.id))
      .returning()) as Array<typeof users.$inferSelect>;

    return json({ user: updated[0] });
  });
