import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Serves /api/media/12 as well as /api/media/12.mp4 — the extension is cosmetic. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numeric = Number.parseInt(id, 10);
  if (!Number.isInteger(numeric) || numeric < 1) return new Response("Not found", { status: 404 });

  const rows = await db.select().from(media).where(eq(media.id, numeric)).limit(1);
  const row = rows[0];
  if (!row || !row.complete) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(row.data, "base64"), {
    headers: {
      "Content-Type": row.mime,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
