"use client";

import Link from "next/link";
import { Button } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vermilion-soft text-crimson">
        <Icon name="alert" className="h-6 w-6" />
      </div>
      <h1 className="mt-6 font-display text-4xl text-ink">Something broke on the press</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink/60">
        {error.message || "An unexpected error occurred while rendering this page."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[13px] font-medium text-ink transition-colors hover:border-ink"
        >
          Back to the portfolio
        </Link>
      </div>
    </div>
  );
}
