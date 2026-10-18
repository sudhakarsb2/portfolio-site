"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export function DashboardShell({
  items,
  user,
  children,
}: {
  items: NavItem[];
  user: { name: string; email: string; role: string; title: string };
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-bone">
      <Sidebar items={items} user={user} open={open} onClose={() => setOpen(false)} />
      <div className="relative lg:pl-[282px]">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="relative px-5 py-7 lg:px-10 lg:py-9">
          <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet/10 blur-[110px] animate-aurora" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-vermilion/10 blur-[110px] animate-aurora-2" />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
