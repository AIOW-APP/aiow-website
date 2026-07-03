import { NextResponse } from "next/server";
import { buildVentureCanvasSnapshot, buildVentureDealCard, captureVentureMemoryEvent, normalizeEmail } from "@/lib/aiow-venture-memory";
import { aiowDurableStoreMode } from "@/lib/aiow-durable-store";
import { captureAiowLead, validLeadEmail, type AiowLeadCaptureInput } from "@/lib/aiow-lead-capture";
import { createAiowCustomerAccount } from "@/lib/aiow-customer-accounts";

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
  language?: unknown;
  responseLanguage?: unknown;
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
    const language = normalizeLanguage(asText(payload.responseLanguage) || asText(payload.language) || detectLanguage(message));
    const sessionId = clamp(asText(payload.sessionId) || `aiow_session_${crypto.randomUUID()}`, 160);
    const canvas = isRecord(payload.canvas) ? payload.canvas : undefined;
    if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

    await captureVentureMemoryEvent({
      sessionId,
      role: "user",
      type: "message",
      content: message,
      canvas,
      metadata: { mode, conversationMode, language, relationshipStage, page: asText(payload.page) || "aiow.ai/", visitorMessageCount },
    });

    const contact = extractContact(payload, message);
    const linkedContact = contact.consentAccepted ? await linkContactToVentureMemory({ sessionId, contact, transcript, canvas, mode }) : null;
    const canvasSnapshot = await buildVentureCanvasSnapshot(sessionId, canvas);

    if (linkedContact) {
      const reply = contactLinkedReply(contact.name, language);
      await captureVentureMemoryEvent({ sessionId, role: "ai", type: "message", content: reply, canvas, metadata: { source: "spunky-chat-contact-link" } });
      return NextResponse.json({
        ok: true,
        source: "spunky-chat-contact-link",
        reply,
        conversationMode,
        relationshipStage: "account",
        language,
        leadGate: false,
        memorySessionId: sessionId,
        storageMode: aiowDurableStoreMode(),
        contactRequired: false,
        leadCapture: linkedContact.leadCapture,
        dealCard: linkedContact.dealCard,
        workspace: linkedContact.workspace,
        canvas: canvasSnapshot,
        ventureSnapshot: canvasSnapshot,
      });
    }

    const webhook = process.env.SPUNKY_CHAT_WEBHOOK_URL || process.env.AIOW_SPUNKY_CHAT_WEBHOOK_URL;
    if (isGreeting(message.toLowerCase())) {
      const reply = buildBoundedSpunkyReply(message, mode, conversationMode, relationshipStage, visitorMessageCount, transcript, language);
      await captureVentureMemoryEvent({ sessionId, role: "ai", type: "message", content: reply, canvas, metadata: { source: "bounded-aiow-greeting", language } });
      return NextResponse.json({
        ok: true,
        source: "bounded-aiow-greeting",
        reply,
        conversationMode,
        relationshipStage,
        language,
        leadGate: false,
        memorySessionId: sessionId,
        storageMode: aiowDurableStoreMode(),
        contactRequired: false,
        leadCapture: null,
        dealCard: null,
        workspace: null,
        canvas: canvasSnapshot,
        ventureSnapshot: canvasSnapshot,
      });
    }

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
            language,
            responseLanguage: language,
            visitorMessageCount,
            sessionId,
            canvas,
            transcript,
            page: asText(payload.page) || "aiow.ai/",
            boundary:
              `Answer as Spunky for AIOW.ai. Reply in ${languageName(language)}. The visitor can choose any language by simply writing in it. Match the visitor language and do not switch languages unless the visitor does. Give useful intake guidance, but do not promise production work, legal conclusions, payments, or a final deal before AIOW review. Internal admin summaries must stay Dutch, but this customer chat must use ${languageName(language)}.`,
          }),
          cache: "no-store",
        });
        if (response.ok) {
          const data = (await response.json()) as { reply?: unknown; answer?: unknown; message?: unknown; handoff?: unknown };
          const rawReply = clamp(asText(data.reply) || asText(data.answer) || asText(data.message), 1100);
          const reply = enforceReplyLanguage(rawReply, language, message, mode, conversationMode, relationshipStage, visitorMessageCount, transcript);
          if (reply) {
            await captureVentureMemoryEvent({ sessionId, role: "ai", type: "message", content: reply, canvas, metadata: { source: "spunky-webhook" } });
            return NextResponse.json({
              ok: true,
              source: "spunky-webhook",
              reply,
              conversationMode,
              relationshipStage,
              language,
              leadGate: visitorMessageCount >= 3 && !linkedContact,
              memorySessionId: sessionId,
              storageMode: aiowDurableStoreMode(),
              contactRequired: visitorMessageCount >= 3 && !linkedContact,
              leadCapture: null,
              dealCard: null,
              workspace: null,
              canvas: canvasSnapshot,
              ventureSnapshot: canvasSnapshot,
              handoff: data.handoff ?? null,
            });
          }
        }
      } catch (error) {
        console.warn("[spunky-chat] webhook fallback", error);
      }
    }

    const reply = buildBoundedSpunkyReply(message, mode, conversationMode, relationshipStage, visitorMessageCount, transcript, language);
    await captureVentureMemoryEvent({ sessionId, role: "ai", type: "message", content: reply, canvas, metadata: { source: "bounded-aiow-fallback" } });

    return NextResponse.json({
      ok: true,
      source: "bounded-aiow-fallback",
      reply,
      conversationMode,
      relationshipStage,
      language,
      leadGate: visitorMessageCount >= 3 && !linkedContact,
      memorySessionId: sessionId,
      storageMode: aiowDurableStoreMode(),
      contactRequired: visitorMessageCount >= 3 && !linkedContact,
      leadCapture: null,
      dealCard: null,
      workspace: null,
      canvas: canvasSnapshot,
      ventureSnapshot: canvasSnapshot,
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
  language: string,
): string {
  const lower = message.toLowerCase();
  if (language !== "nl") return buildEnglishSpunkyReply(lower, mode, conversationMode, relationshipStage, count, transcript, language);
  if (relationshipStage === "signed") {
    return "Ik pak dit als ondertekende samenwerking op: binnen scope, met focus op uitvoering, blockers en de eerste sprint. Wat moet volgens jou als eerste bewijsbaar af zijn?";
  }
  if (relationshipStage === "account") {
    return "Ik zie dit als accountfase. Dan ga ik niet opnieuw breed verkopen, maar je Venture Memory aanscherpen richting Deal Card review. Welke info mist nog: website, doelgroep, data, budget of timeline?";
  }
  if (isGreeting(lower)) return greetingReply("nl");
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

function buildEnglishSpunkyReply(
  lower: string,
  mode: "idea" | "company",
  conversationMode: SpunkyConversationMode,
  relationshipStage: "anonymous" | "account" | "signed",
  count: number,
  transcript: string,
  language: string,
): string {
  if (language !== "en") return translatedGenericReply(language);
  if (relationshipStage === "signed") return "I’ll handle this as a signed collaboration: within scope, focused on execution, blockers and the first sprint. What should be proven first?";
  if (relationshipStage === "account") return "I see this as account stage. I won’t restart the sales pitch. I’ll sharpen your Venture Memory toward Deal Card review. What is still missing: website, audience, data, budget or timeline?";
  if (isGreeting(lower)) return greetingReply("en");
  if (count >= 3) return "This is enough for a first Venture Memory. Do you want AIOW to save this and personally follow up? Share your name and e-mail with permission. No newsletter, just context-aware follow-up.";
  if (conversationMode === "pricing_model") return "The right model depends on proof and scope: scan, proof sprint, fixed build, growth partner, revenue share or participation. Which route do you want to explore?";
  if (conversationMode === "team_access") return "For this work, Handsome owns the central build and truth, Spunky handles AIOW intake and customer context, Book handles strategy and UX red-team, Mini tracks outside signals and growth. What outcome should this team force now?";
  if (conversationMode === "lead_machine") return "Then the first leverage is lead capture, intent scoring and personal follow-up. Where do you leak most value now: website visits, intake, proposal or follow-up?";
  if (conversationMode === "workflow_scan" || mode === "company" || lower.includes("company") || lower.includes("process") || lower.includes("automat")) return "For an existing company, I look for the workflow with the most time loss or revenue leakage: customer contact, sales, planning, admin, support or data. Which process should be measurably better within 30 days?";
  if (conversationMode === "new_venture" || lower.includes("startup") || lower.includes("idea") || lower.includes("app")) return "For a new idea, I look at audience, urgency, proof and AI moat. Who is this for, what problem does it solve, and what proof do you already have?";
  if (transcript.length > 500) return "I see enough direction. Let’s capture this so AIOW does not lose your context, then we can ask sharper questions inside your account.";
  return "I’m with you. Tell me messily or clearly what you want to build, automate or grow. I’ll turn it into a first Venture Memory with opportunity, risk and the next question.";
}

type SpunkyConversationMode = "greeting" | "lead_machine" | "workflow_scan" | "new_venture" | "pricing_model" | "team_access" | "general_intake";

function enforceReplyLanguage(
  reply: string,
  language: string,
  message: string,
  mode: "idea" | "company",
  conversationMode: SpunkyConversationMode,
  relationshipStage: "anonymous" | "account" | "signed",
  count: number,
  transcript: string,
): string {
  if (!reply) return "";
  const lower = reply.toLowerCase();
  const looksDutch = /\b(ik|jij|je|jouw|vertel|bedrijf|idee|groei|klant|klanten|omzet|afspraak|past|kans|risico|bouwen|werkt|vraag)\b/.test(lower);
  const looksEnglish = /\b(i|you|your|tell|company|idea|growth|customer|customers|revenue|meeting|chance|risk|build|question)\b/.test(lower);
  if (language === "en" && looksDutch) return buildBoundedSpunkyReply(message, mode, conversationMode, relationshipStage, count, transcript, language);
  if (language === "nl" && looksEnglish && !looksDutch) return buildBoundedSpunkyReply(message, mode, conversationMode, relationshipStage, count, transcript, language);
  if (["de", "fr", "es"].includes(language) && (looksDutch || looksEnglish)) return buildBoundedSpunkyReply(message, mode, conversationMode, relationshipStage, count, transcript, language);
  return reply;
}

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
  return /^(hey|hi|hoi|hallo|yo|hello|hola|bonjour|salut|guten tag|guten morgen|goeie|goedemorgen|goedemiddag|goedenavond)(\s+spunky)?[!.\s]*$/i.test(lower.trim());
}

function greetingReply(language = "nl"): string {
  const englishReplies = [
    "Hey, tell me. What do you want to build, automate or grow? You can start messy, I’ll structure it for you.",
    "Hey. Give me one sentence about your idea or company, then I’ll start building your Venture Memory.",
    "Hey, I’m listening. Where is the chance: more leads, less manual work, a new product or something still vague?",
  ];
  if (language === "en") return englishReplies[Math.floor(Math.random() * englishReplies.length)];
  if (language !== "nl") return translatedGenericReply(language);
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

function extractContact(payload: SpunkyChatPayload, message: string): SpunkyContact {
  const contact = isRecord(payload.contact) ? payload.contact : {};
  const parsed = parseContactFromText(message);
  return {
    name: clamp(asText(contact.name) || asText(payload.name) || parsed.name, 160),
    email: normalizeEmail(asText(contact.email) || asText(payload.email) || parsed.email),
    company: clamp(asText(contact.company) || asText(payload.company) || parsed.company, 180),
    consentAccepted: contact.consentAccepted === true || payload.consentAccepted === true || parsed.consentAccepted,
    consentText: clamp(asText(contact.consentText) || asText(payload.consentText) || DEFAULT_CONSENT_TEXT, 700),
    consentVersion: clamp(asText(contact.consentVersion) || asText(payload.consentVersion) || DEFAULT_CONSENT_VERSION, 80),
  };
}

function parseContactFromText(message: string): Pick<SpunkyContact, "name" | "email" | "company" | "consentAccepted"> {
  const email = normalizeEmail(message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "");
  const nameMatch = message.match(/(?:mijn naam is|ik ben|naam is|heet)\s+([^,.\n]+?)(?:\s+en\s+(?:mijn\s+)?(?:e-?mail|mail)|[,.;\n]|$)/i);
  const rawName = (nameMatch?.[1] || "").replace(/\b(mijn|email|e-mail|mail)\b/gi, "").trim();
  const companyMatch = message.match(/(?:bedrijf|company|van)\s+(?:is\s+)?([A-Z0-9][^,.\n]{1,80})/i);
  const lower = message.toLowerCase();
  const consentAccepted = Boolean(email) && includesAny(lower, ["tuurlijk", "natuurlijk", "ja", "yes", "sure", "ok", "okay", "akkoord", "agree", "permission", "consent", "mag", "toestemming", "prima", "geef ik", "hierbij"]);
  return {
    name: rawName,
    email,
    company: (companyMatch?.[1] || "").trim(),
    consentAccepted,
  };
}

async function linkContactToVentureMemory(input: {
  sessionId: string;
  contact: SpunkyContact;
  transcript: string;
  canvas?: Record<string, unknown>;
  mode: "idea" | "company";
}): Promise<{ leadCapture: { id: string; path: string; followUp: unknown }; dealCard: any; workspace: { accountId: string; accessCode: string; portalUrl: string; status: string; previewLogin: true } } | null> {
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
    locale: normalizeLeadLocale(detectLanguage(transcript || contact.consentText || contact.name)),
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
  const workspace = await createAiowCustomerAccount({
    companyName: contact.company || contact.name,
    legalName: contact.company || contact.name,
    contactName: contact.name,
    contactEmail: contact.email,
    projectName: dealCard.title || "AIOW Venture Memory",
    projectType: dealCard.likelyRoute || "AIOW venture intake",
    moduleInterests: ["Venture Memory", "Deal Card", "AI follow-up"],
    addOns: ["Private workspace"],
    ideaSummary: transcript || dealCard.problem,
    coreOffer: dealCard.opportunity,
    painPoints: dealCard.problem,
    aiowBuildScope: dealCard.nextStep,
    risks: Array.isArray(dealCard.missing) ? dealCard.missing.join(", ") : "Nog te beoordelen",
    onboardingId: sessionId,
  });
  return {
    leadCapture: { id: leadCapture.id, path: leadCapture.path, followUp: leadCapture.record.followUp },
    dealCard,
    workspace: {
      accountId: workspace.account.accountId,
      accessCode: workspace.accessCode,
      portalUrl: `/portal/customer/${workspace.account.accountId}`,
      status: workspace.account.status,
      previewLogin: true,
    },
  };
}

function contactLinkedReply(name: string, language: string): string {
  if (language === "en") return `Great ${name}. I processed your name, e-mail and permission. Your Venture Memory is now linked and your private AIOW workspace is ready. Open it to complete the Deal Card.`;
  return `Top ${name}. Ik heb je naam, e-mail en toestemming verwerkt. Je Venture Memory is nu gekoppeld en je private AIOW workspace staat klaar. Open hem om de Deal Card verder aan te vullen.`;
}

function normalizeLanguage(value: string): string {
  const normalized = value.toLowerCase().trim();
  if (["nl", "en", "de", "fr", "es"].includes(normalized)) return normalized;
  if (["dutch", "nederlands"].includes(normalized)) return "nl";
  if (["english", "engels"].includes(normalized)) return "en";
  if (["german", "duits"].includes(normalized)) return "de";
  if (["french", "frans"].includes(normalized)) return "fr";
  if (["spanish", "spaans"].includes(normalized)) return "es";
  return "en";
}

function detectLanguage(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(hallo|hoi|goedemorgen|goedemiddag|goedenavond|bedrijf|idee|groei|klant|klanten|omzet|afspraak|mijn|wij willen|kun je)\b/.test(lower)) return "nl";
  if (/\b(bonjour|salut|merci|entreprise|idée|croissance)\b/.test(lower)) return "fr";
  if (/\b(hola|gracias|empresa|idea|crecimiento)\b/.test(lower)) return "es";
  if (/\b(guten|danke|unternehmen|wachstum)\b/.test(lower)) return "de";
  return "en";
}

function languageName(language: string): string {
  if (language === "nl") return "Dutch";
  if (language === "de") return "German";
  if (language === "fr") return "French";
  if (language === "es") return "Spanish";
  return "English";
}

function translatedGenericReply(language: string): string {
  if (language === "de") return "Ich bin bei dir. Erzähl mir, was du bauen, automatisieren oder wachsen lassen willst. Ich mache daraus eine erste Venture Memory mit Chance, Risiko und der nächsten besten Frage.";
  if (language === "fr") return "Je suis avec vous. Dites-moi ce que vous voulez construire, automatiser ou développer. Je le transforme en première Venture Memory avec opportunité, risque et prochaine question utile.";
  if (language === "es") return "Estoy contigo. Cuéntame qué quieres construir, automatizar o hacer crecer. Lo convierto en una primera Venture Memory con oportunidad, riesgo y la siguiente mejor pregunta.";
  return "I’m with you. Tell me what you want to build, automate or grow. I’ll turn it into a first Venture Memory with opportunity, risk and the next best question.";
}

function normalizeLeadLocale(language: string): "nl" | "en" {
  return language === "nl" ? "nl" : "en";
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
