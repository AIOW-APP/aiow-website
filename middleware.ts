import { NextResponse, type NextRequest } from "next/server";
import {
  AIOW_OPERATOR_ID_HEADER,
  AIOW_OPERATOR_ROLE_HEADER,
  authorizeOpsRequest,
} from "@/lib/aiow-v1/ops-access.mjs";

const OPERATIONS_CHALLENGE = 'Basic realm="AIOW Operations", charset="UTF-8"';

function isOperationsPath(pathname: string) {
  return pathname === "/portal/admin" || pathname.startsWith("/portal/admin/")
    || pathname === "/api/admin" || pathname.startsWith("/api/admin/")
    || pathname === "/api/ops" || pathname.startsWith("/api/ops/")
    || pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete(AIOW_OPERATOR_ID_HEADER);
  headers.delete(AIOW_OPERATOR_ROLE_HEADER);

  if (isOperationsPath(request.nextUrl.pathname)) {
    const access = await authorizeOpsRequest({
      hostname: request.headers.get("host") ?? "",
      authorization: request.headers.get("authorization"),
      env: {
        AIOW_OPS_DEPLOYMENT_HOST: process.env.AIOW_OPS_DEPLOYMENT_HOST,
        AIOW_OPS_BASIC_USERNAME: process.env.AIOW_OPS_BASIC_USERNAME,
        AIOW_OPS_BASIC_PASSWORD: process.env.AIOW_OPS_BASIC_PASSWORD,
        AIOW_OPS_OPERATOR_ID: process.env.AIOW_OPS_OPERATOR_ID,
      },
    });
    if (access.kind === "not_found") return new NextResponse(null, { status: 404 });
    if (access.kind === "unauthorized") {
      return new NextResponse(null, {
        status: 401,
        headers: { "WWW-Authenticate": OPERATIONS_CHALLENGE },
      });
    }
    headers.set(AIOW_OPERATOR_ID_HEADER, access.principal.id);
    headers.set(AIOW_OPERATOR_ROLE_HEADER, access.principal.role);
  }

  headers.set("x-aiow-locale", request.nextUrl.pathname === "/en" || request.nextUrl.pathname.startsWith("/en/") ? "en" : "nl");
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|opengraph-image).*)"] };
