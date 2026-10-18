import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, projectTags } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";
import { parseProject } from "@/lib/validators";
import { attachTags } from "@/lib/data";

const projectInclude = {
  category: true,
  projectTags: { with: { tag: true } },
} as const;

export const GET = async (_req: Request, ctx: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireApiUser();
    const { id } = await ctx.params;
    const row = await db.query.projects.findFirst({
      where: eq(projects.id, Number(id)),
      with: projectInclude,
    });
    if (!row) throw new HttpError("That project no longer exists.", 404);
    return json(attachTags(row));
  });

export const PATCH = async (req: Request, ctx: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireApiUser();
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { values, errors } = parseProject(body);
    if (errors.length) throw new HttpError(errors.join(" "), 422);

    const tagIds = Array.isArray(body.tagIds)
      ? body.tagIds.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0)
      : [];

    const updated = (await db
      .update(projects)
      .set({ ...(values as unknown as typeof projects.$inferInsert), updatedAt: new Date() })
      .where(eq(projects.id, Number(id)))
      .returning()) as Array<typeof projects.$inferSelect>;

    if (!updated[0]) throw new HttpError("That project no longer exists.", 404);

    await db.delete(projectTags).where(eq(projectTags.projectId, Number(id)));
    if (tagIds.length) {
      await db.insert(projectTags).values(tagIds.map((tagId) => ({ projectId: Number(id), tagId })));
    }

    const full = await db.query.projects.findFirst({
      where: eq(projects.id, Number(id)),
      with: projectInclude,
    });
    return json(full ? attachTags(full) : null);
  });

export const DELETE = async (_req: Request, ctx: { params: Promise<{ id: string }> }) =>
  handle(async () => {
    await requireApiUser();
    const { id } = await ctx.params;
    const removed = (await db
      .delete(projects)
      .where(eq(projects.id, Number(id)))
      .returning()) as Array<typeof projects.$inferSelect>;
    if (!removed[0]) throw new HttpError("That project no longer exists.", 404);
    return json({ ok: true, id: Number(id) });
  });
