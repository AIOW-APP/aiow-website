export const AIOW_OPERATOR_ID_HEADER = "x-aiow-operator-id";
export const AIOW_OPERATOR_ROLE_HEADER = "x-aiow-operator-role";
export const AIOW_OPS_OPERATOR_ID = "richard";
export const AIOW_OPS_OPERATOR_ROLE = "ops_admin";

const MAX_AUTHORIZATION_LENGTH = 4096;
const HOSTNAME = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/;
const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8", { fatal: true });

function concealed() {
  return { kind: "not_found" };
}

function challenged() {
  return { kind: "unauthorized" };
}

function configured(env) {
  const hostname = env?.AIOW_OPS_DEPLOYMENT_HOST;
  const username = env?.AIOW_OPS_BASIC_USERNAME;
  const password = env?.AIOW_OPS_BASIC_PASSWORD;
  const operatorId = env?.AIOW_OPS_OPERATOR_ID;

  if (typeof hostname !== "string" || !HOSTNAME.test(hostname)) return null;
  if (!validCredentialPart(username, 256) || !validCredentialPart(password, 2048)) return null;
  if (operatorId !== AIOW_OPS_OPERATOR_ID) return null;
  return { hostname, username, password };
}

function validCredentialPart(value, maxBytes) {
  if (typeof value !== "string" || value.length === 0 || value.includes(":") || /[\u0000-\u001f\u007f-\u009f]/.test(value)) return false;
  const length = encoder.encode(value).length;
  return length > 0 && length <= maxBytes;
}

function parseBasic(header) {
  if (typeof header !== "string" || header.length === 0 || header.length > MAX_AUTHORIZATION_LENGTH) return null;
  const match = /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(header);
  if (!match || match[1].length % 4 !== 0) return null;

  try {
    const binary = atob(match[1]);
    if (btoa(binary) !== match[1]) return null;
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const decoded = decoder.decode(bytes);
    const separator = decoded.indexOf(":");
    if (separator <= 0 || separator !== decoded.lastIndexOf(":") || separator === decoded.length - 1) return null;
    return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
}

async function digest(value) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function equalDigests(left, right) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return difference === 0;
}

export async function authorizeOpsRequest({ hostname, authorization, env }) {
  const config = configured(env);
  if (!config) return concealed();
  if (typeof hostname !== "string" || hostname !== config.hostname) return concealed();

  const supplied = parseBasic(authorization);
  if (!supplied) return challenged();

  const [suppliedUsername, expectedUsername, suppliedPassword, expectedPassword] = await Promise.all([
    digest(supplied.username),
    digest(config.username),
    digest(supplied.password),
    digest(config.password),
  ]);
  const usernameMatches = equalDigests(suppliedUsername, expectedUsername);
  const passwordMatches = equalDigests(suppliedPassword, expectedPassword);
  if (!(usernameMatches & passwordMatches)) return challenged();

  return {
    kind: "authorized",
    principal: { id: AIOW_OPS_OPERATOR_ID, role: AIOW_OPS_OPERATOR_ROLE },
  };
}
