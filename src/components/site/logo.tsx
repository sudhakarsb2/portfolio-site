import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  light = false,
}: {
  className?: string;
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="logo-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3BA9FF" />
              <stop offset="50%" stopColor="#7A5CFF" />
              <stop offset="100%" stopColor="#FF4A1C" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="18" r="16.5" fill="#0A0A0C" stroke="url(#logo-ring)" strokeWidth="1.6" />
          <text
            x="18"
            y="23.2"
            textAnchor="middle"
            fontFamily="var(--font-instrument), Georgia, serif"
            fontSize="15"
            fill="#F5F5F7"
          >
            SB
          </text>
        </svg>
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[15px] font-semibold tracking-tight",
              light ? "text-white" : "text-ink",
            )}
          >
            Sudhakar Bhambade
          </span>
          <span
            className={cn(
              "micro mt-1 text-[8px]",
              light ? "text-white/45" : "text-ink/45",
            )}
          >
            Graphic Designer
          </span>
        </span>
      ) : null}
    </span>
  );
}
