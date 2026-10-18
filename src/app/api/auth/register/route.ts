import { handle } from "@/lib/api";
import { HttpError } from "@/lib/api";

/**
 * This portfolio is single-owner: no new accounts can be created, by anyone.
 * Sign-in is only possible with the owner's own credentials.
 */
export const POST = async () =>
  handle(async () => {
    throw new HttpError("Account creation is disabled on this portfolio.", 403);
  });
