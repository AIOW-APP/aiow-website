import { createHash, createSign } from "node:crypto";

const SENDER = "offerte@aiow.ai";
const EMAIL = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]{2,}$/;
const MESSAGE_ID = /^[0-9A-Za-z._-]{1,180}$/;
const MAX_TEXT = 200_000;
const MAX_ATTACHMENT = 1_500_000;
const enc = (value) => Buffer.from(value).toString("base64url");
function plain(value) { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
function cleanHeader(value, max) { if (typeof value !== "string" || !value || value.length > max || /[\r\n\0]/.test(value)) throw new TypeError("invalid mail header"); return value; }
function encodedHeader(value) {
  cleanHeader(value, 200); if (/^[\x20-\x7e]+$/.test(value)) return value;
  const words = []; let bytes = []; let length = 0;
  for (const character of value) {
    const encoded = [...Buffer.from(character, "utf8")];
    if (length && length + encoded.length > 45) { words.push(`=?UTF-8?B?${Buffer.from(bytes).toString("base64")}?=`); bytes = []; length = 0; }
    bytes.push(...encoded); length += encoded.length;
  }
  if (length) words.push(`=?UTF-8?B?${Buffer.from(bytes).toString("base64")}?=`);
  return words.join("\r\n ");
}
function quotedPrintable(value) {
  if (typeof value !== "string" || value.length > MAX_TEXT || /\0/.test(value)) throw new TypeError("invalid mail body");
  const normalized = value.replace(/\r\n|\r|\n/g, "\r\n");
  return normalized.split("\r\n").map((line) => {
    const tokens = [...Buffer.from(line, "utf8")].map((byte) => `=${byte.toString(16).toUpperCase().padStart(2, "0")}`);
    const wrapped = []; for (let index = 0; index < tokens.length; index += 24) wrapped.push(tokens.slice(index, index + 24).join(""));
    return wrapped.join("=\r\n");
  }).join("\r\n");
}
function wrapBase64(value) { return value.match(/.{1,76}/g)?.join("\r\n") ?? ""; }
export function buildGmailMime(job) {
  if (!plain(job) || !["customer_quote", "internal_lead"].includes(job.kind) || !plain(job.payload)) throw new TypeError("invalid mail job");
  const mail = job.payload; const from = cleanHeader(mail.from, 254); const to = cleanHeader(mail.to, 254); const subject = cleanHeader(mail.subject, 200);
  if (from !== SENDER || !EMAIL.test(to) || typeof mail.text !== "string" || typeof mail.html !== "string" || !MESSAGE_ID.test(job.id)) throw new TypeError("invalid mail payload");
  const dedupe = createHash("sha256").update(`${job.kind}:${job.id}`).digest("hex");
  const messageId = `<aiow-${dedupe.slice(0, 32)}@aiow.ai>`;
  const mixed = `aiow-mixed-${dedupe.slice(0, 24)}`; const alternative = `aiow-alt-${dedupe.slice(24, 48)}`;
  const headers = [`From: ${SENDER}`, `To: ${to}`, `Subject: ${encodedHeader(subject)}`, `Message-ID: ${messageId}`, `X-AIOW-Outbox-ID: ${job.id}`, `X-AIOW-Dedupe: ${dedupe}`, "MIME-Version: 1.0"];
  const alternativeBody = [`--${alternative}`, "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: quoted-printable", "", quotedPrintable(mail.text), `--${alternative}`, "Content-Type: text/html; charset=UTF-8", "Content-Transfer-Encoding: quoted-printable", "", quotedPrintable(mail.html), `--${alternative}--`].join("\r\n");
  let mime;
  if (job.kind === "customer_quote") {
    if (job.attachmentMimeType !== "application/pdf" || typeof job.attachmentFilename !== "string" || !/^AIOW-[0-9]{4}-[0-9]{4}\.pdf$/.test(job.attachmentFilename) || typeof job.attachmentBase64 !== "string") throw new TypeError("invalid customer attachment");
    const attachment = Buffer.from(job.attachmentBase64, "base64");
    if (!attachment.subarray(0, 5).equals(Buffer.from("%PDF-")) || attachment.length > MAX_ATTACHMENT || attachment.toString("base64") !== job.attachmentBase64.replace(/\s/g, "")) throw new TypeError("invalid customer attachment");
    if (typeof job.attachmentSha256 !== "string" || createHash("sha256").update(attachment).digest("hex") !== job.attachmentSha256) throw new TypeError("invalid attachment hash");
    headers.push(`Content-Type: multipart/mixed; boundary="${mixed}"`);
    mime = [...headers, "", `--${mixed}`, `Content-Type: multipart/alternative; boundary="${alternative}"`, "", alternativeBody, `--${mixed}`, `Content-Type: application/pdf; name="${job.attachmentFilename}"`, "Content-Transfer-Encoding: base64", `Content-Disposition: attachment; filename="${job.attachmentFilename}"`, "", wrapBase64(attachment.toString("base64")), `--${mixed}--`, ""].join("\r\n");
  } else {
    if ([job.attachmentFilename, job.attachmentMimeType, job.attachmentBase64, job.attachmentSha256].some(Boolean) || to !== SENDER) throw new TypeError("internal attachment/recipient invalid");
    headers.push(`Content-Type: multipart/alternative; boundary="${alternative}"`);
    mime = [...headers, "", alternativeBody, ""].join("\r\n");
  }
  if (Buffer.byteLength(mime) > 2_800_000) throw new TypeError("message too large");
  return mime;
}
export class GmailProviderError extends Error { constructor(kind, code) { super(code); this.name = "GmailProviderError"; this.kind = kind; this.code = code; } }
export function classifyGmailFailure(error) {
  if (error instanceof GmailProviderError) return error.kind;
  return "transient";
}
async function exactJson(response, max = 64_000) { const text = await response.text(); if (Buffer.byteLength(text) > max) throw new GmailProviderError("permanent", "RESPONSE_TOO_LARGE"); try { return JSON.parse(text); } catch { throw new GmailProviderError("permanent", "INVALID_RESPONSE"); } }
async function providerFailure(response) {
  let reason = "";
  try {
    const text = await response.text(); if (Buffer.byteLength(text) <= 64_000) {
      const body = JSON.parse(text); const candidates = body?.error?.errors;
      if (Array.isArray(candidates)) reason = candidates.find((item) => plain(item) && typeof item.reason === "string")?.reason ?? "";
    }
  } catch { /* status remains authoritative */ }
  const retryableReason = ["rateLimitExceeded", "userRateLimitExceeded", "backendError"].includes(reason);
  const kind = response.status === 408 || response.status === 429 || response.status >= 500 || (response.status === 403 && retryableReason) ? "transient" : "permanent";
  const suffix = reason ? `_${reason.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[^A-Za-z0-9_]/g, "_").toUpperCase().slice(0, 36)}` : "";
  return new GmailProviderError(kind, `HTTP_${response.status}${suffix}`.slice(0, 64));
}
export async function sendGmailJob(job, options = {}) {
  const env = options.env ?? process.env; const email = env.AIOW_GOOGLE_SERVICE_ACCOUNT_EMAIL; const privateKey = env.AIOW_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"); const subject = env.AIOW_GOOGLE_DELEGATED_SUBJECT;
  if (!email || !privateKey || subject !== SENDER || !EMAIL.test(email)) throw new GmailProviderError("permanent", "PROVIDER_CONFIG");
  let mime; try { mime = buildGmailMime(job); } catch { throw new GmailProviderError("permanent", "MAIL_SCHEMA"); }
  const now = Math.floor((options.now ?? Date.now()) / 1000); const tokenUrl = options.tokenUrl ?? "https://oauth2.googleapis.com/token"; const gmailUrl = options.gmailUrl ?? "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
  const jwtHeader = enc(JSON.stringify({ alg: "RS256", typ: "JWT" })); const jwtClaim = enc(JSON.stringify({ iss: email, sub: subject, scope: "https://www.googleapis.com/auth/gmail.send", aud: tokenUrl, iat: now, exp: now + 3600 }));
  let signature; try { const signer = createSign("RSA-SHA256"); signer.update(`${jwtHeader}.${jwtClaim}`); signer.end(); signature = signer.sign(privateKey).toString("base64url"); } catch { throw new GmailProviderError("permanent", "PRIVATE_KEY"); }
  const fetchImpl = options.fetchImpl ?? fetch; let tokenResponse;
  try { tokenResponse = await fetchImpl(tokenUrl, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${jwtHeader}.${jwtClaim}.${signature}` }), signal: AbortSignal.timeout(8_000), redirect: "error" }); } catch { throw new GmailProviderError("transient", "TOKEN_NETWORK"); }
  if (!tokenResponse.ok) throw await providerFailure(tokenResponse); const token = await exactJson(tokenResponse);
  if (!plain(token) || Object.keys(token).some((key) => !["access_token", "token_type", "expires_in"].includes(key)) || typeof token.access_token !== "string" || token.access_token.length < 8 || token.access_token.length > 4096 || token.token_type !== "Bearer" || (token.expires_in !== undefined && (!Number.isSafeInteger(token.expires_in) || token.expires_in < 1 || token.expires_in > 86400))) throw new GmailProviderError("permanent", "TOKEN_RESPONSE");
  const raw = Buffer.from(mime, "utf8").toString("base64url"); let sendResponse;
  try { sendResponse = await fetchImpl(gmailUrl, { method: "POST", headers: { authorization: `Bearer ${token.access_token}`, "content-type": "application/json" }, body: JSON.stringify({ raw }), signal: AbortSignal.timeout(12_000), redirect: "error" }); } catch { throw new GmailProviderError("ambiguous", "SEND_NETWORK"); }
  if (!sendResponse.ok) throw await providerFailure(sendResponse);
  let sent;
  try {
    sent = await exactJson(sendResponse);
    if (!plain(sent) || Object.keys(sent).some((key) => !["id", "threadId", "labelIds"].includes(key)) || typeof sent.id !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(sent.id)) throw new TypeError("invalid accepted response");
  } catch { throw new GmailProviderError("ambiguous", "SEND_ACCEPTANCE_UNKNOWN"); }
  return { id: sent.id };
}
