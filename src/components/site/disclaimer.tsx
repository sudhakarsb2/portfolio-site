"use client";

import { useEffect, useState } from "react";

const DEFAULT_SHORT =
  "This is a personal, non-commercial portfolio featuring work from multiple brands and agencies. All assets belong to their respective individual owners. No copyright infringement is intended.";

const DEFAULT_FULL = `All brand names, logos, trademarks, product imagery, campaign visuals, and related assets displayed on this website are the exclusive property of their respective brand owners, clients, and affiliated agencies. The projects showcased here represent work that has been publicly released and is available in the market.

## Purpose of Use
This website is a personal portfolio created solely to demonstrate my professional skills and contributions to previously completed projects. It is not a commercial platform, does not sell, license, or monetize any of the displayed assets, and is not intended for any commercial use whatsoever.

## No Copyright Infringement Intended
No copyright or trademark infringement is intended. The inclusion of any brand assets on this site is strictly for illustrative and portfolio purposes. All intellectual property rights remain entirely with the original rights holders. This website does not claim ownership of, nor seek to profit from, any third-party intellectual property.

## No Implied Affiliation
The display of these works does not imply any ongoing endorsement, sponsorship, partnership, or affiliation with the brands or agencies mentioned beyond the original professional engagement.

## Takedown Requests
If you are a rights holder and would like any content to be updated, re-credited, or removed, please contact me at sudhakar.bhambade2@gmail.com and I will act promptly.`;

type Section = { heading: string; body: string };

/** Parses "## Heading" blocks; plain leading text becomes an unheaded section. */
function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  let heading = "";
  let lines: string[] = [];

  const flush = () => {
    const body = lines.join("\n").trim();
    if (body || heading) sections.push({ heading, body });
    lines = [];
  };

  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) {
      flush();
      heading = line.slice(3).trim();
    } else {
      lines.push(line);
    }
  }
  flush();
  return sections;
}

/** Turns email addresses in a paragraph into live mailto links. */
function withEmailLinks(body: string) {
  const parts = body.split(/([\w.+-]+@[\w-]+\.[\w.]+)/g);
  return parts.map((part, index) =>
    /^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part) ? (
      <a
        key={index}
        href={`mailto:${part}`}
        className="font-semibold text-white underline underline-offset-4"
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

/**
 * Short disclaimer shown in every footer; clicking "Read full disclaimer"
 * opens the complete text in a modal. Both texts are editable from the
 * dashboard (Customize → Legal) and fall back to the defaults when empty.
 */
export function Disclaimer({
  shortText,
  fullText,
}: {
  shortText?: string;
  fullText?: string;
}) {
  const [open, setOpen] = useState(false);
  const short = (shortText ?? "").trim() || DEFAULT_SHORT;
  const sections = parseSections((fullText ?? "").trim() || DEFAULT_FULL);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <p className="max-w-3xl text-[11px] leading-relaxed text-white/40">
        {short}{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-semibold text-white/70 underline underline-offset-4 transition-colors hover:text-white"
        >
          Read full disclaimer
        </button>
      </p>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close disclaimer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Copyright, Trademark and Fair Use Disclaimer"
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#101012] sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-6 border-b border-white/10 px-7 py-6">
              <div>
                <p className="micro text-[9px] text-white/40">Legal</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
                  Copyright, Trademark &amp; Fair Use Disclaimer
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full border border-white/15 p-2.5 text-white/60 transition-colors hover:border-white/40 hover:text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="dash-scroll overflow-y-auto px-7 py-6">
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={section.heading || index}>
                    {section.heading ? (
                      <h3 className="text-sm font-semibold text-white">{section.heading}</h3>
                    ) : null}
                    {section.body.split(/\n\n+/).map((paragraph, pIndex) => (
                      <p
                        key={pIndex}
                        className={`${section.heading || pIndex > 0 ? "mt-2" : ""} text-sm leading-relaxed text-white/60`}
                      >
                        {withEmailLinks(paragraph)}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 px-7 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-[13px] font-semibold text-black transition-colors hover:bg-vermilion hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
