"use client";

import { ResourceManager, type FieldDef } from "@/components/dashboard/resource-manager";
import { Icon, type IconName } from "@/components/ui/icons";

const iconOptions: Array<{ value: string; label: string }> = [
  { value: "aperture", label: "Aperture" },
  { value: "book", label: "Book" },
  { value: "box", label: "Box" },
  { value: "compass", label: "Compass" },
  { value: "monitor", label: "Monitor" },
  { value: "play", label: "Play" },
  { value: "layers", label: "Layers" },
];

const fields: FieldDef[] = [
  { name: "title", label: "Service title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text" },
  { name: "description", label: "Description", type: "textarea", required: true, full: true },
  { name: "deliverables", label: "Deliverables", type: "list", full: true, hint: "One per line." },
  { name: "priceFrom", label: "Price from (USD)", type: "number" },
  { name: "accent", label: "Accent colour", type: "text", hint: "Hex, e.g. #FF4A1C" },
  { name: "icon", label: "Icon", type: "select", options: iconOptions },
  { name: "sortOrder", label: "Sort order", type: "number" },
  { name: "published", label: "Visible on the services page", type: "boolean", full: true },
];

export default function DashboardServicesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-3xl text-ink">Services</h2>
        <p className="mt-1.5 text-sm text-ink/55">
          What you offer, what the client receives and what it costs.
        </p>
      </header>

      <ResourceManager
        endpoint="/api/services"
        resourceName="service"
        fields={fields}
        searchPlaceholder="Search services…"
        emptyIcon="layers"
        emptyTitle="No services yet"
        emptyDescription="Add the services you offer and they appear on the public services page straight away."
        defaultValues={{ published: true, icon: "aperture", accent: "#FF4A1C", priceFrom: 0, sortOrder: 0, deliverables: [] }}
        card={(row, actions) => {
          const deliverables = Array.isArray(row.deliverables) ? (row.deliverables as string[]) : [];
          const icon = (iconOptions.find((option) => option.value === row.icon)?.value ??
            "layers") as IconName;
          return (
            <div className="rounded-2xl border border-line bg-paper p-5 transition-shadow hover:shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: String(row.accent ?? "#FF4A1C") }}
                >
                  <Icon name={icon} className="h-4.5 w-4.5" />
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={actions.edit}
                    aria-label="Edit service"
                    className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-bone-2 hover:text-ink"
                  >
                    <Icon name="pencil" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={actions.remove}
                    aria-label="Delete service"
                    className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-[#ffe4dc] hover:text-crimson"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="mt-4 font-display text-xl text-ink">{String(row.title ?? "")}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/55">
                {String(row.description ?? "")}
              </p>

              {deliverables.length ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {deliverables.slice(0, 4).map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-bone-2 px-2.5 py-1 text-[11px] text-ink/60"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="font-medium text-ink/70">
                  {Number(row.priceFrom) ? `From $${Number(row.priceFrom).toLocaleString()}` : "On request"}
                </span>
                <span
                  className={
                    row.published
                      ? "rounded-full bg-[#dff0e6] px-2.5 py-1 font-medium text-[#1c6b3f]"
                      : "rounded-full bg-bone-2 px-2.5 py-1 font-medium text-ink/50"
                  }
                >
                  {row.published ? "Live" : "Hidden"}
                </span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
