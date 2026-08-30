import { CommercialError, commercialRpc, endpointPayloadDigest, validIdempotencyKey, validRequestId, validSha256 } from "./commercial-api-runtime.mjs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const QUOTE_NUMBER = /^AIOW-[0-9]{4}-[0-9]{4}$/;
const PDF_NAME = /^AIOW-[0-9]{4}-[0-9]{4}\.pdf$/;
const plain = (value) => value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const exactKeys = (value, keys) => plain(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
const conflict = (message = "durable prepared quote conflict") => new CommercialError("idempotency_conflict", 409, message);

function validIdentity(input) {
  return plain(input) && validRequestId(input.requestId) && validIdempotencyKey(input.idempotencyKey)
    && UUID.test(input.leadId) && UUID.test(input.commercialLeadId) && QUOTE_NUMBER.test(input.quoteNumber);
}
function rpcArgs(input) {
  return { p_request_id:input.requestId, p_idempotency_key:input.idempotencyKey, p_lead_id:input.leadId,
    p_commercial_lead_id:input.commercialLeadId, p_quote_number:input.quoteNumber };
}

export async function loadDurablePreparedQuote(input, options = {}) {
  if (!validIdentity(input)) throw conflict();
  let record;
  try { record = await commercialRpc("aiow_quote_prepared_load_v1", rpcArgs(input), options); }
  catch (error) { if (error?.status === 409 || error?.code === "idempotency_conflict") throw error; throw conflict(); }
  const keys=["schemaKind","requestId","idempotencyKey","leadId","commercialLeadId","quoteNumber","state","requestPayloadDigest","quote","receivedAt","expiresAt"];
  if (!exactKeys(record,keys) || record.schemaKind!=="prepared_quote_authority" || record.requestId!==input.requestId
    || record.idempotencyKey!==input.idempotencyKey || record.leadId!==input.leadId || record.commercialLeadId!==input.commercialLeadId
    || record.quoteNumber!==input.quoteNumber || !["prepared","committed"].includes(record.state) || !validSha256(record.requestPayloadDigest)
    || !plain(record.quote) || endpointPayloadDigest("quote_prepare",record.quote)!==record.requestPayloadDigest
    || typeof record.receivedAt!=="string" || Number.isNaN(Date.parse(record.receivedAt))
    || typeof record.expiresAt!=="string" || Number.isNaN(Date.parse(record.expiresAt))) throw conflict();
  if (record.state==="prepared" && Date.parse(record.expiresAt)<=Number(options.now??Date.now())) throw conflict("durable prepared quote expired");
  return { quote:record.quote, receivedAt:record.receivedAt, state:record.state, requestPayloadDigest:record.requestPayloadDigest };
}

export async function loadDurableCommittedQuote(input, options = {}) {
  if (!validIdentity(input) || !validSha256(input.requestPayloadDigest)) throw conflict();
  let record;
  try { record=await commercialRpc("aiow_quote_committed_pdf_load_v1",{...rpcArgs(input),p_request_payload_digest:input.requestPayloadDigest},options); }
  catch { throw conflict("durable committed quote unavailable"); }
  const keys=["schemaKind","requestId","leadId","commercialLeadId","quoteNumber","filename","mimeType","base64","sha256"];
  if (!exactKeys(record,keys) || record.schemaKind!=="committed_quote_pdf" || record.requestId!==input.requestId || record.leadId!==input.leadId
    || record.commercialLeadId!==input.commercialLeadId || record.quoteNumber!==input.quoteNumber || !PDF_NAME.test(record.filename)
    || record.filename!==`${input.quoteNumber}.pdf` || record.mimeType!=="application/pdf" || typeof record.base64!=="string" || !validSha256(record.sha256)) throw conflict();
  const bytes=Buffer.from(record.base64,"base64");
  if (bytes.length<5 || bytes.subarray(0,5).toString("utf8")!=="%PDF-" || (await import("node:crypto")).createHash("sha256").update(bytes).digest("hex")!==record.sha256) throw conflict();
  return { bytes, filename:record.filename, mimeType:record.mimeType, sha256:record.sha256 };
}
