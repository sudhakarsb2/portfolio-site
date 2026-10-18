"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icons";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/projects": "Projects",
  "/dashboard/messages": "Messages",
  "/dashboard/services": "Services",
  "/dashboard/testimonials": "Testimonials",
  "/dashboard/experience": "Experience",
  "/dashboard/tags": "Tags",
  "/dashboard/categories": "Disciplines",
  "/dashboard/settings": "Settings",
};

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const base = pathname.startsWith("/dashboard/projects/") ? "/dashboard/projects" : pathname;
  const title = titles[base] ?? "Studio";

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-bone/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-5 lg:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink transition-colors hover:border-ink lg:hidden"
          >
            <Icon name="menu" className="h-4 w-4" />
          </button>
          <div>
            <p className="micro text-[9px] text-ink/35">Portfolio / Sudhakar</p>
            <h1 className="font-display text-xl leading-tight text-ink">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-ink/40 md:block">
            {now
              ? now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })
              : ""}
          </p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-paper px-3.5 text-xs font-medium text-ink/70 transition-all hover:border-ink hover:text-ink"
          >
            <Icon name="external" className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Live site</span>
          </a>
        </div>
      </div>
    </header>
  );
}
