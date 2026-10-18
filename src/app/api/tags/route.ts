import { asc } from "drizzle-orm";
import { tags } from "@/db/schema";
import { createHandler, listHandler } from "@/lib/crud";
import { parseTag } from "@/lib/validators";

export const GET = listHandler(tags, asc(tags.name));
export const POST = createHandler(tags, parseTag);
