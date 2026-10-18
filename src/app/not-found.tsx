import Link from "next/link";
import { Artwork } from "@/components/artwork";
import { Icon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone px-6 py-20 text-center">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-line">
        <Artwork seed="404 missing page" title="404" client="Page not found" className="h-56 w-full" showMeta={false} />
      </div>
      <h1 className="mt-8 font-display text-5xl text-ink">This page went missing</h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-ink/60">
        The link may be out of date, or the project may have been archived. The work is still where you
        left it.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/work"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-bone transition-colors hover:bg-vermilion hover:text-white"
        >
          Browse the work
          <Icon name="arrow-up-right" className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-[13px] font-medium text-ink transition-colors hover:border-ink"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
