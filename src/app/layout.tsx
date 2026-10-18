import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Instrument_Serif, Space_Mono } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const grotesk = Inter({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sudhakar Bhambade — Graphic Designer & Production Specialist",
    template: "%s — Sudhakar Bhambade",
  },
  description:
    "Portfolio of Sudhakar Bhambade — graphic designer and production artist producing brand rollouts for digital, out-of-home, point of sale and packaging platforms.",
  keywords: [
    "graphic designer",
    "production artist",
    "brand rollouts",
    "packaging production",
    "out of home",
    "POSM",
    "portfolio",
  ],
  openGraph: {
    title: "Sudhakar Bhambade — Graphic Designer & Production Specialist",
    description:
      "Flawless, press-ready brand rollouts across digital, OOH, POSM and packaging.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <body className="bg-bone text-ink antialiased">{children}</body>
    </html>
  );
}
