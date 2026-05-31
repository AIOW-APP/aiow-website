import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { captureOneTapSubmission } from "@/lib/onetap-capture";

type IntakePayload = {
  email?: unknown;
  rawTasks?: unknown;
  fixedAppointments?: unknown;
  workWindow?: unknown;
  priorityContext?: unknown;
  planningBaselineMinutes?: unknown;
  timezone?: unknown;
  consentAccepted?: unknown;
  aiTransitAccepted?: unknown;
  website?: unknown;
  testMode?: unknown;
};

const REQUIRED_TEXT_FIELDS: Array<keyof IntakePayload> = [
  "email",
  "rawTasks",
  "fixedAppointments",
  "workWindow",
  "priorityContext",
  "planningBaselineMinutes",
];

const MAX_FIELD_LENGTHS: Record<string, number> = {
  email: 254,
  rawTasks: 5000,
  fixedAppointments: 2000,
  workWindow: 500,
  priorityContext: 2000,
  planningBaselineMinutes: 8,
  timezone: 80,
};

const INTAKE_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000,
  maxAttempts: 8,
};

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many intake attempts", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const payload = (await req.json()) as IntakePayload;

    if (typeof payload.website === "string" && payload.website.trim().length > 0) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }

    const missing = REQUIRED_TEXT_FIELDS.filter((field) => !asTrimmed(payload[field]));
    if (missing.length > 0 || payload.consentAccepted !== true || payload.aiTransitAccepted !== true) {
      return NextResponse.json(
        {
          error: "Incomplete intake",
          missing: [
            ...missing,
            ...(payload.consentAccepted === true ? [] : ["consentAccepted"]),
            ...(payload.aiTransitAccepted === true ? [] : ["aiTransitAccepted"]),
          ],
        },
        { status: 400 },
      );
    }

    const email = asTrimmed(payload.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const planningBaselineMinutes = asTrimmed(payload.planningBaselineMinutes);
    if (!/^\d{1,4}$/.test(planningBaselineMinutes)) {
      return NextResponse.json({ error: "Invalid planning baseline minutes" }, { status: 400 });
    }

    const normalized = {
      email,
      rawTasks: clampText(asTrimmed(payload.rawTasks), MAX_FIELD_LENGTHS.rawTasks),
      fixedAppointments: clampText(asTrimmed(payload.fixedAppointments), MAX_FIELD_LENGTHS.fixedAppointments),
      workWindow: clampText(asTrimmed(payload.workWindow), MAX_FIELD_LENGTHS.workWindow),
      priorityContext: clampText(asTrimmed(payload.priorityContext), MAX_FIELD_LENGTHS.priorityContext),
      planningBaselineMinutes,
      timezone: clampText(asTrimmed(payload.timezone) || "Europe/Amsterdam", MAX_FIELD_LENGTHS.timezone),
      consentAccepted: true,
      aiTransitAccepted: true,
      submittedAt: new Date().toISOString(),
      dataBoundary: "text-only phase1; raw intake retention max 30 days; remove-from-active-workflow on request via support@aiow.ai or hello@aiow.ai; queued for provider deletion cycle; no calendar OAuth; no voice upload; no secrets/medical/financial-account/third-party-sensitive data",
      aiTransitBoundary: "human-reviewed; may be assisted by Team Handsome AI tools for summarisation/planning; no autonomous payment/store/distribution action",
      paymentState: "PAUSED_PROVIDER_OFF",
      offer: "OneTap Day plan request; checkout paused until Gate Ledger PASS + explicit Richard approval",
    };

    const intakeId = `otd_${createHash("sha256")
      .update(`${normalized.email}|${normalized.submittedAt}|${normalized.rawTasks.slice(0, 128)}`)
      .digest("hex")
      .slice(0, 16)}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      const localCapture = await captureOneTapSubmission("intake", intakeId, normalized, "LOCAL_CAPTURED");
      console.warn("[onetap/intake] Missing RESEND_API_KEY; stored local capture", { intakeId, path: localCapture.path });
      return NextResponse.json({
        ok: true,
        intakeId,
        paymentState: "PAUSED_PROVIDER_OFF",
        deliveryState: "LOCAL_CAPTURED",
        message: "Intake captured. Team Handsome has the request queued; payment remains paused until explicit approval.",
      });
    }

    const testMode = payload.testMode === true;
    const subjectPrefix = testMode ? "[TEST OneTap intake]" : "[OneTap intake]";
    const teamPayload = {
      from: "OneTap Day <intake@send.aiow.ai>",
      to: ["hello@aiow.ai"],
      reply_to: normalized.email,
      subject: `${subjectPrefix} ${intakeId} · ${normalized.email}`,
      html: renderTeamEmail(intakeId, normalized),
    };

    const userPayload = {
      from: "OneTap Day <hello@send.aiow.ai>",
      to: [normalized.email],
      reply_to: "hello@aiow.ai",
      subject: testMode
        ? `[TEST] OneTap Day intake ontvangen — ${intakeId}`
        : `OneTap Day intake ontvangen — ${intakeId}`,
      html: renderUserEmail(intakeId, normalized),
    };

    const [teamRes, userRes] = await Promise.all([
      sendResend(apiKey, teamPayload),
      sendResend(apiKey, userPayload),
    ]);

    if (!teamRes.ok || !userRes.ok) {
      const teamText = teamRes.ok ? "ok" : await teamRes.text();
      const userText = userRes.ok ? "ok" : await userRes.text();
      console.error("[onetap/intake] Resend failed", {
        intakeId,
        teamStatus: teamRes.status,
        userStatus: userRes.status,
        teamText: redact(teamText),
        userText: redact(userText),
      });
      const localCapture = await captureOneTapSubmission("intake", intakeId, normalized, "LOCAL_CAPTURED");
      return NextResponse.json({
        ok: true,
        intakeId,
        paymentState: "PAUSED_PROVIDER_OFF",
        deliveryState: "LOCAL_CAPTURED",
        warning: "Intake email failed; local capture stored instead.",
        message: "Intake captured locally. Team Handsome has the request queued; payment remains paused until explicit approval.",
        capturePath: localCapture.path,
      });
    }

    await captureOneTapSubmission("intake", intakeId, normalized, "EMAIL_AND_LOCAL_CAPTURED");

    return NextResponse.json({
      ok: true,
      intakeId,
      paymentState: "PAUSED_PROVIDER_OFF",
      deliveryState: "EMAIL_AND_LOCAL_CAPTURED",
      message: "Intake captured. Team Handsome has the request queued; payment remains paused until explicit approval.",
    });
  } catch (error) {
    console.error("[onetap/intake] Error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
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

function redact(value: string): string {
  return value.replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [REDACTED]");
}

function rateLimitKey(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const userAgent = req.headers.get("user-agent")?.slice(0, 120) || "unknown";
  return createHash("sha256").update(`${forwardedFor || realIp || "unknown-ip"}|${userAgent}`).digest("hex");
}

function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + INTAKE_RATE_LIMIT.windowMs });
    cleanupRateLimitBuckets(now);
    return { ok: true };
  }

  bucket.count += 1;
  if (bucket.count > INTAKE_RATE_LIMIT.maxAttempts) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  return { ok: true };
}

function cleanupRateLimitBuckets(now: number): void {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}

async function sendResend(apiKey: string, body: unknown): Promise<Response> {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
}

function renderTeamEmail(intakeId: string, intake: ReturnType<typeof normalizeForTemplate>): string {
  return renderTeamEmailUntyped(intakeId, intake);
}

function renderUserEmail(intakeId: string, intake: ReturnType<typeof normalizeForTemplate>): string {
  return renderUserEmailUntyped(intakeId, intake);
}

function normalizeForTemplate<T extends Record<string, string | boolean>>(value: T): T {
  return value;
}

function renderTeamEmailUntyped(intakeId: string, intake: Record<string, string | boolean>): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;max-width:720px;margin:0 auto;padding:32px;background:#100904;color:#fff8ec;border-radius:18px;">
      <p style="color:#ffb840;text-transform:uppercase;letter-spacing:.14em;font-weight:900;margin:0 0 12px;">OneTap Day controlled intake</p>
      <h1 style="font-size:30px;line-height:1.05;margin:0 0 20px;">${escapeHtml(intakeId)}</h1>
      <p style="color:#d6c8b5;line-height:1.6;">Payment remains <strong>PAUSED_PROVIDER_OFF</strong>. Do not send Stripe checkout until Gate Ledger PASS + explicit Richard payment approval.</p>
      ${row("Email", String(intake.email))}
      ${row("Timezone", String(intake.timezone))}
      ${row("Planning baseline", `${String(intake.planningBaselineMinutes)} minutes`)}
      ${block("Raw tasks", String(intake.rawTasks))}
      ${block("Fixed appointments / constraints", String(intake.fixedAppointments))}
      ${block("Work window", String(intake.workWindow))}
      ${block("Priority context", String(intake.priorityContext))}
      ${block("Data boundary", String(intake.dataBoundary))}
      ${block("AI transit boundary", String(intake.aiTransitBoundary))}
      ${block("Offer/payment state", String(intake.offer))}
    </div>
  `;
}

function renderUserEmailUntyped(intakeId: string, intake: Record<string, string | boolean>): string {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;max-width:640px;margin:0 auto;padding:32px;background:#fff8ec;color:#15130f;border-radius:18px;">
      <p style="color:#9a5b00;text-transform:uppercase;letter-spacing:.14em;font-weight:900;margin:0 0 12px;">OneTap Day</p>
      <h1 style="font-size:30px;line-height:1.05;margin:0 0 20px;">Je intake is ontvangen.</h1>
      <p style="line-height:1.65;">Receipt: <strong>${escapeHtml(intakeId)}</strong></p>
      <p style="line-height:1.65;">We behandelen dit als text-only Phase 1 intake. Raw intake wordt maximaal 30 dagen bewaard. Verwijderverzoeken via <a href="mailto:support@aiow.ai">support@aiow.ai</a> of <a href="mailto:hello@aiow.ai">hello@aiow.ai</a> halen de intake uit de actieve workflow en zetten deze klaar voor permanente verwijdering volgens de mailbox-providercyclus.</p>
      <p style="line-height:1.65;">Belangrijk: Stripe checkout staat nog gepauzeerd. De 24-uurs SLA start pas na succesvolle betaling én complete intake. Betaling gaat pas open na Gate Ledger PASS + expliciete approval.</p>
      ${block("AI/transit disclosure", String(intake.aiTransitBoundary))}
      <p style="color:#6a5945;font-size:13px;margin-top:28px;">Als je secrets, wachtwoorden, medische details, financiële accountgegevens of gevoelige data van derden hebt meegestuurd, reply dan direct zodat we de intake uit de actieve workflow halen en klaarzetten voor verwijdering.</p>
    </div>
  `;
}

function row(label: string, value: string): string {
  return `<p style="margin:10px 0;color:#d6c8b5;"><strong style="color:#fff8ec;">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

function block(label: string, value: string): string {
  return `<div style="margin:18px 0;padding:16px;border:1px solid rgba(255,184,64,.24);border-radius:12px;background:rgba(255,255,255,.06);"><p style="color:#ffb840;text-transform:uppercase;letter-spacing:.08em;font-size:12px;font-weight:900;margin:0 0 10px;">${escapeHtml(label)}</p><p style="margin:0;line-height:1.65;">${escapeHtml(value)}</p></div>`;
}
