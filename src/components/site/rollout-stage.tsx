"use client";

import { useEffect, useMemo, useState } from "react";
import { Artwork } from "@/components/artwork";
import { cn } from "@/lib/utils";

export type StageCategory = {
  id: number;
  name: string;
  description: string;
  color: string;
};

type SceneKind = "billboard" | "stand" | "pack" | "phone" | "magazine" | "poster";

/** Picks a scene template from the category name, so new categories just work. */
function sceneFor(name: string): SceneKind {
  const text = name.toLowerCase();
  if (/(out of home|ooh|outdoor|billboard|unipole|hoarding)/.test(text)) return "billboard";
  if (/(point of sale|posm|in-store|instore|retail|shelf|display)/.test(text)) return "stand";
  if (/(pack)/.test(text)) return "pack";
  if (/(digital|social|web|screen|app|email)/.test(text)) return "phone";
  if (/(magazine|editorial|print|publication|brochure|catalog)/.test(text)) return "magazine";
  return "poster";
}

function frameClass(active: boolean) {
  return cn(
    "absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]",
    active ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
  );
}

function Scene({ kind, label, color }: { kind: SceneKind; label: string; color: string }) {
  const seed = `Key visual — ${label}`;

  if (kind === "billboard") {
    return (
      <div className="relative w-[min(88%,36rem)]">
        <div className="absolute -top-3 left-6 right-6 flex justify-between">
          {[0, 1, 2, 3].map((light) => (
            <span key={light} className="h-2 w-8 rounded-b-full bg-gradient-to-b from-white/80 to-transparent" />
          ))}
        </div>
        <div className="aspect-[3/1] overflow-hidden rounded-md border-[7px] border-[#2b2b2e] bg-black shadow-lift">
          <Artwork seed={seed} title={label} client="Key visual" className="h-full w-full" align="xMidYMax" />
        </div>
        <span className="absolute -bottom-16 left-[18%] h-16 w-3 bg-gradient-to-b from-[#3a3a3d] to-transparent" />
        <span className="absolute -bottom-16 right-[18%] h-16 w-3 bg-gradient-to-b from-[#3a3a3d] to-transparent" />
      </div>
    );
  }

  if (kind === "stand") {
    return (
      <div className="relative flex flex-col items-center">
        <div className="relative h-[17rem] w-[11.5rem] overflow-hidden rounded-t-2xl border-[5px] border-[#2b2b2e] bg-black shadow-lift sm:h-[20rem] sm:w-[13.5rem]">
          <Artwork seed={seed} title={label} client="Key visual" className="h-full w-full" />
        </div>
        <div className="h-3 w-[14.5rem] rounded-b-xl bg-[#2b2b2e] sm:w-[16.5rem]" />
        <div
          className="absolute -right-12 top-10 flex h-20 w-20 rotate-12 animate-float items-center justify-center rounded-full border-4 border-white text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white shadow-lift"
          style={{ backgroundColor: color }}
        >
          Wobbler
          <br />
          tag
        </div>
      </div>
    );
  }

  if (kind === "pack") {
    return (
      <>
        <div style={{ perspective: "1200px" }}>
          <div className="relative animate-box-sway" style={{ width: 180, height: 240, transformStyle: "preserve-3d" }}>
            <div
              className="absolute inset-0 overflow-hidden rounded-[3px] border border-white/15"
              style={{ transform: "translateZ(50px)", backfaceVisibility: "hidden" }}
            >
              <Artwork seed={seed} title={label} client="Key visual" className="h-full w-full" />
            </div>
            <div
              className="absolute overflow-hidden border border-white/10"
              style={{
                left: 40,
                top: 0,
                width: 100,
                height: 240,
                transform: "rotateY(90deg) translateZ(90px)",
                backfaceVisibility: "hidden",
                background: `linear-gradient(to bottom, ${color}, #7a5cff)`,
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center [writing-mode:vertical-rl] text-[11px] font-bold uppercase tracking-[0.3em] text-white/80">
                {label}
              </span>
            </div>
            <div
              className="absolute border border-white/10 bg-[#1b1b1e]"
              style={{
                left: 0,
                top: 70,
                width: 180,
                height: 100,
                transform: "rotateX(90deg) translateZ(120px)",
                backfaceVisibility: "hidden",
              }}
            >
              <span className="absolute inset-x-6 top-1/2 h-px bg-white/25" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 h-6 w-48 rounded-[50%] bg-black/60 blur-xl" />
      </>
    );
  }

  if (kind === "phone") {
    return (
      <div className="relative h-[21rem] w-[10.5rem] overflow-hidden rounded-[2.2rem] border-[6px] border-[#2b2b2e] bg-black shadow-lift sm:h-[25rem] sm:w-[12.5rem]">
        <Artwork seed={seed} title={label} client="Key visual" className="h-full w-full" />
        <div className="absolute inset-x-3 top-3 flex gap-1">
          {[0, 1, 2].map((bar) => (
            <span key={bar} className={cn("h-0.5 flex-1 rounded-full", bar === 0 ? "bg-white" : "bg-white/40")} />
          ))}
        </div>
        <span className="absolute left-1/2 top-1.5 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
        <div className="absolute inset-x-4 bottom-4 rounded-full bg-white px-4 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-black">
          Learn more
        </div>
      </div>
    );
  }

  if (kind === "magazine") {
    return (
      <div className="relative flex" style={{ perspective: "1400px" }}>
        <div
          className="h-[16rem] w-[11rem] overflow-hidden rounded-l-sm border border-white/15 bg-black shadow-lift sm:h-[19rem] sm:w-[13rem]"
          style={{ transform: "rotateY(18deg)", transformOrigin: "right center" }}
        >
          <Artwork seed={`${seed} left`} title={label} client="Key visual" className="h-full w-full" showMeta={false} />
        </div>
        <div
          className="relative h-[16rem] w-[11rem] overflow-hidden rounded-r-sm border border-white/15 bg-[#101012] shadow-lift sm:h-[19rem] sm:w-[13rem]"
          style={{ transform: "rotateY(-18deg)", transformOrigin: "left center" }}
        >
          <div className="flex h-full flex-col justify-between p-5">
            <div>
              <span className="micro text-[8px]" style={{ color }}>
                {label}
              </span>
              <span className="mt-3 block h-2.5 w-4/5 rounded bg-white/85" />
              <span className="mt-1.5 block h-2.5 w-3/5 rounded bg-white/85" />
            </div>
            <div className="space-y-1.5">
              {[0, 1, 2, 3, 4].map((line) => (
                <span key={line} className="block h-1 rounded bg-white/25" style={{ width: `${92 - line * 9}%` }} />
              ))}
            </div>
            <span className="micro text-[7px] text-white/30">Spread 24 — 25</span>
          </div>
        </div>
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-black/70" />
      </div>
    );
  }

  // poster — the fallback for any new category
  return (
    <div className="relative">
      <span className="absolute -top-8 left-1/2 h-8 w-px -translate-x-1/2 bg-white/30" />
      <span className="absolute -top-2 left-1/2 h-3 w-10 -translate-x-1/2 rounded-sm bg-[#2b2b2e]" />
      <div className="h-[17rem] w-[12.5rem] rotate-[-2deg] overflow-hidden rounded-sm border-[10px] border-white bg-black shadow-lift sm:h-[20rem] sm:w-[14.5rem]">
        <Artwork seed={seed} title={label} client="Key visual" className="h-full w-full" />
      </div>
      <span
        className="absolute -right-10 bottom-8 flex rotate-6 animate-float items-center rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-lift"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    </div>
  );
}

export function RolloutStage({ categories }: { categories: StageCategory[] }) {
  const stages = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        scene: sceneFor(category.name),
      })),
    [categories],
  );

  const [activeId, setActiveId] = useState<number | null>(stages[0]?.id ?? null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!stages.some((stage) => stage.id === activeId)) {
      setActiveId(stages[0]?.id ?? null);
    }
  }, [stages, activeId]);

  useEffect(() => {
    if (paused || stages.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveId((current) => {
        const index = stages.findIndex((stage) => stage.id === current);
        return stages[(index + 1) % stages.length]?.id ?? stages[0]?.id ?? null;
      });
    }, 4800);
    return () => window.clearInterval(timer);
  }, [paused, stages]);

  if (!stages.length) return null;
  const active = stages.find((stage) => stage.id === activeId) ?? stages[0];

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#121214] to-black"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(122,92,255,0.22),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:44px_44px]"
      />

      <div className="relative flex items-center justify-between gap-4 px-6 pt-6">
        <span className="micro text-[10px] text-white/45">One key visual → {active.name}</span>
        {active.description ? (
          <span key={active.id} className="hidden max-w-[50%] truncate text-[13px] text-white/50 animate-rise sm:block">
            {active.description}
          </span>
        ) : null}
      </div>

      <div className="relative h-[24rem] sm:h-[28rem]">
        {stages.map((stage) => (
          <div key={stage.id} className={frameClass(stage.id === active.id)}>
            <Scene kind={stage.scene} label={stage.name} color={stage.color} />
          </div>
        ))}
      </div>

      <div className="relative flex flex-wrap gap-2 px-6 pb-6">
        {stages.map((stage) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => {
              setActiveId(stage.id);
              setPaused(true);
            }}
            aria-pressed={stage.id === active.id}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300",
              stage.id === active.id
                ? "border-white bg-white text-black"
                : "border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white",
            )}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden="true" />
            {stage.name}
          </button>
        ))}
      </div>
    </div>
  );
}
