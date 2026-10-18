import { deleteHandler, updateHandler } from "@/lib/crud";
import { categories } from "@/db/schema";
import { parseCategory } from "@/lib/validators";

export const PATCH = updateHandler(categories, parseCategory);
export const DELETE = deleteHandler(categories);
