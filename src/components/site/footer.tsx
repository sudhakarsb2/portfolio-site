import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Icon } from "@/components/ui/icons";
import { splitHeadline } from "@/lib/utils";

export function SiteFooter({
  settings,
  compact = false,
}: {
  settings: Record<string, string>;
  /** Hides the big CTA block — used on pages that already ask for contact. */
  compact?: boolean;
}) {
  const email = settings.email ?? "";
  const linkedin = settings.linkedin ?? "";
  const headline = splitHeadline(settings.footerHeadline, "Got a rollout", "to ship?");
  const ticker = ["Digital", "Out of Home", "Point of Sale", "Packaging", "Brand Rollouts", "Production"];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black text-white">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-violet/25 blur-[110px] animate-aurora" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-vermilion/20 blur-[110px] animate-aurora-2" />

      <div className={compact ? "relative shell py-14 md:py-16" : "relative shell py-20 md:py-28"}>
        {!compact ? (
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="micro text-white/45">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-acid" />
                {settings.availability ?? "Open to projects"}
              </p>
              <h2 className="mt-6 max-w-3xl text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]">
                {headline.plain}
                <br />
                <span className="animate-gradient bg-gradient-to-r from-azure via-violet to-vermilion bg-clip-text text-transparent">
                  {headline.highlight}
                </span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-white px-7 text-sm font-semibold text-black transition-all hover:bg-vermilion hover:text-white"
                >
                  {email}
                  <Icon name="arrow-up-right" className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </a>
              ) : null}
              {linkedin ? (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-14 items-center gap-3 rounded-full border border-white/25 px-7 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10"
                >
                  <Icon name="linkedin" className="h-4.5 w-4.5" />
                  LinkedIn
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={compact ? "overflow-hidden border-y border-white/10 py-5" : "mt-16 overflow-hidden border-y border-white/10 py-5"}>
          <div className="flex w-max animate-marquee items-center gap-10">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-10">
                {ticker.map((item) => (
                  <span key={`${copy}-${item}`} className="flex items-center gap-10">
                    <span className="stroke-text text-[clamp(1.8rem,3.4vw,3rem)] font-semibold tracking-tight text-white/70">
                      {item}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-vermilion" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-12 md:grid-cols-2">
          <div>
            <p className="micro text-white/35">Explore</p>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {[
                ["/work", "Selected work"],
                ["/services", "What I produce"],
                ["/about", "About & experience"],
                ["/contact", "Start a project"],
                ["/dashboard", "Studio login"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="micro text-white/35">Status</p>
            <div className="mt-5 flex flex-col items-start gap-2.5">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-acid opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-acid" />
                </span>
                <span className="text-sm text-white/85">Available for projects</span>
              </div>
              {settings.relocation ? (
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-4 py-2.5">
                  <span className="inline-flex h-2 w-2 rounded-full bg-azure" />
                  <span className="text-sm text-white/85">{settings.relocation}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <Logo light />
          <p className="micro text-[10px] text-white/35">
            © {new Date().getFullYear()} {settings.studioName ?? "Sudhakar Bhambade"}
          </p>
        </div>
      </div>
    </footer>
  );
}
