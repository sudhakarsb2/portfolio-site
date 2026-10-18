import Link from "next/link";
import { ProjectForm } from "@/components/dashboard/project-form";
import { Icon } from "@/components/ui/icons";
import { getCategories, getTags } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

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
        <h2 className="font-display text-3xl text-ink">New project</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Saved as a draft first — publish it when the artwork is ready.
        </p>
      </header>
      <ProjectForm
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
