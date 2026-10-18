import { handle, json } from "@/lib/api";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { parseMessage } from "@/lib/validators";
import { HttpError } from "@/lib/api";
import { ensureSeeded } from "@/lib/seed";

export const POST = async (req: Request) =>
  handle(async () => {
    await ensureSeeded();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    if (toTextHoneypot(body)) {
      return json({ ok: true });
    }

    const { values, errors } = parseMessage(body);
    if (errors.length) throw new HttpError(errors.join(" "), 422);

    const inserted = (await db.insert(messages).values(values as unknown as typeof messages.$inferInsert).returning()) as Array<
      typeof messages.$inferSelect
    >;
    return json({ ok: true, id: inserted[0].id }, { status: 201 });
  });

function toTextHoneypot(body: Record<string, unknown>): string {
  const value = body.website;
  return typeof value === "string" ? value : "";
}
