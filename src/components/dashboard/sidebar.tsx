"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/site/logo";
import { Icon, type IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  badge?: number;
};

export function Sidebar({
  items,
  user,
  open,
  onClose,
}: {
  items: NavItem[];
  user: { name: string; email: string; role: string; title: string };
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[282px] flex-col bg-ink text-bone transition-transform duration-500 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="pointer-events-none absolute -left-20 top-10 h-56 w-56 rounded-full bg-violet/25 blur-[90px] animate-aurora" />
        <div className="pointer-events-none absolute -right-16 bottom-24 h-52 w-52 rounded-full bg-vermilion/20 blur-[90px] animate-aurora-2" />

        <div className="relative flex items-center justify-between px-6 py-6">
          <Link href="/dashboard" onClick={onClose}>
            <Logo light />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-full p-2 text-bone/60 transition-colors hover:bg-bone/10 hover:text-bone lg:hidden"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 pb-4 dash-scroll">
          <p className="micro px-3 pb-3 pt-2 text-[9px] text-bone/30">Manage</p>
          <ul className="space-y-1">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-all duration-300",
                      active
                        ? "bg-bone text-ink shadow-lift"
                        : "text-bone/60 hover:bg-bone/10 hover:text-bone",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                        active ? "bg-ink/5 text-ink" : "bg-bone/5 text-bone/70 group-hover:bg-bone/10",
                      )}
                    >
                      <Icon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="flex-1 truncate font-medium">{item.label}</span>
                    {item.badge ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-vermilion px-1.5 text-[11px] font-semibold text-white shadow-glow">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="micro px-3 pb-3 pt-7 text-[9px] text-bone/30">Portfolio</p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm text-bone/60 transition-all hover:bg-bone/10 hover:text-bone"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-bone/5">
                  <Icon name="external" className="h-4 w-4" />
                </span>
                View live site
              </Link>
            </li>
            <li>
              <Link
                href="/work"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm text-bone/60 transition-all hover:bg-bone/10 hover:text-bone"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-bone/5">
                  <Icon name="grid" className="h-4 w-4" />
                </span>
                Public work archive
              </Link>
            </li>
          </ul>
        </nav>

        <div className="relative border-t border-bone/10 p-4">
          <div className="rounded-2xl border border-bone/10 bg-bone/5 p-3">
            <div className="flex items-center gap-3">
              <img
                src="/images/profile.jpg"
                alt={user.name}
                className="h-9 w-9 shrink-0 rounded-full object-cover object-[center_20%]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-bone">{user.name}</p>
                <p className="micro mt-0.5 truncate text-[8px] text-bone/40">
                  {user.title || user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                aria-label="Sign out"
                className="rounded-xl p-2 text-bone/50 transition-colors hover:bg-bone/10 hover:text-bone disabled:opacity-50"
              >
                <Icon name="logout" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
