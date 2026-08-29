import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const AIOW_WEBHOOK_TIMESTAMP_HEADER = "x-aiow-webhook-timestamp";
export const AIOW_WEBHOOK_SIGNATURE_HEADER = "x-aiow-webhook-signature";
export const AIOW_REQUEST_ID_HEADER = "x-aiow-request-id";
export const AIOW_IDEMPOTENCY_HEADER = "idempotency-key";
export const AIOW_WEBHOOK_MAX_SKEW_SECONDS = 300;
const METHOD = /^[A-Z]{3,10}$/;
const PATH = /^\/[\x21-\x7e]{0,2047}$/;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const IDEMPOTENCY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const TIMESTAMP = /^[0-9]{10}$/;
const HEX_64 = /^[0-9a-f]{64}$/;

function bytes(value) {
  if (value instanceof Uint8Array) return value;
  if (Buffer.isBuffer(value)) return value;
  throw new TypeError("bodyBytes must be bytes");
}
function secretBytes(secret) {
  if (typeof secret !== "string") throw new TypeError("secret must be a string");
  const value = Buffer.from(secret, "utf8");
  if (value.length < 32 || value.length > 256) throw new TypeError("secret must be 32..256 UTF-8 bytes");
  return value;
}
function validated({ method, path, timestamp, requestId, idempotencyKey }) {
  if (typeof method !== "string" || !METHOD.test(method)) throw new TypeError("invalid method");
  if (typeof path !== "string" || !PATH.test(path) || /[\r\n]/.test(path)) throw new TypeError("invalid path");
  if (typeof timestamp !== "string" || !TIMESTAMP.test(timestamp)) throw new TypeError("invalid timestamp");
  if (typeof requestId !== "string" || !SAFE_ID.test(requestId)) throw new TypeError("invalid request ID");
  if (typeof idempotencyKey !== "string" || !IDEMPOTENCY.test(idempotencyKey)) throw new TypeError("invalid idempotency key");
  return { method, path, timestamp, requestId, idempotencyKey };
}
export function sha256Hex(bodyBytes) { return createHash("sha256").update(bytes(bodyBytes)).digest("hex"); }
export function canonicalQuoteAdapterRequest(input) {
  const value = validated(input);
  const bodySha256 = input.bodySha256 ?? sha256Hex(input.bodyBytes);
  if (typeof bodySha256 !== "string" || !HEX_64.test(bodySha256)) throw new TypeError("invalid body SHA-256");
  return `AIOW-QUOTE-WEBHOOK-V1\n${value.method}\n${value.path}\n${value.timestamp}\n${value.requestId}\n${value.idempotencyKey}\n${bodySha256}`;
}
export function signQuoteAdapterRequest({ secret, ...input }) {
  return createHmac("sha256", secretBytes(secret)).update(canonicalQuoteAdapterRequest(input), "utf8").digest("hex");
}
export function verifyQuoteAdapterRequest({ secret, signature, now = Date.now(), maxSkewSeconds = AIOW_WEBHOOK_MAX_SKEW_SECONDS, ...input }) {
  try {
    if (typeof signature !== "string" || !HEX_64.test(signature)) return false;
    if (!Number.isFinite(now) || !Number.isSafeInteger(maxSkewSeconds) || maxSkewSeconds < 0 || maxSkewSeconds > 300) return false;
    validated(input);
    const timestampSeconds = Number(input.timestamp);
    if (!Number.isSafeInteger(timestampSeconds) || Math.abs(Math.floor(now / 1000) - timestampSeconds) > maxSkewSeconds) return false;
    const expected = Buffer.from(signQuoteAdapterRequest({ secret, ...input }), "hex");
    const supplied = Buffer.from(signature, "hex");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  } catch { return false; }
}
export function authorizationBearerMatches(header, secrets) {
  if (typeof header !== "string" || !header.startsWith("Bearer ") || header.length > 520) return false;
  const supplied = Buffer.from(header.slice(7), "utf8");
  return secrets.some((secret) => {
    if (typeof secret !== "string" || secret.length < 32 || secret.length > 256) return false;
    const expected = Buffer.from(secret, "utf8");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  });
}
export function secureServiceUrl(value, testMode = false) {
  let url; try { url = new URL(value); } catch { throw new TypeError("invalid service URL"); }
  if (url.username || url.password || url.hash) throw new TypeError("invalid service URL");
  const localHttp = testMode === true && url.protocol === "http:" && ["127.0.0.1", "localhost", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !localHttp) throw new TypeError("service URL requires HTTPS");
  return url;
}
