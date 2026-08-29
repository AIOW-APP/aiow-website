import { NextResponse } from "next/server";
import { verifyQuoteAdapterRequest } from "@/lib/aiow-v1/quote-adapter-auth.mjs";
import { quoteAdapterRpc, QuoteAdapterStoreError, supabaseConfigured, validateCommitRpcResponse, validatePrepareRpcResponse } from "@/lib/aiow-v1/quote-adapter-store";

export const runtime = "nodejs";
const MAX_BODY = 2 * 1024 * 1024;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const IDEMPOTENCY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const HEX = /^[0-9a-f]{64}$/;
function object(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype; }
function exact(value: unknown, keys: readonly string[]): value is Record<string, unknown> { return object(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)); }
function only(value: unknown, required: readonly string[], allowed: readonly string[]) { return object(value) && required.every((key) => Object.hasOwn(value, key)) && Object.keys(value).every((key) => allowed.includes(key)); }
function normalizedCommon(body: Record<string, unknown>) {
  const quoteKeys = ["schemaVersion","locale","issueDate","validUntil","configuration","primary","smartDesign","comfort","qualification","bookingUrl"];
  return exact(body.quote, quoteKeys) && body.quote.schemaVersion === 1 && ["nl","en"].includes(String(body.quote.locale)) && /^\d{4}-\d{2}-\d{2}$/.test(String(body.quote.issueDate)) && object(body.quote.configuration) && object(body.quote.primary) && Array.isArray(body.quote.smartDesign)
    && only(body.contact,["name","email","phone"],["name","email","phone","company","postcode","kvk","startDate","note"])
    && only(body.source,["route","locale"],["route","utm","locale"]) && (body.country === "" || /^[A-Z]{2}$/.test(String(body.country)));
}
async function readBytes(request: Request) {
  const declared = Number(request.headers.get("content-length") || "0"); if (Number.isFinite(declared) && declared > MAX_BODY) return null;
  if (!request.body) return null; const reader = request.body.getReader(); const parts: Uint8Array[] = []; let size = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BODY) { await reader.cancel(); return null; } parts.push(value); } } finally { reader.releaseLock(); }
  return Buffer.concat(parts.map((part) => Buffer.from(part)), size);
}
function error(status: number) { return NextResponse.json({ accepted: false }, { status, headers: { "cache-control": "no-store" } }); }
export async function POST(request: Request) {
  const secret = process.env.AIOW_QUOTE_WEBHOOK_SECRET;
  if (!secret || !supabaseConfigured()) return error(503);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return error(415);
  const bodyBytes = await readBytes(request); if (!bodyBytes) return error(413);
  const requestId = request.headers.get("x-aiow-request-id") || ""; const idempotencyKey = request.headers.get("idempotency-key") || ""; const timestamp = request.headers.get("x-aiow-webhook-timestamp") || ""; const signature = request.headers.get("x-aiow-webhook-signature") || "";
  const url = new URL(request.url);
  if (!verifyQuoteAdapterRequest({ secret, signature, method: "POST", path: `${url.pathname}${url.search}`, timestamp, requestId, idempotencyKey, bodyBytes })) return error(401);
  let body: unknown; try { body = JSON.parse(bodyBytes.toString("utf8")); } catch { return error(400); }
  if (!object(body) || body.requestId !== requestId || body.idempotencyKey !== idempotencyKey || body.schemaVersion !== 1 || !SAFE_ID.test(requestId) || !IDEMPOTENCY.test(idempotencyKey)) return error(400);
  try {
    if (body.operation === "prepare") {
      const keys = ["operation","schemaVersion","requestId","idempotencyKey","receivedAt","country","quote","contact","consent","source"];
      if (!exact(body,keys) || !normalizedCommon(body) || !exact(body.consent,["accepted","version"]) || body.consent.accepted !== true || body.consent.version !== "aiow-quote-v1" || typeof body.receivedAt !== "string" || !Number.isFinite(Date.parse(body.receivedAt))) return error(400);
      const result = await quoteAdapterRpc("aiow_quote_prepare_v1", { p_request_id: requestId, p_idempotency_key: idempotencyKey, p_received_at: body.receivedAt, p_country: body.country, p_quote: body.quote, p_contact: body.contact, p_consent: body.consent, p_source: body.source });
      return NextResponse.json(validatePrepareRpcResponse(result), { headers: { "cache-control": "no-store" } });
    }
    if (body.operation === "commit") {
      const keys = ["operation","schemaVersion","requestId","idempotencyKey","quoteNumber","leadId","pdf","customerMail","internalMail","quote","contact","source","country"];
      if (!exact(body,keys) || !normalizedCommon(body) || typeof body.quoteNumber !== "string" || !/^AIOW-[0-9]{4}-[0-9]{4}$/.test(body.quoteNumber) || typeof body.leadId !== "string" || !UUID.test(body.leadId)
        || !exact(body.pdf,["filename","mimeType","base64","sha256"]) || body.pdf.filename !== `${body.quoteNumber}.pdf` || body.pdf.mimeType !== "application/pdf" || typeof body.pdf.base64 !== "string" || body.pdf.base64.length > 2_000_000 || typeof body.pdf.sha256 !== "string" || !HEX.test(body.pdf.sha256)
        || !exact(body.customerMail,["from","to","subject","text","html"]) || !exact(body.internalMail,["from","to","subject","text","html"])) return error(400);
      const result = await quoteAdapterRpc("aiow_quote_commit_v1", { p_request_id: requestId,p_idempotency_key:idempotencyKey,p_quote_number:body.quoteNumber,p_lead_id:body.leadId,p_pdf_filename:body.pdf.filename,p_pdf_mime_type:body.pdf.mimeType,p_pdf_base64:body.pdf.base64,p_pdf_sha256:body.pdf.sha256,p_customer_mail:body.customerMail,p_internal_mail:body.internalMail,p_quote:body.quote,p_contact:body.contact,p_source:body.source,p_country:body.country });
      return NextResponse.json(validateCommitRpcResponse(result), { headers: { "cache-control": "no-store" } });
    }
    return error(400);
  } catch (caught) {
    const conflict = caught instanceof QuoteAdapterStoreError && caught.code === "RPC" && (caught.status === 400 || caught.status === 409 || /P0001|23505|22023/.test(caught.message));
    console.warn("AIOW internal quote adapter RPC failed", { operation: body.operation, status: conflict ? 409 : 502, reason: caught instanceof QuoteAdapterStoreError ? caught.code : "unknown" });
    return error(conflict ? 409 : 502);
  }
}
