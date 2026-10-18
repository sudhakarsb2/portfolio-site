import Link from "next/link";
import { Artwork } from "@/components/artwork";
import { HeroPortrait } from "@/components/site/hero-portrait";
import { HoldButton } from "@/components/site/hold-button";
import { ProjectCard } from "@/components/site/project-card";
import { RolloutStage } from "@/components/site/rollout-stage";
import { Spotlight } from "@/components/site/spotlight";
import { WordCycler } from "@/components/site/word-cycler";
import { Icon, type IconName } from "@/components/ui/icons";
import { Counter, Reveal } from "@/components/ui/reveal";
import { flattenSkills } from "@/lib/utils";
import {
  getCategories,
  getExperiences,
  getPublishedProjects,
  getServices,
  getSettings,
  getTestimonials,
} from "@/lib/data";

export const dynamic = "force-dynamic";

const serviceIcons: Record<string, IconName> = {
  aperture: "aperture",
  book: "book",
  box: "box",
  compass: "compass",
  monitor: "monitor",
  play: "play",
  layers: "layers",
};

const list = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default async function HomePage() {
  const [projects, services, testimonials, experiences, settings, categories] = await Promise.all([
    getPublishedProjects(),
    getServices(),
    getTestimonials(),
    getExperiences(),
    getSettings(),
    getCategories(),
  ]);

  const name = settings.designerName ?? "Sudhakar Bhambade";
  const role = settings.roleTitle ?? "Graphic Designer / Identity & Production Specialist";
  const clients = list(settings.clients);
  const skills = flattenSkills(settings.skills);
  const heroWords = list(settings.heroWords);
  const cycleWords = heroWords.length ? heroWords : ["billboard.", "shelf.", "pack.", "screen."];
  const shown = projects.slice(0, 5);
  const locked = projects.slice(5);

  const stats: Array<{ label: string; value: number; suffix: string }> = [
    { label: "Years in design & production", value: Number(settings.yearsExperience ?? 18), suffix: "+" },
    { label: "Years at Leo Burnett MEA", value: Number(settings.agencyYears ?? 8), suffix: "+" },
    { label: "Global brands produced for", value: Number(settings.brandsCount ?? 20), suffix: "+" },
    { label: "Platforms, one standard", value: Number(settings.channelsCount ?? 4), suffix: "" },
  ];

  const cardData = (project: (typeof projects)[number]) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    client: project.client,
    year: project.year,
    summary: project.summary,
    featured: project.featured,
    coverImage: project.coverImage,
    category: project.category,
    tags: project.tags,
  });

  return (
    <>
      {/* ───────── HERO ───────── */}
      <Spotlight className="overflow-hidden bg-black">
        <div className="pointer-events-none absolute -left-40 -top-32 h-[36rem] w-[36rem] rounded-full bg-violet/25 blur-[140px] animate-aurora" />
        <div className="pointer-events-none absolute -right-32 top-40 h-[30rem] w-[30rem] rounded-full bg-vermilion/20 blur-[130px] animate-aurora-2" />
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(70%_60%_at_50%_30%,black,transparent)]" />

        <div className="relative shell grid items-center gap-20 pb-24 pt-32 lg:grid-cols-[1.15fr_0.85fr] lg:pb-32 lg:pt-40">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-acid" />
                </span>
                <span className="micro text-[10px] text-white/70">
                  {settings.availability ?? "Open to projects"}
                </span>
              </span>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-8 text-lg font-medium text-white/60">
                {name} <span className="text-white/25">/</span> Production Specialist
              </p>
            </Reveal>

            <Reveal delay={140}>
              <h1 className="mt-4 text-[clamp(3rem,8.4vw,7.2rem)] font-semibold leading-[0.93] tracking-[-0.05em] text-white">
                Your brand,
                <br />
                on every
                <br />
                <WordCycler
                  words={cycleWords}
                  className="bg-gradient-to-r from-azure via-violet to-vermilion bg-clip-text pr-2 text-transparent"
                />
              </h1>
            </Reveal>

            <Reveal delay={240}>
              <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-white/60">
                {settings.subheadline}
              </p>
            </Reveal>

            <Reveal delay={340}>
              <div className="mt-11 flex flex-wrap items-center gap-x-5 gap-y-10">
                <HoldButton href="/work" label={settings.holdLabel || "Hold to open the full portfolio"} />
                <Link
                  href="/contact"
                  className="inline-flex h-14 items-center gap-2 rounded-full border border-white/20 px-7 text-[13px] font-semibold text-white transition-all hover:border-white hover:bg-white/10"
                >
                  Say hello
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <HeroPortrait src={settings.profilePhoto || "/images/profile.jpg"} name={name} role={role} />
          </Reveal>
        </div>

        {clients.length ? (
          <div className="relative border-y border-white/10 bg-black/40 backdrop-blur">
            <div className="shell flex items-center gap-6 py-5">
              <p className="micro hidden shrink-0 text-[9px] text-white/35 md:block">
                Brands I&apos;ve
                <br />
                produced for
              </p>
              <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
                <div className="flex w-max animate-marquee items-center gap-12">
                  {[0, 1].map((copy) => (
                    <div key={copy} className="flex shrink-0 items-center gap-12">
                      {clients.map((client) => (
                        <span
                          key={`${copy}-${client}`}
                          className="whitespace-nowrap text-lg font-semibold tracking-tight text-white/45 transition-colors hover:text-white"
                        >
                          {client}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Spotlight>

      {/* ───────── ROLLOUT MACHINE ───────── */}
      <section className="shell py-28 md:py-36">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="micro text-white/40">The craft</p>
          <h2 className="mt-5 text-[clamp(2.4rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
            One idea.{" "}
            <span className="bg-gradient-to-r from-azure via-violet to-vermilion bg-clip-text text-transparent">
              Every touchpoint.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/55">
            One key visual, carried across out-of-home, point of sale, packaging and digital —
            without losing the idea along the way.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-14">
          <RolloutStage
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description,
              color: category.color,
            }))}
          />
        </Reveal>
      </section>

      {/* ───────── SELECTED WORK + LOCKED ARCHIVE ───────── */}
      <section className="shell pb-28 md:pb-36">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="micro text-white/40">Selected rollouts</p>
            <h2 className="mt-5 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
              Recent work
            </h2>
          </div>
          <Link
            href="/work"
            className="group inline-flex items-center gap-2.5 rounded-full border border-white/15 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:border-white"
          >
            View all {projects.length}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-all group-hover:rotate-45 group-hover:bg-vermilion group-hover:text-white">
              <Icon name="arrow-up-right" className="h-3.5 w-3.5" />
            </span>
          </Link>
        </Reveal>

        <div className="mt-14 grid gap-x-6 gap-y-14 lg:grid-cols-12">
          {shown.slice(0, 2).map((project, index) => (
            <Reveal key={project.id} delay={index * 110} className={index === 0 ? "lg:col-span-7" : "lg:col-span-5"}>
              <ProjectCard project={cardData(project)} aspect="aspect-[4/5] lg:aspect-[6/5]" />
            </Reveal>
          ))}

          {shown.slice(2, 5).map((project, index) => (
            <Reveal key={project.id} delay={index * 110} className="lg:col-span-4">
              <ProjectCard project={cardData(project)} />
            </Reveal>
          ))}
        </div>

        {locked.length ? (
          <Reveal className="mt-16">
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#0b0b0d]">
              <div className="grid grid-cols-2 gap-3 p-3 opacity-80 sm:grid-cols-4">
                {locked.slice(0, 4).map((project) => (
                  <div key={project.id} className="aspect-[4/5] overflow-hidden rounded-2xl">
                    <Artwork
                      seed={project.title}
                      title={project.title}
                      showMeta={false}
                      className="h-full w-full scale-110 blur-[7px] saturate-75"
                    />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black via-black/70 to-black/30 px-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
                  <Icon name="lock" className="h-6 w-6 text-white" />
                </span>
                <h3 className="mt-6 text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-tight tracking-[-0.04em] text-white">
                  {locked.length} more projects inside the full archive
                </h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/60">
                  Packaging families, POSM kits, OOH series, bilingual adaptations and the editorial work
                  that started it all.
                </p>
                <div className="mt-8 pb-6">
                  <HoldButton href="/work" label={settings.holdLabelArchive || "Hold to unlock the full portfolio"} />
                </div>
              </div>
            </div>
          </Reveal>
        ) : null}
      </section>

      {/* ───────── STATS ───────── */}
      <section className="shell pb-28 md:pb-36">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 90}>
              <div className="accent-card h-full rounded-[28px] border border-white/10 bg-gradient-to-b from-[#141416] to-[#0a0a0b] p-7">
                <p className="text-[clamp(3rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.05em] text-white">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-4 text-[13px] leading-snug text-white/50">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────── CAPABILITIES ───────── */}
      <section className="relative overflow-hidden border-y border-white/10 bg-[#050506] py-28 md:py-36">
        <div className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 rounded-full bg-azure/15 blur-[140px] animate-aurora" />
        <div className="relative shell">
          <Reveal className="max-w-3xl">
            <p className="micro text-white/40">What I produce</p>
            <h2 className="mt-5 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
              Creative eye. <span className="text-white/40">Production hand.</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.id} delay={index * 70} className="h-full">
                <Link
                  href="/services"
                  style={{ "--accent": service.accent } as React.CSSProperties}
                  className="accent-card group flex h-full flex-col rounded-[28px] border border-white/10 bg-white/[0.03] p-7 hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl text-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                      style={{ backgroundColor: service.accent }}
                    >
                      <Icon name={serviceIcons[service.icon] ?? "layers"} className="h-5 w-5" />
                    </span>
                    <span className="micro text-[10px] text-white/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-semibold tracking-tight text-white">{service.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{service.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="micro text-[9px] text-white/35">
                      {service.deliverables.length} deliverables
                    </span>
                    <Icon
                      name="arrow-up-right"
                      className="h-4 w-4 text-white/40 transition-all group-hover:rotate-45 group-hover:text-white"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── CAREER ───────── */}
      <section className="shell py-28 md:py-36">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="micro text-white/40">Career</p>
            <h2 className="mt-5 text-[clamp(2.4rem,5.5vw,4rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-white">
              From first sketch to final press run
            </h2>
            <div className="mt-8 flex flex-wrap gap-2">
              {skills.slice(0, 9).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/12 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/70"
                >
                  {skill}
                </span>
              ))}
            </div>
            <Link
              href="/about"
              className="group mt-10 inline-flex items-center gap-2.5 text-sm font-semibold text-white transition-colors hover:text-vermilion"
            >
              Full experience &amp; education
              <Icon name="chevron-right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          <div>
            {experiences.slice(0, 5).map((experience, index) => (
              <Reveal key={experience.id} delay={index * 70}>
                <div className="group grid gap-2 border-t border-white/10 py-6 transition-colors hover:bg-white/[0.03] sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8 sm:px-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-white">{experience.role}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {experience.company}
                      {experience.location ? ` · ${experience.location}` : ""}
                    </p>
                  </div>
                  <p className="micro text-[10px] text-white/35">{experience.period}</p>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-white/10" />
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIALS ───────── */}
      {testimonials.length ? (
        <section className="border-y border-white/10 bg-[#050506] py-28 md:py-36">
          <div className="shell">
            <Reveal>
              <p className="micro text-white/40">Recommendations</p>
              <h2 className="mt-5 max-w-3xl text-[clamp(2.2rem,5vw,3.75rem)] font-semibold leading-[1] tracking-[-0.045em] text-white">
                Stories of collaboration and results.
              </h2>
            </Reveal>
          </div>

          <div className="scroll-x mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 md:px-10">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 70} className="w-[85vw] shrink-0 snap-start sm:w-[26rem]">
                <figure className="accent-card flex h-full flex-col rounded-[28px] border border-white/10 bg-gradient-to-b from-[#161618] to-[#0b0b0c] p-8">
                  <Icon name="quote" className="h-6 w-6 text-vermilion" />
                  <blockquote className="mt-6 flex-1 text-xl font-medium leading-snug tracking-tight text-white">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-8 border-t border-white/10 pt-5">
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="mt-0.5 text-xs text-white/45">
                      {testimonial.role}
                      {testimonial.company ? ` · ${testimonial.company}` : ""}
                    </p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

    </>
  );
}
