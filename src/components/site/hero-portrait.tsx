"use client";

import { useRef, type PointerEvent } from "react";
import { ProfilePhoto } from "@/components/site/profile-photo";

const chips = [
  { text: "Graphic Design", className: "-left-4 top-[14%] sm:-left-10", delay: "0s" },
  { text: "Advertising", className: "-right-3 top-[34%] sm:-right-9", delay: "1.2s" },
  { text: "Print and Production", className: "-left-3 bottom-[22%] sm:-left-12", delay: "2.1s" },
  { text: "Digital rollouts", className: "-right-2 bottom-[8%] sm:-right-8", delay: "0.6s" },
];

/** Tilting profile card with floating discipline chips that tie to the craft. */
export function HeroPortrait({
  src,
  name,
  role,
}: {
  src?: string | null;
  name: string;
  role: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(event: PointerEvent<HTMLDivElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty("--rx", `${-y * 9}deg`);
    element.style.setProperty("--ry", `${x * 11}deg`);
  }

  function onLeave() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative mx-auto w-full max-w-[26rem]"
      style={{ perspective: "1100px" }}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[48px] bg-gradient-to-br from-vermilion/30 via-violet/25 to-azure/25 blur-3xl"
      />

      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[36px] border border-white/15 bg-[#0b0b0d] shadow-lift transition-transform duration-200 ease-out"
        style={{ transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
      >
        <ProfilePhoto src={src} name={name} className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-xl font-semibold tracking-tight text-white">{name}</p>
          <p className="mt-1 text-[13px] text-white/65">{role}</p>
        </div>
      </div>

      {chips.map((chip) => (
        <div
          key={chip.text}
          className={`absolute ${chip.className} animate-float`}
          style={{ animationDelay: chip.delay }}
        >
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3.5 py-2 text-[11px] font-medium text-white/90 shadow-lift backdrop-blur-xl">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-acid text-[9px] font-bold text-black">
              ✓
            </span>
            {chip.text}
          </div>
        </div>
      ))}
    </div>
  );
}
