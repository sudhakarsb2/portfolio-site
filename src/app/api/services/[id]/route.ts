import { deleteHandler, updateHandler } from "@/lib/crud";
import { services } from "@/db/schema";
import { parseService } from "@/lib/validators";

export const PATCH = updateHandler(services, parseService);
export const DELETE = deleteHandler(services);
