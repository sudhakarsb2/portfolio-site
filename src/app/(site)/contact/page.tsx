import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/reveal";
import { getSettings } from "@/lib/data";
import { splitHeadline } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a brand rollout, packaging, OOH or POSM production project with Sudhakar Bhambade.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  const headline = splitHeadline(settings.contactHeadline, "Let\u2019s get your brand", "ready.");

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-violet/20 blur-[130px] animate-aurora" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full bg-vermilion/15 blur-[130px] animate-aurora-2" />

      <div className="relative shell pb-24 pt-36 md:pt-44">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="flex h-full flex-col rounded-[36px] border border-white/10 bg-gradient-to-b from-[#141416] to-[#09090a] p-8 md:p-10">
              <p className="micro text-white/40">Start a project</p>
              <h1 className="mt-6 text-[clamp(2.2rem,4.8vw,3.75rem)] font-semibold leading-[0.97] tracking-[-0.045em] text-white">
                {headline.plain}{" "}
                <span className="bg-gradient-to-r from-azure via-violet to-vermilion bg-clip-text text-transparent">
                  {headline.highlight}
                </span>
              </h1>
              <p className="mt-6 text-[16px] leading-relaxed text-white/55">
                Share the brief, the channels and the deadline. I read every message myself and reply
                with questions, a plan, or an honest &ldquo;that&apos;s not a fit.&rdquo;
              </p>

              <div className="mt-10 space-y-7">
                <div>
                  <p className="micro text-[9px] text-white/35">Email</p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="mt-2 inline-flex items-center gap-2 break-all text-xl font-semibold tracking-tight text-white transition-colors hover:text-vermilion"
                  >
                    {settings.email}
                    <Icon name="arrow-up-right" className="h-4 w-4 shrink-0" />
                  </a>
                </div>
                {settings.linkedin ? (
                  <div>
                    <p className="micro text-[9px] text-white/35">LinkedIn</p>
                    <a
                      href={settings.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-6 text-[13px] font-semibold text-black transition-all hover:bg-vermilion hover:text-white"
                    >
                      <Icon name="linkedin" className="h-4 w-4" />
                      Connect on LinkedIn
                    </a>
                  </div>
                ) : null}
              </div>

            </div>
          </Reveal>

          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
