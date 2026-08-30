import { createHash } from "node:crypto";
import { validateProviderGateCurrentV1 } from "./commercial-contract-validator.mjs";

export const AIOW_MAIL_SENDER = "info@aiow.io";
const KINDS = new Set(["customer_booking", "internal_booking", "customer_quote", "internal_lead"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]{2,}$/;
const JOB_KEYS = ["schemaKind","jobId","commercialLeadId","kind","from","to","subject","text","html","attachments","payloadSha256","attempt","leaseOwner","leaseToken","leaseExpiresAt"];
const ATTACHMENT_KEYS = ["filename","mimeType","base64","sha256"];
const MAX_GRAPH_REQUEST_BYTES = 3_000_000;
function plain(value) { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
function exactKeys(value, keys) { return plain(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)); }
function cleanHeader(value, max) { return typeof value === "string" && value.length >= 1 && value.length <= max && !/[\r\n\0]/.test(value); }
function normalizeBody(value, max) { if (typeof value !== "string" || value.length < 1 || value.length > max || /\0/.test(value)) throw new TypeError("invalid mail body"); return value.replace(/\r\n|\r|\n/g, "\r\n"); }
function canonicalBase64(value) { if (typeof value !== "string" || value.length > 2_000_000 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) return null; const bytes = Buffer.from(value, "base64"); return bytes.toString("base64") === value ? bytes : null; }
function validDateTime(value) { return typeof value === "string" && Number.isFinite(Date.parse(value)) && /^\d{4}-\d{2}-\d{2}T/.test(value); }

export function validateMailJobV2(job) {
  if (!exactKeys(job, JOB_KEYS) || job.schemaKind !== "mail_job" || !UUID.test(job.jobId) || !UUID.test(job.commercialLeadId) || !KINDS.has(job.kind)) return false;
  if (job.from !== AIOW_MAIL_SENDER || !Array.isArray(job.to) || job.to.length < 1 || job.to.length > 5 || new Set(job.to).size !== job.to.length || !job.to.every((item) => typeof item === "string" && item.length <= 254 && EMAIL.test(item) && !/[\r\n\0]/.test(item))) return false;
  if (!cleanHeader(job.subject, 200) || typeof job.text !== "string" || job.text.length < 1 || job.text.length > 20_000 || /\0/.test(job.text) || typeof job.html !== "string" || job.html.length < 1 || job.html.length > 50_000 || /\0/.test(job.html)) return false;
  if (!SHA256.test(job.payloadSha256) || !Number.isInteger(job.attempt) || job.attempt < 1 || job.attempt > 5 || typeof job.leaseOwner !== "string" || job.leaseOwner.length < 1 || job.leaseOwner.length > 100 || !UUID.test(job.leaseToken) || !validDateTime(job.leaseExpiresAt)) return false;
  if (!Array.isArray(job.attachments) || job.attachments.length > 2) return false;
  for (const attachment of job.attachments) {
    if (!exactKeys(attachment, ATTACHMENT_KEYS) || !cleanHeader(attachment.filename, 128) || !["application/pdf","text/calendar"].includes(attachment.mimeType) || !SHA256.test(attachment.sha256)) return false;
    const bytes = canonicalBase64(attachment.base64); if (!bytes || createHash("sha256").update(bytes).digest("hex") !== attachment.sha256) return false;
    if (attachment.mimeType === "application/pdf" && !bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) return false;
  }
  const internal = job.kind === "internal_booking" || job.kind === "internal_lead";
  if (internal !== (job.to.length === 1 && job.to[0] === AIOW_MAIL_SENDER)) return false;
  if (internal && job.attachments.length !== 0) return false;
  if (job.kind === "customer_quote" && !(job.attachments.length === 1 && job.attachments[0].mimeType === "application/pdf")) return false;
  if (job.kind !== "customer_quote" && job.attachments.some((item) => item.mimeType === "application/pdf")) return false;
  if (job.kind === "customer_booking" && job.attachments.length !== 0) return false;
  return true;
}

export function buildMicrosoftGraphMessage(job) {
  if (!validateMailJobV2(job)) throw new TypeError("invalid mail job");
  const message = {
    message: {
      subject: job.subject,
      body: { contentType: "HTML", content: normalizeBody(job.html, 50_000) },
      from: { emailAddress: { address: AIOW_MAIL_SENDER } },
      toRecipients: job.to.map((address) => ({ emailAddress: { address } })),
      internetMessageHeaders: [
        { name: "X-AIOW-Outbox-ID", value: job.jobId },
        { name: "X-AIOW-Payload-SHA256", value: job.payloadSha256 },
      ],
      attachments: job.attachments.map((item) => ({ "@odata.type": "#microsoft.graph.fileAttachment", name: item.filename, contentType: item.mimeType, contentBytes: item.base64 })),
    },
    saveToSentItems: true,
  };
  const encoded = JSON.stringify(message);
  if (Buffer.byteLength(encoded) > MAX_GRAPH_REQUEST_BYTES) throw new RangeError("Graph single-request limit exceeded");
  return message;
}

function observed(options) { return new Date(options.now ? options.now() : Date.now()).toISOString(); }
function receipt(job, options, httpStatus, requestId, acceptanceKind = null) {
  const observedAt = observed(options);
  const attemptReceipt = createHash("sha256").update(`${job.jobId}:${job.attempt}:${httpStatus}:${requestId ?? ""}:${observedAt}`).digest("hex");
  return { provider:"microsoft_graph", httpStatus, graphRequestId:requestId, providerMessageId:null, acceptanceKind, attemptReceipt, observedAt };
}
function result(schemaKind, category, code, receiptValue) { return { schemaKind, category, code, receipt:receiptValue }; }
function permanent(job, options, code, status, requestId = null) { return result("provider_permanent_pre_acceptance","permanent_pre_acceptance",code,receipt(job,options,status,requestId)); }
function transient(job, options, code, status, requestId = null) { return result("provider_transient_pre_acceptance","transient_pre_acceptance",code,receipt(job,options,status,requestId)); }
function ambiguous(job, options, code, status = 599) { return result("provider_ambiguous","ambiguous",code,receipt(job,options,status,null)); }
function requestId(response) { const value = response.headers.get("request-id") ?? response.headers.get("client-request-id"); return value && value.length <= 200 ? value : null; }
async function boundedText(response, max = 64_000) { const text = await response.text(); if (Buffer.byteLength(text) > max) throw new RangeError("response too large"); return text; }
function gateCurrent(gate, options) { return gate?.state === "activated" && validateProviderGateCurrentV1(gate, { serverNow:observed(options), target:options.target }); }

export async function sendMicrosoftGraphJob(job, gate, options = {}) {
  if (!validateMailJobV2(job)) return permanent(job ?? {jobId:"invalid",attempt:1}, options, "invalid_payload", 400);
  if (!gateCurrent(gate, options)) return permanent(job, options, "exchange_rbac_denied", 403);
  const clientSecret = options.clientSecret; if (typeof clientSecret !== "string" || clientSecret.length < 1 || clientSecret.length > 4096) return permanent(job, options, "oauth_authentication_failed", 401);
  let body; try { body = JSON.stringify(buildMicrosoftGraphMessage(job)); } catch { return permanent(job, options, "invalid_payload", 400); }
  const fetchImpl = options.fetchImpl ?? fetch;
  const tokenUrl = options.tokenUrl ?? `https://login.microsoftonline.com/${gate.tenantId}/oauth2/v2.0/token`;
  let tokenResponse;
  try {
    tokenResponse = await fetchImpl(tokenUrl, { method:"POST", headers:{"content-type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({client_id:gate.applicationId,client_secret:clientSecret,scope:"https://graph.microsoft.com/.default",grant_type:"client_credentials"}), signal:AbortSignal.timeout(options.tokenTimeoutMs ?? 8_000), redirect:"error" });
  } catch (error) { return transient(job, options, error?.name === "TimeoutError" ? "timeout_before_response" : "network_before_response", 599); }
  if (!tokenResponse.ok) return permanent(job, options, "oauth_authentication_failed", tokenResponse.status, requestId(tokenResponse));
  let token;
  try { token = JSON.parse(await boundedText(tokenResponse)); } catch { return permanent(job, options, "oauth_authentication_failed", 401, requestId(tokenResponse)); }
  if (!plain(token) || typeof token.access_token !== "string" || token.access_token.length < 8 || token.access_token.length > 8192 || token.token_type !== "Bearer") return permanent(job, options, "oauth_authentication_failed", 401, requestId(tokenResponse));
  if (!gateCurrent(gate, options)) return permanent(job, options, "exchange_rbac_denied", 403);
  const graphUrl = options.graphUrl ?? `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(gate.mailbox)}/sendMail`;
  let graphResponse;
  try { graphResponse = await fetchImpl(graphUrl, { method:"POST", headers:{authorization:`Bearer ${token.access_token}`,"content-type":"application/json"}, body, signal:AbortSignal.timeout(options.sendTimeoutMs ?? 12_000), redirect:"error" }); }
  catch (error) { return ambiguous(job, options, error?.name === "TimeoutError" ? "timeout_after_request_body" : "connection_lost_after_dispatch"); }
  const id = requestId(graphResponse);
  if (graphResponse.status === 202) {
    try { if ((await boundedText(graphResponse)).length !== 0) return ambiguous(job, options, "unknown_acceptance", 202); } catch { return ambiguous(job, options, "unknown_acceptance", 202); }
    return result("provider_accepted","accepted",null,receipt(job,options,202,id,"graph_http_202"));
  }
  if (graphResponse.status === 429) {
    const rawRetryAfter = graphResponse.headers.get("retry-after");
    const seconds = rawRetryAfter && /^\d{1,5}$/.test(rawRetryAfter) ? Math.min(Math.max(Number(rawRetryAfter), 1), 3600) : null;
    if (seconds !== null && typeof options.onRetryAfter === "function") options.onRetryAfter(seconds);
    return transient(job, options, "throttled_429", 429, id);
  }
  if (graphResponse.status >= 500) return transient(job, options, "graph_5xx", graphResponse.status, id);
  if (graphResponse.status === 401) return permanent(job, options, "oauth_authentication_failed", 401, id);
  if (graphResponse.status === 403) return permanent(job, options, "exchange_rbac_denied", 403, id);
  let graphCode = ""; try { graphCode = JSON.parse(await boundedText(graphResponse))?.error?.code ?? ""; } catch { /* status is sufficient */ }
  return permanent(job, options, /recipient/i.test(graphCode) ? "invalid_recipient" : "invalid_payload", graphResponse.status, id);
}
