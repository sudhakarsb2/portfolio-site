"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/site/logo";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const links = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ linkedin, photo }: { linkedin?: string; photo?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled || open
          ? "border-b border-white/10 bg-black/70 backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="shell flex h-[68px] items-center justify-between gap-6">
        <Link href="/" aria-label="Sudhakar Bhambade — home" className="flex items-center gap-3">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt="Sudhakar Bhambade"
              className="h-9 w-9 rounded-full object-cover object-[center_20%]"
            />
          ) : null}
          <Logo light />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                isActive(link.href) ? "text-white" : "text-white/60 hover:text-white",
              )}
            >
              {isActive(link.href) ? (
                <span className="absolute inset-0 -z-0 rounded-full bg-white/10" />
              ) : null}
              <span className="relative">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {linkedin ? (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white hover:text-white sm:inline-flex"
            >
              <Icon name="linkedin" className="h-4 w-4" />
            </a>
          ) : null}
          <Link
            href="/contact"
            className="hidden h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] font-semibold text-black transition-all hover:bg-vermilion hover:text-white sm:inline-flex"
          >
            Let&apos;s talk
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white md:hidden"
          >
            <Icon name={open ? "x" : "menu"} className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden bg-black/95 backdrop-blur-2xl transition-[max-height,opacity] duration-500 md:hidden",
          open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="shell flex flex-col py-5" aria-label="Mobile">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between border-b border-white/10 py-4 text-3xl font-semibold tracking-tight text-white"
            >
              {link.label}
              <Icon name="chevron-right" className="h-4 w-4 opacity-30" />
            </Link>
          ))}
          <div className="mt-5 flex items-center gap-4 text-sm font-medium text-white/60">
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                <Icon name="linkedin" className="h-4 w-4" />
                LinkedIn
              </a>
            ) : null}
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              <Icon name="grid" className="h-4 w-4" />
              Studio login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
