import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-aiow-pathname", request.nextUrl.pathname);

  const host = request.headers.get("host")?.toLowerCase() || "";
  const pathname = request.nextUrl.pathname;
  const isHandsomeHost = host === "handsome.bot" || host === "www.handsome.bot";

  if (isHandsomeHost && !pathname.startsWith("/api") && !pathname.startsWith("/handsome")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/handsome" : `/handsome${pathname}`;
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  const isLocalPreview = host.startsWith("127.0.0.1") || host.startsWith("localhost");

  if (!isHandsomeHost && pathname === "/onetap-day") {
    return NextResponse.redirect("https://handsome.bot/apps/onetap-day", 308);
  }

  if (
    !isHandsomeHost &&
    !isLocalPreview &&
    (pathname === "/apps" ||
      pathname.startsWith("/apps/") ||
      pathname === "/early-access" ||
      pathname === "/founders")
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https";
    url.hostname = "handsome.bot";
    url.pathname = pathname;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
