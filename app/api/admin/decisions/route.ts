import { NextResponse } from "next/server";
import { aiowDurableStoreMode, supabaseInsert, supabaseSelect } from "@/lib/aiow-durable-store";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { getPublicAiowCustomerAccountById, recordAiowCustomerAdminDecision, type AiowAdminDecision } from "@/lib/aiow-customer-accounts";
import { buildVentureCanvasSnapshot, listVentureMemoryEvents } from "@/lib/aiow-venture-memory";
import { appendAiowProofEvent, listAiowProofEvents } from "@/lib/aiow-proof-events";

type DecisionPayload = {
  adminEmail?: unknown;
  adminToken?: unknown;
  accountId?: unknown;
  decision?: unknown;
  note?: unknown;
  spunkyHandoff?: unknown;
};

const DECISIONS = new Set(["GO", "CONDITIONAL_GO", "ADJUST_DEAL", "NO_GO"]);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = assertAiowAdmin(url.searchParams.get("adminEmail") || req.headers.get("x-aiow-admin-email") || "", url.searchParams.get("adminToken") || req.headers.get("x-aiow-admin-token") || "");
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });
    const accountId = url.searchParams.get("accountId") || undefined;
    const events = await listAiowProofEvents(accountId);
    return NextResponse.json({ ok: true, admin, events, count: events.length, source: "local-jsonl-proof-events" });
  } catch (error) {
    console.error("[admin/decisions] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as DecisionPayload;
    const admin = assertAiowAdmin(asTrimmed(payload.adminEmail), asTrimmed(payload.adminToken));
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });

    const accountId = asTrimmed(payload.accountId);
    const decision = asTrimmed(payload.decision).toUpperCase() as AiowAdminDecision;
    const note = clampText(asTrimmed(payload.note), 1000);
    if (!accountId) return NextResponse.json({ error: "accountId required" }, { status: 400 });
    if (!DECISIONS.has(decision)) return NextResponse.json({ error: "Unknown decision" }, { status: 400 });

    const account = await getPublicAiowCustomerAccountById(accountId);
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const updatedAccount = await recordAiowCustomerAdminDecision(accountId, decision, note);
    if (!updatedAccount) return NextResponse.json({ error: "Account decision status update failed" }, { status: 500 });

    const memory = await loadDecisionMemory(account.onboardingId);
    const followUpDraft = buildCustomerFollowUpDraft(updatedAccount, decision, note, memory);
    const spunkyBridge = buildSpunkyBridge(updatedAccount, decision, note, memory);

    const event = await appendAiowProofEvent({
      accountId,
      type: "ADMIN_DECISION_RECORDED",
      actorEmail: admin.email,
      summary: `${admin.email} recorded ${decision} for ${account.companyName}.`,
      payload: {
        decision,
        note,
        previousStatus: account.status,
        nextStatus: updatedAccount.status,
        companyName: account.companyName,
        projectName: account.projectName,
        verdict: account.analysis?.verdict || "UNSCORED",
        memorySessionId: account.onboardingId || "",
        memoryEventCount: memory.events.length,
        dealCardTitle: memory.dealCard?.title || "",
        recommendedRevenueSharePercent: account.analysis?.recommendedRevenueSharePercent || account.aiowRevenueSharePercent || 10,
        recommendedResaleSharePercent: account.analysis?.recommendedResaleSharePercent || 10,
        spunkyHandoffRequested: payload.spunkyHandoff === true,
      },
    });

    if (payload.spunkyHandoff === true && decision !== "NO_GO") {
      await appendAiowProofEvent({
        accountId,
        type: "SPUNKY_HANDOFF_REQUESTED",
        actorEmail: admin.email,
        summary: `Spunky handoff prepared for ${account.companyName}.`,
        payload: { decision, message: spunkyBridge.message, memorySessionId: account.onboardingId || "" },
      });
    }

    const emailQueue = await scheduleDecisionFollowupEmail(accountId, followUpDraft, decision);
    await appendAiowProofEvent({
      accountId,
      type: "CUSTOMER_FOLLOWUP_DRAFTED",
      actorEmail: admin.email,
      summary: `Customer follow-up draft prepared for ${account.companyName}.`,
      payload: { decision, subject: followUpDraft.subject, body: followUpDraft.body, nextAction: followUpDraft.nextAction, emailQueue },
    });

    return NextResponse.json({
      ok: true,
      admin,
      event,
      decision,
      account: updatedAccount,
      accountStatus: updatedAccount.status,
      spunkyBridge,
      followUpDraft,
      emailQueue,
      memoryContext: {
        memorySessionId: account.onboardingId || "",
        eventCount: memory.events.length,
        hasDealCard: Boolean(memory.dealCard),
        canvas: memory.canvas,
        dealCard: memory.dealCard,
      },
    });
  } catch (error) {
    console.error("[admin/decisions] POST error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function loadDecisionMemory(sessionId?: string) {
  if (!sessionId) return { events: [], canvas: null, dealCard: null as Record<string, unknown> | null };
  const events = await listVentureMemoryEvents(sessionId, 160);
  const latestCanvas = [...events].reverse().find((event) => event.canvas)?.canvas;
  const canvas = await buildVentureCanvasSnapshot(sessionId, latestCanvas);
  const dealCardEvent = [...events].reverse().find((event) => event.type === "deal_card");
  const dealCard = parseJsonObject(dealCardEvent?.content);
  return { events, canvas, dealCard };
}

function buildSpunkyBridge(
  account: NonNullable<Awaited<ReturnType<typeof getPublicAiowCustomerAccountById>>>,
  decision: AiowAdminDecision,
  note: string,
  memory: Awaited<ReturnType<typeof loadDecisionMemory>>,
) {
  const proof = account.analysis?.requiredCustomerProof?.join("; ") || "Nog geen proof-items beschikbaar; eerst intake/scoring verversen.";
  const dealTitle = textValue(memory.dealCard?.title) || memory.canvas?.project || account.projectName;
  const problem = textValue(memory.dealCard?.problem) || memory.canvas?.problem || "Nog niet scherp";
  const opportunity = textValue(memory.dealCard?.opportunity) || memory.canvas?.aiOpportunities || "Nog niet scherp";
  const missing = Array.isArray(memory.dealCard?.missing) ? memory.dealCard.missing.join("; ") : "Geen missing fields gevonden";
  return {
    title: `AIOW handoff voor ${account.companyName}`,
    target: decision === "NO_GO" ? "Geen Spunky projectgroep" : "Spunky / Team AIOW projectgroep",
    message: [
      `AIOW Deal Card beslissing: ${decision}`,
      `Klant: ${account.companyName} (${account.contactName}, ${account.contactEmail})`,
      `Project: ${dealTitle} / ${account.projectType}`,
      `Memory session: ${account.onboardingId || "geen session"}; events: ${memory.events.length}`,
      `Probleem: ${problem}`,
      `AI kans: ${opportunity}`,
      `Missing info: ${missing}`,
      `AI verdict: ${account.analysis?.verdict || "UNSCORED"}; revenue share advies: ${account.analysis?.recommendedRevenueSharePercent || account.aiowRevenueSharePercent || 10}%; resale: ${account.analysis?.recommendedResaleSharePercent || 10}%`,
      `Eerste sprint: ${account.analysis?.firstSprintRecommendation || "Intake/scoring eerst verversen; daarna proof sprint bepalen."}`,
      `Benodigd bewijs: ${proof}`,
      note ? `Richard/Jeroen note: ${note}` : "Richard/Jeroen note: geen extra notitie",
      decision === "NO_GO"
        ? "Spunky taak: geen projectgroep starten. Alleen archiveren of later heropenen met nieuw bewijs als Team Richard dat vraagt."
        : "Spunky taak: verzamel context, bewaak klantvragen, maak ontbrekende bewijsstukken zichtbaar, routeer naar Team Richard voor besluit. Niet zelfstandig deal/contract wijzigen.",
    ].join("\n"),
  };
}

function buildCustomerFollowUpDraft(
  account: NonNullable<Awaited<ReturnType<typeof getPublicAiowCustomerAccountById>>>,
  decision: AiowAdminDecision,
  note: string,
  memory: Awaited<ReturnType<typeof loadDecisionMemory>>,
) {
  const firstName = (account.contactName || account.companyName || "daar").split(" ")[0];
  const dealTitle = textValue(memory.dealCard?.title) || memory.canvas?.project || account.projectName;
  const missing = Array.isArray(memory.dealCard?.missing) ? memory.dealCard.missing.filter(Boolean).slice(0, 4) : [];
  const missingLine = missing.length ? `Wat nog ontbreekt: ${missing.join(", ")}.` : "De eerste context is compleet genoeg voor de volgende stap.";
  const templates: Record<AiowAdminDecision, { subject: string; opener: string; nextAction: string }> = {
    GO: {
      subject: `AIOW review positief: ${dealTitle}`,
      opener: `Hey ${firstName}, we hebben je AIOW intake bekeken. Team Richard ziet genoeg potentie om dit serieus door te zetten naar voorstel en scope.`,
      nextAction: "Maak voorstel/contract en bereid Spunky projectgroep voor na signing.",
    },
    CONDITIONAL_GO: {
      subject: `AIOW ziet potentie, nog paar punten nodig voor ${dealTitle}`,
      opener: `Hey ${firstName}, we hebben je intake bekeken. Er zit potentie in, maar we willen eerst een paar punten scherper maken voordat we scope of contract definitief maken.`,
      nextAction: "Stuur bewijsverzoek of aanvullende vragen, daarna herreview.",
    },
    ADJUST_DEAL: {
      subject: `AIOW voorstelroute aanpassen voor ${dealTitle}`,
      opener: `Hey ${firstName}, we hebben je case bekeken. De kans is interessant genoeg om verder te bespreken, maar niet op de standaard route. We willen scope, dealstructuur of voorwaarden eerst aanpassen.`,
      nextAction: "Maak aangepaste dealroute of commerciële voorwaarden klaar.",
    },
    NO_GO: {
      subject: `AIOW review: nu geen passend build traject`,
      opener: `Hey ${firstName}, we hebben je intake bekeken. Op basis van de huidige context pakken we dit nu niet op als AIOW venture/build traject.`,
      nextAction: "Stuur nette afwijzing of lichte alternatieve route, geen contract en geen Spunky projectgroep.",
    },
  };
  const selected = templates[decision];
  const body = [
    selected.opener,
    "",
    `Onze korte samenvatting: ${textValue(memory.dealCard?.problem) || memory.canvas?.problem || account.projectName}`,
    `AI-kans: ${textValue(memory.dealCard?.opportunity) || memory.canvas?.aiOpportunities || "nog verder te bepalen"}`,
    missingLine,
    note ? `Notitie vanuit Team Richard: ${note}` : "",
    "",
    decision === "NO_GO"
      ? "Als je later concreter bewijs, budget of tractie hebt, kunnen we opnieuw kijken. Voor nu starten we geen productie of projectgroep."
      : "Als dit klopt, maken we de volgende stap concreet: scope, bewijs, voorstel en pas daarna uitvoering. AIOW bouwt niet gratis en neemt geen open risico zonder duidelijke afspraken.",
    "",
    "Handsome / Team Richard",
  ].filter(Boolean).join("\n");
  return { subject: selected.subject, body, nextAction: selected.nextAction, to: account.contactEmail };
}

async function scheduleDecisionFollowupEmail(
  accountId: string,
  followUpDraft: { to: string; subject: string; body: string; nextAction: string },
  decision: AiowAdminDecision,
): Promise<{ queued: boolean; storageMode: string; jobId?: string; reason?: string }> {
  const storageMode = aiowDurableStoreMode();
  if (storageMode !== "supabase") return { queued: false, storageMode, reason: "Supabase storage required for e-mail queue" };
  const leads = await supabaseSelect<{ id: string; email: string }>(
    "aiow_leads",
    `customer_account_id=eq.${encodeURIComponent(accountId)}&order=created_at.desc&limit=1`,
  );
  const lead = leads?.[0];
  if (!lead) return { queued: false, storageMode, reason: "No Supabase lead found for account" };
  const now = new Date();
  const scheduledFor = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
  const jobId = `aiow_email_job_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
  await supabaseInsert("aiow_email_jobs", {
    id: jobId,
    lead_id: lead.id,
    job_type: "admin_decision_followup",
    scheduled_for: scheduledFor,
    status: "pending",
    idempotency_key: `admin_decision:${accountId}:${decision}:${Date.now()}`,
    attempts: 0,
    template_version: "aiow-admin-decision-followup-v1",
    personalization_snapshot: {
      subject: followUpDraft.subject,
      body: followUpDraft.body,
      nextAction: followUpDraft.nextAction,
      decision,
      accountId,
    },
  });
  await supabaseInsert("aiow_lead_events", {
    lead_id: lead.id,
    event_type: "admin_decision_followup_queued",
    event_payload: { jobId, accountId, decision, subject: followUpDraft.subject },
  });
  return { queued: true, storageMode, jobId };
}

function parseJsonObject(value?: string): Record<string, unknown> | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function textValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asTrimmed(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function clampText(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
