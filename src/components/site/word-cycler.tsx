"use client";

import { useEffect, useState } from "react";

/** Rotates through words with a masked slide-up transition. */
export function WordCycler({
  words,
  interval = 2200,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % words.length), interval);
    return () => window.clearInterval(timer);
  }, [words, interval]);

  return (
    <span className="relative inline-block overflow-hidden pb-[0.24em] -mb-[0.04em] align-bottom">
      <span
        key={index}
        className={className}
        style={{
          display: "inline-block",
          animation: "rise 0.8s cubic-bezier(.22,1,.36,1) both",
        }}
      >
        {words[index]}
      </span>
    </span>
  );
}
