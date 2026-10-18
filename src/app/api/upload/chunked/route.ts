import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, handle, json, requireApiUser } from "@/lib/api";
import {
  BASE64_CHUNK,
  MAX_FILE_BASE64,
  MAX_IMAGE_BASE64,
  UPLOAD_FORMATS,
} from "@/lib/upload-formats";

/**
 * Chunked uploads for files too large for a single request (hosting platforms
 * commonly cap request bodies around 4 MB). The client sends:
 *   begin  { mime }           -> { id }
 *   append { id, chunk }      -> { ok, received }   (repeat, in order)
 *   finish { id }             -> { id, url, mime }
 * Incomplete uploads are invisible to the public site and swept after an hour.
 */
export const POST = async (req: Request) =>
  handle(async () => {
    await requireApiUser();
    const body = (await req.json().catch(() => ({}))) as {
      action?: unknown;
      mime?: unknown;
      id?: unknown;
      chunk?: unknown;
    };
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "begin") {
      const mime = typeof body.mime === "string" ? body.mime.toLowerCase() : "";
      if (!UPLOAD_FORMATS[mime]) {
        throw new HttpError(
          "Supported formats: JPG, PNG, WebP, GIF, SVG, PDF, MP4, WebM and MOV.",
          422,
        );
      }

      // Sweep abandoned uploads so they never pile up.
      await db
        .delete(media)
        .where(and(eq(media.complete, false), lt(media.createdAt, new Date(Date.now() - 3_600_000))));

      const inserted = (await db
        .insert(media)
        .values({ mime, data: "", complete: false })
        .returning({ id: media.id })) as Array<{ id: number }>;
      return json({ id: inserted[0].id }, { status: 201 });
    }

    if (action === "append") {
      const id = Number(body.id);
      const chunk = typeof body.chunk === "string" ? body.chunk : "";
      if (!Number.isInteger(id) || id < 1) throw new HttpError("Unknown upload.", 422);
      if (!chunk || !BASE64_CHUNK.test(chunk) || chunk.length > 3_500_000) {
        throw new HttpError("That part of the file could not be read. Please retry the upload.", 422);
      }

      const rows = await db
        .select({ mime: media.mime, complete: media.complete, length: sql<number>`length(${media.data})` })
        .from(media)
        .where(eq(media.id, id))
        .limit(1);
      const row = rows[0];
      if (!row || row.complete) throw new HttpError("Unknown upload.", 422);

      const limit = row.mime.startsWith("image/") ? MAX_IMAGE_BASE64 : MAX_FILE_BASE64;
      if (Number(row.length) + chunk.length > limit) {
        await db.delete(media).where(eq(media.id, id));
        const size = row.mime.startsWith("image/") ? "6 MB" : "35 MB";
        throw new HttpError(`That file is too large. Please keep it under ${size}.`, 413);
      }

      await db
        .update(media)
        .set({ data: sql`${media.data} || ${chunk}` })
        .where(eq(media.id, id));
      return json({ ok: true, received: Number(row.length) + chunk.length });
    }

    if (action === "finish") {
      const id = Number(body.id);
      if (!Number.isInteger(id) || id < 1) throw new HttpError("Unknown upload.", 422);
      const rows = await db
        .select({ mime: media.mime, complete: media.complete, length: sql<number>`length(${media.data})` })
        .from(media)
        .where(eq(media.id, id))
        .limit(1);
      const row = rows[0];
      if (!row || row.complete) throw new HttpError("Unknown upload.", 422);
      if (!Number(row.length)) {
        await db.delete(media).where(eq(media.id, id));
        throw new HttpError("The upload was empty. Please try again.", 422);
      }

      await db.update(media).set({ complete: true }).where(eq(media.id, id));
      const extension = UPLOAD_FORMATS[row.mime] ?? "bin";
      return json({ id, url: `/api/media/${id}.${extension}`, mime: row.mime });
    }

    throw new HttpError("Unknown upload action.", 422);
  });
