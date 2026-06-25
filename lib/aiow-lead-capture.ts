import { createHash, randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { aiowDurableStoreMode, supabaseInsert } from "./aiow-durable-store";

export type AiowLeadDeliveryState = "LOCAL_CAPTURED" | "EMAIL_AND_LOCAL_CAPTURED";

export type AiowLeadCaptureInput = {
  email: string;
  consentAccepted: true;
  consentText: string;
  consentVersion: string;
  source: string;
  sourceRoute?: string;
  sourceComponent?: string;
  locale?: "nl" | "en";
  name?: string;
  company?: string;
  phone?: string;
  intentType?: "idea" | "company" | "scan" | "talk" | "apply" | "account" | "contact" | "unknown";
  intentText?: string;
  projectType?: string;
  moduleInterests?: string[];
  addOns?: string[];
  customerAccountId?: string;
  onboardingId?: string;
  metadata?: Record<string, unknown>;
};

export type AiowLeadCaptureRecord = {
  id: string;
  emailHash: string;
  capturedAt: string;
  updatedAt: string;
  deliveryState: AiowLeadDeliveryState;
  followUp: {
    status: "SCHEDULED_NEXT_DAY" | "READY_FOR_MANUAL_REVIEW";
    scheduledFor: string;
    idempotencyKey: string;
    templateVersion: "aiow-next-day-followup-v1";
    personalizationSnapshot: {
      route: string;
      component: string;
      intentType: string;
      intentText: string;
      recommendedAngle: string;
      proofPoint: string;
      safeCta: string;
    };
  };
  consent: {
    accepted: true;
    text: string;
    version: string;
    acceptedAt: string;
    source: string;
  };
  payload: AiowLeadCaptureInput;
  privacyBoundary: string;
};

const PRIVACY_BOUNDARY =
  "AIOW stores this lead for intake/follow-up only after explicit permission. No newsletter, profiling, production activation, payment, provider billing or legal acceptance is triggered by this lead capture.";

export function normalizeLeadEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validLeadEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function nextAmsterdamBusinessMorning(from = new Date()): string {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + 1);
  // 08:30 UTC = 10:30 CEST / 09:30 CET-ish. Good enough for MVP; production can use TZ-aware scheduler.
  next.setUTCHours(8, 30, 0, 0);
  const day = next.getUTCDay();
  if (day === 6) next.setUTCDate(next.getUTCDate() + 2);
  if (day === 0) next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString();
}

export async function captureAiowLead(input: AiowLeadCaptureInput, deliveryState: AiowLeadDeliveryState): Promise<{ id: string; path: string; record: AiowLeadCaptureRecord }> {
  const capturedAt = new Date().toISOString();
  const email = normalizeLeadEmail(input.email);
  const id = `aiow_lead_${createHash("sha256").update(`${email}|${input.source}|${capturedAt}|${randomUUID()}`).digest("hex").slice(0, 16)}`;
  const scheduledFor = nextAmsterdamBusinessMorning(new Date(capturedAt));
  const record: AiowLeadCaptureRecord = {
    id,
    emailHash: createHash("sha256").update(email).digest("hex"),
    capturedAt,
    updatedAt: capturedAt,
    deliveryState,
    followUp: {
      status: "SCHEDULED_NEXT_DAY",
      scheduledFor,
      idempotencyKey: `next_day_followup:${createHash("sha256").update(`${email}|${input.source}|${scheduledFor}`).digest("hex").slice(0, 24)}`,
      templateVersion: "aiow-next-day-followup-v1",
      personalizationSnapshot: buildPersonalizationSnapshot(input),
    },
    consent: {
      accepted: true,
      text: input.consentText,
      version: input.consentVersion,
      acceptedAt: capturedAt,
      source: input.source,
    },
    payload: { ...input, email },
    privacyBoundary: PRIVACY_BOUNDARY,
  };

  if (aiowDurableStoreMode() === "supabase") {
    try {
      await persistLeadToSupabase(record);
      return { id, path: "supabase:aiow_leads", record };
    } catch (error) {
      console.warn("[aiow-lead-capture] Supabase unavailable, falling back to JSONL", error);
    }
  }

  const filePath = leadStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
  return { id, path: filePath, record };
}

async function persistLeadToSupabase(record: AiowLeadCaptureRecord): Promise<void> {
  const payload = record.payload;
  await supabaseInsert("aiow_leads", {
    id: record.id,
    created_at: record.capturedAt,
    updated_at: record.updatedAt,
    email: normalizeLeadEmail(payload.email),
    email_hash: record.emailHash,
    name: payload.name || null,
    company: payload.company || null,
    phone: payload.phone || null,
    source: payload.source,
    source_route: payload.sourceRoute || null,
    source_component: payload.sourceComponent || null,
    locale: payload.locale || "nl",
    intent_type: payload.intentType || "unknown",
    intent_text: payload.intentText || null,
    project_type: payload.projectType || null,
    module_interests: payload.moduleInterests || [],
    add_ons: payload.addOns || [],
    customer_account_id: payload.customerAccountId || null,
    onboarding_id: payload.onboardingId || null,
    status: "captured",
    metadata: { ...(payload.metadata || {}), deliveryState: record.deliveryState, privacyBoundary: record.privacyBoundary },
  });
  await supabaseInsert("aiow_lead_consents", {
    lead_id: record.id,
    email: normalizeLeadEmail(payload.email),
    consent_type: "follow_up_email",
    granted: true,
    consent_text: record.consent.text,
    consent_version: record.consent.version,
    legal_basis: "consent",
    source: record.consent.source,
    created_at: record.consent.acceptedAt,
  });
  await supabaseInsert("aiow_email_jobs", {
    lead_id: record.id,
    job_type: "next_day_followup",
    scheduled_for: record.followUp.scheduledFor,
    status: "pending",
    idempotency_key: record.followUp.idempotencyKey,
    attempts: 0,
    template_version: record.followUp.templateVersion,
    personalization_snapshot: record.followUp.personalizationSnapshot,
  });
  await supabaseInsert("aiow_lead_events", {
    lead_id: record.id,
    event_type: "lead_captured",
    event_payload: { source: payload.source, component: payload.sourceComponent, customerAccountId: payload.customerAccountId || null },
  });
}

function buildPersonalizationSnapshot(input: AiowLeadCaptureInput): AiowLeadCaptureRecord["followUp"]["personalizationSnapshot"] {
  const intentText = clamp(input.intentText || input.metadata?.context || "", 700);
  const intentType = input.intentType || "unknown";
  const recommendedAngle = intentType === "company"
    ? "Bestaand bedrijf: start met een private AI-workflow rond sales, klantcontact of operations voordat er groter gebouwd wordt."
    : intentType === "idea"
      ? "Nieuw idee: start met proof, doelgroepvalidatie en een kleine AI-native sprint voordat er zwaar geïnvesteerd wordt."
      : "AIOW-scan: vertaal de vraag naar één meetbare workflow met human approval en duidelijke businesswaarde.";
  return {
    route: input.sourceRoute || input.source,
    component: input.sourceComponent || "unknown",
    intentType,
    intentText,
    recommendedAngle,
    proofPoint: "AIOW gebruikt de intakecontext om een concrete AI-kans, workflow en veilige eerste sprint te schetsen. Geen generieke nieuwsbrief.",
    safeCta: "Open je AIOW intake of plan een korte scope-check; productie start pas na scope, voorwaarden en akkoord.",
  };
}

function leadStorePath(): string {
  return process.env.AIOW_LEAD_CAPTURE_STORE || path.join(os.tmpdir(), "aiow-customer-onboarding", "leads.jsonl");
}

function clamp(value: unknown, maxLength: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}
