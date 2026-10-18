"use client";

import Link from "next/link";
import { startTransition, useCallback, useEffect, useMemo, useOptimistic, useState } from "react";
import { Artwork } from "@/components/artwork";
import { Button, EmptyState, Select, Skeleton, useToast } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type ProjectRow = {
  id: number;
  title: string;
  slug: string;
  client: string;
  year: number;
  summary: string;
  status: "draft" | "published";
  featured: boolean;
  order: number;
  coverImage: string | null;
  categoryId: number | null;
  category: { id: number; name: string; color: string } | null;
  tags: Array<{ id: number; name: string }>;
  updatedAt: string;
};

type OptimisticAction =
  | { kind: "patch"; id: number; changes: Partial<ProjectRow> }
  | { kind: "remove"; id: number };

export function ProjectsTable({ categories }: { categories: Array<{ id: number; name: string }> }) {
  const { push } = useToast();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [category, setCategory] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [optimisticRows, applyOptimistic] = useOptimistic(
    rows,
    (state: ProjectRow[], action: OptimisticAction) => {
      if (action.kind === "remove") return state.filter((row) => row.id !== action.id);
      return state.map((row) =>
        row.id === action.id ? { ...row, ...action.changes } : row,
      );
    },
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/projects", { cache: "no-store" });
      if (!response.ok) throw new Error("failed");
      setRows((await response.json()) as ProjectRow[]);
    } catch {
      setError("We could not load your projects. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return optimisticRows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (category !== "all" && String(row.categoryId ?? "") !== category) return false;
      if (!term) return true;
      return (
        row.title.toLowerCase().includes(term) ||
        row.client.toLowerCase().includes(term) ||
        row.tags.some((tag) => tag.name.toLowerCase().includes(term))
      );
    });
  }, [optimisticRows, query, status, category]);

  function patchRow(row: ProjectRow, changes: Partial<ProjectRow>, successMessage: string) {
    startTransition(async () => {
      applyOptimistic({ kind: "patch", id: row.id, changes });
      try {
        const response = await fetch(`/api/projects/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...row, ...changes }),
        });
        const payload = (await response.json()) as ProjectRow & { error?: string };
        if (!response.ok) {
          push(payload.error ?? "That change could not be saved", "error");
          return;
        }
        setRows((current) => current.map((item) => (item.id === row.id ? payload : item)));
        push(successMessage);
      } catch {
        push("That change could not be saved", "error");
      }
    });
  }

  async function remove(row: ProjectRow) {
    setDeleting(true);
    startTransition(async () => {
      applyOptimistic({ kind: "remove", id: row.id });
      try {
        const response = await fetch(`/api/projects/${row.id}`, { method: "DELETE" });
        if (!response.ok) {
          push("That project could not be deleted", "error");
          return;
        }
        setRows((current) => current.filter((item) => item.id !== row.id));
        push("Project deleted");
      } catch {
        push("That project could not be deleted", "error");
      }
    });
    setDeleting(false);
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-xs">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects…"
              className="h-10 w-full rounded-xl border border-line bg-paper pl-10 pr-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-10 sm:w-40">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </Select>
          <Select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 sm:w-48">
            <option value="all">All disciplines</option>
            {categories.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-medium text-bone transition-colors hover:bg-vermilion hover:text-white"
        >
          <Icon name="plus" className="h-4 w-4" />
          New project
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-[74px] w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="alert"
          title="Could not load your projects"
          description={error}
          action={
            <Button variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="folder"
          title={rows.length ? "No projects match those filters" : "No projects yet"}
          description={
            rows.length
              ? "Try clearing the search or switching discipline."
              : "Add your first case study and it will appear on the public work page instantly."
          }
          action={
            rows.length ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setCategory("all");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Link
                href="/dashboard/projects/new"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-medium text-bone"
              >
                <Icon name="plus" className="h-4 w-4" />
                New project
              </Link>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-bone/50">
                  {["Project", "Discipline", "Year", "Status", ""].map((heading, index) => (
                    <th
                      key={heading || index}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45"
                    >
                      {heading}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {filtered.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-bone/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bone-2">
                          <Artwork
                            seed={row.title}
                            title={row.title}
                            className="h-full w-full"
                            showMeta={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{row.title}</p>
                          <p className="mt-0.5 truncate text-xs text-ink/45">{row.client}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-[13px] text-ink/70">
                        {row.category ? (
                          <>
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: row.category.color }}
                              aria-hidden="true"
                            />
                            {row.category.name}
                          </>
                        ) : (
                          <span className="text-ink/35">Uncategorised</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink/60">{row.year}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-medium",
                          row.status === "published"
                            ? "bg-[#dff0e6] text-[#1c6b3f]"
                            : "bg-bone-2 text-ink/55",
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          patchRow(
                            row,
                            { featured: !row.featured },
                            row.featured ? "Removed from featured" : "Marked as featured",
                          )
                        }
                        aria-label={row.featured ? "Unfeature project" : "Feature project"}
                        title={row.featured ? "Remove from featured" : "Mark as featured"}
                        className={cn(
                          "rounded-lg p-2 transition-colors",
                          row.featured ? "text-amber" : "text-ink/25 hover:text-ink/60",
                        )}
                      >
                        <Icon name="star" className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            patchRow(
                              row,
                              { status: row.status === "published" ? "draft" : "published" },
                              row.status === "published" ? "Moved to drafts" : "Published",
                            )
                          }
                          title={row.status === "published" ? "Unpublish" : "Publish"}
                          className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-bone-2 hover:text-ink"
                        >
                          <Icon name={row.status === "published" ? "eye" : "external"} className="h-4 w-4" />
                        </button>
                        <Link
                          href={`/dashboard/projects/${row.id}`}
                          aria-label="Edit"
                          className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-bone-2 hover:text-ink"
                        >
                          <Icon name="pencil" className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(row)}
                          aria-label="Delete"
                          className="rounded-lg p-2 text-ink/40 transition-colors hover:bg-[#ffe4dc] hover:text-crimson"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-line bg-bone p-6 shadow-lift">
            <h3 className="font-display text-2xl text-ink">Delete “{confirmDelete.title}”?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              The case study will be removed from the portfolio and the public work page straight away.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Keep it
              </Button>
              <Button variant="danger" loading={deleting} onClick={() => void remove(confirmDelete)}>
                Delete project
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
