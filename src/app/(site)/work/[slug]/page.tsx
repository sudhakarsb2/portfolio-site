import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Artwork } from "@/components/artwork";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { getAdjacentProjects, getProjectBySlug } from "@/lib/data";
import { displayImage, mediaKind, youtubeId } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { next } = await getAdjacentProjects(slug);
  const paragraphs = project.description.split(/\n\n+/).filter(Boolean);

  return (
    <article className="pb-16">
      <section className="relative overflow-hidden bg-black pb-24 pt-36 md:pb-32 md:pt-44">
        <div className="pointer-events-none absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-vermilion/20 blur-[130px] animate-aurora" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-azure/20 blur-[120px] animate-aurora-2" />

        <div className="relative shell">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white"
          >
            <Icon name="chevron-right" className="h-3.5 w-3.5 rotate-180" />
            All work
          </Link>

          <div className="mt-8 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {project.category ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium text-white/80">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.category.color }}
                      aria-hidden="true"
                    />
                    {project.category.name}
                  </span>
                ) : null}
                {project.featured ? (
                  <span className="rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold text-black">
                    Featured
                  </span>
                ) : null}
              </div>
              <h1 className="mt-7 text-[clamp(2.8rem,7.5vw,6rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white">
                {project.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/60">{project.summary}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-6 text-sm">
              <div>
                <dt className="micro text-[9px] text-white/35">Client</dt>
                <dd className="mt-1.5 text-white">{project.client}</dd>
              </div>
              <div>
                <dt className="micro text-[9px] text-white/35">Year</dt>
                <dd className="mt-1.5 text-white">{project.year}</dd>
              </div>
              <div>
                <dt className="micro text-[9px] text-white/35">Discipline</dt>
                <dd className="mt-1.5 text-white">{project.category?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="micro text-[9px] text-white/35">Tags</dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {project.tags.length ? (
                    project.tags.map((tag) => (
                      <span key={tag.id} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/70">
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/40">—</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="shell -mt-12 md:-mt-16">
        <Reveal>
          <div className="aspect-[16/10] overflow-hidden rounded-[36px] border border-white/10 bg-[#101012] shadow-lift">
            {project.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage(project.coverImage)} alt={`${project.title} cover`} className="h-full w-full object-cover" />
            ) : (
              <Artwork
                seed={project.title}
                title={project.title}
                client={project.client}
                year={project.year}
                className="h-full w-full"
              />
            )}
          </div>
        </Reveal>
      </div>

      {project.gallery.length ? (
        <div className="shell mt-6 grid gap-6 sm:grid-cols-2">
          {project.gallery.map((url) => {
            const kind = mediaKind(url);
            return (
              <Reveal key={url} className={kind !== "image" ? "sm:col-span-2" : undefined}>
                {kind === "youtube" ? (
                  <div className="aspect-video overflow-hidden rounded-[28px] border border-white/10 bg-[#101012]">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${youtubeId(url)}`}
                      title={`${project.title} — video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                ) : kind === "video" ? (
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101012]">
                    <video src={url} controls playsInline preload="metadata" className="h-auto w-full" />
                  </div>
                ) : kind === "pdf" ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-5 rounded-[28px] border border-white/10 bg-[#101012] p-6 transition-colors hover:border-white/30"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-vermilion text-xs font-bold uppercase text-white">
                      PDF
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">View document</span>
                      <span className="mt-1 block text-xs text-white/50">
                        Opens in a new tab — {project.title}
                      </span>
                    </span>
                    <Icon
                      name="arrow-up-right"
                      className="ml-auto h-4 w-4 text-white/40 transition-transform group-hover:rotate-45"
                    />
                  </a>
                ) : (
                  <div className="aspect-[4/3] overflow-hidden rounded-[28px] border border-white/10 bg-[#101012]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`${project.title} gallery`} className="h-full w-full object-cover" />
                  </div>
                )}
              </Reveal>
            );
          })}
        </div>
      ) : null}

      <div className="shell mt-20 grid gap-14 lg:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <div className="space-y-6">
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="text-[18px] leading-[1.8] text-white/70">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="space-y-6">
          {project.credits.length ? (
            <div className="rounded-[28px] border border-white/10 bg-[#101012] p-7">
              <p className="micro text-white/40">Scope & credits</p>
              <ul className="mt-5 space-y-3">
                {project.credits.map((credit) => (
                  <li key={credit} className="text-sm text-white/75">
                    {credit}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1a1230] to-[#2a130c] p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-vermilion/30 blur-[70px] animate-aurora-2" />
            <p className="micro relative text-white/50">Need something like this?</p>
            <p className="relative mt-3 text-2xl font-semibold leading-snug tracking-tight text-white">
              Let&apos;s talk about your rollout.
            </p>
            <Link
              href="/contact"
              className="group relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[13px] font-semibold text-black transition-all hover:bg-vermilion hover:text-white"
            >
              Start a project
              <Icon name="arrow-up-right" className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </Reveal>
      </div>

      {next ? (
        <div className="shell mt-24">
          <Reveal>
            <Link href={`/work/${next.slug}`} className="group block">
              <div className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-[#0d0d0f] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-white/25 md:flex-row md:items-center">
                <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl md:h-24 md:w-32">
                  <Artwork seed={next.title} title={next.title} className="h-full w-full" showMeta={false} />
                </div>
                <div className="flex-1">
                  <p className="micro text-white/40">Next project</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{next.title}</p>
                  <p className="mt-1 text-sm text-white/45">
                    {next.client} · {next.year}
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-all group-hover:rotate-45 group-hover:border-vermilion group-hover:bg-vermilion">
                  <Icon name="arrow-up-right" className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      ) : null}
    </article>
  );
}
