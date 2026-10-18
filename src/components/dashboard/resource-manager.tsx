"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useOptimistic,
  useState,
  type ReactNode,
} from "react";
import { Button, EmptyState, Field, Input, Modal, Select, Skeleton, Switch, Textarea, useToast } from "@/components/ui/kit";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "select" | "list" | "password";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  full?: boolean;
};

export type ColumnDef = {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
  className?: string;
};

export type Row = Record<string, unknown> & { id: number };

type OptimisticAction =
  | { type: "remove"; id: number }
  | { type: "patch"; row: Row }
  | { type: "replace"; row: Row };

function applyAction(rows: Row[], action: OptimisticAction): Row[] {
  if (action.type === "remove") return rows.filter((row) => row.id !== action.id);
  if (action.type === "replace") {
    return rows.map((row) => (row.id === action.row.id ? action.row : row));
  }
  return rows.map((row) => (row.id === action.row.id ? { ...row, ...action.row } : row));
}

export function ResourceManager({
  endpoint,
  resourceName,
  fields,
  columns = [],
  defaultValues = {},
  searchPlaceholder = "Search…",
  emptyTitle,
  emptyDescription,
  emptyIcon = "sparkle",
  card,
  searchFields = ["name", "title", "role", "company", "description", "quote"],
  headerExtra,
}: {
  endpoint: string;
  resourceName: string;
  fields: FieldDef[];
  columns?: ColumnDef[];
  defaultValues?: Record<string, unknown>;
  searchPlaceholder?: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon?: IconName;
  card?: (row: Row, actions: { edit: () => void; remove: () => void }) => ReactNode;
  searchFields?: string[];
  headerExtra?: ReactNode;
}) {
  const { push } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [optimisticRows, applyOptimistic] = useOptimistic(rows, applyAction);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) throw new Error("Request failed");
      const payload = (await response.json()) as Row[];
      setRows(payload);
    } catch {
      setError("We could not load this list. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return optimisticRows;
    return optimisticRows.filter((row) =>
      searchFields.some((field) => String(row[field] ?? "").toLowerCase().includes(term)),
    );
  }, [optimisticRows, query, searchFields]);

  function openCreate() {
    setForm({ ...defaultValues });
    setFormError("");
    setCreating(true);
  }

  function openEdit(row: Row) {
    const next: Record<string, unknown> = { ...defaultValues };
    for (const field of fields) {
      const value = row[field.name];
      next[field.name] = field.type === "list" ? (Array.isArray(value) ? value.join("\n") : value ?? "") : value ?? "";
    }
    setForm(next);
    setFormError("");
    setEditing(row);
  }

  function closeModal() {
    setCreating(false);
    setEditing(null);
    setFormError("");
  }

  function setField(name: string, value: unknown) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function save() {
    setSaving(true);
    setFormError("");
    try {
      const isEdit = Boolean(editing);
      const response = await fetch(isEdit ? `${endpoint}/${editing!.id}` : endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as Row & { error?: string };
      if (!response.ok) {
        setFormError(payload.error ?? "We could not save that.");
        setSaving(false);
        return;
      }
      const saved = { ...payload };
      delete (saved as { error?: string }).error;

      if (isEdit) {
        setRows((current) => current.map((row) => (row.id === saved.id ? saved : row)));
        push(`${resourceName} updated`);
      } else {
        setRows((current) => [saved, ...current]);
        push(`${resourceName} created`);
      }
      closeModal();
    } catch {
      setFormError("We could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function toggleField(row: Row, field: FieldDef) {
    const next = !Boolean(row[field.name]);
    startTransition(async () => {
      applyOptimistic({ type: "patch", row: { ...row, [field.name]: next } });
      try {
        const response = await fetch(`${endpoint}/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...row, [field.name]: next }),
        });
        const payload = (await response.json()) as Row & { error?: string };
        if (!response.ok) {
          push(payload.error ?? "That change could not be saved", "error");
          return;
        }
        const saved = { ...payload };
        delete (saved as { error?: string }).error;
        setRows((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      } catch {
        push("That change could not be saved", "error");
      }
    });
  }

  async function remove(row: Row) {
    setDeleting(true);
    startTransition(async () => {
      applyOptimistic({ type: "remove", id: row.id });
      try {
        const response = await fetch(`${endpoint}/${row.id}`, { method: "DELETE" });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          push(payload.error ?? "That record could not be deleted", "error");
          return;
        }
        setRows((current) => current.filter((item) => item.id !== row.id));
        push(`${resourceName} deleted`);
      } catch {
        push("That record could not be deleted", "error");
      }
    });
    setDeleting(false);
    setConfirmDelete(null);
  }

  const modalOpen = creating || Boolean(editing);
  const title = creating ? `New ${resourceName}` : `Edit ${resourceName}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-line bg-paper pl-10 pr-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </div>
        <div className="flex items-center gap-3">
          {headerExtra}
          <Button icon="plus" onClick={openCreate}>
            New {resourceName}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="alert"
          title="Could not load this list"
          description={error}
          action={
            <Button variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={query ? `No ${resourceName}s match “${query}”` : emptyTitle}
          description={query ? "Try a different search term." : emptyDescription}
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            ) : (
              <Button icon="plus" onClick={openCreate}>
                New {resourceName}
              </Button>
            )
          }
        />
      ) : card ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <div key={row.id} className="group relative">
              {card(row, { edit: () => openEdit(row), remove: () => setConfirmDelete(row) })}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-bone/50">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45"
                    >
                      {column.label}
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
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3.5 align-middle", column.className)}>
                        {column.render ? column.render(row) : String(row[column.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {fields
                          .filter((field) => field.type === "boolean")
                          .map((field) => (
                            <button
                              key={field.name}
                              type="button"
                              title={`Toggle ${field.label.toLowerCase()}`}
                              onClick={() => toggleField(row, field)}
                              className={cn(
                                "rounded-lg p-2 transition-colors",
                                row[field.name]
                                  ? "text-[#1c6b3f] hover:bg-[#dff0e6]"
                                  : "text-ink/30 hover:bg-bone-2",
                              )}
                            >
                              <Icon name="check" className="h-4 w-4" />
                            </button>
                          ))}
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label="Edit"
                          className="rounded-lg p-2 text-ink/45 transition-colors hover:bg-bone-2 hover:text-ink"
                        >
                          <Icon name="pencil" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(row)}
                          aria-label="Delete"
                          className="rounded-lg p-2 text-ink/45 transition-colors hover:bg-[#ffe4dc] hover:text-crimson"
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={title}
        description={creating ? `Add a new ${resourceName} to the studio.` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : `Create ${resourceName}`}
            </Button>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => {
            const value = form[field.name];
            const control = (() => {
              switch (field.type) {
                case "textarea":
                  return (
                    <Textarea
                      value={String(value ?? "")}
                      onChange={(event) => setField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                    />
                  );
                case "list":
                  return (
                    <Textarea
                      value={String(value ?? "")}
                      onChange={(event) => setField(field.name, event.target.value)}
                      placeholder={field.placeholder ?? "One item per line"}
                      rows={5}
                    />
                  );
                case "number":
                  return (
                    <Input
                      type="number"
                      value={String(value ?? 0)}
                      onChange={(event) => setField(field.name, Number(event.target.value))}
                      placeholder={field.placeholder}
                    />
                  );
                case "password":
                  return (
                    <Input
                      type="password"
                      value={String(value ?? "")}
                      onChange={(event) => setField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  );
                case "select":
                  return (
                    <Select
                      value={String(value ?? "")}
                      onChange={(event) => setField(field.name, event.target.value)}
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  );
                case "boolean":
                  return (
                    <Switch
                      checked={Boolean(value)}
                      onChange={(next) => setField(field.name, next)}
                      label={field.label}
                    />
                  );
                default:
                  return (
                    <Input
                      value={String(value ?? "")}
                      onChange={(event) => setField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  );
              }
            })();

            if (field.type === "boolean") {
              return (
                <div key={field.name} className={cn(field.full && "sm:col-span-2")}>
                  {control}
                </div>
              );
            }

            return (
              <Field
                key={field.name}
                label={field.label}
                hint={field.hint}
                required={field.required}
                className={cn(field.full && "sm:col-span-2")}
              >
                {control}
              </Field>
            );
          })}
        </div>

        {formError ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-crimson/25 bg-[#fff3f3] px-4 py-3 text-sm text-crimson">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            {formError}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title={`Delete this ${resourceName}?`}
        description="This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              loading={deleting}
              onClick={() => confirmDelete && void remove(confirmDelete)}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-ink/60">
          {confirmDelete
            ? `“${String(confirmDelete.title ?? confirmDelete.name ?? confirmDelete.role ?? confirmDelete.id)}” will be removed from the studio immediately.`
            : null}
        </p>
      </Modal>
    </div>
  );
}
