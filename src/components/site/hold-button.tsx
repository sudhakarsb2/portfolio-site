"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const HOLD_MS = 1100;

/**
 * "Press & hold to unlock" — a playful gate in front of the full portfolio.
 * Fully accessible: Enter / Space opens it immediately for keyboard users.
 */
export function HoldButton({
  href,
  label = "Hold to open the full portfolio",
  className,
  tone = "light",
}: {
  href: string;
  label?: string;
  className?: string;
  tone?: "light" | "ghost";
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState(false);
  const [opening, setOpening] = useState(false);

  const progressRef = useRef(0);
  const holding = useRef(false);
  const startedAt = useRef(0);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function push(value: number) {
    progressRef.current = value;
    setProgress(value);
  }

  function open() {
    setOpening(true);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(25);
    router.push(href);
  }

  function tick(now: number) {
    if (!holding.current) return;
    const next = Math.min(1, (now - startedAt.current) / HOLD_MS);
    push(next);
    if (next >= 1) {
      holding.current = false;
      open();
      return;
    }
    frame.current = requestAnimationFrame(tick);
  }

  function begin() {
    if (opening) return;
    cancelAnimationFrame(frame.current);
    holding.current = true;
    startedAt.current = performance.now() - progressRef.current * HOLD_MS;
    frame.current = requestAnimationFrame(tick);
  }

  function release() {
    if (!holding.current) return;
    holding.current = false;
    cancelAnimationFrame(frame.current);

    if (performance.now() - startedAt.current < 260) {
      setHint(true);
      window.setTimeout(() => setHint(false), 1700);
    }

    const decay = () => {
      const next = Math.max(0, progressRef.current - 0.045);
      push(next);
      if (next > 0 && !holding.current) frame.current = requestAnimationFrame(decay);
    };
    frame.current = requestAnimationFrame(decay);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  }

  const percent = Math.round(progress * 100);
  const circumference = 2 * Math.PI * 15;

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-label={`${label}. Press and hold, or press Enter.`}
        onPointerDown={begin}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onContextMenu={(event) => event.preventDefault()}
        onKeyDown={onKeyDown}
        style={{ touchAction: "none", WebkitUserSelect: "none", userSelect: "none" }}
        className={cn(
          "group relative inline-flex h-14 select-none items-center gap-3 overflow-hidden rounded-full pl-2 pr-7 text-[13px] font-semibold outline-none transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-vermilion focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.97]",
          hint && "animate-shake",
          tone === "light"
            ? "bg-white text-black"
            : "border border-white/25 bg-white/10 text-white backdrop-blur",
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-vermilion via-[#ff7a45] to-[#ffb199]"
          style={{ width: `${percent}%`, opacity: progress > 0 ? 1 : 0 }}
        />

        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 h-full w-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.18"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <Icon
            name={opening || progress >= 1 ? "arrow-up-right" : "lock"}
            className="relative h-4 w-4"
          />
        </span>

        <span className="relative">
          {opening
            ? "Opening…"
            : progress > 0
              ? `Keep holding… ${percent}%`
              : label}
        </span>
      </button>

      <span
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute -bottom-8 left-4 whitespace-nowrap text-[11px] font-medium text-white/60 transition-opacity duration-300",
          hint ? "opacity-100" : "opacity-0",
        )}
      >
        A tap isn&apos;t enough — press and hold ✨
      </span>
    </div>
  );
}
