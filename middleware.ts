import { NextResponse, type NextRequest } from "next/server";
import { applyOperationsAuthority } from "./middleware-ops-authority";

export async function middleware(request: NextRequest) {
  const authority = await applyOperationsAuthority({
    pathname: request.nextUrl.pathname,
    headers: request.headers,
    env: {
      AIOW_OPS_DEPLOYMENT_HOST: process.env.AIOW_OPS_DEPLOYMENT_HOST,
      AIOW_OPS_BASIC_USERNAME: process.env.AIOW_OPS_BASIC_USERNAME,
      AIOW_OPS_BASIC_PASSWORD: process.env.AIOW_OPS_BASIC_PASSWORD,
      AIOW_OPS_OPERATOR_ID: process.env.AIOW_OPS_OPERATOR_ID,
      AIOW_OPS_LOCAL_PROOF_MODE: process.env.AIOW_OPS_LOCAL_PROOF_MODE,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_TARGET_ENV: process.env.VERCEL_TARGET_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_DEPLOYMENT_ID: process.env.VERCEL_DEPLOYMENT_ID,
      VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
    },
  });
  if (authority.kind === "response") return new NextResponse(authority.body, { status: authority.status, headers: authority.headers });

  authority.headers.set("x-aiow-locale", request.nextUrl.pathname === "/en" || request.nextUrl.pathname.startsWith("/en/") ? "en" : "nl");
  return NextResponse.next({ request: { headers: authority.headers } });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|opengraph-image).*)"] };
