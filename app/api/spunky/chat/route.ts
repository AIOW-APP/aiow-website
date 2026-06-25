import { NextResponse } from "next/server";
import { captureVentureMemoryEvent } from "@/lib/aiow-venture-memory";

type SpunkyChatPayload = {
  message?: unknown;
  mode?: unknown;
  visitorMessageCount?: unknown;
  transcript?: unknown;
  page?: unknown;
  sessionId?: unknown;
  canvas?: unknown;
};

const RATE_LIMIT = { windowMs: 60 * 1000, maxAttempts: 18 };
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json({ error: "Too many chat messages", retryAfterSeconds: rateLimit.retryAfterSeconds }, { status: 429 });
    }

    const payload = (await req.json()) as SpunkyChatPayload;
    const message = clamp(asText(payload.message), 900);
    const mode = asText(payload.mode) === "company" ? "company" : "idea";
    const visitorMessageCount = Math.max(1, Math.min(20, Number(payload.visitorMessageCount) || 1));
    const transcript = clamp(asText(payload.transcript), 3000);
    const sessionId = clamp(asText(payload.sessionId) || `aiow_session_${crypto.randomUUID()}`, 160);
    const canvas = isRecord(payload.canvas) ? payload.canvas : undefined;
    if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

    await captureVentureMemoryEvent({
      sessionId,
      role: "user",
      type: "message",
      content: message,
      canvas,
      metadata: { mode, page: asText(payload.page) || "aiow.ai/", visitorMessageCount },
    });

    const webhook = process.env.SPUNKY_CHAT_WEBHOOK_URL || process.env.AIOW_SPUNKY_CHAT_WEBHOOK_URL;
    if (webhook) {
      try {
        const response = await fetch(webhook, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(process.env.SPUNKY_CHAT_WEBHOOK_TOKEN ? { authorization: `Bearer ${process.env.SPUNKY_CHAT_WEBHOOK_TOKEN}` } : {}),
          },
          body: JSON.stringify({
            message,
            mode,
            visitorMessageCount,
            sessionId,
            canvas,
            transcript,
            page: asText(payload.page) || "aiow.ai/",
            boundary:
              "Answer as Spunky for AIOW.ai. Give useful intake guidance, but do not promise production work, legal conclusions, payments, or a final deal before AIOW review.",
          }),
          cache: "no-store",
        });
        if (response.ok) {
          const data = (await response.json()) as { reply?: unknown; answer?: unknown; message?: unknown; handoff?: unknown };
          const reply = clamp(asText(data.reply) || asText(data.answer) || asText(data.message), 1100);
          if (reply) {
            await captureVentureMemoryEvent({ sessionId, role: "ai", type: "message", content: reply, canvas, metadata: { source: "spunky-webhook" } });
            return NextResponse.json({ ok: true, source: "spunky-webhook", reply, leadGate: visitorMessageCount >= 3, memorySessionId: sessionId, handoff: data.handoff ?? null });
          }
        }
      } catch (error) {
        console.warn("[spunky-chat] webhook fallback", error);
      }
    }

    const reply = buildBoundedSpunkyReply(message, mode, visitorMessageCount, transcript);
    await captureVentureMemoryEvent({ sessionId, role: "ai", type: "message", content: reply, canvas, metadata: { source: "bounded-aiow-fallback" } });

    return NextResponse.json({
      ok: true,
      source: "bounded-aiow-fallback",
      reply,
      leadGate: visitorMessageCount >= 3,
      memorySessionId: sessionId,
      requiredConsentText: "AIOW mag deze Venture Memory koppelen aan mijn account en mij persoonlijk e-mailen over deze kans.",
    });
  } catch (error) {
    console.error("[spunky-chat] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildBoundedSpunkyReply(message: string, mode: "idea" | "company", count: number, transcript: string): string {
  const lower = message.toLowerCase();
  if (isGreeting(lower)) return greetingReply();
  if (count >= 3) {
    return "Helder. Ik heb genoeg eerste context om dit niet te verliezen. Geef je naam en e-mail als je wilt dat ik deze Venture Memory koppel aan een private intake. Dan hoeft Team AIOW je niet opnieuw alles te vragen.";
  }
  if (lower.includes("prijs") || lower.includes("kosten") || lower.includes("budget") || lower.includes("revenue") || lower.includes("share")) {
    return "We kiezen pas een model na de intake: proof sprint, retainer/growth partner, revenue share, profit share of participatie. De eerste stap is bepalen waar AI aantoonbaar waarde maakt en welk bewijs nog ontbreekt.";
  }
  if (lower.includes("lead") || lower.includes("sales") || lower.includes("opvolg") || lower.includes("mail")) {
    return "Dan zit de eerste hefboom waarschijnlijk in lead capture + opvolging: websitechat, CRM, persoonlijke follow-up, score op intentie en een dashboard dat laat zien wie terug moet worden benaderd. Welke leads mis je nu vooral: websitebezoekers, bestaande klanten of koude prospects?";
  }
  if (mode === "company" || lower.includes("bedrijf") || lower.includes("proces") || lower.includes("automatis")) {
    return "Voor een bestaand bedrijf zoek ik eerst de workflow met de meeste tijdverlies of omzetlekkage: klantcontact, sales, planning, administratie, support of data. Noem één proces dat nu traag of rommelig is, dan vertaal ik het naar een AI-sprint.";
  }
  if (lower.includes("startup") || lower.includes("idee") || lower.includes("app")) {
    return "Voor een nieuw idee kijk ik naar doelgroep, bewijs van vraag, distributie en AI-moat. Vertel: voor wie is het, welk probleem lost het op en heb je al klanten/contacten/data?";
  }
  if (transcript.length > 500) {
    return "Ik zie genoeg richting. Laten we dit nu vastleggen zodat AIOW je context niet kwijt raakt en we daarna gericht kunnen doorvragen in je account.";
  }
  return "Ik ben bij je. Vertel rommelig of scherp wat je wilt bouwen, automatiseren of laten groeien. Ik maak er meteen een eerste Venture Memory van met kans, risico en volgende vraag.";
}

function isGreeting(lower: string): boolean {
  return /^(hey|hi|hoi|hallo|yo|hello|goeie|goedemorgen|goedemiddag|goedenavond)[!.\s]*$/i.test(lower.trim());
}

function greetingReply(): string {
  const replies = [
    "Hey, vertel. Wat wil je bouwen, automatiseren of laten groeien? Je mag rommelig beginnen, ik structureer het voor je.",
    "Hey. Geef me één zin over je idee of bedrijf, dan bouw ik meteen je eerste Venture Memory op.",
    "Hey, ik luister. Waar zit de kans: meer leads, minder handwerk, een nieuw product of iets dat nog vaag is?",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return { ok: true };
  }
  if (current.count >= RATE_LIMIT.maxAttempts) return { ok: false, retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000) };
  current.count += 1;
  return { ok: true };
}

function rateLimitKey(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
