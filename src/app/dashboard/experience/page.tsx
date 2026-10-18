"use client";

import { ResourceManager, type FieldDef } from "@/components/dashboard/resource-manager";
import { Icon } from "@/components/ui/icons";

const fields: FieldDef[] = [
  { name: "role", label: "Role", type: "text", required: true },
  { name: "company", label: "Studio / company", type: "text" },
  { name: "period", label: "Period", type: "text", placeholder: "2019 — Present" },
  { name: "location", label: "Location", type: "text" },
  { name: "description", label: "Description", type: "textarea", full: true },
  { name: "sortOrder", label: "Sort order", type: "number" },
];

export default function DashboardExperiencePage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Experience</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          The timeline shown on the about page.
        </p>
      </header>

      <ResourceManager
        endpoint="/api/experiences"
        resourceName="entry"
        fields={fields}
        searchPlaceholder="Search roles or studios…"
        emptyIcon="briefcase"
        emptyTitle="No experience entries yet"
        emptyDescription="Add the roles and studios that shaped the practice — they build the timeline on the about page."
        defaultValues={{ sortOrder: 0 }}
        card={(row, actions) => (
          <div className="relative rounded-2xl border border-line bg-paper p-5 transition-shadow hover:shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-bone-2 px-3 py-1 text-[11px] font-medium text-ink/60">
                {String(row.period ?? "")}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={actions.edit}
                  aria-label="Edit entry"
                  className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-bone-2 hover:text-ink"
                >
                  <Icon name="pencil" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={actions.remove}
                  aria-label="Delete entry"
                  className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-[#ffe4dc] hover:text-crimson"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="mt-4 font-display text-xl text-ink">{String(row.role ?? "")}</h3>
            <p className="mt-1 text-sm text-ink/55">
              {String(row.company ?? "")}
              {row.location ? ` · ${String(row.location)}` : ""}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/60">{String(row.description ?? "")}</p>
          </div>
        )}
      />
    </div>
  );
}
