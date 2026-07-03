import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeAiowCustomer, type AiowCustomerAnalysisInput } from "@/lib/aiow-customer-analysis";
import { aiowDurableStoreMode, supabaseInsert } from "@/lib/aiow-durable-store";
import { buildVentureDealCard, captureVentureMemoryEvent, normalizeEmail } from "@/lib/aiow-venture-memory";

type VentureScorePayload = Partial<Record<keyof AiowCustomerAnalysisInput, unknown>> & {
  sessionId?: unknown;
  name?: unknown;
  email?: unknown;
  companyName?: unknown;
  company?: unknown;
  phone?: unknown;
  message?: unknown;
  transcript?: unknown;
  consentAccepted?: unknown;
  source?: unknown;
  sourceRoute?: unknown;
  sourceComponent?: unknown;
  testMode?: unknown;
  honeyWebsite?: unknown;
};

const RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxAttempts: 12 };
const buckets = new Map<string, { count: number; resetAt: number }>();

const TEXT_FIELDS: Array<keyof AiowCustomerAnalysisInput> = [
  "industry",
  "ideaSummary",
  "founderExperience",
  "industryContacts",
  "existingAudience",
  "proofOfDemand",
  "customerSegments",
  "acquisitionChannels",
  "coreOffer",
  "currentMonthlyRevenue",
  "targetMonthlyRevenue",
  "averageOrderValue",
  "monthlyCustomerVolume",
  "keyProcesses",
  "systemsStack",
  "dataSources",
  "painPoints",
  "successMetrics",
  "competitorNotes",
  "resalePotential",
  "moduleRevenueNotes",
  "executionCapacity",
  "budgetRange",
  "risks",
  "aiowBuildScope",
];

export async function POST(req: Request) {
  try {
    const rateLimit = checkRateLimit(rateLimitKey(req));
    if (!rateLimit.ok) {
      return NextResponse.json({ error: "Too many venture scoring attempts", retryAfterSeconds: rateLimit.retryAfterSeconds }, { status: 429 });
    }

    const payload = (await req.json()) as VentureScorePayload;
    if (asText(payload.honeyWebsite)) return NextResponse.json({ error: "Rejected" }, { status: 400 });

    const input = normalizeAnalysisInput(payload);
    const combinedText = [input.ideaSummary, input.coreOffer, input.painPoints, input.aiowBuildScope, asText(payload.message), asText(payload.transcript)]
      .filter(Boolean)
      .join("\n");
    if (combinedText.trim().length < 24) {
      return NextResponse.json({ error: "Insufficient venture context", missing: ["ideaSummary or message with concrete context"] }, { status: 400 });
    }

    const email = normalizeEmail(asText(payload.email));
    const personName = clamp(asText(payload.name), 140);
    const company = clamp(asText(payload.companyName) || asText(payload.company), 160);
    const consentAccepted = payload.consentAccepted === true;
    const sessionId = clamp(asText(payload.sessionId), 160) || buildSessionId(email, company, combinedText);
    const analysis = analyzeAiowCustomer(input);
    const review = buildReviewGate(analysis.ventureFitScore);
    const now = new Date().toISOString();
    const dossier = {
      dossierId: `aiow_avs_${createHash("sha256").update(`${sessionId}|${now}`).digest("hex").slice(0, 16)}`,
      createdAt: now,
      sessionId,
      source: clamp(asText(payload.source), 120) || "aiow.ai",
      sourceRoute: clamp(asText(payload.sourceRoute), 180) || "/api/venture-score",
      sourceComponent: clamp(asText(payload.sourceComponent), 120) || "avs-v1",
      contact: {
        name: personName,
        email,
        company,
        phone: clamp(asText(payload.phone), 80),
        consentAccepted,
      },
      input,
      analysis,
      review,
      gates: {
        contractAutonomy: false,
        contractGate: "Richard/Jeroen approval plus lawyer-safe template before any contract is sent.",
        telegramGroupAutonomy: false,
        telegramGroupGate: "@TeamAIOW_bot can join groups but cannot create groups. Create group manually or add MTProto userbot later.",
        emailAutonomy: Boolean(process.env.RESEND_API_KEY),
        emailGate: process.env.RESEND_API_KEY ? "Resend key present in runtime." : "RESEND_API_KEY missing in runtime, store dossier only.",
      },
      stakeholders: {
        richardTelegramId: "521713358",
        jeroenTelegramHandle: "@TheRambler_eth",
        spunkyBot: "@TeamAIOW_bot",
      },
    };

    await captureVentureMemoryEvent({
      sessionId,
      role: "user",
      type: "message",
      content: combinedText,
      personEmail: email,
      personName,
      company,
      consentAccepted,
      canvas: {
        project: input.ideaSummary || input.coreOffer || "AIOW venture intake",
        founder: personName,
        problem: input.painPoints || input.proofOfDemand || "Nog te scherpen",
        solution: input.aiowBuildScope || input.coreOffer || "Nog te scherpen",
        businessModel: input.moduleRevenueNotes || input.resalePotential || "Nog te bepalen",
        audience: input.customerSegments || "Nog te scherpen",
        aiOpportunities: input.aiowBuildScope || "Nog te scherpen",
        risk: input.risks || "Nog te beoordelen",
        confidence: analysis.ventureFitScore,
        marketScore: Math.round(analysis.scorecard.marketScore / 10),
        riskScore: Math.max(0, 10 - Math.round(analysis.requiredCustomerProof.length)),
        aiScore: Math.round(analysis.scorecard.aiOpportunityScore / 10),
        automationScore: Math.round(analysis.scorecard.executionScore / 10),
      },
      metadata: { source: "avs-v1-input", dossierId: dossier.dossierId, reviewGate: review.state },
    });

    await captureVentureMemoryEvent({
      sessionId,
      role: "system",
      type: "deal_card",
      content: JSON.stringify(dossier),
      personEmail: email,
      personName,
      company,
      consentAccepted,
      metadata: { source: "avs-v1-dossier", dossierId: dossier.dossierId, ventureFitScore: analysis.ventureFitScore },
    });

    const dealCard = await buildVentureDealCard(sessionId, {
      project: input.ideaSummary || input.coreOffer || "AIOW venture intake",
      founder: personName,
      confidence: analysis.ventureFitScore,
      marketScore: Math.round(analysis.scorecard.marketScore / 10),
      aiScore: Math.round(analysis.scorecard.aiOpportunityScore / 10),
      automationScore: Math.round(analysis.scorecard.executionScore / 10),
      problem: input.painPoints || "Nog te scherpen",
      solution: input.aiowBuildScope || input.coreOffer || "Nog te scherpen",
      audience: input.customerSegments || "Nog te scherpen",
      aiOpportunities: input.aiowBuildScope || "Nog te scherpen",
      risk: input.risks || analysis.gaps.slice(0, 3).join(", "),
      businessModel: input.moduleRevenueNotes || input.resalePotential || "Nog te bepalen",
    });

    const adminEvent = await recordAdminEvent(dossier);

    return NextResponse.json({
      ok: true,
      source: "avs-v1",
      storageMode: aiowDurableStoreMode(),
      dossier,
      dealCard,
      adminEvent,
      richardReviewRequired: review.richardReviewRequired,
      richardPingTask: review.richardReviewRequired
        ? buildRichardPingTask(dossier)
        : null,
      message: review.message,
    });
  } catch (error) {
    console.error("[venture-score] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function normalizeAnalysisInput(payload: VentureScorePayload): AiowCustomerAnalysisInput {
  const input: AiowCustomerAnalysisInput = {};
  for (const field of TEXT_FIELDS) {
    const value = clamp(asText(payload[field]), maxLength(field));
    if (value) input[field] = value;
  }
  if (!input.ideaSummary && asText(payload.message)) input.ideaSummary = clamp(asText(payload.message), 1600);
  if (!input.coreOffer && asText(payload.companyName)) input.coreOffer = `${asText(payload.companyName)} venture / growth case`;
  return input;
}

function buildReviewGate(score: number) {
  if (score >= 82) {
    return {
      state: "STRATEGIC_GO_REVIEW",
      richardReviewRequired: true,
      message: "Sterke AIOW-case. Richard/Jeroen review verplicht vóór contract, percentage of projectgroep.",
      nextAction: "Maak voorstelconcept en bewijscheck klaar voor Richard/Jeroen.",
    };
  }
  if (score >= 70) {
    return {
      state: "GO_REVIEW",
      richardReviewRequired: true,
      message: "Interessante AIOW-case. Richard review verplicht vóór contract of projectgroep.",
      nextAction: "Vraag ontbrekend bewijs en zet reviewkaart klaar.",
    };
  }
  if (score >= 48) {
    return {
      state: "CONDITIONAL_REVIEW",
      richardReviewRequired: false,
      message: "Potentie, maar nog niet contractwaardig. Eerst bewijs/scope aanscherpen.",
      nextAction: "Laat Spunky gerichte vervolgvragen stellen.",
    };
  }
  return {
    state: "NO_GO_OR_REWORK",
    richardReviewRequired: false,
    message: "Nog niet sterk genoeg voor AIOW venture-route. Eerst propositie, bewijs en doelgroep aanscherpen.",
    nextAction: "Geen contract, geen projectgroep. Alleen heropenen met beter bewijs.",
  };
}

async function recordAdminEvent(dossier: any) {
  const payload = {
    event_type: dossier.review.richardReviewRequired ? "avs_richard_review_requested" : "avs_dossier_created",
    subject_type: "venture_session",
    subject_id: dossier.sessionId,
    event_payload: {
      dossierId: dossier.dossierId,
      company: dossier.contact.company,
      email: dossier.contact.email,
      ventureFitScore: dossier.analysis.ventureFitScore,
      verdict: dossier.analysis.verdict,
      reviewState: dossier.review.state,
      revenueShare: dossier.analysis.recommendedRevenueSharePercent,
      resaleShare: dossier.analysis.recommendedResaleSharePercent,
      requiredProof: dossier.analysis.requiredCustomerProof,
      gates: dossier.gates,
      stakeholders: dossier.stakeholders,
    },
    created_at: dossier.createdAt,
  };

  if (aiowDurableStoreMode() === "supabase") {
    try {
      await supabaseInsert("aiow_admin_events", payload);
      return { stored: true, storage: "supabase:aiow_admin_events", eventType: payload.event_type };
    } catch (error) {
      console.warn("[venture-score] Supabase admin event failed", error);
    }
  }

  await captureVentureMemoryEvent({
    sessionId: dossier.sessionId,
    role: "system",
    type: "decision",
    content: JSON.stringify(payload),
    personEmail: dossier.contact.email,
    personName: dossier.contact.name,
    company: dossier.contact.company,
    consentAccepted: dossier.contact.consentAccepted,
    metadata: { source: "avs-v1-admin-event", eventType: payload.event_type },
  });
  return { stored: true, storage: "venture-memory:decision-event", eventType: payload.event_type };
}

function buildRichardPingTask(dossier: any): string {
  return [
    `AIOW AVS review nodig: ${dossier.contact.company || dossier.contact.name || dossier.sessionId}`,
    `Score: ${dossier.analysis.ventureFitScore}/100 (${dossier.analysis.verdict})`,
    `Advies: ${dossier.analysis.recommendedRevenueSharePercent}% omzetdeel + ${dossier.analysis.recommendedResaleSharePercent}% resale/exit minimum`,
    `Sterktes: ${dossier.analysis.strengths.slice(0, 4).join(", ") || "n.t.b."}`,
    `Missing proof: ${dossier.analysis.requiredCustomerProof.slice(0, 4).join("; ")}`,
    `Gate: geen contract/groep zonder Richard/Jeroen approval. Jeroen: @TheRambler_eth. Spunky: @TeamAIOW_bot.`,
  ].join("\n");
}

function buildSessionId(email: string, company: string, text: string): string {
  return `aiow_avs_session_${createHash("sha256").update(`${email}|${company}|${text.slice(0, 400)}`).digest("hex").slice(0, 18)}`;
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
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || req.headers.get("x-real-ip") || "local";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function maxLength(field: keyof AiowCustomerAnalysisInput): number {
  if (["ideaSummary", "founderExperience", "industryContacts", "proofOfDemand", "keyProcesses", "systemsStack", "dataSources", "painPoints", "risks", "aiowBuildScope"].includes(field)) return 1600;
  if (["customerSegments", "acquisitionChannels", "coreOffer", "successMetrics", "competitorNotes", "resalePotential", "moduleRevenueNotes", "executionCapacity"].includes(field)) return 1200;
  return 240;
}
