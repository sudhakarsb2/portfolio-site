import { deleteHandler, updateHandler } from "@/lib/crud";
import { tags } from "@/db/schema";
import { parseTag } from "@/lib/validators";

export const PATCH = updateHandler(tags, parseTag);
export const DELETE = deleteHandler(tags);
