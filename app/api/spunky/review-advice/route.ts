import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { aiowDurableStoreMode, supabaseInsert, supabaseSelect } from "@/lib/aiow-durable-store";
import { getPublicAiowCustomerAccountById } from "@/lib/aiow-customer-accounts";
import { appendAiowProofEvent } from "@/lib/aiow-proof-events";
import { buildVentureCanvasSnapshot, captureVentureMemoryEvent, listVentureMemoryEvents } from "@/lib/aiow-venture-memory";
import { generateSpunkyReviewAdvice, type SpunkyReviewAdvice } from "@/lib/aiow-spunky-review-advice";

type Payload = {
  accountId?: unknown;
  adminEmail?: unknown;
  adminToken?: unknown;
  persist?: unknown;
  queueFollowUp?: unknown;
  delayMinutes?: unknown;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as Payload;
    const adminEmail = asText(payload.adminEmail);
    const adminToken = asText(payload.adminToken);
    const admin = assertAiowAdmin(adminEmail, adminToken);
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });

    const accountId = clamp(asText(payload.accountId), 160);
    const account = accountId ? await getPublicAiowCustomerAccountById(accountId) : null;
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const sessionId = account.onboardingId || account.accountId;
    const events = await listVentureMemoryEvents(sessionId, 240);
    const latestCanvas = [...events].reverse().find((event) => event.canvas)?.canvas;
    const canvas = await buildVentureCanvasSnapshot(sessionId, latestCanvas);
    const dealCardEvent = [...events].reverse().find((event) => event.type === "deal_card");
    const dealCard = parseJson(dealCardEvent?.content);
    const advice = generateSpunkyReviewAdvice({ account, events, canvas, dealCard });

    let memoryEventId: string | null = null;
    if (payload.persist === true) {
      const memory = await captureVentureMemoryEvent({
        sessionId,
        role: "system",
        type: "decision",
        content: [
          "Spunky review advice",
          `Verdict: ${advice.verdict}`,
          `Readiness: ${advice.readinessScore}`,
          `Risk: ${advice.riskLevel}`,
          "Summary:",
          advice.summary,
          "Missing proof:",
          advice.missingProof.join("; ") || "none",
          "Recommended first sprint:",
          advice.recommendedFirstSprint,
        ].join("\n"),
        personEmail: account.contactEmail,
        personName: account.contactName,
        company: account.companyName,
        consentAccepted: true,
        metadata: {
          source: "spunky_review_advice",
          accountId: account.accountId,
          adminEmail: admin.email,
          verdict: advice.verdict,
          readinessScore: advice.readinessScore,
          riskLevel: advice.riskLevel,
        },
      });
      memoryEventId = memory.id;
    }

    const followUpQueue = payload.queueFollowUp === true
      ? await scheduleSpunkyReviewFollowUp({ accountId: account.accountId, adminEmail: admin.email, advice, delayMinutes: Number(payload.delayMinutes) || 10 })
      : { queued: false, storageMode: aiowDurableStoreMode(), reason: "queueFollowUp not requested" };

    return NextResponse.json({
      ok: true,
      accountId: account.accountId,
      memorySessionId: sessionId,
      advice,
      persisted: payload.persist === true,
      queuedFollowUp: payload.queueFollowUp === true,
      followUpQueue,
      memoryEventId,
      message: payload.queueFollowUp === true
        ? "Spunky reviewadvies en persoonlijke follow-up draft zijn klaargezet. Verzending blijft afhankelijk van consent, cron en mailprovider."
        : payload.persist === true
          ? "Spunky reviewadvies opgeslagen in Venture Memory. Dit is geen contract, scopewijziging of livegang."
          : "Spunky reviewadvies gegenereerd voor Team Richard.",
    });
  } catch (error) {
    console.error("[spunky/review-advice] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function parseJson(value?: string): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

type SpunkyFollowUpQueueInput = {
  accountId: string;
  adminEmail: string;
  advice: SpunkyReviewAdvice;
  delayMinutes: number;
};

async function scheduleSpunkyReviewFollowUp(input: SpunkyFollowUpQueueInput): Promise<{ queued: boolean; storageMode: string; jobId?: string; reason?: string }> {
  const storageMode = aiowDurableStoreMode();
  if (storageMode !== "supabase") return { queued: false, storageMode, reason: "Supabase storage required for e-mail queue" };
  const leads = await supabaseSelect<{ id: string; email: string }>(
    "aiow_leads",
    `customer_account_id=eq.${encodeURIComponent(input.accountId)}&order=created_at.desc&limit=1`,
  );
  const lead = leads?.[0];
  if (!lead) return { queued: false, storageMode, reason: "No Supabase lead found for account" };

  const safeDelay = Math.max(5, Math.min(60 * 24, input.delayMinutes || 10));
  const scheduledFor = new Date(Date.now() + safeDelay * 60 * 1000).toISOString();
  const jobId = `aiow_email_job_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  await supabaseInsert("aiow_email_jobs", {
    id: jobId,
    lead_id: lead.id,
    job_type: "spunky_review_followup",
    scheduled_for: scheduledFor,
    status: "pending",
    idempotency_key: `spunky_review:${input.accountId}:${input.advice.verdict}:${Date.now()}`,
    attempts: 0,
    template_version: "aiow-spunky-review-followup-v1",
    personalization_snapshot: {
      subject: input.advice.customerEmailDraft.subject,
      body: input.advice.customerEmailDraft.body,
      nextAction: input.advice.adminActions[0] || "Review de Spunky vervolgvraag en bepaal de volgende klantactie.",
      decision: input.advice.verdict,
      accountId: input.accountId,
    },
  });
  await supabaseInsert("aiow_lead_events", {
    lead_id: lead.id,
    event_type: "spunky_review_followup_queued",
    event_payload: { jobId, accountId: input.accountId, verdict: input.advice.verdict, subject: input.advice.customerEmailDraft.subject },
  });
  await appendAiowProofEvent({
    accountId: input.accountId,
    type: "CUSTOMER_FOLLOWUP_DRAFTED",
    actorEmail: input.adminEmail,
    summary: "Spunky follow-up draft queued after review advice.",
    payload: {
      jobId,
      verdict: input.advice.verdict,
      subject: input.advice.customerEmailDraft.subject,
      body: input.advice.customerEmailDraft.body,
      scheduledFor,
      source: "spunky_review_advice",
    },
  });
  return { queued: true, storageMode, jobId };
}

function clamp(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}
