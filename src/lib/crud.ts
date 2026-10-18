import { eq } from "drizzle-orm";
import { db } from "@/db";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";

type ParseFn = (body: Record<string, unknown>) => { values: Record<string, unknown>; errors: string[] };

export function listHandler(table: any, orderBy?: any) {
  return async () =>
    handle(async () => {
      await requireApiUser();
      const rows = (orderBy
        ? await db.select().from(table).orderBy(orderBy)
        : await db.select().from(table)) as unknown[];
      return json(rows);
    });
}

export function createHandler(table: any, parse: ParseFn) {
  return async (req: Request) =>
    handle(async () => {
      await requireApiUser();
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const { values, errors } = parse(body);
      if (errors.length) throw new HttpError(errors.join(" "), 422);
      const inserted = (await db.insert(table).values(values).returning()) as unknown[];
      return json(inserted[0], { status: 201 });
    });
}

export function updateHandler(table: any, parse: ParseFn) {
  return async (req: Request, ctx: { params: Promise<{ id: string }> }) =>
    handle(async () => {
      await requireApiUser();
      const { id } = await ctx.params;
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const { values, errors } = parse(body);
      if (errors.length) throw new HttpError(errors.join(" "), 422);
      const updated = (await db
        .update(table)
        .set(values)
        .where(eq(table.id, Number(id)))
        .returning()) as unknown[];
      if (!updated[0]) throw new HttpError("That record no longer exists.", 404);
      return json(updated[0]);
    });
}

export function deleteHandler(table: any) {
  return async (_req: Request, ctx: { params: Promise<{ id: string }> }) =>
    handle(async () => {
      await requireApiUser();
      const { id } = await ctx.params;
      const removed = (await db.delete(table).where(eq(table.id, Number(id))).returning()) as unknown[];
      if (!removed[0]) throw new HttpError("That record no longer exists.", 404);
      return json({ ok: true, id: Number(id) });
    });
}
