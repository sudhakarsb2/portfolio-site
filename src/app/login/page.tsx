import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Artwork } from "@/components/artwork";
import { LoginForm } from "@/app/login/login-form";
import { Logo } from "@/components/site/logo";
import { Icon } from "@/components/ui/icons";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Studio sign in",
  description: "Sign in to manage the Sudhakar Bhambade portfolio.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(next && next.startsWith("/") ? next : "/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="grain relative hidden overflow-hidden bg-ink text-bone lg:block">
        <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-violet/30 blur-[120px] animate-aurora" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-vermilion/25 blur-[110px] animate-aurora-2" />
        <Artwork
          seed="Production Rollout login"
          title="Studio"
          client="Sudhakar Bhambade"
          className="absolute inset-0 h-full w-full opacity-40"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div>
            <img
              src="/images/profile.jpg"
              alt="Sudhakar Bhambade"
              className="mb-8 h-36 w-28 rounded-2xl object-cover object-[center_18%]"
            />
            <p className="max-w-md text-[clamp(1.6rem,2.6vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
              The work speaks first. The production behind it has to{" "}
              <span className="animate-gradient bg-gradient-to-r from-vermilion via-acid to-azure bg-clip-text text-transparent">
                keep up.
              </span>
            </p>
            <p className="micro mt-6 text-[9px] text-bone/45">Sudhakar Bhambade — Graphic Designer / Production Specialist</p>
          </div>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-bone px-6 py-14">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ink/45 transition-colors hover:text-ink"
          >
            <Icon name="chevron-right" className="h-3.5 w-3.5 rotate-180" />
            Back to portfolio
          </Link>

          <div className="mt-10">
            <p className="micro text-[9px] text-ink/40">Studio access</p>
            <h1 className="display mt-3 text-4xl leading-tight text-ink">
              Sign in to manage your work
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink/55">
              Projects, services, recommendations and enquiries — all in one place.
            </p>
          </div>

          <div className="mt-9">
            <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-bone-2" />}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-8 text-center text-xs text-ink/40">
            Protected area. Sessions last 14 days on this device.
          </p>
        </div>
      </main>
    </div>
  );
}
