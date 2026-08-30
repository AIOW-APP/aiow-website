import {
  AIOW_OPERATOR_ID_HEADER,
  AIOW_OPERATOR_ROLE_HEADER,
  authorizeOpsRequest,
} from "./lib/aiow-v1/ops-access.mjs";

type OpsAccessEnv = {
  AIOW_OPS_DEPLOYMENT_HOST?: string;
  AIOW_OPS_BASIC_USERNAME?: string;
  AIOW_OPS_BASIC_PASSWORD?: string;
  AIOW_OPS_OPERATOR_ID?: string;
  AIOW_OPS_LOCAL_PROOF_MODE?: string;
  NODE_ENV?: string;
  VERCEL?: string;
  VERCEL_ENV?: string;
  VERCEL_TARGET_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_DEPLOYMENT_ID?: string;
  VERCEL_PROJECT_ID?: string;
};

export const OPERATIONS_CHALLENGE = 'Basic realm="AIOW Operations", charset="UTF-8"';
const NO_STORE = "no-store";
const PLATFORM_DEPLOYMENT_HEADER = "x-vercel-deployment-url";

export function isOperationsPath(pathname: string): boolean {
  return pathname === "/portal/admin" || pathname.startsWith("/portal/admin/")
    || pathname === "/api/admin" || pathname.startsWith("/api/admin/")
    || pathname === "/api/ops" || pathname.startsWith("/api/ops/")
    || pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isOperationsApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/")
    || pathname === "/api/ops" || pathname.startsWith("/api/ops/");
}

type AuthorityResult =
  | { kind: "next"; headers: Headers }
  | { kind: "response"; status: 404; headers: Headers; body: null }
  | { kind: "response"; status: 401; headers: Headers; body: string | null };

function unauthenticatedApiResponse(): Extract<AuthorityResult, { status: 401 }> {
  const requestId = crypto.randomUUID();
  return {
    kind: "response",
    status: 401,
    body: JSON.stringify({
      schemaKind: "ops_error",
      code: "unauthenticated",
      message: "Request rejected",
      requestId,
      retriable: false,
    }),
    headers: new Headers({
      "cache-control": NO_STORE,
      "content-type": "application/json; charset=utf-8",
      "x-aiow-request-id": requestId,
      "WWW-Authenticate": OPERATIONS_CHALLENGE,
    }),
  };
}

export async function applyOperationsAuthority(input: {
  pathname: string;
  headers: HeadersInit;
  env: OpsAccessEnv;
}): Promise<AuthorityResult> {
  const requestHeaders = new Headers(input.headers);
  requestHeaders.delete(AIOW_OPERATOR_ID_HEADER);
  requestHeaders.delete(AIOW_OPERATOR_ROLE_HEADER);
  if (!isOperationsPath(input.pathname)) return { kind: "next", headers: requestHeaders };

  const platformDeploymentHostname = requestHeaders.get(PLATFORM_DEPLOYMENT_HEADER);
  requestHeaders.delete("x-forwarded-host");
  requestHeaders.delete(PLATFORM_DEPLOYMENT_HEADER);
  const access = await authorizeOpsRequest({
    hostname: requestHeaders.get("host") ?? "",
    platformDeploymentHostname,
    authorization: requestHeaders.get("authorization"),
    env: input.env,
  });
  if (access.kind === "not_found") {
    return { kind: "response", status: 404, body: null, headers: new Headers({ "cache-control": NO_STORE }) };
  }
  if (access.kind === "unauthorized") {
    if (isOperationsApiPath(input.pathname)) return unauthenticatedApiResponse();
    return { kind: "response", status: 401, body: null, headers: new Headers({ "cache-control": NO_STORE, "WWW-Authenticate": OPERATIONS_CHALLENGE }) };
  }
  requestHeaders.set(AIOW_OPERATOR_ID_HEADER, access.principal.id);
  requestHeaders.set(AIOW_OPERATOR_ROLE_HEADER, access.principal.role);
  return { kind: "next", headers: requestHeaders };
}
