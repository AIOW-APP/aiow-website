import { NextResponse } from "next/server";
import { aiowDurableStoreMode, supabaseInsert, supabaseSelect, supabaseUpdate } from "@/lib/aiow-durable-store";

type EmailJob = {
  id: string;
  lead_id: string;
  job_type: string;
  scheduled_for: string;
  status: string;
  idempotency_key: string;
  attempts: number;
  template_version: string;
  personalization_snapshot: PersonalizationSnapshot;
};

type Lead = {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
  intent_type?: string | null;
  intent_text?: string | null;
  source_route?: string | null;
  source_component?: string | null;
  metadata?: Record<string, unknown> | null;
};

type Consent = {
  id: string;
  lead_id: string;
  granted: boolean;
  revoked_at?: string | null;
  consent_text: string;
  consent_version: string;
};

type PersonalizationSnapshot = {
  route?: string;
  component?: string;
  intentType?: string;
  intentText?: string;
  recommendedAngle?: string;
  proofPoint?: string;
  safeCta?: string;
  subject?: string;
  body?: string;
  nextAction?: string;
  decision?: string;
  accountId?: string;
};

type ProcessedJob = {
  jobId: string;
  leadId: string;
  email?: string;
  status: "dry_run" | "sent" | "skipped" | "failed";
  reason?: string;
  providerMessageId?: string;
};

const MAX_JOBS = 10;

export async function GET(req: Request) {
  return processFollowUps(req);
}

export async function POST(req: Request) {
  return processFollowUps(req);
}

async function processFollowUps(req: Request) {
  try {
    const url = new URL(req.url);
    const dryRun = url.searchParams.get("dryRun") === "true";
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : url.searchParams.get("token") || "";
    const expected = process.env.AIOW_CRON_SECRET || process.env.CRON_SECRET || "";
    if (!expected || token !== expected) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (aiowDurableStoreMode() !== "supabase") {
      return NextResponse.json({ error: "Supabase storage required", storageMode: aiowDurableStoreMode() }, { status: 503 });
    }

    const now = new Date().toISOString();
    const jobs = (await supabaseSelect<EmailJob>(
      "aiow_email_jobs",
      `status=eq.pending&scheduled_for=lte.${encodeURIComponent(now)}&order=scheduled_for.asc&limit=${MAX_JOBS}`,
    )) || [];

    if (!dryRun && jobs.length > 0 && !process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: "RESEND_API_KEY missing",
        ok: false,
        dueJobs: jobs.length,
        message: "Follow-up queue is ready, but e-mail sending is not enabled yet.",
      }, { status: 503 });
    }

    const processed: ProcessedJob[] = [];
    for (const job of jobs) {
      processed.push(await processJob(job, dryRun));
    }

    return NextResponse.json({
      ok: true,
      dryRun,
      storageMode: "supabase",
      dueJobs: jobs.length,
      processed,
    });
  } catch (error) {
    console.error("[aiow-followups] cron error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function processJob(job: EmailJob, dryRun: boolean): Promise<ProcessedJob> {
  const lead = ((await supabaseSelect<Lead>("aiow_leads", `id=eq.${encodeURIComponent(job.lead_id)}&limit=1`)) || [])[0];
  if (!lead) return markSkipped(job, "lead_not_found", dryRun);

  const consent = ((await supabaseSelect<Consent>(
    "aiow_lead_consents",
    `lead_id=eq.${encodeURIComponent(job.lead_id)}&consent_type=eq.follow_up_email&granted=is.true&revoked_at=is.null&limit=1`,
  )) || [])[0];
  if (!consent) return markSkipped(job, "consent_missing_or_revoked", dryRun, lead);

  const snapshot = job.personalization_snapshot || {};
  const usesCustomDraft = Boolean(snapshot.subject && snapshot.body) && ["admin_decision_followup", "spunky_review_followup"].includes(job.job_type);
  const subject = usesCustomDraft && snapshot.subject ? snapshot.subject.slice(0, 120) : buildSubject(lead);
  const html = usesCustomDraft && snapshot.body
    ? renderAdminDecisionEmail(lead, snapshot)
    : renderFollowUpEmail(lead, snapshot);
  if (dryRun) return { jobId: job.id, leadId: job.lead_id, email: maskEmail(lead.email), status: "dry_run", reason: subject };

  const sent = await sendResend({ to: lead.email, subject, html, replyTo: "hello@aiow.ai" });
  if (!sent.ok) {
    const attempts = (job.attempts || 0) + 1;
    const finalStatus = attempts >= 3 ? "failed" : "pending";
    await supabaseUpdate("aiow_email_jobs", `id=eq.${encodeURIComponent(job.id)}`, {
      attempts,
      status: finalStatus,
      last_error: sent.error.slice(0, 700),
      updated_at: new Date().toISOString(),
    });
    await supabaseInsert("aiow_email_sends", {
      lead_id: job.lead_id,
      email_job_id: job.id,
      provider: "resend",
      status: "failed",
      subject,
      metadata: { error: sent.error, attempts },
    });
    await supabaseInsert("aiow_lead_events", {
      lead_id: job.lead_id,
      event_type: "followup_email_failed",
      event_payload: { jobId: job.id, attempts, finalStatus },
    });
    return { jobId: job.id, leadId: job.lead_id, email: maskEmail(lead.email), status: "failed", reason: sent.error };
  }

  await supabaseInsert("aiow_email_sends", {
    lead_id: job.lead_id,
    email_job_id: job.id,
    provider: "resend",
    provider_message_id: sent.messageId,
    status: "sent",
    subject,
    metadata: { templateVersion: job.template_version, idempotencyKey: job.idempotency_key },
  });
  await supabaseUpdate("aiow_email_jobs", `id=eq.${encodeURIComponent(job.id)}`, {
    status: "sent",
    attempts: (job.attempts || 0) + 1,
    last_error: null,
    updated_at: new Date().toISOString(),
  });
  await supabaseUpdate("aiow_leads", `id=eq.${encodeURIComponent(job.lead_id)}`, {
    status: "followed_up",
    updated_at: new Date().toISOString(),
  });
  await supabaseInsert("aiow_lead_events", {
    lead_id: job.lead_id,
    event_type: "followup_email_sent",
    event_payload: { jobId: job.id, providerMessageId: sent.messageId, subject },
  });
  return { jobId: job.id, leadId: job.lead_id, email: maskEmail(lead.email), status: "sent", providerMessageId: sent.messageId };
}

async function markSkipped(job: EmailJob, reason: string, dryRun: boolean, lead?: Lead): Promise<ProcessedJob> {
  if (!dryRun) {
    await supabaseUpdate("aiow_email_jobs", `id=eq.${encodeURIComponent(job.id)}`, {
      status: "skipped",
      last_error: reason,
      updated_at: new Date().toISOString(),
    });
    await supabaseInsert("aiow_lead_events", {
      lead_id: job.lead_id,
      event_type: "followup_email_skipped",
      event_payload: { jobId: job.id, reason },
    });
  }
  return { jobId: job.id, leadId: job.lead_id, email: lead?.email ? maskEmail(lead.email) : undefined, status: "skipped", reason };
}

async function sendResend(input: { to: string; subject: string; html: string; replyTo: string }): Promise<{ ok: true; messageId: string } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY || "";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM_AIOW_FOLLOWUP || process.env.EMAIL_FROM_AIOW || "AIOW <hello@send.aiow.ai>",
      to: [input.to],
      reply_to: input.replyTo,
      subject: input.subject,
      html: input.html,
    }),
  });
  const body = await response.text();
  if (!response.ok) return { ok: false, error: `${response.status} ${body}` };
  try {
    const parsed = JSON.parse(body) as { id?: string };
    return { ok: true, messageId: parsed.id || "resend_unknown" };
  } catch {
    return { ok: true, messageId: "resend_unknown" };
  }
}

function buildSubject(lead: Lead): string {
  const subjectName = lead.company || lead.name || "je AIOW intake";
  return `Een concrete AI-route voor ${subjectName}`.slice(0, 120);
}

function renderFollowUpEmail(lead: Lead, snapshot: PersonalizationSnapshot): string {
  const name = lead.name || lead.company || "daar";
  const angle = snapshot.recommendedAngle || "We zien waarschijnlijk de meeste waarde in een kleine, veilige AI-sprint met duidelijke businesswaarde.";
  const proofPoint = snapshot.proofPoint || "De intakecontext is vastgelegd zodat we niet opnieuw breed hoeven te beginnen.";
  const safeCta = snapshot.safeCta || "Antwoord op deze mail met de workflow of kans die als eerste bewezen moet worden.";
  return renderShell(`
    <p style="color:#91ffd2; letter-spacing:.14em; text-transform:uppercase; font-size:12px; margin:0 0 18px;">Persoonlijke AIOW opvolging</p>
    <h1 style="font-size:30px; line-height:1.05; margin:0 0 18px;">Hoi ${escapeHtml(name)}, dit is de eerste AI-route.</h1>
    <p style="color:#D7D7DE; line-height:1.65; margin:0 0 16px;">Je was gisteren op AIOW.ai en gaf toestemming om je intake persoonlijk op te volgen. We hebben je context gebruikt om een eerste denkrichting te maken.</p>
    <div style="padding:16px; border-radius:14px; background:#101C18; border:1px solid rgba(145,255,210,.22); color:#F8F8FA; line-height:1.6; margin-bottom:16px;">${escapeHtml(angle)}</div>
    <p style="color:#D7D7DE; line-height:1.65; margin:0 0 16px;">${escapeHtml(proofPoint)}</p>
    ${lead.intent_text ? `<p style="color:#A7A7B2; line-height:1.65; margin:0 0 18px;">Context die we meenemen: “${escapeHtml(lead.intent_text.slice(0, 320))}”</p>` : ""}
    <div style="padding:16px; border-radius:14px; background:#111114; border:1px solid rgba(255,255,255,.10); color:#F8F8FA; line-height:1.6;">Volgende stap: ${escapeHtml(safeCta)}</div>
    <p style="color:#7A7A84; font-size:12px; line-height:1.5; margin:18px 0 0;">Geen nieuwsbrief. Je ontvangt dit omdat je toestemming gaf voor persoonlijke opvolging van je AIOW-aanvraag.</p>
  `);
}

function renderAdminDecisionEmail(lead: Lead, snapshot: PersonalizationSnapshot): string {
  const name = lead.name || lead.company || "daar";
  const body = snapshot.body || "Team Richard heeft je aanvraag beoordeeld.";
  return renderShell(`
    <p style="color:#91ffd2; letter-spacing:.14em; text-transform:uppercase; font-size:12px; margin:0 0 18px;">AIOW review update</p>
    <h1 style="font-size:30px; line-height:1.05; margin:0 0 18px;">Hoi ${escapeHtml(name)}, update vanuit Team Richard.</h1>
    ${body.split("\n").map((line) => line.trim() ? `<p style="color:#D7D7DE; line-height:1.65; margin:0 0 14px;">${escapeHtml(line)}</p>` : `<div style="height:8px"></div>`).join("")}
    ${snapshot.nextAction ? `<div style="padding:16px; border-radius:14px; background:#101C18; border:1px solid rgba(145,255,210,.22); color:#F8F8FA; line-height:1.6; margin-top:16px;">Interne volgende actie: ${escapeHtml(snapshot.nextAction)}</div>` : ""}
    <p style="color:#7A7A84; font-size:12px; line-height:1.5; margin:18px 0 0;">Je ontvangt dit omdat je toestemming gaf voor persoonlijke opvolging van je AIOW-aanvraag. Geen nieuwsbrief.</p>
  `);
}

function renderShell(content: string): string {
  return `<!doctype html><html><body style="margin:0; background:#08090B; font-family:Inter,Arial,sans-serif; color:#F8F8FA;"><div style="max-width:680px; margin:0 auto; padding:32px 20px;"><div style="border:1px solid rgba(255,255,255,.10); border-radius:24px; padding:28px; background:linear-gradient(145deg,#101114,#08090B);">${content}</div></div></body></html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] || char);
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "masked";
  return `${name.slice(0, 2)}***@${domain}`;
}
