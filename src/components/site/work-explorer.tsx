"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Artwork } from "@/components/artwork";
import { ProjectCard } from "@/components/site/project-card";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type ExplorerProject = {
  id: number;
  title: string;
  slug: string;
  client: string;
  year: number;
  summary: string;
  featured: boolean;
  coverImage: string | null;
  category: { id: number; name: string; color: string } | null;
  tags: Array<{ id: number; name: string }>;
};

export function WorkExplorer({
  projects,
  categories,
  tags,
}: {
  projects: ExplorerProject[];
  categories: Array<{ id: number; name: string; color: string }>;
  tags: Array<{ id: number; name: string }>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<number | null>(null);
  const [tag, setTag] = useState<number | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (category && project.category?.id !== category) return false;
      if (tag && !project.tags.some((item) => item.id === tag)) return false;
      if (!term) return true;
      return (
        project.title.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term) ||
        project.summary.toLowerCase().includes(term) ||
        project.tags.some((item) => item.name.toLowerCase().includes(term))
      );
    });
  }, [projects, query, category, tag]);

  const reset = () => {
    setQuery("");
    setCategory(null);
    setTag(null);
  };

  const hiddenFilters = new Set([
  "arabic",
  "cmyk",
  "die-line",
  "die-lines",
  "figma to print",
  "figma to indesign",
  "large format",
  "pantone",
  "preflight",
  "production",
  "qsr",
  "retail",
]);

const visibleCategories = categories.filter((item) => !hiddenFilters.has(item.name.toLowerCase()));
const visibleTags = tags.filter((item) => !hiddenFilters.has(item.name.toLowerCase()));

const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300",
      active
        ? "border-ink bg-ink text-bone shadow-soft"
        : "border-line bg-paper text-ink/60 hover:-translate-y-0.5 hover:border-ink hover:text-ink",
    );

  return (
    <div>
      <div className="sticky top-[68px] z-20 -mx-5 border-y border-line bg-bone/90 px-5 py-5 backdrop-blur-xl md:-mx-10 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, clients, tags…"
              className="h-11 w-full rounded-full border border-line bg-paper pl-11 pr-4 text-sm text-ink placeholder:text-ink/35 transition-all focus:border-ink focus:outline-none focus:ring-4 focus:ring-ink/5"
            />
          </div>

          <div className="flex items-center gap-3">
            <p className="micro text-[10px] text-ink/40">
              {filtered.length} {filtered.length === 1 ? "project" : "projects"}
            </p>
            <div className="flex rounded-full border border-line bg-paper p-1">
              {(["grid", "list"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setView(option)}
                  aria-label={`${option} view`}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    view === option
                      ? "bg-ink text-bone"
                      : "text-ink/40 hover:text-ink",
                  )}
                >
                  <Icon name={option} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="scroll-x mt-4 flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={cn(chip(category === null), "shrink-0")}
          >
            All disciplines
          </button>
          {visibleCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(category === item.id ? null : item.id)}
              className={cn(chip(category === item.id), "shrink-0")}
            >
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.name}
            </button>
          ))}
        </div>

        {visibleTags.length ? (
          <div className="scroll-x mt-3 flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
            <span className="micro mr-1 shrink-0 text-[9px] text-ink/35">Tags</span>
            {visibleTags.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTag(tag === item.id ? null : item.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all duration-300",
                  tag === item.id
                    ? "bg-vermilion text-white shadow-glow"
                    : "bg-bone-2 text-ink/55 hover:text-ink",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-14 flex flex-col items-center justify-center rounded-[32px] border border-dashed border-line bg-paper/60 px-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bone-2 text-ink/50">
            <Icon name="search" className="h-6 w-6" />
          </div>
          <h3 className="display mt-5 text-3xl text-ink">Nothing matches yet</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/55">
            No projects fit that combination of filters. Try a different discipline, or clear everything
            and browse the full archive.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-bone transition-colors hover:bg-vermilion hover:text-white"
          >
            Clear filters
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                id: project.id,
                title: project.title,
                slug: project.slug,
                client: project.client,
                year: project.year,
                summary: project.summary,
                featured: project.featured,
                coverImage: project.coverImage,
                category: project.category,
                tags: project.tags,
              }}
            />
          ))}
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {filtered.map((project, index) => (
            <li key={project.id}>
              <Link
                href={`/work/${project.slug}`}
                className="group flex items-center gap-5 py-5 transition-colors hover:bg-paper"
              >
                <span className="micro w-8 shrink-0 text-ink/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bone-2">
                  <Artwork
                    seed={project.title}
                    title={project.title}
                    className="h-full w-full"
                    showMeta={false}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl text-ink transition-colors group-hover:text-vermilion">
                    {project.title}
                  </h3>
                  <p className="mt-0.5 truncate text-[13px] text-ink/50">{project.summary}</p>
                </div>
                <div className="hidden shrink-0 text-right text-xs text-ink/45 sm:block">
                  <p>{project.client}</p>
                  <p className="mt-0.5">{project.category?.name ?? "—"}</p>
                </div>
                <span className="shrink-0 font-display text-sm text-ink/35">{project.year}</span>
                <Icon
                  name="chevron-right"
                  className="hidden h-4 w-4 shrink-0 text-ink/30 transition-transform group-hover:translate-x-1 sm:block"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
