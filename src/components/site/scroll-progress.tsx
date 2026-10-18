"use client";

import { useEffect, useRef } from "react";

/** Thin gradient reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      const element = bar.current;
      if (!element) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      element.style.transform = `scaleX(${ratio})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]">
      <div
        ref={bar}
        className="h-full origin-left bg-gradient-to-r from-azure via-violet to-vermilion"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
