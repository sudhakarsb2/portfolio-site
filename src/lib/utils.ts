export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatDate(value: Date | string | number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string | number): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(value: Date | string | number): string {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

export function formatPrice(value: number | null | undefined): string {
  if (!value) return "On request";
  return `From $${value.toLocaleString("en-US")}`;
}

export function toText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export function toInt(value: unknown, fallback = 0): number {
  const parsed = Number(toText(value));
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  const text = toText(value).toLowerCase();
  if (["true", "1", "yes", "on"].includes(text)) return true;
  if (["false", "0", "no", "off"].includes(text)) return false;
  return fallback;
}

export function toList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }
  const text = toText(value);
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function truncate(value: string, length = 120): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export type MediaKind = "image" | "video" | "pdf" | "youtube";

/** Extracts the video id from any common YouTube URL shape. */
export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/,
  );
  return match ? match[1] : null;
}

/** YouTube's own thumbnail for a video id — nothing stored on our side. */
export function youtubeThumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** If the URL is a YouTube link, swap it for the video thumbnail; otherwise unchanged. */
export function displayImage(url: string): string {
  const id = youtubeId(url);
  return id ? youtubeThumb(id) : url;
}

/** Infers how a gallery URL should be rendered. */
export function mediaKind(url: string): MediaKind {
  if (youtubeId(url)) return "youtube";
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|mov)$/.test(clean)) return "video";
  if (/\.pdf$/.test(clean)) return "pdf";
  return "image";
}

/**
 * Splits an editable headline like "Every channel.|One standard." into the
 * plain part and the highlighted part. Falls back when the setting is empty.
 */
export function splitHeadline(
  value: string | undefined,
  fallbackPlain: string,
  fallbackHighlight: string,
): { plain: string; highlight: string } {
  const text = (value ?? "").trim();
  if (!text) return { plain: fallbackPlain, highlight: fallbackHighlight };
  const [plain, ...rest] = text.split("|");
  return { plain: plain.trim(), highlight: rest.join("|").trim() };
}

export type SkillGroup = { title: string; items: string[] };

/**
 * Parses the editable skills setting. Supports grouped syntax:
 *   "Design: a, b | Production: c, d"
 * A plain comma list (no "|" or ":") becomes one untitled group.
 */
export function parseSkillGroups(value: string | undefined): SkillGroup[] {
  const text = (value ?? "").trim();
  if (!text) return [];
  return text
    .split("|")
    .map((section) => {
      const colon = section.indexOf(":");
      const title = colon > -1 ? section.slice(0, colon).trim() : "";
      const items = (colon > -1 ? section.slice(colon + 1) : section)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return { title, items };
    })
    .filter((group) => group.items.length > 0);
}

/** All skills as a flat list, whatever syntax was used. */
export function flattenSkills(value: string | undefined): string[] {
  return parseSkillGroups(value).flatMap((group) => group.items);
}
