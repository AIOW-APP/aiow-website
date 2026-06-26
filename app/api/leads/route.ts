import { NextResponse } from "next/server";
import { captureAiowLead, normalizeLeadEmail, validLeadEmail, type AiowLeadCaptureInput } from "@/lib/aiow-lead-capture";

type LeadPayload = {
  email?: unknown;
  consentAccepted?: unknown;
  consentText?: unknown;
  consentVersion?: unknown;
  source?: unknown;
  sourceRoute?: unknown;
  sourceComponent?: unknown;
  locale?: unknown;
  name?: unknown;
  company?: unknown;
  phone?: unknown;
  intentType?: unknown;
  intentText?: unknown;
  message?: unknown;
  projectType?: unknown;
  moduleInterests?: unknown;
  addOns?: unknown;
  website?: unknown;
  honeyWebsite?: unknown;
  testMode?: unknown;
};

const CONSENT_VERSION = "aiow-followup-v1";
const DEFAULT_CONSENT_TEXT =
  "AIOW mag mijn contactgegevens en intakecontext gebruiken om mijn aanvraag persoonlijk per e-mail op te volgen. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.";
const RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxAttempts: 10 };
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many lead attempts", retryAfterSeconds: rateLimit.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const payload = (await req.json()) as LeadPayload;
    if (asTrimmed(payload.website) || asTrimmed(payload.honeyWebsite)) {
      return NextResponse.json({ error: "Rejected" }, { status: 400 });
    }

    const email = normalizeLeadEmail(asTrimmed(payload.email));
    const missing: string[] = [];
    if (!email || !validLeadEmail(email)) missing.push("validEmail");
    if (payload.consentAccepted !== true) missing.push("consentAccepted");

    if (missing.length > 0) {
      return NextResponse.json({ error: "Incomplete lead", missing }, { status: 400 });
    }

    const leadInput: AiowLeadCaptureInput = {
      email,
      consentAccepted: true,
      consentText: clampText(asTrimmed(payload.consentText), 500) || DEFAULT_CONSENT_TEXT,
      consentVersion: clampText(asTrimmed(payload.consentVersion), 80) || CONSENT_VERSION,
      source: clampText(asTrimmed(payload.source), 120) || "aiow.ai",
      sourceRoute: clampText(asTrimmed(payload.sourceRoute), 180),
      sourceComponent: clampText(asTrimmed(payload.sourceComponent), 120) || "lead-capture",
      locale: payload.locale === "en" ? "en" : "nl",
      name: clampText(asTrimmed(payload.name), 140),
      company: clampText(asTrimmed(payload.company), 160),
      phone: clampText(asTrimmed(payload.phone), 80),
      intentType: normalizeIntent(payload.intentType),
      intentText: clampText(asTrimmed(payload.intentText) || asTrimmed(payload.message), 1200),
      projectType: clampText(asTrimmed(payload.projectType), 120),
      moduleInterests: normalizeList(payload.moduleInterests, 20, 80),
      addOns: normalizeList(payload.addOns, 20, 80),
      metadata: {
        userAgentClass: classifyUserAgent(req.headers.get("user-agent") || ""),
        referrer: clampText(req.headers.get("referer") || "", 240),
      },
    };

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      const localCapture = await captureAiowLead(leadInput, "LOCAL_CAPTURED");
      console.warn("[leads] Missing RESEND_API_KEY; stored local lead capture", { leadId: localCapture.id, path: localCapture.path });
      return NextResponse.json({
        ok: true,
        leadId: localCapture.id,
        deliveryState: "LOCAL_CAPTURED",
        followUp: localCapture.record.followUp,
        message: "AIOW heeft je aanvraag en toestemming vastgelegd. We volgen persoonlijk op zodra e-mailverzending actief is.",
      });
    }

    const localPreview = await captureAiowLead(leadInput, "LOCAL_CAPTURED");
    const testMode = payload.testMode === true;
    const [teamRes, userRes] = await Promise.all([
      sendResend(apiKey, {
        from: "AIOW Leads <leads@send.aiow.ai>",
        to: ["hello@aiow.ai"],
        reply_to: email,
        subject: `${testMode ? "[TEST] " : ""}[AIOW lead] ${leadInput.company || leadInput.name || email}`,
        html: renderTeamEmail(localPreview.id, leadInput, localPreview.record.followUp.scheduledFor),
      }),
      sendResend(apiKey, {
        from: "AIOW <hello@send.aiow.ai>",
        to: [email],
        reply_to: "hello@aiow.ai",
        subject: testMode ? "[TEST] AIOW heeft je aanvraag ontvangen" : "AIOW heeft je aanvraag ontvangen",
        html: renderUserEmail(localPreview.id, leadInput),
      }),
    ]);

    if (!teamRes.ok || !userRes.ok) {
      console.error("[leads] Resend failed", { leadId: localPreview.id, teamStatus: teamRes.status, userStatus: userRes.status });
      return NextResponse.json({
        ok: true,
        leadId: localPreview.id,
        deliveryState: "LOCAL_CAPTURED",
        warning: "Lead email failed; local capture stored instead.",
        followUp: localPreview.record.followUp,
        message: "AIOW heeft je aanvraag vastgelegd. We volgen persoonlijk op.",
      });
    }

    return NextResponse.json({
      ok: true,
      leadId: localPreview.id,
      deliveryState: "EMAIL_AND_LOCAL_CAPTURED",
      followUp: localPreview.record.followUp,
      message: "AIOW heeft je aanvraag ontvangen. Je krijgt een persoonlijke opvolging met een eerste AI-schets.",
    });
  } catch (error) {
    console.error("[leads] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function normalizeList(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => clampText(item.trim(), maxLength)).filter(Boolean).slice(0, maxItems);
}

function normalizeIntent(value: unknown): AiowLeadCaptureInput["intentType"] {
  const raw = asTrimmed(value);
  if (["idea", "company", "scan", "talk", "apply", "account", "contact", "unknown"].includes(raw)) return raw as AiowLeadCaptureInput["intentType"];
  return "unknown";
}

function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { ok: true };
  }
  if (current.count >= RATE_LIMIT.maxAttempts) return { ok: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  current.count += 1;
  return { ok: true };
}

function rateLimitKey(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.headers.get("x-real-ip") || "local";
}

function classifyUserAgent(userAgent: string): "mobile" | "desktop" | "unknown" {
  if (!userAgent) return "unknown";
  return /mobile|iphone|android/i.test(userAgent) ? "mobile" : "desktop";
}

async function sendResend(apiKey: string, payload: Record<string, unknown>): Promise<Response> {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function renderTeamEmail(leadId: string, lead: AiowLeadCaptureInput, scheduledFor: string): string {
  return renderShell(`
    <p style="color:#91ffd2; letter-spacing:.14em; text-transform:uppercase; font-size:12px; margin:0 0 18px;">Nieuwe AIOW lead</p>
    <h1 style="font-size:30px; line-height:1.05; margin:0 0 24px;">${escapeHtml(lead.company || lead.name || lead.email)}</h1>
    ${renderRows([
      ["Lead ID", leadId],
      ["Naam", lead.name || "n.v.t."],
      ["Bedrijf", lead.company || "n.v.t."],
      ["E-mail", lead.email],
      ["Telefoon", lead.phone || "n.v.t."],
      ["Bron", `${lead.sourceRoute || lead.source} · ${lead.sourceComponent || "unknown"}`],
      ["Intent", lead.intentType || "unknown"],
      ["Projecttype", lead.projectType || "n.v.t."],
      ["Modules", (lead.moduleInterests || []).join(", ") || "n.v.t."],
      ["Follow-up gepland", scheduledFor],
      ["Consent", `${lead.consentVersion} · ${lead.consentText}`],
    ])}
    ${lead.intentText ? `<div style="margin-top:22px; padding:16px; background:#111114; border:1px solid rgba(255,255,255,.08); border-radius:12px;"><p style="margin:0 0 8px; color:#8A8A94; text-transform:uppercase; letter-spacing:.12em; font-size:11px;">Context</p><p style="margin:0; color:#F8F8FA; line-height:1.6;">${escapeHtml(lead.intentText).replace(/\n/g, "<br>")}</p></div>` : ""}
  `);
}

function renderUserEmail(leadId: string, lead: AiowLeadCaptureInput): string {
  return renderShell(`
    <p style="color:#91ffd2; letter-spacing:.14em; text-transform:uppercase; font-size:12px; margin:0 0 18px;">AIOW intake ontvangen</p>
    <h1 style="font-size:30px; line-height:1.05; margin:0 0 18px;">We hebben je context vastgelegd.</h1>
    <p style="color:#D7D7DE; line-height:1.65; margin:0 0 16px;">Hoi ${escapeHtml(lead.name || lead.company || "")}, AIOW heeft je aanvraag ontvangen. We gebruiken je input om een persoonlijke AI-schets te maken: waar zit waarschijnlijk de eerste waarde, welke workflow is veilig als startpunt en welke vervolgstap past.</p>
    ${lead.intentText ? `<p style="color:#A7A7B2; line-height:1.65; margin:0 0 18px;">Je gaf aan: “${escapeHtml(lead.intentText.slice(0, 260))}”</p>` : ""}
    <div style="padding:16px; border-radius:14px; background:#101C18; border:1px solid rgba(145,255,210,.22); color:#F8F8FA; line-height:1.6;">Morgen sturen we, als dit bij je aanvraag past, een korte persoonlijke opvolging met een concrete AIOW-denkrichting. Geen generieke nieuwsbrief.</div>
    <p style="color:#7A7A84; font-size:12px; line-height:1.5; margin:18px 0 0;">Lead ID: ${escapeHtml(leadId)}. Je ontvangt dit omdat je toestemming gaf voor persoonlijke opvolging van je AIOW-aanvraag.</p>
  `);
}

function renderRows(rows: Array<[string, unknown]>): string {
  return `<table style="width:100%; border-collapse:collapse;">${rows.map(([label, value]) => `<tr><td style="padding:9px 0; color:#8A8A94; font-size:12px; text-transform:uppercase; letter-spacing:.1em; border-bottom:1px solid rgba(255,255,255,.08);">${escapeHtml(label)}</td><td style="padding:9px 0; color:#F8F8FA; text-align:right; border-bottom:1px solid rgba(255,255,255,.08);">${escapeHtml(String(value || "n.v.t."))}</td></tr>`).join("")}</table>`;
}

function renderShell(content: string): string {
  return `<!doctype html><html><body style="margin:0; background:#08090B; font-family:Inter,Arial,sans-serif; color:#F8F8FA;"><div style="max-width:680px; margin:0 auto; padding:32px 20px;"><div style="border:1px solid rgba(255,255,255,.10); border-radius:24px; padding:28px; background:linear-gradient(145deg,#101114,#08090B);">${content}</div></div></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] || char);
}
