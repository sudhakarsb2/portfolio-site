"use client";

import { ResourceManager, type FieldDef } from "@/components/dashboard/resource-manager";

const fields: FieldDef[] = [
  { name: "name", label: "Tag name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text" },
];

export default function DashboardTagsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Tags</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          The vocabulary used to tag projects and filter the public work archive.
        </p>
      </header>

      <ResourceManager
        endpoint="/api/tags"
        resourceName="tag"
        fields={fields}
        searchPlaceholder="Search tags…"
        emptyIcon="tag"
        emptyTitle="No tags yet"
        emptyDescription="Create a few tags such as “Typography” or “Packaging” and then apply them to your projects."
        columns={[
          {
            key: "name",
            label: "Name",
            render: (row) => (
              <span className="font-medium text-ink">{String(row.name ?? "")}</span>
            ),
          },
          {
            key: "slug",
            label: "Slug",
            render: (row) => (
              <span className="font-mono text-[12px] text-ink/50">{String(row.slug ?? "")}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
