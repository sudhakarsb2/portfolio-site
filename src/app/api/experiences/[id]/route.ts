import { deleteHandler, updateHandler } from "@/lib/crud";
import { experiences } from "@/db/schema";
import { parseExperience } from "@/lib/validators";

export const PATCH = updateHandler(experiences, parseExperience);
export const DELETE = deleteHandler(experiences);
