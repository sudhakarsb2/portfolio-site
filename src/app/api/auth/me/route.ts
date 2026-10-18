import { handle, json } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

export const GET = async () =>
  handle(async () => {
    const user = await getCurrentUser();
    return json({ user });
  });
