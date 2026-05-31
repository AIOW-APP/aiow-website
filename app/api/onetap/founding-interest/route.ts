import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { captureOneTapSubmission } from "@/lib/onetap-capture";

type FoundingInterestPayload = {
  email?: unknown;
  intentLevel?: unknown;
  day2Value?: unknown;
  day7Value?: unknown;
  day30Value?: unknown;
  currentPlanningPain?: unknown;
  premiumFeature?: unknown;
  priceReaction?: unknown;
  source?: unknown;
  website?: unknown;
};

const INTEREST_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000,
  maxAttempts: 6,
};

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many founding interest attempts", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const payload = (await req.json()) as FoundingInterestPayload;

    if (typeof payload.website === "string" && payload.website.trim().length > 0) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }

    const email = asTrimmed(payload.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalized = {
      email,
      intentLevel: clampText(asTrimmed(payload.intentLevel) || "interest", 80),
      day2Value: clampText(asTrimmed(payload.day2Value), 1200),
      day7Value: clampText(asTrimmed(payload.day7Value), 1200),
      day30Value: clampText(asTrimmed(payload.day30Value), 1200),
      currentPlanningPain: clampText(asTrimmed(payload.currentPlanningPain), 1200),
      premiumFeature: clampText(asTrimmed(payload.premiumFeature), 300),
      priceReaction: clampText(asTrimmed(payload.priceReaction), 300),
      source: clampText(asTrimmed(payload.source) || "onetap-day-provider-off-offer", 160),
      submittedAt: new Date().toISOString(),
      metric: "interest_intent_rate",
      commercialState: "PROVIDER_OFF_INTEREST_ONLY",
      paymentBoundary: "no live checkout; no payment collected; paid_rate can only run after explicit Richard approval",
      replyTo: "hello@aiow.ai / support@aiow.ai",
    };

    const foundingInterestId = `otd_interest_${createHash("sha256")
      .update(`${normalized.email}|${normalized.submittedAt}|${normalized.intentLevel}`)
      .digest("hex")
      .slice(0, 16)}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      const localCapture = await captureOneTapSubmission("founding-interest", foundingInterestId, normalized, "LOCAL_CAPTURED");
      console.warn("[onetap/founding-interest] Missing RESEND_API_KEY; stored local capture", { foundingInterestId, path: localCapture.path });
      return NextResponse.json({
        ok: true,
        foundingInterestId,
        commercialState: "PROVIDER_OFF_INTEREST_ONLY",
        metric: "interest_intent_rate",
        deliveryState: "LOCAL_CAPTURED",
        message: "Founding interest captured. Team Handsome has it queued; no live checkout or payment.",
      });
    }

    const [teamRes, userRes] = await Promise.all([
      sendResend(apiKey, {
        from: "OneTap Day <intake@send.aiow.ai>",
        to: ["hello@aiow.ai"],
        reply_to: normalized.email,
        subject: `[OneTap founding interest] ${foundingInterestId} · ${normalized.email}`,
        html: renderTeamEmail(foundingInterestId, normalized),
      }),
      sendResend(apiKey, {
        from: "OneTap Day <hello@send.aiow.ai>",
        to: [normalized.email],
        reply_to: "hello@aiow.ai",
        subject: `OneTap Day founding interest ontvangen — ${foundingInterestId}`,
        html: renderUserEmail(foundingInterestId, normalized),
      }),
    ]);

    if (!teamRes.ok || !userRes.ok) {
      const teamText = teamRes.ok ? "ok" : await teamRes.text();
      const userText = userRes.ok ? "ok" : await userRes.text();
      console.error("[onetap/founding-interest] Resend failed", {
        foundingInterestId,
        teamStatus: teamRes.status,
        userStatus: userRes.status,
        teamText: redact(teamText),
        userText: redact(userText),
      });
      const localCapture = await captureOneTapSubmission("founding-interest", foundingInterestId, normalized, "LOCAL_CAPTURED");
      return NextResponse.json({
        ok: true,
        foundingInterestId,
        commercialState: "PROVIDER_OFF_INTEREST_ONLY",
        metric: "interest_intent_rate",
        deliveryState: "LOCAL_CAPTURED",
        warning: "Interest email failed; local capture stored instead.",
        message: "Founding interest captured locally. Team Handsome has it queued; no live checkout or payment.",
        capturePath: localCapture.path,
      });
    }

    await captureOneTapSubmission("founding-interest", foundingInterestId, normalized, "EMAIL_AND_LOCAL_CAPTURED");

    return NextResponse.json({
      ok: true,
      foundingInterestId,
      commercialState: "PROVIDER_OFF_INTEREST_ONLY",
      metric: "interest_intent_rate",
      deliveryState: "EMAIL_AND_LOCAL_CAPTURED",
      message: "Founding interest captured. Team Handsome has it queued; no live checkout or payment.",
    });
  } catch (error) {
    console.error("[onetap/founding-interest] Error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function rateLimitKey(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const userAgent = req.headers.get("user-agent")?.slice(0, 120) || "unknown";
  return createHash("sha256").update(`${forwardedFor || realIp || "unknown-ip"}|${userAgent}|founding-interest`).digest("hex");
}

function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + INTEREST_RATE_LIMIT.windowMs });
    cleanupRateLimitBuckets(now);
    return { ok: true };
  }

  bucket.count += 1;
  if (bucket.count > INTEREST_RATE_LIMIT.maxAttempts) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  return { ok: true };
}

function cleanupRateLimitBuckets(now: number): void {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(key);
  }
}

async function sendResend(apiKey: string, body: unknown): Promise<Response> {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
}

function redact(value: string): string {
  return value.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\n/g, "<br>");
}

function renderTeamEmail(id: string, interest: Record<string, string>): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;max-width:720px;margin:0 auto;padding:32px;background:#100904;color:#fff8ec;border-radius:18px;">
      <p style="color:#ffb840;text-transform:uppercase;letter-spacing:.14em;font-weight:900;margin:0 0 12px;">OneTap Day founding interest</p>
      <h1 style="font-size:28px;line-height:1.1;margin:0 0 18px;">${escapeHtml(id)}</h1>
      <p style="color:#d6c8b5;line-height:1.6;">Metric: <strong>interest_intent_rate</strong>. State: <strong>PROVIDER_OFF_INTEREST_ONLY</strong>. This is no live checkout and no payment proof.</p>
      ${row("Email", interest.email)}
      ${row("Intent level", interest.intentLevel)}
      ${row("Price reaction", interest.priceReaction)}
      ${row("Premium feature", interest.premiumFeature)}
      ${block("Current planning pain", interest.currentPlanningPain)}
      ${block("Day 2 value", interest.day2Value)}
      ${block("Day 7 value", interest.day7Value)}
      ${block("Day 30 value", interest.day30Value)}
      ${block("Payment boundary", interest.paymentBoundary)}
    </div>
  `;
}

function renderUserEmail(id: string, interest: Record<string, string>): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;max-width:640px;margin:0 auto;padding:32px;background:#fff8ec;color:#15130f;border-radius:18px;">
      <p style="color:#9a5b00;text-transform:uppercase;letter-spacing:.14em;font-weight:900;margin:0 0 12px;">OneTap Day</p>
      <h1 style="font-size:28px;line-height:1.1;margin:0 0 18px;">Founding interest ontvangen.</h1>
      <p style="line-height:1.65;">Receipt: <strong>${escapeHtml(id)}</strong></p>
      <p style="line-height:1.65;">Dit is alleen provider-off interesse. Geen live checkout, geen betaling, geen abonnement. We gebruiken dit om te meten of OneTap Premium de juiste revenue-fit heeft voordat we iets live monetizen.</p>
      <p style="line-height:1.65;">Vragen of verwijderen? Reply of mail <a href="mailto:hello@aiow.ai">hello@aiow.ai</a> / <a href="mailto:support@aiow.ai">support@aiow.ai</a>.</p>
    </div>
  `;
}

function row(label: string, value: string): string {
  return `<p style="margin:10px 0;color:#d6c8b5;"><strong style="color:#fff8ec;">${escapeHtml(label)}:</strong> ${escapeHtml(value || "—")}</p>`;
}

function block(label: string, value: string): string {
  return `<div style="margin:18px 0;padding:16px;border:1px solid rgba(255,184,64,.24);border-radius:12px;background:rgba(255,255,255,.06);"><p style="color:#ffb840;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:900;margin:0 0 10px;">${escapeHtml(label)}</p><p style="margin:0;line-height:1.65;">${escapeHtml(value || "—")}</p></div>`;
}
