import type { ReactNode } from "react";
import { FooterSwitch } from "@/components/site/footer-switch";
import { SiteHeader } from "@/components/site/header";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="dark-site relative flex min-h-screen flex-col bg-black text-snow">
      <ScrollProgress />
      <SiteHeader linkedin={settings.linkedin} photo={settings.profilePhoto || "/images/profile.jpg"} />
      <main className="flex-1">{children}</main>
      <FooterSwitch settings={settings} />
    </div>
  );
}
