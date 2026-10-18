import { deleteHandler, updateHandler } from "@/lib/crud";
import { testimonials } from "@/db/schema";
import { parseTestimonial } from "@/lib/validators";

export const PATCH = updateHandler(testimonials, parseTestimonial);
export const DELETE = deleteHandler(testimonials);
