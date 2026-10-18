"use client";

import { cn } from "@/lib/utils";

/**
 * Word-by-word masked reveal. Each word slides up from behind its own mask
 * with a slight rotation — the signature "kinetic type" moment.
 */
export function KineticWords({
  text,
  className,
  wordClassName,
  delay = 0,
  step = 90,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  step?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={cn("inline", className)}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden pb-[0.08em] align-bottom"
        >
          <span
            className={cn("inline-block", wordClassName)}
            style={{
              animation: "rise 0.95s cubic-bezier(.22,1,.36,1) both",
              animationDelay: `${delay + index * step}ms`,
            }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </span>
  );
}

/** Rotating circular badge built from SVG text on a circular path. */
export function OrbitBadge({
  words = ["Production artist", "Rollouts", "UAE", "Press-ready"],
  className,
  tone = "bone",
}: {
  words?: string[];
  className?: string;
  tone?: "bone" | "ink";
}) {
  const text = words.join(" • ");
  const color = tone === "bone" ? "#F4F2EC" : "#0C0C10";

  return (
    <div className={cn("animate-spin-slow", className)}>
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <defs>
          <path
            id="orbit-path"
            d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"
            fill="none"
          />
        </defs>
        <text
          fill={color}
          fontFamily="var(--font-mono), monospace"
          fontSize="13"
          fontWeight="700"
          letterSpacing="3.4"
        >
          <textPath href="#orbit-path" startOffset="0%">
            {text.toUpperCase()}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
