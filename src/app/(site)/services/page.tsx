import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { getServices, getSettings } from "@/lib/data";
import { splitHeadline } from "@/lib/utils";

export const metadata: Metadata = {
  title: "What I Produce",
  description:
    "Brand rollouts, packaging, out-of-home, POSM, digital and prepress production services by Sudhakar Bhambade.",
};

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

type ProcessStep = { title: string; body: string };

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  const headline = splitHeadline(settings.servicesHeadline, "Built to spec.", "Delivered clean.");
  let process: ProcessStep[] = [];
  try {
    process = JSON.parse(settings.process ?? "[]") as ProcessStep[];
  } catch {
    process = [];
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-black pb-20 pt-36 md:pb-28 md:pt-44">
        <div className="pointer-events-none absolute -left-24 -top-20 h-[30rem] w-[30rem] rounded-full bg-violet/25 blur-[130px] animate-aurora" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-azure/20 blur-[120px] animate-aurora-2" />
        <div className="relative shell">
          <Reveal>
            <p className="micro text-white/40">What I produce</p>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.8rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-white">
              {headline.plain}{" "}
              <span className="bg-gradient-to-r from-azure via-violet to-vermilion bg-clip-text text-transparent">
                {headline.highlight}
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-white/55">
              Six disciplines, one standard: creative analysed for brand impact, then every file structured, colour-managed and
              preflighted so the first press run is the right one.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="shell pb-24">
        <div className="grid gap-4 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 70} className={index === 0 ? "lg:col-span-2" : undefined}>
              <article
                style={{ "--accent": service.accent } as React.CSSProperties}
                className="accent-card group relative h-full overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-[#141416] to-[#09090a] p-8"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                  style={{ backgroundColor: service.accent }}
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between gap-4">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-black transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                    style={{ backgroundColor: service.accent }}
                  >
                    <Icon name={serviceIcons[service.icon] ?? "layers"} className="h-5 w-5" />
                  </span>
                  <span className="micro text-[10px] text-white/25">{String(index + 1).padStart(2, "0")}</span>
                </div>

                <h2 className="mt-8 text-2xl font-semibold tracking-tight text-white">{service.title}</h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/55">{service.description}</p>

                <p className="micro mt-8 text-[9px] text-white/35">What you get</p>
                <ul className="mt-4 space-y-2.5">
                  {service.deliverables.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-white/75">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <Icon name="check" className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        {process.length ? (
          <section className="mt-28">
            <Reveal>
              <p className="micro text-white/40">How it works</p>
              <h2 className="mt-5 text-[clamp(2.2rem,5vw,3.75rem)] font-semibold leading-[1] tracking-[-0.045em] text-white">
                Four steps, zero surprises
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {process.map((step, index) => (
                <Reveal key={step.title} delay={index * 90} className="h-full">
                  <div className="accent-card group h-full rounded-[28px] border border-white/10 bg-white/[0.03] p-7 hover:bg-white/[0.06]">
                    <span className="text-5xl font-semibold tracking-tight text-white/10 transition-colors duration-500 group-hover:text-vermilion">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-6 text-xl font-semibold tracking-tight text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

      </div>
    </div>
  );
}
