import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/dashboard/project-form";
import { Icon } from "@/components/ui/icons";
import { getCategories, getTags } from "@/lib/data";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  const rows = await db.query.projects.findFirst({
    where: eq(projects.id, Number(id)),
    with: { projectTags: { with: { tag: true } }, category: true },
  });
  if (!rows) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ink/45 transition-colors hover:text-ink"
      >
        <Icon name="chevron-right" className="h-3.5 w-3.5 rotate-180" />
        Projects
      </Link>
      <header>
        <h2 className="font-display text-3xl text-ink">Edit {rows.title}</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Last updated {new Date(rows.updatedAt).toLocaleDateString("en-US")} ·{" "}
          <Link href={`/work/${rows.slug}`} className="text-ink/70 underline decoration-line underline-offset-4 hover:text-vermilion">
            view live
          </Link>
        </p>
      </header>
      <ProjectForm
        project={{
          id: rows.id,
          title: rows.title,
          slug: rows.slug,
          client: rows.client,
          year: rows.year,
          categoryId: rows.categoryId,
          summary: rows.summary,
          description: rows.description,
          coverImage: rows.coverImage,
          gallery: rows.gallery,
          credits: rows.credits,
          featured: rows.featured,
          status: rows.status,
          order: rows.order,
          tagIds: rows.projectTags.map((entry) => entry.tag.id),
        }}
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
          color: category.color,
        }))}
        tags={tags.map((tag) => ({ id: tag.id, name: tag.name }))}
      />
    </div>
  );
}
