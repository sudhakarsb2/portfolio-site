import { asc } from "drizzle-orm";
import { categories } from "@/db/schema";
import { createHandler, listHandler } from "@/lib/crud";
import { parseCategory } from "@/lib/validators";

export const GET = listHandler(categories, asc(categories.sortOrder));
export const POST = createHandler(categories, parseCategory);
