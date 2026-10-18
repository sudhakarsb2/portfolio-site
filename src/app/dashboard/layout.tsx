import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/sidebar";
import { ToastProvider } from "@/components/ui/kit";
import { getCurrentUser } from "@/lib/auth";
import { getMessages } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const messages = await getMessages();
  const unread = messages.filter((message) => message.status === "new").length;

  const items: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "home" },
    { href: "/dashboard/projects", label: "Projects", icon: "folder" },
    { href: "/dashboard/messages", label: "Messages", icon: "mail", badge: unread },
    { href: "/dashboard/services", label: "Services", icon: "layers" },
    { href: "/dashboard/testimonials", label: "Testimonials", icon: "quote" },
    { href: "/dashboard/experience", label: "Experience", icon: "briefcase" },
    { href: "/dashboard/tags", label: "Tags", icon: "tag" },
    { href: "/dashboard/categories", label: "Categories", icon: "grid" },
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
  ];

  return (
    <ToastProvider>
      <DashboardShell items={items} user={user}>
        {children}
      </DashboardShell>
    </ToastProvider>
  );
}
