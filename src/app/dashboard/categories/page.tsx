"use client";

import { ResourceManager, type FieldDef } from "@/components/dashboard/resource-manager";

const fields: FieldDef[] = [
  { name: "name", label: "Discipline name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text" },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "color", label: "Colour", type: "text", hint: "Hex, e.g. #FF4A1C" },
  { name: "sortOrder", label: "Sort order", type: "number" },
];

export default function DashboardCategoriesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Disciplines</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          The categories projects are grouped into — brand, editorial, packaging and beyond.
        </p>
      </header>

      <ResourceManager
        endpoint="/api/categories"
        resourceName="discipline"
        fields={fields}
        searchPlaceholder="Search disciplines…"
        emptyIcon="grid"
        emptyTitle="No disciplines yet"
        emptyDescription="Add the disciplines you work in. They become the filters on the public work page."
        defaultValues={{ color: "#FF4A1C", sortOrder: 0 }}
        columns={[
          {
            key: "name",
            label: "Discipline",
            render: (row) => (
              <span className="inline-flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: String(row.color ?? "#FF4A1C") }}
                  aria-hidden="true"
                />
                <span className="font-medium text-ink">{String(row.name ?? "")}</span>
              </span>
            ),
          },
          {
            key: "slug",
            label: "Slug",
            render: (row) => (
              <span className="font-mono text-[12px] text-ink/50">{String(row.slug ?? "")}</span>
            ),
          },
          {
            key: "description",
            label: "Description",
            render: (row) => (
              <span className="text-[13px] text-ink/55">{String(row.description ?? "—")}</span>
            ),
          },
        ]}
      />
    </div>
  );
}
