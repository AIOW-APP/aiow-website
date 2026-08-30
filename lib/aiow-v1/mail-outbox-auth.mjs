import { createHmac, timingSafeEqual } from "node:crypto";
import {
  AIOW_IDEMPOTENCY_HEADER,
  AIOW_REQUEST_ID_HEADER,
  AIOW_WEBHOOK_MAX_SKEW_SECONDS,
  AIOW_WEBHOOK_SIGNATURE_HEADER,
  AIOW_WEBHOOK_TIMESTAMP_HEADER,
  sha256Hex,
} from "./quote-adapter-auth.mjs";

export const MAIL_OUTBOX_PATH = "/api/internal/mail-outbox/run";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const IDEMPOTENCY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const TIMESTAMP = /^[0-9]{10}$/;
const HEX_64 = /^[0-9a-f]{64}$/;

function secretBytes(secret) {
  if (typeof secret !== "string") throw new TypeError("secret must be a string");
  const value = Buffer.from(secret, "utf8");
  if (value.length < 32 || value.length > 256) throw new TypeError("secret must be 32..256 UTF-8 bytes");
  return value;
}
function validateInput({ method, path, timestamp, requestId, idempotencyKey, bodyBytes }) {
  if (method !== "POST") throw new TypeError("invalid method");
  if (path !== MAIL_OUTBOX_PATH) throw new TypeError("invalid path");
  if (typeof timestamp !== "string" || !TIMESTAMP.test(timestamp)) throw new TypeError("invalid timestamp");
  if (typeof requestId !== "string" || !UUID.test(requestId)) throw new TypeError("invalid request ID");
  if (typeof idempotencyKey !== "string" || !IDEMPOTENCY.test(idempotencyKey)) throw new TypeError("invalid idempotency key");
  if (!(bodyBytes instanceof Uint8Array)) throw new TypeError("bodyBytes must be bytes");
}
export function canonicalMailOutboxRequest(input) {
  validateInput(input);
  return `${input.method}\n${input.path}\n${input.timestamp}\n${input.requestId}\n${input.idempotencyKey}\n${sha256Hex(input.bodyBytes)}`;
}
export function signMailOutboxRequest({ secret, ...input }) {
  return createHmac("sha256", secretBytes(secret)).update(canonicalMailOutboxRequest(input), "utf8").digest("hex");
}
export function verifyMailOutboxSignature({ secret, signature, now = Date.now(), ...input }) {
  try {
    if (typeof signature !== "string" || !HEX_64.test(signature) || !Number.isFinite(now)) return false;
    validateInput(input);
    const timestampSeconds = Number(input.timestamp);
    if (!Number.isSafeInteger(timestampSeconds) || Math.abs(Math.floor(now / 1000) - timestampSeconds) > AIOW_WEBHOOK_MAX_SKEW_SECONDS) return false;
    const expected = Buffer.from(signMailOutboxRequest({ secret, ...input }), "hex");
    const supplied = Buffer.from(signature, "hex");
    return supplied.length === expected.length && timingSafeEqual(supplied, expected);
  } catch { return false; }
}
export function verifyMailOutboxHttpRequest({ request, bodyBytes, secret, now = Date.now() }) {
  try {
    const url = new URL(request.url);
    if (url.protocol !== "https:" || url.pathname !== MAIL_OUTBOX_PATH || url.search !== "") return false;
    return verifyMailOutboxSignature({
      secret,
      signature:request.headers.get(AIOW_WEBHOOK_SIGNATURE_HEADER),
      method:request.method,
      path:url.pathname,
      timestamp:request.headers.get(AIOW_WEBHOOK_TIMESTAMP_HEADER),
      requestId:request.headers.get(AIOW_REQUEST_ID_HEADER),
      idempotencyKey:request.headers.get(AIOW_IDEMPOTENCY_HEADER),
      bodyBytes,
      now,
    });
  } catch { return false; }
}
