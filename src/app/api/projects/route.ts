import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, projectTags } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";
import { parseProject } from "@/lib/validators";
import { attachTags } from "@/lib/data";

const projectInclude = {
  category: true,
  projectTags: { with: { tag: true } },
} as const;

export const GET = async () =>
  handle(async () => {
    await requireApiUser();
    const rows = await db.query.projects.findMany({
      orderBy: [desc(projects.updatedAt), desc(projects.id)],
      with: projectInclude,
    });
    return json(rows.map((row) => attachTags(row)));
  });

export const POST = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { values, errors } = parseProject(body);
    if (errors.length) throw new HttpError(errors.join(" "), 422);

    const tagIds = Array.isArray(body.tagIds)
      ? body.tagIds.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
      : [];

    const inserted = (await db
      .insert(projects)
      .values({ ...(values as unknown as typeof projects.$inferInsert), updatedAt: new Date() })
      .returning()) as Array<typeof projects.$inferSelect>;

    const project = inserted[0];
    if (tagIds.length) {
      await db.insert(projectTags).values(tagIds.map((tagId) => ({ projectId: project.id, tagId })));
    }

    const full = await db.query.projects.findFirst({
      where: eq(projects.id, project.id),
      with: projectInclude,
    });
    return json(full ? attachTags(full) : null, { status: 201 });
  });
