"use client";

import { useEffect, useRef, useState } from "react";
import { cn, initials } from "@/lib/utils";

/**
 * Profile picture with a graceful monogram fallback so the layout never
 * breaks if a photo has not been uploaded yet.
 */
export function ProfilePhoto({
  src,
  name,
  className,
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setFailed(false);
    const image = ref.current;
    if (image && image.complete && image.naturalWidth === 0) setFailed(true);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1c1c1e] via-[#2a2147] to-[#3a1d14]",
          className,
        )}
        aria-label={name}
      >
        <span className="font-display text-[clamp(4rem,12vw,9rem)] leading-none text-white/90">
          {initials(name)}
        </span>
        <span className="absolute bottom-3 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Photo not added yet
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={`Portrait of ${name}`}
      onError={() => setFailed(true)}
      className={cn("object-cover object-[center_20%]", className)}
    />
  );
}
