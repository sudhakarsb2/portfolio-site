import { hashString } from "@/lib/utils";

const PALETTES = [
  { bg: "#0C0C10", ink: "#F4F2EC", accent: "#FF4A1C", accent2: "#7A5CFF" },
  { bg: "#F4F2EC", ink: "#0C0C10", accent: "#FF4A1C", accent2: "#3BA9FF" },
  { bg: "#7A5CFF", ink: "#0C0C10", accent: "#D7F24B", accent2: "#F4F2EC" },
  { bg: "#0E3B2E", ink: "#F4F2EC", accent: "#D7F24B", accent2: "#FF4A1C" },
  { bg: "#FF4A1C", ink: "#0C0C10", accent: "#F4F2EC", accent2: "#0C0C10" },
  { bg: "#B3122E", ink: "#F4F2EC", accent: "#D7F24B", accent2: "#0C0C10" },
  { bg: "#3BA9FF", ink: "#0C0C10", accent: "#FF4A1C", accent2: "#F4F2EC" },
  { bg: "#D7F24B", ink: "#0C0C10", accent: "#7A5CFF", accent2: "#F4F2EC" },
];

export type ArtworkProps = {
  seed: string;
  title: string;
  client?: string;
  year?: number;
  className?: string;
  showMeta?: boolean;
  /** SVG alignment used when the frame crops the poster (default: centre). */
  align?: "xMidYMid" | "xMidYMax" | "xMidYMin";
};

/**
 * Deterministic generative poster artwork. Each project gets a unique,
 * reproducible composition derived from its title — with live motion so the
 * portfolio never feels static.
 */
export function Artwork({
  seed,
  title,
  client,
  year,
  className,
  showMeta = true,
  align = "xMidYMid",
}: ArtworkProps) {
  const hash = hashString(seed || title);
  const palette = PALETTES[hash % PALETTES.length];
  const variant = Math.floor(hash / 7) % 4;
  const rotation = (hash % 24) - 12;
  const letter = (title || "S").trim().charAt(0).toUpperCase();
  const uid = `art-${hash.toString(36)}`;

  return (
    <svg
      viewBox="0 0 800 1000"
      className={className}
      preserveAspectRatio={`${align} slice`}
      role="img"
      aria-label={`${title} — cover artwork`}
    >
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={palette.bg} />
          <stop offset="100%" stopColor={palette.accent2} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${uid}-ink`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.ink} />
          <stop offset="100%" stopColor={palette.accent} />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <rect width="800" height="1000" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${uid}-clip)`}>
        <rect width="800" height="1000" fill={palette.bg} />
        <rect width="800" height="1000" fill={`url(#${uid}-grad)`} opacity="0.45" />

        {variant === 0 ? (
          <>
            <g className="animate-float">
              <circle cx={560} cy={340} r={250} fill={palette.accent} opacity="0.95" />
              <circle cx={560} cy={340} r={168} fill={palette.bg} opacity="0.9" />
            </g>
            <rect
              x={-60}
              y={620}
              width={520}
              height={520}
              fill={palette.accent2}
              opacity="0.38"
              transform={`rotate(${rotation} 200 700)`}
            />
            <circle
              className="animate-spin-slow"
              cx={210}
              cy={220}
              r={78}
              fill="none"
              stroke={palette.ink}
              strokeWidth="2"
              strokeDasharray="10 14"
              opacity="0.5"
            />
          </>
        ) : null}

        {variant === 1 ? (
          <>
            {Array.from({ length: 9 }).map((_, index) => (
              <rect
                key={index}
                className={index % 3 === 0 ? "animate-float" : undefined}
                x={-200 + index * 120}
                y={-120}
                width={46}
                height={1300}
                fill={index % 2 === 0 ? palette.accent : palette.accent2}
                opacity={index % 2 === 0 ? 0.9 : 0.4}
                transform={`rotate(${rotation} 400 500)`}
              />
            ))}
            <rect
              x={80}
              y={120}
              width={640}
              height={640}
              fill="none"
              stroke={palette.ink}
              strokeWidth="3"
              opacity="0.45"
            />
          </>
        ) : null}

        {variant === 2 ? (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <path
                key={index}
                d={`M ${120 + index * 40} ${980} A ${300 + index * 70} ${300 + index * 70} 0 0 1 ${760 - index * 30} ${520 - index * 40}`}
                fill="none"
                stroke={index % 2 === 0 ? palette.accent : palette.ink}
                strokeWidth={14 - index}
                opacity={0.75 - index * 0.08}
              />
            ))}
            <g className="animate-spin-slow">
              <circle cx={590} cy={210} r={118} fill={palette.accent2} opacity="0.55" />
            </g>
          </>
        ) : null}

        {variant === 3 ? (
          <>
            {Array.from({ length: 48 }).map((_, index) => {
              const column = index % 8;
              const row = Math.floor(index / 8);
              const active = (index + hash) % 7 === 0;
              return (
                <rect
                  key={index}
                  x={70 + column * 84}
                  y={120 + row * 84}
                  width={64}
                  height={64}
                  fill={active ? palette.accent : palette.ink}
                  opacity={active ? 0.95 : 0.16}
                />
              );
            })}
            <rect x={70} y={540} width={590} height={26} fill={palette.ink} opacity="0.9" />
            <rect
              className="animate-float"
              x={70}
              y={586}
              width={380}
              height={12}
              fill={palette.accent}
            />
          </>
        ) : null}

        <text
          x="70"
          y="800"
          fill={`url(#${uid}-ink)`}
          fontFamily="var(--font-instrument), Georgia, serif"
          fontSize="360"
          letterSpacing="-18"
          opacity="0.95"
        >
          {letter}
        </text>

        {showMeta ? (
          <>
            <text
              x="70"
              y="900"
              fill={palette.ink}
              fontFamily="var(--font-mono), monospace"
              fontSize="26"
              fontWeight="700"
              letterSpacing="3"
              opacity="0.9"
            >
              {(title || "UNTITLED").toUpperCase().slice(0, 20)}
            </text>
            <text
              x="70"
              y="945"
              fill={palette.ink}
              fontFamily="var(--font-mono), monospace"
              fontSize="20"
              letterSpacing="3"
              opacity="0.55"
            >
              {(client ?? "SUDHAKAR BHAMBADE").toUpperCase().slice(0, 26)} {year ? `· ${year}` : ""}
            </text>
          </>
        ) : null}
      </g>
    </svg>
  );
}
