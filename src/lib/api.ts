import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError("You need to be signed in to do that.", 401);
  return user;
}

export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) return errorResponse(error.message, error.status);
    console.error("[api]", error);
    return errorResponse("Something went wrong on our side. Please try again.", 500);
  }
}
