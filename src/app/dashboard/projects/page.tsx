import { ProjectsTable } from "@/components/dashboard/projects-table";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardProjectsPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Projects</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          Every case study in the portfolio. Publish, feature, edit or archive them.
        </p>
      </header>
      <ProjectsTable
        categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      />
    </div>
  );
}
