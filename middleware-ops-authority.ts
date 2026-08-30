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
};

export const OPERATIONS_CHALLENGE = 'Basic realm="AIOW Operations", charset="UTF-8"';

export function isOperationsPath(pathname: string): boolean {
  return pathname === "/portal/admin" || pathname.startsWith("/portal/admin/")
    || pathname === "/api/admin" || pathname.startsWith("/api/admin/")
    || pathname === "/api/ops" || pathname.startsWith("/api/ops/")
    || pathname === "/admin" || pathname.startsWith("/admin/");
}

type AuthorityResult =
  | { kind: "next"; headers: Headers }
  | { kind: "response"; status: 404; headers: Headers }
  | { kind: "response"; status: 401; headers: Headers };

export async function applyOperationsAuthority(input: {
  pathname: string;
  headers: HeadersInit;
  env: OpsAccessEnv;
}): Promise<AuthorityResult> {
  const requestHeaders = new Headers(input.headers);
  requestHeaders.delete(AIOW_OPERATOR_ID_HEADER);
  requestHeaders.delete(AIOW_OPERATOR_ROLE_HEADER);
  if (!isOperationsPath(input.pathname)) return { kind: "next", headers: requestHeaders };

  const access = await authorizeOpsRequest({
    hostname: requestHeaders.get("host") ?? "",
    authorization: requestHeaders.get("authorization"),
    env: input.env,
  });
  if (access.kind === "not_found") return { kind: "response", status: 404, headers: new Headers() };
  if (access.kind === "unauthorized") return { kind: "response", status: 401, headers: new Headers({ "WWW-Authenticate": OPERATIONS_CHALLENGE }) };
  requestHeaders.set(AIOW_OPERATOR_ID_HEADER, access.principal.id);
  requestHeaders.set(AIOW_OPERATOR_ROLE_HEADER, access.principal.role);
  return { kind: "next", headers: requestHeaders };
}
