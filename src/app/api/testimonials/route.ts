import { asc } from "drizzle-orm";
import { testimonials } from "@/db/schema";
import { createHandler, listHandler } from "@/lib/crud";
import { parseTestimonial } from "@/lib/validators";

export const GET = listHandler(testimonials, asc(testimonials.sortOrder));
export const POST = createHandler(testimonials, parseTestimonial);
