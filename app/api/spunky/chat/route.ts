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
  conversationMode?: unknown;
  intentMode?: unknown;
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
    const conversationMode = classifyConversationMode(message, asText(payload.conversationMode) || asText(payload.intentMode), transcript);
    const sessionId = clamp(asText(payload.sessionId) || `aiow_session_${crypto.randomUUID()}`, 160);
    const canvas = isRecord(payload.canvas) ? payload.canvas : undefined;
    if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

    await captureVentureMemoryEvent({
      sessionId,
      role: "user",
      type: "message",
      content: message,
      canvas,
      metadata: { mode, conversationMode, relationshipStage, page: asText(payload.page) || "aiow.ai/", visitorMessageCount },
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
            conversationMode,
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
              conversationMode,
              relationshipStage,
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

    const reply = buildBoundedSpunkyReply(message, mode, conversationMode, relationshipStage, visitorMessageCount, transcript);
    await captureVentureMemoryEvent({ sessionId, role: "ai", type: "message", content: reply, canvas, metadata: { source: "bounded-aiow-fallback" } });

    return NextResponse.json({
      ok: true,
      source: "bounded-aiow-fallback",
      reply,
      conversationMode,
      relationshipStage,
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

function buildBoundedSpunkyReply(
  message: string,
  mode: "idea" | "company",
  conversationMode: SpunkyConversationMode,
  relationshipStage: "anonymous" | "account" | "signed",
  count: number,
  transcript: string,
): string {
  const lower = message.toLowerCase();
  if (relationshipStage === "signed") {
    return "Ik pak dit als ondertekende samenwerking op: binnen scope, met focus op uitvoering, blockers en de eerste sprint. Wat moet volgens jou als eerste bewijsbaar af zijn?";
  }
  if (relationshipStage === "account") {
    return "Ik zie dit als accountfase. Dan ga ik niet opnieuw breed verkopen, maar je Venture Memory aanscherpen richting Deal Card review. Welke info mist nog: website, doelgroep, data, budget of timeline?";
  }
  if (isGreeting(lower)) return greetingReply();
  if (count >= 3) {
    return "Dit is genoeg voor een eerste Venture Memory. Wil je dat AIOW dit bewaart en persoonlijk opvolgt? Geef dan je naam en e-mail met toestemming. Geen nieuwsbrief, wel contextvaste opvolging.";
  }
  if (conversationMode === "pricing_model") {
    return "Het juiste model hangt af van bewijs en scope: scan, proof sprint, vaste build, growth partner, revenue share of participatie. Welke route wil je vooral onderzoeken?";
  }
  if (conversationMode === "team_access") {
    return "Voor dit soort werk pakt Handsome de centrale bouw en waarheid, Spunky de AIOW intake en klantcontext, Book strategie en UX-redteam, Mini buitenwereld en growth-signalen. Welke uitkomst moet dit team nu forceren?";
  }
  if (conversationMode === "lead_machine") {
    return "Dan zit de eerste hefboom in lead capture, intent scoring en persoonlijke opvolging. Waar lekt nu de meeste waarde: websitebezoek, intake, offerte of opvolging?";
  }
  if (conversationMode === "workflow_scan" || mode === "company" || lower.includes("bedrijf") || lower.includes("proces") || lower.includes("automatis")) {
    return "Voor een bestaand bedrijf zoek ik de workflow met de meeste tijdverlies of omzetlekkage: klantcontact, sales, planning, administratie, support of data. Welk proces moet binnen 30 dagen meetbaar beter zijn?";
  }
  if (conversationMode === "new_venture" || lower.includes("startup") || lower.includes("idee") || lower.includes("app")) {
    return "Voor een nieuw idee kijk ik naar doelgroep, urgentie, bewijs en AI-moat. Voor wie is dit, welk probleem lost het op en welk bewijs heb je al?";
  }
  if (transcript.length > 500) {
    return "Ik zie genoeg richting. Laten we dit nu vastleggen zodat AIOW je context niet kwijt raakt en we daarna gericht kunnen doorvragen in je account.";
  }
  return "Ik ben bij je. Vertel rommelig of scherp wat je wilt bouwen, automatiseren of laten groeien. Ik maak er meteen een eerste Venture Memory van met kans, risico en volgende vraag.";
}

type SpunkyConversationMode = "greeting" | "lead_machine" | "workflow_scan" | "new_venture" | "pricing_model" | "team_access" | "general_intake";

function classifyConversationMode(message: string, explicit: string, transcript: string): SpunkyConversationMode {
  const normalized = explicit.toLowerCase().replace(/-/g, "_").trim();
  if (isSpunkyConversationMode(normalized)) return normalized;
  const lower = `${message}\n${transcript}`.toLowerCase();
  if (isGreeting(message.toLowerCase())) return "greeting";
  if (includesAny(lower, ["lead", "leads", "sales", "opvolg", "follow-up", "follow up", "mail", "crm", "offerte", "afspraak"])) return "lead_machine";
  if (includesAny(lower, ["proces", "workflow", "automatis", "administratie", "support", "planning", "operatie", "handwerk"])) return "workflow_scan";
  if (includesAny(lower, ["startup", "idee", "app", "platform", "product", "venture", "bouwen"])) return "new_venture";
  if (includesAny(lower, ["prijs", "kosten", "budget", "revenue", "share", "participatie", "equity", "dealmodel", "retainer"])) return "pricing_model";
  if (includesAny(lower, ["team", "mini", "book", "handsome", "spunky", "toegang", "mac mini", "agent"])) return "team_access";
  return "general_intake";
}

function isSpunkyConversationMode(value: string): value is SpunkyConversationMode {
  return ["greeting", "lead_machine", "workflow_scan", "new_venture", "pricing_model", "team_access", "general_intake"].includes(value);
}

function includesAny(value: string, terms: string[]): boolean {
  return terms.some((term) => value.includes(term));
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
