import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "sb_session";

/**
 * First line of defence for the studio area: a request without a session cookie
 * never reaches the dashboard. The session itself is verified again on the
 * server inside the dashboard layout.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
