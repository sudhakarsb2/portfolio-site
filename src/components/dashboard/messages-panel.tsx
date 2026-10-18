"use client";

import { startTransition, useCallback, useEffect, useMemo, useOptimistic, useState } from "react";
import { Button, EmptyState, Skeleton, useToast } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";
import { cn, relativeTime } from "@/lib/utils";

type MessageRow = {
  id: number;
  name: string;
  email: string;
  company: string;
  subject: string;
  budget: string;
  message: string;
  status: "new" | "read" | "archived";
  createdAt: string;
};

type Action =
  | { kind: "status"; id: number; status: MessageRow["status"] }
  | { kind: "remove"; id: number };

const tabs = [
  { key: "all", label: "All" },
  { key: "new", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
] as const;

export function MessagesPanel() {
  const { push } = useToast();
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MessageRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [optimisticRows, applyOptimistic] = useOptimistic(
    rows,
    (state: MessageRow[], action: Action) => {
      if (action.kind === "remove") return state.filter((row) => row.id !== action.id);
      return state.map((row) => (row.id === action.id ? { ...row, status: action.status } : row));
    },
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/messages", { cache: "no-store" });
      if (!response.ok) throw new Error("failed");
      setRows((await response.json()) as MessageRow[]);
    } catch {
      setError("We could not load your inbox. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      all: optimisticRows.length,
      new: optimisticRows.filter((row) => row.status === "new").length,
      read: optimisticRows.filter((row) => row.status === "read").length,
      archived: optimisticRows.filter((row) => row.status === "archived").length,
    }),
    [optimisticRows],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return optimisticRows.filter((row) => {
      if (tab !== "all" && row.status !== tab) return false;
      if (!term) return true;
      return (
        row.name.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.subject.toLowerCase().includes(term) ||
        row.message.toLowerCase().includes(term)
      );
    });
  }, [optimisticRows, tab, query]);

  function setStatus(row: MessageRow, status: MessageRow["status"], message: string) {
    startTransition(async () => {
      applyOptimistic({ kind: "status", id: row.id, status });
      try {
        const response = await fetch(`/api/messages/${row.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!response.ok) {
          push("That message could not be updated", "error");
          return;
        }
        setRows((current) =>
          current.map((item) => (item.id === row.id ? { ...item, status } : item)),
        );
        push(message);
      } catch {
        push("That message could not be updated", "error");
      }
    });
  }

  async function remove(row: MessageRow) {
    setDeleting(true);
    startTransition(async () => {
      applyOptimistic({ kind: "remove", id: row.id });
      try {
        const response = await fetch(`/api/messages/${row.id}`, { method: "DELETE" });
        if (!response.ok) {
          push("That message could not be deleted", "error");
          return;
        }
        setRows((current) => current.filter((item) => item.id !== row.id));
        push("Message deleted");
      } catch {
        push("That message could not be deleted", "error");
      }
    });
    setDeleting(false);
    setConfirmDelete(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-line bg-paper p-1">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                tab === item.key ? "bg-ink text-bone" : "text-ink/55 hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold",
                  tab === item.key ? "bg-bone/20 text-bone" : "bg-bone-2 text-ink/50",
                )}
              >
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the inbox…"
            className="h-10 w-full rounded-xl border border-line bg-paper pl-10 pr-4 text-sm text-ink placeholder:text-ink/35 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon="alert"
          title="Could not load your inbox"
          description={error}
          action={
            <Button variant="outline" onClick={() => void load()}>
              Try again
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="inbox"
          title={query ? "No messages match that search" : "Nothing in this view"}
          description={
            query
              ? "Try a different name, email or keyword."
              : "Enquiries from the contact form land here. New messages are highlighted until you read them."
          }
          action={
            query ? (
              <Button variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((row) => {
            const open = openId === row.id;
            return (
              <li
                key={row.id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-paper transition-colors",
                  row.status === "new" ? "border-vermilion/40" : "border-line",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(open ? null : row.id);
                    if (!open && row.status === "new") {
                      setStatus(row, "read", "Marked as read");
                    }
                  }}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left"
                >
                  <span
                    className={cn(
                      "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                      row.status === "new" ? "bg-vermilion" : "bg-line",
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-medium text-ink">{row.name}</span>
                      <span className="text-xs text-ink/45">{row.email}</span>
                      {row.company ? (
                        <span className="text-xs text-ink/35">{row.company}</span>
                      ) : null}
                    </span>
                    <span className="mt-1 block truncate text-sm text-ink/70">
                      {row.subject || row.message}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-[11px] text-ink/35">{relativeTime(row.createdAt)}</span>
                    <Icon
                      name="chevron-down"
                      className={cn("h-4 w-4 text-ink/30 transition-transform", open && "rotate-180")}
                    />
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-line-soft bg-bone/50 px-5 py-5">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-ink/75">
                      {row.message}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        icon="external"
                        onClick={() =>
                          window.open(
                            `mailto:${row.email}?subject=${encodeURIComponent(
                              `Re: ${row.subject || "Your enquiry"}`,
                            )}`,
                            "_self",
                          )
                        }
                      >
                        Reply by email
                      </Button>
                      {row.status === "archived" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(row, "read", "Moved back to read")}
                        >
                          Unarchive
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(row, "archived", "Archived")}
                        >
                          Archive
                        </Button>
                      )}
                      {row.status === "new" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(row, "read", "Marked as read")}
                        >
                          Mark as read
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(row, "new", "Marked as unread")}
                        >
                          Mark unread
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        icon="trash"
                        onClick={() => setConfirmDelete(row)}
                      >
                        Delete
                      </Button>
                      {row.budget ? (
                        <span className="ml-auto rounded-full bg-bone-2 px-3 py-1.5 text-[11px] font-medium text-ink/60">
                          Budget: {row.budget}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
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
            <h3 className="font-display text-2xl text-ink">Delete this message?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              The enquiry from {confirmDelete.name} will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Keep it
              </Button>
              <Button variant="danger" loading={deleting} onClick={() => void remove(confirmDelete)}>
                Delete message
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
