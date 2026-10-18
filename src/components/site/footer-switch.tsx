"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site/footer";

/**
 * The contact page already is the call to action, so its footer drops the
 * big "Got a rollout to ship?" block and keeps only the ticker and links.
 */
export function FooterSwitch({ settings }: { settings: Record<string, string> }) {
  const pathname = usePathname();
  const compact = pathname === "/contact" || pathname.startsWith("/contact/");
  return <SiteFooter settings={settings} compact={compact} />;
}
