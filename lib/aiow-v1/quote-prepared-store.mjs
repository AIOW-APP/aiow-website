import { CommercialError, canonicalJson, payloadDigest, validIdempotencyKey, validRequestId } from "./commercial-api-runtime.mjs";
import { secureServiceUrl } from "./quote-adapter-auth.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const QUOTE_NUMBER = /^AIOW-[0-9]{4}-[0-9]{4}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const MAX_RESPONSE_BYTES = 256 * 1024;
const COLUMNS = "id,commercial_lead_id,idempotency_key,request_id,quote_number,state,request_payload_hash,normalized_quote,contact,consent,source,country,received_at,expires_at";

function plain(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
function conflict(message = "durable prepared quote conflict") {
  return new CommercialError("idempotency_conflict", 409, message);
}
function exactKeys(value, keys) {
  return plain(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}
async function responseJson(response) {
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) throw new CommercialError("unavailable", 502, "prepared quote response too large");
  try { return JSON.parse(text); } catch { throw new CommercialError("unavailable", 502, "prepared quote response malformed"); }
}

export async function loadDurablePreparedQuote(input, { env = process.env, fetchImpl = fetch, now = Date.now(), timeoutMs = 8_000 } = {}) {
  if (!plain(input) || !validRequestId(input.requestId) || !validIdempotencyKey(input.idempotencyKey)
    || !UUID.test(input.leadId) || !UUID.test(input.commercialLeadId) || !QUOTE_NUMBER.test(input.quoteNumber)) throw conflict();
  const base = env.AIOW_SUPABASE_URL;
  const key = env.AIOW_SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key || key.length > 4096) throw new CommercialError("unavailable", 503, "prepared quote store unavailable");
  let root;
  try { root = secureServiceUrl(base, env.AIOW_COMMERCIAL_TEST_MODE === "1"); }
  catch { throw new CommercialError("unavailable", 503, "prepared quote store unavailable"); }
  const url = new URL("/rest/v1/quote_leads", root);
  url.searchParams.set("select", COLUMNS);
  url.searchParams.set("id", `eq.${input.leadId}`);
  url.searchParams.set("limit", "2");
  let response;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      headers: { accept: "application/json", apikey: key, authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(Math.min(Math.max(timeoutMs, 100), 15_000)),
      cache: "no-store",
      redirect: "error",
    });
  } catch { throw new CommercialError("unavailable", 502, "prepared quote store unavailable"); }
  const payload = await responseJson(response);
  if (!response.ok) throw new CommercialError("unavailable", 502, "prepared quote store rejected request", payload);
  if (!Array.isArray(payload) || payload.length !== 1) throw conflict();
  const record = payload[0];
  const keys = COLUMNS.split(",");
  if (!exactKeys(record, keys) || record.id !== input.leadId || record.commercial_lead_id !== input.commercialLeadId
    || record.idempotency_key !== input.idempotencyKey || record.request_id !== input.requestId || record.quote_number !== input.quoteNumber
    || !["prepared", "committed"].includes(record.state) || !SHA256.test(record.request_payload_hash)
    || !plain(record.normalized_quote) || !plain(record.contact) || !plain(record.consent) || !plain(record.source)
    || typeof record.country !== "string" || typeof record.received_at !== "string" || Number.isNaN(Date.parse(record.received_at))
    || typeof record.expires_at !== "string" || Number.isNaN(Date.parse(record.expires_at))) throw conflict();
  const digestInput = { country: record.country, quote: record.normalized_quote, contact: record.contact, consent: record.consent, source: record.source };
  if (payloadDigest(digestInput) !== record.request_payload_hash
    || canonicalJson(record.normalized_quote.contact) !== canonicalJson(record.contact)
    || canonicalJson(record.normalized_quote.consent) !== canonicalJson(record.consent)
    || canonicalJson(record.normalized_quote.source) !== canonicalJson(record.source)
    || record.normalized_quote.country !== record.country) throw conflict();
  if (record.state === "prepared" && Date.parse(record.expires_at) <= now) throw conflict("durable prepared quote expired");
  return { quote: record.normalized_quote, receivedAt: record.received_at, state: record.state };
}
