"use client";

import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import { Artwork } from "@/components/artwork";
import { Icon } from "@/components/ui/icons";
import { cn, displayImage } from "@/lib/utils";

export type ProjectCardData = {
  id: number;
  title: string;
  slug: string;
  client: string;
  year: number;
  summary: string;
  featured: boolean;
  coverImage?: string | null;
  category?: { name: string; color: string } | null;
  tags?: Array<{ id: number; name: string }>;
};

export function ProjectCard({
  project,
  className,
  aspect = "aspect-[4/5]",
}: {
  project: ProjectCardData;
  index?: number;
  className?: string;
  aspect?: string;
}) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  function onMove(event: MouseEvent<HTMLAnchorElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    element.style.setProperty("--mx", `${x * 100}%`);
    element.style.setProperty("--my", `${y * 100}%`);
    element.style.setProperty("--rx", `${(0.5 - y) * 6}deg`);
    element.style.setProperty("--ry", `${(x - 0.5) * 7}deg`);
  }

  function onLeave() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--rx", "0deg");
    element.style.setProperty("--ry", "0deg");
  }

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ perspective: "900px" }}
      className={cn(
        "group block focus:outline-none focus-visible:ring-2 focus-visible:ring-vermilion focus-visible:ring-offset-4 focus-visible:ring-offset-black",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border border-white/10 bg-[#101012] transition-all duration-500 group-hover:border-white/25",
          aspect,
        )}
        style={{ transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))" }}
      >
        {project.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage(project.coverImage)}
            alt={`${project.title} cover`}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
          />
        ) : (
          <Artwork
            seed={project.title}
            title={project.title}
            client={project.client}
            year={project.year}
            className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-110"
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.18), transparent 65%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {project.featured ? (
          <span className="micro absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[9px] text-white backdrop-blur-md">
            Featured
          </span>
        ) : null}

        <div className="absolute bottom-4 left-4 right-4 flex translate-y-4 items-end justify-between gap-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="micro rounded-full bg-white px-3.5 py-2 text-[9px] text-black">
            View case study
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-vermilion text-white shadow-glow">
            <Icon name="arrow-up-right" className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-white/80">
            {project.title}
          </h3>
          <p className="mt-1.5 text-[13px] text-white/45">
            {project.client}
            {project.category ? ` · ${project.category.name}` : ""} · {project.year}
          </p>
        </div>
        {project.category ? (
          <span
            className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: project.category.color }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </Link>
  );
}
