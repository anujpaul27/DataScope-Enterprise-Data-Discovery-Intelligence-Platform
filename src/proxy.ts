import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// First, cheap gate: no session cookie = go to /login.
// (The REAL check - is the session valid, is the role allowed - happens on the
// server in app/dashboard/layout.tsx and the Express API. Never rely on this alone.)
export function proxy(request: NextRequest) {
  const cookie = getSessionCookie(request, { cookiePrefix: "datascope" });
  if (!cookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
