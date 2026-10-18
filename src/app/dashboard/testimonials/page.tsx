"use client";

import { ResourceManager, type FieldDef } from "@/components/dashboard/resource-manager";
import { Icon } from "@/components/ui/icons";

const fields: FieldDef[] = [
  { name: "name", label: "Client name", type: "text", required: true },
  { name: "role", label: "Role", type: "text" },
  { name: "company", label: "Company", type: "text" },
  { name: "quote", label: "Quote", type: "textarea", required: true, full: true },
  { name: "avatar", label: "Avatar URL", type: "text" },
  { name: "rating", label: "Rating (1–5)", type: "number" },
  { name: "sortOrder", label: "Sort order", type: "number" },
  { name: "published", label: "Show on the site", type: "boolean", full: true },
];

export default function DashboardTestimonialsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Testimonials</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          The client quotes that appear on the homepage and about page.
        </p>
      </header>

      <ResourceManager
        endpoint="/api/testimonials"
        resourceName="testimonial"
        fields={fields}
        searchPlaceholder="Search quotes…"
        emptyIcon="quote"
        emptyTitle="No testimonials yet"
        emptyDescription="Collect a sentence or two from a happy client and it will appear on the homepage."
        defaultValues={{ published: true, rating: 5, sortOrder: 0 }}
        card={(row, actions) => (
          <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-5 transition-shadow hover:shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <Icon name="quote" className="h-5 w-5 text-vermilion" />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={actions.edit}
                  aria-label="Edit testimonial"
                  className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-bone-2 hover:text-ink"
                >
                  <Icon name="pencil" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={actions.remove}
                  aria-label="Delete testimonial"
                  className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-[#ffe4dc] hover:text-crimson"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-4 flex-1 font-display text-lg leading-snug text-ink">
              &ldquo;{String(row.quote ?? "")}&rdquo;
            </p>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm font-medium text-ink">{String(row.name ?? "")}</p>
              <p className="mt-0.5 text-xs text-ink/45">
                {String(row.role ?? "")}
                {row.company ? ` · ${String(row.company)}` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] tracking-[0.2em] text-amber">
                  {"★".repeat(Math.max(0, Math.min(5, Number(row.rating ?? 5))))}
                </span>
                <span
                  className={
                    row.published
                      ? "rounded-full bg-[#dff0e6] px-2.5 py-1 text-[11px] font-medium text-[#1c6b3f]"
                      : "rounded-full bg-bone-2 px-2.5 py-1 text-[11px] font-medium text-ink/50"
                  }
                >
                  {row.published ? "Live" : "Hidden"}
                </span>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
