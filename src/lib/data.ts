import { asc, desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  experiences,
  messages,
  projects,
  services,
  siteSettings,
  tags,
  testimonials,
} from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export type ProjectWithRelations = Awaited<ReturnType<typeof getPublishedProjects>>[number];

export function attachTags<
  T extends { projectTags: Array<{ tag: typeof tags.$inferSelect }> },
>(row: T) {
  return { ...row, tags: row.projectTags.map((entry) => entry.tag) };
}

export async function getPublishedProjects() {
  await ensureSeeded();
  return db.query.projects.findMany({
    where: eq(projects.status, "published"),
    orderBy: [desc(projects.featured), asc(projects.order), desc(projects.year)],
    with: {
      category: true,
      projectTags: { with: { tag: true } },
    },
  }).then((rows) => rows.map((row) => attachTags(row)));
}

export async function getAllProjects() {
  await ensureSeeded();
  return db.query.projects.findMany({
    orderBy: [desc(projects.updatedAt), desc(projects.id)],
    with: {
      category: true,
      projectTags: { with: { tag: true } },
    },
  }).then((rows) => rows.map((row) => attachTags(row)));
}

export async function getProjectBySlug(slug: string) {
  await ensureSeeded();
  const rows = await db.query.projects.findMany({
    where: and(eq(projects.slug, slug), eq(projects.status, "published")),
    with: {
      category: true,
      projectTags: { with: { tag: true } },
    },
    limit: 1,
  });
  const row = rows[0];
  return row ? attachTags(row) : null;
}

export async function getAdjacentProjects(slug: string) {
  const all = await getPublishedProjects();
  const index = all.findIndex((project) => project.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: all[index + 1] ?? null,
    next: all[index - 1] ?? null,
  };
}

export async function getCategories() {
  await ensureSeeded();
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getTags() {
  await ensureSeeded();
  return db.select().from(tags).orderBy(asc(tags.name));
}

export async function getServices() {
  await ensureSeeded();
  return db
    .select()
    .from(services)
    .where(eq(services.published, true))
    .orderBy(asc(services.sortOrder), asc(services.id));
}

export async function getTestimonials() {
  await ensureSeeded();
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.published, true))
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
}

export async function getExperiences() {
  await ensureSeeded();
  return db.select().from(experiences).orderBy(asc(experiences.sortOrder), asc(experiences.id));
}

export async function getMessages() {
  await ensureSeeded();
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function getSettings(): Promise<Record<string, string>> {
  await ensureSeeded();
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getSettingsGroup(group: string) {
  await ensureSeeded();
  return db.select().from(siteSettings).where(eq(siteSettings.group, group));
}

export async function countMessagesByStatus() {
  await ensureSeeded();
  const rows = await db
    .select({ status: messages.status, total: sql<number>`count(*)::int` })
    .from(messages)
    .groupBy(messages.status);
  return rows;
}
