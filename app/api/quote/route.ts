import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { readBoundedJson, BookingRequestError, createRateLimiter } from "@/lib/aiow-v1/booking-runtime.mjs";
import { amsterdamDateISO, buildQuoteMailContent, buildQuoteSnapshot, validateQuoteNumber, validateQuoteRequest } from "@/lib/aiow-v1/quote.mjs";
import { generateQuotePdf } from "@/lib/aiow-v1/quote-pdf.mjs";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 16_384;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const COUNTRY = /^[A-Z]{2}$/;
const limiterGlobal = globalThis as typeof globalThis & { __aiowQuoteLimiter?: ReturnType<typeof createRateLimiter> };
const limiter = limiterGlobal.__aiowQuoteLimiter ??= createRateLimiter({ perKey: 5, global: 40, windowMs: 60_000 });

function jsonError(status: number, error: string, requestId: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, requestId, ...extra }, { status, headers: { "Cache-Control": "no-store" } });
}
async function adapterPost(url: string, body: unknown, requestId: string, idempotencyKey: string) {
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json", "x-aiow-request-id": requestId, "idempotency-key": idempotencyKey }, body: JSON.stringify(body), signal: AbortSignal.timeout(10_000), cache: "no-store" });
  let payload: unknown = null;
  if (response.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    try { payload = await response.json(); } catch { payload = null; }
  }
  return { response, payload };
}
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function exactKeys(value: Record<string, unknown>, keys: readonly string[]) { return Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)); }

export async function POST(request: Request) {
  const requestId = randomUUID();
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown";
  const rateIdentity = createHash("sha256").update(forwarded.split(",")[0].trim()).digest("hex");
  const rate = limiter.consume(rateIdentity);
  if (!rate.ok) return new NextResponse(JSON.stringify({ ok: false, error: "Te veel aanvragen. Probeer het later opnieuw.", requestId }), { status: 429, headers: { "content-type": "application/json", "Retry-After": String(rate.retryAfterSeconds), "Cache-Control": "no-store" } });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return jsonError(415, "Content-Type moet application/json zijn.", requestId);
  const idempotencyKey = request.headers.get("idempotency-key") || "";
  if (!IDEMPOTENCY_KEY.test(idempotencyKey)) return jsonError(400, "Ongeldige aanvraag.", requestId);
  const webhookUrl = process.env.AIOW_QUOTE_WEBHOOK_URL;
  if (!webhookUrl) { console.warn("AIOW quote unavailable", { requestId, status: 503 }); return jsonError(503, "Offerte-indicaties zijn tijdelijk niet beschikbaar.", requestId); }
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return jsonError(413, "Aanvraag is te groot.", requestId);

  let input: unknown;
  try { input = await readBoundedJson(request, MAX_BODY_BYTES); }
  catch (error) { const status = error instanceof BookingRequestError ? error.status : 400; return jsonError(status, status === 413 ? "Aanvraag is te groot." : "Ongeldige aanvraag.", requestId); }
  const validation = validateQuoteRequest(input);
  if (!validation.ok) return jsonError(400, "Controleer de ingevulde gegevens.", requestId, { fields: validation.errors });

  const now = new Date(); const receivedAt = now.toISOString();
  const countryHeader = request.headers.get("x-vercel-ip-country") || ""; const country = COUNTRY.test(countryHeader) ? countryHeader : "";
  const snapshot = buildQuoteSnapshot(validation.data, { now });
  const prepareBody = { operation: "prepare", schemaVersion: 1, requestId, idempotencyKey, receivedAt, country, quote: snapshot, contact: validation.data.contact, consent: validation.data.consent, source: validation.data.source };
  let quoteNumber: string; let leadId: string;
  try {
    const { response, payload } = await adapterPost(webhookUrl, prepareBody, requestId, idempotencyKey);
    const currentAmsterdamYear = Number(amsterdamDateISO(now).slice(0, 4));
    if (!response.ok || !record(payload) || !exactKeys(payload, ["accepted", "quoteNumber", "leadId"]) || payload.accepted !== true || !validateQuoteNumber(payload.quoteNumber, currentAmsterdamYear) || typeof payload.leadId !== "string" || !SAFE_ID.test(payload.leadId)) {
      console.warn("AIOW quote prepare rejected", { requestId, status: response.status });
      return jsonError(502, "De offerte-indicatie kon niet duurzaam worden voorbereid.", requestId);
    }
    quoteNumber = payload.quoteNumber as string; leadId = payload.leadId;
  } catch (error) {
    console.warn("AIOW quote prepare failed", { requestId, status: 502, reason: error instanceof Error ? error.name : "unknown" });
    return jsonError(502, "De offerte-indicatie kon niet duurzaam worden voorbereid.", requestId);
  }

  try {
    const pdfBytes = await generateQuotePdf({ quoteNumber, snapshot, contact: validation.data.contact });
    const sha256 = createHash("sha256").update(pdfBytes).digest("hex"); const filename = `${quoteNumber}.pdf`;
    const mails = buildQuoteMailContent({ quoteNumber, snapshot, contact: validation.data.contact, source: validation.data.source, country, receivedAt });
    const commitBody = { operation: "commit", schemaVersion: 1, requestId, idempotencyKey, quoteNumber, leadId, pdf: { filename, mimeType: "application/pdf", base64: Buffer.from(pdfBytes).toString("base64"), sha256 }, ...mails, quote: snapshot, contact: validation.data.contact, source: validation.data.source, country };
    const { response, payload } = await adapterPost(webhookUrl, commitBody, requestId, idempotencyKey);
    if (!response.ok || !record(payload) || !exactKeys(payload, ["accepted"]) || payload.accepted !== true) {
      console.warn("AIOW quote commit rejected", { requestId, status: response.status });
      return jsonError(502, "De offerte-indicatie kon niet duurzaam worden afgerond.", requestId);
    }
    console.info("AIOW quote durably accepted", { requestId, status: response.status, quoteNumber });
    return new NextResponse(Buffer.from(pdfBytes), { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "X-AIOW-Quote-Number": quoteNumber, "X-AIOW-Request-ID": requestId, "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("AIOW quote commit failed", { requestId, status: 502, reason: error instanceof Error ? error.name : "unknown" });
    return jsonError(502, "De offerte-indicatie kon niet duurzaam worden afgerond.", requestId);
  }
}
