export const AIOW_OPERATOR_ID_HEADER: "x-aiow-operator-id";
export const AIOW_OPERATOR_ROLE_HEADER: "x-aiow-operator-role";
export const AIOW_OPS_OPERATOR_ID: "richard";
export const AIOW_OPS_OPERATOR_ROLE: "ops_admin";

export type OpsAccessEnvironment = {
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

export type OpsAccessResult =
  | { kind: "not_found" }
  | { kind: "unauthorized" }
  | { kind: "authorized"; principal: { id: "richard"; role: "ops_admin" } };

export function resolveOpsDeploymentAuthority(input: {
  hostname: string;
  platformDeploymentHostname: string | null;
  env: OpsAccessEnvironment;
}): { hostname: string; username: string; password: string } | null;

export function authorizeOpsRequest(input: {
  hostname: string;
  platformDeploymentHostname?: string | null;
  authorization: string | null;
  env: OpsAccessEnvironment;
}): Promise<OpsAccessResult>;
