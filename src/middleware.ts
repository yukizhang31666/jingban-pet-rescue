import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.cookies.get("admin_auth")?.value === "1") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/admin-login", request.url));
}

export const config = {
  matcher: ["/admin/:path*"],
};
