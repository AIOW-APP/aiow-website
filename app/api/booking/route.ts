import { NextResponse } from "next/server";
import { createHash, randomUUID } from "node:crypto";
import { validateBooking } from "@/lib/aiow-v1/booking.mjs";
import { BookingRequestError, createRateLimiter, readBoundedJson } from "@/lib/aiow-v1/booking-runtime.mjs";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8_000;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const limiterGlobal = globalThis as typeof globalThis & { __aiowBookingLimiter?: ReturnType<typeof createRateLimiter> };
const limiter = limiterGlobal.__aiowBookingLimiter ??= createRateLimiter();

export async function POST(request: Request) {
  const requestId = randomUUID();
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for") || "unknown";
  const rateIdentity = createHash("sha256").update(forwarded.split(",")[0].trim()).digest("hex");
  const rate = limiter.consume(rateIdentity);
  if (!rate.ok) return NextResponse.json({ ok: false, error: "Te veel aanvragen. Probeer het later opnieuw.", requestId }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: "Content-Type moet application/json zijn.", requestId }, { status: 415 });
  }
  const idempotencyKey = request.headers.get("idempotency-key") || "";
  if (!IDEMPOTENCY_KEY.test(idempotencyKey)) {
    return NextResponse.json({ ok: false, error: "Ongeldige idempotency key.", requestId }, { status: 400 });
  }
  const webhookUrl = process.env.AIOW_BOOKING_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("AIOW booking unavailable", { requestId, status: 503 });
    return NextResponse.json({ ok: false, error: "Boeken is tijdelijk niet beschikbaar.", requestId }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "Aanvraag is te groot.", requestId }, { status: 413 });

  let input: unknown;
  try {
    input = await readBoundedJson(request, MAX_BODY_BYTES);
  } catch (error) {
    const status = error instanceof BookingRequestError ? error.status : 400;
    return NextResponse.json({ ok: false, error: status === 413 ? "Aanvraag is te groot." : "Ongeldige aanvraag.", requestId }, { status });
  }

  const result = validateBooking(input);
  if (!result.ok) return NextResponse.json({ ok: false, error: "Controleer de ingevulde gegevens.", fields: result.errors, requestId }, { status: 400 });

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json", "x-aiow-request-id": requestId, "idempotency-key": idempotencyKey },
      body: JSON.stringify({ ...result.data, requestId, receivedAt: new Date().toISOString(), source: "aiow.ai" }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!upstream.ok) {
      console.warn("AIOW booking upstream rejected", { requestId, status: upstream.status });
      return NextResponse.json({ ok: false, error: "De boeking kon niet worden bevestigd. Probeer het later opnieuw.", requestId }, { status: 502 });
    }
    console.info("AIOW booking accepted", { requestId, status: upstream.status });
    return NextResponse.json({ ok: true, requestId, booking: { date: result.data.date, slot: result.data.slot, subject: result.data.subject } });
  } catch (error) {
    console.warn("AIOW booking upstream failed", { requestId, status: 502, reason: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ ok: false, error: "De boeking kon niet worden bevestigd. Probeer het later opnieuw.", requestId }, { status: 502 });
  }
}
