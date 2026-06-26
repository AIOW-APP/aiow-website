import { NextResponse } from "next/server";
import { buildVentureDealCard, captureVentureMemoryEvent, normalizeEmail } from "@/lib/aiow-venture-memory";
import { aiowDurableStoreMode } from "@/lib/aiow-durable-store";
import { captureAiowLead, validLeadEmail, type AiowLeadCaptureInput } from "@/lib/aiow-lead-capture";

type SpunkyChatPayload = {
  message?: unknown;
  mode?: unknown;
  relationshipStage?: unknown;
  stage?: unknown;
  visitorMessageCount?: unknown;
  transcript?: unknown;
  page?: unknown;
  sessionId?: unknown;
  canvas?: unknown;
  contact?: unknown;
  name?: unknown;
  email?: unknown;
  company?: unknown;
  consentAccepted?: unknown;
  consentText?: unknown;
  consentVersion?: unknown;
};

const RATE_LIMIT = { windowMs: 60 * 1000, maxAttempts: 18 };
const buckets = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_CONSENT_TEXT =
  "AIOW mag deze Venture Memory koppelen aan mijn account en mij persoonlijk e-mailen over deze kans. Geen nieuwsbrief of generieke marketing zonder aparte toestemming.";
const DEFAULT_CONSENT_VERSION = "aiow-venture-memory-v1";

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json({ error: "Too many chat messages", retryAfterSeconds: rateLimit.retryAfterSeconds }, { status: 429 });
    }

    const payload = (await req.json()) as SpunkyChatPayload;
    const message = clamp(asText(payload.message), 900);
    const mode = asText(payload.mode) === "company" ? "company" : "idea";
    const relationshipStage = normalizeRelationshipStage(asText(payload.relationshipStage) || asText(payload.stage));
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
      metadata: { mode, relationshipStage, page: asText(payload.page) || "aiow.ai/", visitorMessageCount },
    });

    const contact = extractContact(payload);
    const linkedContact = contact.consentAccepted ? await linkContactToVentureMemory({ sessionId, contact, transcript, canvas, mode }) : null;

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
            relationshipStage,
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
            return NextResponse.json({
              ok: true,
              source: "spunky-webhook",
              reply,
              leadGate: visitorMessageCount >= 3 && !linkedContact,
              memorySessionId: sessionId,
              storageMode: aiowDurableStoreMode(),
              contactRequired: visitorMessageCount >= 3 && !linkedContact,
              leadCapture: linkedContact?.leadCapture ?? null,
              dealCard: linkedContact?.dealCard ?? null,
              handoff: data.handoff ?? null,
            });
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
      leadGate: visitorMessageCount >= 3 && !linkedContact,
      memorySessionId: sessionId,
      storageMode: aiowDurableStoreMode(),
      contactRequired: visitorMessageCount >= 3 && !linkedContact,
      leadCapture: linkedContact?.leadCapture ?? null,
      dealCard: linkedContact?.dealCard ?? null,
      requiredConsentText: DEFAULT_CONSENT_TEXT,
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

type SpunkyContact = {
  name: string;
  email: string;
  company: string;
  consentAccepted: boolean;
  consentText: string;
  consentVersion: string;
};

function extractContact(payload: SpunkyChatPayload): SpunkyContact {
  const contact = isRecord(payload.contact) ? payload.contact : {};
  return {
    name: clamp(asText(contact.name) || asText(payload.name), 160),
    email: normalizeEmail(asText(contact.email) || asText(payload.email)),
    company: clamp(asText(contact.company) || asText(payload.company), 180),
    consentAccepted: contact.consentAccepted === true || payload.consentAccepted === true,
    consentText: clamp(asText(contact.consentText) || asText(payload.consentText) || DEFAULT_CONSENT_TEXT, 700),
    consentVersion: clamp(asText(contact.consentVersion) || asText(payload.consentVersion) || DEFAULT_CONSENT_VERSION, 80),
  };
}

async function linkContactToVentureMemory(input: {
  sessionId: string;
  contact: SpunkyContact;
  transcript: string;
  canvas?: Record<string, unknown>;
  mode: "idea" | "company";
}): Promise<{ leadCapture: { id: string; path: string; followUp: unknown }; dealCard: unknown } | null> {
  const { sessionId, contact, transcript, canvas, mode } = input;
  if (!contact.name || !validLeadEmail(contact.email) || !contact.consentAccepted) return null;

  await captureVentureMemoryEvent({
    sessionId,
    role: "system",
    type: "contact_linked",
    content: "Visitor explicitly allowed AIOW to link this temporary Venture Memory to contact details and personal follow-up.",
    personEmail: contact.email,
    personName: contact.name,
    company: contact.company,
    consentAccepted: true,
    canvas,
    metadata: { consentText: contact.consentText, consentVersion: contact.consentVersion, source: "spunky-chat" },
  });

  const dealCard = await buildVentureDealCard(sessionId, canvas);
  const leadInput: AiowLeadCaptureInput = {
    email: contact.email,
    consentAccepted: true,
    consentText: contact.consentText,
    consentVersion: contact.consentVersion,
    source: "aiow.ai",
    sourceRoute: "/",
    sourceComponent: "homepage-spunky-chat",
    locale: "nl",
    name: contact.name,
    company: contact.company,
    intentType: mode === "company" ? "company" : "idea",
    intentText: transcript || JSON.stringify(dealCard),
    projectType: dealCard.likelyRoute,
    moduleInterests: ["Spunky", "Venture Memory", "Deal Card", "AI follow-up"],
    addOns: [],
    metadata: {
      ventureSessionId: sessionId,
      dealCard,
      retention: "account_linked",
      sourceAgent: "spunky",
    },
  };
  const leadCapture = await captureAiowLead(leadInput, "LOCAL_CAPTURED");
  return { leadCapture: { id: leadCapture.id, path: leadCapture.path, followUp: leadCapture.record.followUp }, dealCard };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeRelationshipStage(value: string): "anonymous" | "account" | "signed" {
  const normalized = value.toLowerCase().trim();
  if (["signed", "contract", "contracted", "agreement", "afspraak", "ondertekend"].includes(normalized)) return "signed";
  if (["account", "logged-in", "logged_in", "customer", "client", "klant"].includes(normalized)) return "account";
  return "anonymous";
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
