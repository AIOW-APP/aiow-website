import { secureServiceUrl } from "./quote-adapter-auth.mjs";

const RPC_NAME = /^[a-z][a-z0-9_]{2,63}$/;
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

export class QuoteAdapterStoreError extends Error {
  status: number;
  code: "CONFIG" | "NETWORK" | "RPC" | "INVALID_RESPONSE";
  constructor(code: QuoteAdapterStoreError["code"], message: string, status = 0) { super(message); this.name = "QuoteAdapterStoreError"; this.code = code; this.status = status; }
}
function exactObject(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
async function boundedJson(response: Response) {
  if (!response.body) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "RPC response body missing", response.status);
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_RESPONSE_BYTES) { await reader.cancel(); throw new QuoteAdapterStoreError("INVALID_RESPONSE", "RPC response too large", response.status); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  const text = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), size).toString("utf8");
  try { return JSON.parse(text) as unknown; } catch { throw new QuoteAdapterStoreError("INVALID_RESPONSE", "RPC response is not JSON", response.status); }
}
export function supabaseConfigured(env: NodeJS.ProcessEnv = process.env) { return Boolean(env.AIOW_SUPABASE_URL && env.AIOW_SUPABASE_SERVICE_ROLE_KEY); }
export async function quoteAdapterRpc(name: string, args: Record<string, unknown>, options: { timeoutMs?: number; env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch } = {}) {
  if (!RPC_NAME.test(name) || !exactObject(args)) throw new TypeError("invalid RPC request");
  const env = options.env ?? process.env; const base = env.AIOW_SUPABASE_URL; const key = env.AIOW_SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key || key.length > 4096) throw new QuoteAdapterStoreError("CONFIG", "Supabase adapter is disabled");
  let root: URL; try { root = secureServiceUrl(base, env.AIOW_QUOTE_ADAPTER_TEST_MODE === "1"); } catch { throw new QuoteAdapterStoreError("CONFIG", "Invalid Supabase URL"); }
  const url = new URL(`/rest/v1/rpc/${name}`, root);
  let response: Response;
  try { response = await (options.fetchImpl ?? fetch)(url, { method: "POST", headers: { "content-type": "application/json", apikey: key, authorization: `Bearer ${key}` }, body: JSON.stringify(args), signal: AbortSignal.timeout(Math.min(Math.max(options.timeoutMs ?? 8_000, 100), 15_000)), cache: "no-store", redirect: "error" }); }
  catch (error) { throw new QuoteAdapterStoreError("NETWORK", error instanceof Error ? error.name : "network failure"); }
  const payload = await boundedJson(response);
  if (!response.ok) {
    const pgCode = exactObject(payload) && typeof payload.code === "string" ? payload.code : "";
    throw new QuoteAdapterStoreError("RPC", pgCode || `RPC HTTP ${response.status}`, response.status);
  }
  return payload;
}
export function validatePrepareRpcResponse(value: unknown) {
  if (!exactObject(value) || Object.keys(value).length !== 4 || value.accepted !== true || typeof value.quoteNumber !== "string" || !/^AIOW-[0-9]{4}-[0-9]{4}$/.test(value.quoteNumber) || typeof value.leadId !== "string" || !/^[0-9a-f-]{36}$/.test(value.leadId) || typeof value.receivedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.receivedAt) || Number.isNaN(Date.parse(value.receivedAt))) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Invalid prepare RPC response");
  return { accepted: true as const, quoteNumber: value.quoteNumber, leadId: value.leadId, receivedAt: value.receivedAt };
}
export function validateCommitRpcResponse(value: unknown) {
  if (!exactObject(value) || Object.keys(value).length !== 1 || value.accepted !== true) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Invalid commit RPC response");
  return { accepted: true as const };
}
export function validateClaimRpcResponse(value: unknown) {
  if (!Array.isArray(value) || value.length > 10) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Invalid claim RPC response");
  return value.map((job) => {
    if (!exactObject(job)) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Invalid claim job");
    const keys = ["id", "kind", "payload", "attempts", "leaseToken", "attachmentFilename", "attachmentMimeType", "attachmentBase64", "attachmentSha256"];
    if (Object.keys(job).length !== keys.length || !keys.every((key) => Object.hasOwn(job, key)) || typeof job.id !== "string" || !/^[0-9]+$/.test(job.id) || !["customer_quote", "internal_lead"].includes(String(job.kind)) || !exactObject(job.payload) || !Number.isSafeInteger(job.attempts) || typeof job.leaseToken !== "string" || !/^[0-9a-f-]{36}$/.test(job.leaseToken)) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Invalid claim job");
    for (const key of ["attachmentFilename", "attachmentMimeType", "attachmentBase64", "attachmentSha256"] as const) if (job[key] !== null && typeof job[key] !== "string") throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Invalid claim attachment");
    if (job.kind === "customer_quote" && (!job.attachmentBase64 || job.attachmentMimeType !== "application/pdf")) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Customer attachment missing");
    if (job.kind === "internal_lead" && [job.attachmentFilename, job.attachmentMimeType, job.attachmentBase64, job.attachmentSha256].some(Boolean)) throw new QuoteAdapterStoreError("INVALID_RESPONSE", "Internal attachment forbidden");
    return job as { id: string; kind: "customer_quote" | "internal_lead"; payload: Record<string, unknown>; attempts: number; leaseToken: string; attachmentFilename: string | null; attachmentMimeType: string | null; attachmentBase64: string | null; attachmentSha256: string | null };
  });
}
