import { asc } from "drizzle-orm";
import { experiences } from "@/db/schema";
import { createHandler, listHandler } from "@/lib/crud";
import { parseExperience } from "@/lib/validators";

export const GET = listHandler(experiences, asc(experiences.sortOrder));
export const POST = createHandler(experiences, parseExperience);
