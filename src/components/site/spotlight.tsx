"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Wraps a section with a soft light that follows the pointer. */
export function Spotlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty("--sx", `${event.clientX - rect.left}px`);
    element.style.setProperty("--sy", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onMove} className={cn("relative", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px circle at var(--sx,70%) var(--sy,30%), rgba(122,92,255,0.18), transparent 60%)",
        }}
      />
      {children}
    </div>
  );
}
