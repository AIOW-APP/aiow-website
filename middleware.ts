import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-aiow-locale", request.nextUrl.pathname === "/en" || request.nextUrl.pathname.startsWith("/en/") ? "en" : "nl");
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|opengraph-image).*)"] };
