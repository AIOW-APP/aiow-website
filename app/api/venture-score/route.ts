import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeAiowCustomer, type AiowCustomerAnalysisInput } from "@/lib/aiow-customer-analysis";
import {
  acceptVentureIntake,
  hashVentureIntakeKey,
  isValidIdempotencyKey,
  isValidVentureEmail,
  requireVentureIntakeHashSecret,
  VentureIntakeConfigurationError,
  VENTURE_INTAKE_RATE_LIMIT,
  ventureIntakeStoreMode,
  type VentureIntakeDossier,
} from "@/lib/aiow-venture-intake-store";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 32 * 1024;
const RETENTION_DAYS = 30;
const CONSENT_VERSION = "aiow-venture-intake-v1";
const ALLOWED_STAGES = new Set(["idee", "eerste-klanten", "omzet"]);
const ALLOWED_GOALS = new Set(["bouwen", "groeien"]);

type VentureScorePayload = {
  idea?: unknown;
  ideaSummary?: unknown;
  industry?: unknown;
  stage?: unknown;
  goal?: unknown;
  name?: unknown;
  email?: unknown;
  kvk?: unknown;
  company?: unknown;
  companyName?: unknown;
  phone?: unknown;
  consentAccepted?: unknown;
  consentVersion?: unknown;
  sourceRoute?: unknown;
  sourceComponent?: unknown;
  honeyWebsite?: unknown;
};

export async function POST(req: Request) {
  try {
    if (ventureIntakeStoreMode() === "unavailable") return serviceUnavailable();
    const secret = requireVentureIntakeHashSecret();
    const idempotencyKey = req.headers.get("idempotency-key")?.trim() || "";
    if (!isValidIdempotencyKey(idempotencyKey)) {
      return apiError("Ongeldige of ontbrekende aanvraag-ID. Vernieuw de pagina en probeer opnieuw.", 400, "INVALID_REQUEST_ID");
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return apiError("De aanvraag is te groot.", 413, "PAYLOAD_TOO_LARGE");
    }
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return apiError("De aanvraag is te groot.", 413, "PAYLOAD_TOO_LARGE");
    }

    let payload: VentureScorePayload;
    try {
      payload = JSON.parse(rawBody) as VentureScorePayload;
    } catch {
      return apiError("De aanvraag kon niet worden gelezen.", 400, "INVALID_JSON");
    }
    if (asText(payload.honeyWebsite)) return apiError("Aanvraag geweigerd.", 400, "BOT_REJECTED");

    const validation = validatePayload(payload);
    if (!validation.ok) return apiError(validation.message, 400, validation.code);

    const input = buildAnalysisInput(validation.value);
    const analysis = analyzeAiowCustomer(input);
    const review = buildReviewGate(analysis.ventureFitScore);
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + RETENTION_DAYS * 86_400_000);
    const dossierId = `aiow_avs_${randomUUID()}`;
    const sessionId = `aiow_avs_session_${createHash("sha256")
      .update(`${dossierId}|${validation.value.email}`)
      .digest("hex")
      .slice(0, 18)}`;

    const dossier: VentureIntakeDossier = {
      dossierId,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      sessionId,
      source: "aiow.ai",
      sourceRoute: validation.value.sourceRoute,
      sourceComponent: validation.value.sourceComponent,
      contact: {
        name: validation.value.name,
        email: validation.value.email,
        company: validation.value.company,
        phone: validation.value.phone,
        consentAccepted: true,
        consentVersion: CONSENT_VERSION,
      },
      input,
      analysis: analysis as unknown as Record<string, unknown>,
      review,
      metadata: {
        industry: validation.value.industry,
        stage: validation.value.stage,
        goal: validation.value.goal,
        kvk: validation.value.kvk,
        retentionDays: RETENTION_DAYS,
        automatedCommercialDecision: false,
      },
    };

    const accepted = await acceptVentureIntake({
      requestKeyHash: hashVentureIntakeKey("request", idempotencyKey, secret),
      rateKeyHash: hashVentureIntakeKey("rate", rateLimitIdentity(req), secret),
      dossier,
    });

    if (accepted.rateLimited) {
      const retryAfterSeconds = accepted.retryAfterSeconds || VENTURE_INTAKE_RATE_LIMIT.windowSeconds;
      return NextResponse.json(
        { ok: false, code: "RATE_LIMITED", error: "Te veel aanvragen vanaf deze verbinding. Probeer het later opnieuw.", retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds), "Cache-Control": "no-store" } },
      );
    }
    if (!accepted.accepted || !accepted.dossierId || !accepted.createdAt) throw new Error("Intake was not durably accepted");

    return NextResponse.json(
      {
        ok: true,
        receipt: {
          dossierId: accepted.dossierId,
          acceptedAt: accepted.createdAt,
          reviewStatus: "PENDING_HUMAN_REVIEW",
          replayed: accepted.replayed,
          retentionDays: RETENTION_DAYS,
        },
        message: "Je aanvraag staat veilig in de reviewrij. AIOW beoordeelt hem menselijk; dit is nog geen commerciële toezegging.",
      },
      { status: accepted.replayed ? 200 : 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof VentureIntakeConfigurationError) return serviceUnavailable();
    console.error("[venture-score] intake failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      storageMode: ventureIntakeStoreMode(),
    });
    return apiError("Je aanvraag kon niet veilig worden opgeslagen. Je invoer staat nog in het formulier; probeer opnieuw of mail ons direct.", 503, "INTAKE_UNAVAILABLE");
  }
}

type ValidatedPayload = {
  idea: string;
  industry: string;
  stage: string;
  goal: string;
  name: string;
  email: string;
  kvk: string;
  company: string;
  phone: string;
  sourceRoute: string;
  sourceComponent: string;
};

function validatePayload(payload: VentureScorePayload): { ok: true; value: ValidatedPayload } | { ok: false; code: string; message: string } {
  const idea = clamp(asText(payload.idea) || asText(payload.ideaSummary), 1600);
  const industry = clamp(asText(payload.industry), 160);
  const stage = asText(payload.stage);
  const goal = asText(payload.goal);
  const name = clamp(asText(payload.name), 140);
  const email = asText(payload.email).toLowerCase();
  const kvk = asText(payload.kvk).replace(/\s/g, "");
  const company = clamp(asText(payload.companyName) || asText(payload.company), 160);
  const phone = clamp(asText(payload.phone), 80);
  const consentVersion = asText(payload.consentVersion);

  if (idea.length < 24) return invalid("INSUFFICIENT_CONTEXT", "Beschrijf je idee of bedrijf iets concreter.");
  if (!industry) return invalid("INVALID_INDUSTRY", "Vul je branche in.");
  if (!ALLOWED_STAGES.has(stage)) return invalid("INVALID_STAGE", "Kies waar je nu staat.");
  if (!ALLOWED_GOALS.has(goal)) return invalid("INVALID_GOAL", "Kies of je wilt bouwen of groeien.");
  if (name.length < 2) return invalid("INVALID_NAME", "Vul je naam in.");
  if (!isValidVentureEmail(email)) return invalid("INVALID_EMAIL", "Vul een geldig e-mailadres in.");
  if (kvk && !/^\d{8}$/.test(kvk)) return invalid("INVALID_KVK", "Een KvK-nummer bestaat uit 8 cijfers.");
  if (payload.consentAccepted !== true || consentVersion !== CONSENT_VERSION) {
    return invalid("CONSENT_REQUIRED", "Geef toestemming voor opslag en persoonlijke opvolging om de aanvraag te versturen.");
  }

  return {
    ok: true,
    value: {
      idea,
      industry,
      stage,
      goal,
      name,
      email,
      kvk,
      company,
      phone,
      sourceRoute: clamp(asText(payload.sourceRoute), 180) || "/nl/venture-score-aanvragen",
      sourceComponent: clamp(asText(payload.sourceComponent), 120) || "venture-score-flow-v1",
    },
  };
}

function buildAnalysisInput(value: ValidatedPayload): AiowCustomerAnalysisInput {
  return {
    industry: value.industry,
    ideaSummary: value.idea,
    founderExperience: `Aanvrager: ${value.name}. Fase: ${value.stage}.`,
    coreOffer: value.idea,
    customerSegments: value.industry,
    proofOfDemand: value.stage === "omzet" ? "Aanvrager rapporteert bestaande omzet; bewijs vereist menselijke verificatie." : value.stage === "eerste-klanten" ? "Aanvrager rapporteert eerste klanten; bewijs vereist menselijke verificatie." : "Ideefase; vraagbewijs nog nodig.",
    executionCapacity: `Doel van samenwerking: ${value.goal}.`,
    aiowBuildScope: value.goal === "bouwen" ? "Product, AI of software samen bouwen." : "Groei, funnel en schaal samen verbeteren.",
    risks: "Publieke intake; alle claims, cijfers en tractie vereisen menselijke verificatie.",
  };
}

function buildReviewGate(score: number): VentureIntakeDossier["review"] {
  const state = score >= 82 ? "STRATEGIC_GO_REVIEW" : score >= 70 ? "GO_REVIEW" : score >= 48 ? "CONDITIONAL_REVIEW" : "NO_GO_OR_REWORK";
  return {
    state,
    humanReviewRequired: true,
    message: "AIOW beoordeelt deze intake menselijk. De score is intern advies en geen aanbod, contract of toezegging.",
    nextAction: "Controleer identiteit, vraagbewijs, scope en privacygrenzen voordat contact of een voorstel volgt.",
  };
}

function rateLimitIdentity(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || req.headers.get("x-real-ip")?.trim() || "unknown";
  const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 200);
  return `${address}\n${userAgent}`;
}

function invalid(code: string, message: string) {
  return { ok: false as const, code, message };
}

function apiError(message: string, status: number, code: string) {
  return NextResponse.json({ ok: false, code, error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function serviceUnavailable() {
  return apiError("De beveiligde aanvraagservice is tijdelijk niet beschikbaar. Je invoer blijft in het formulier; probeer opnieuw of mail ons direct.", 503, "INTAKE_UNAVAILABLE");
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
