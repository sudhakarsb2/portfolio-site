"use client";

import { Button } from "@/components/ui/kit";
import { Icon } from "@/components/ui/icons";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vermilion-soft text-crimson">
        <Icon name="alert" className="h-6 w-6" />
      </div>
      <h2 className="mt-6 font-display text-3xl text-ink">The studio hit a snag</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/60">
        {error.message || "An unexpected error occurred in the dashboard."}
      </p>
      <Button className="mt-7" onClick={reset}>
        Reload this view
      </Button>
    </div>
  );
}
