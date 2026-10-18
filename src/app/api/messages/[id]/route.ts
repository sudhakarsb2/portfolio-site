import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";

export const GET = async () =>
  handle(async () => {
    await requireApiUser();
    const rows = await db.select().from(messages).orderBy(desc(messages.createdAt));
    return json(rows);
  });

export const PATCH = async (req: Request, ctx: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireApiUser();
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const status = body.status;
    if (status !== "new" && status !== "read" && status !== "archived") {
      throw new HttpError("Unknown message status.", 422);
    }
    const updated = (await db
      .update(messages)
      .set({ status, readAt: status === "new" ? null : new Date() })
      .where(eq(messages.id, Number(id)))
      .returning()) as Array<typeof messages.$inferSelect>;
    if (!updated[0]) throw new HttpError("That message no longer exists.", 404);
    return json(updated[0]);
  });

export const DELETE = async (_req: Request, ctx: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireApiUser();
    const { id } = await ctx.params;
    const removed = (await db
      .delete(messages)
      .where(eq(messages.id, Number(id)))
      .returning()) as Array<typeof messages.$inferSelect>;
    if (!removed[0]) throw new HttpError("That message no longer exists.", 404);
    return json({ ok: true, id: Number(id) });
  });
