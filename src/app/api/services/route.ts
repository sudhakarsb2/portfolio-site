import { asc } from "drizzle-orm";
import { services } from "@/db/schema";
import { createHandler, listHandler } from "@/lib/crud";
import { parseService } from "@/lib/validators";

export const GET = listHandler(services, asc(services.sortOrder));
export const POST = createHandler(services, parseService);
