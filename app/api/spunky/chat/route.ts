import { NextResponse } from "next/server";

type SpunkyChatPayload = {
  message?: unknown;
  mode?: unknown;
  visitorMessageCount?: unknown;
  transcript?: unknown;
  page?: unknown;
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
    if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

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
            return NextResponse.json({ ok: true, source: "spunky-webhook", reply, leadGate: visitorMessageCount >= 2, handoff: data.handoff ?? null });
          }
        }
      } catch (error) {
        console.warn("[spunky-chat] webhook fallback", error);
      }
    }

    return NextResponse.json({
      ok: true,
      source: "bounded-aiow-fallback",
      reply: buildBoundedSpunkyReply(message, mode, visitorMessageCount, transcript),
      leadGate: visitorMessageCount >= 2,
    });
  } catch (error) {
    console.error("[spunky-chat] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildBoundedSpunkyReply(message: string, mode: "idea" | "company", count: number, transcript: string): string {
  const lower = message.toLowerCase();
  if (count >= 2) {
    return "Helder. Ik heb genoeg eerste context om dit niet te verliezen. Voordat we verder gaan wil ik je naam, e-mail en eventueel bedrijfsnaam. Dan maak ik je AIOW-account aan, bewaren we deze chat en kan Team Richard gericht beoordelen welke AI-workflow, sprint en dealroute klopt.";
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
  return "Ja. Vertel in één zin wat je wilt bouwen, automatiseren of groeien. Ik vertaal het meteen naar AIOW-kansen, risico’s en de eerste slimme vervolgvraag.";
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
