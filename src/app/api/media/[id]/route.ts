import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * Serves /api/media/12 as well as /api/media/12.mp4 — the extension is cosmetic.
 * Appending ?download=1 returns the file as an attachment, but only for the
 * signed-in owner — visitors cannot use it to save protected work.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numeric = Number.parseInt(id, 10);
  if (!Number.isInteger(numeric) || numeric < 1) return new Response("Not found", { status: 404 });

  const rows = await db.select().from(media).where(eq(media.id, numeric)).limit(1);
  const row = rows[0];
  if (!row || !row.complete) return new Response("Not found", { status: 404 });

  const wantsDownload = new URL(req.url).searchParams.get("download") === "1";
  let disposition = "inline";

  if (wantsDownload) {
    const user = await getCurrentUser();
    if (!user) return new Response("Sign in to download originals.", { status: 403 });
    const extension = EXTENSION[row.mime] ?? "bin";
    disposition = `attachment; filename="portfolio-media-${numeric}.${extension}"`;
  }

  return new Response(Buffer.from(row.data, "base64"), {
    headers: {
      "Content-Type": row.mime,
      "Content-Disposition": disposition,
      "Cache-Control": wantsDownload ? "no-store" : "public, max-age=31536000, immutable",
    },
  });
}
