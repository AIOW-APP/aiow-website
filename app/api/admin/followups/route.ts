import { NextResponse } from "next/server";
import { assertAiowAdmin } from "@/lib/aiow-admins";
import { aiowDurableStoreMode, supabaseSelect } from "@/lib/aiow-durable-store";

type EmailJobRow = {
  id: string;
  lead_id: string;
  job_type: string;
  scheduled_for: string;
  status: string;
  attempts: number;
  template_version: string;
  personalization_snapshot?: Record<string, unknown> | null;
  last_error?: string | null;
  updated_at?: string | null;
};

type LeadRow = {
  id: string;
  email: string;
  name?: string | null;
  company?: string | null;
  customer_account_id?: string | null;
  status?: string | null;
};

type SendRow = {
  id?: string;
  lead_id: string;
  email_job_id: string;
  provider?: string | null;
  provider_message_id?: string | null;
  status: string;
  subject?: string | null;
  created_at?: string | null;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const admin = assertAiowAdmin(
      url.searchParams.get("adminEmail") || req.headers.get("x-aiow-admin-email") || "",
      url.searchParams.get("adminToken") || req.headers.get("x-aiow-admin-token") || "",
    );
    if (!admin) return NextResponse.json({ error: "Admin email/token required" }, { status: 401 });

    const storageMode = aiowDurableStoreMode();
    if (storageMode !== "supabase") {
      return NextResponse.json({ ok: true, admin, storageMode, queue: [], summary: emptySummary(), health: buildEmptyHealth(storageMode), message: "Supabase storage required for follow-up queue." });
    }

    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit")) || 20));
    const jobs = (await supabaseSelect<EmailJobRow>(
      "aiow_email_jobs",
      `select=id,lead_id,job_type,scheduled_for,status,attempts,template_version,personalization_snapshot,last_error,updated_at&job_type=in.(next_day_followup,admin_decision_followup,spunky_review_followup)&order=scheduled_for.desc&limit=${limit}`,
    )) || [];

    const leadIds = unique(jobs.map((job) => job.lead_id));
    const jobIds = unique(jobs.map((job) => job.id));
    const leads = leadIds.length
      ? (await supabaseSelect<LeadRow>("aiow_leads", `select=id,email,name,company,customer_account_id,status&id=in.(${leadIds.map(encodeFilterValue).join(",")})`)) || []
      : [];
    const sends = jobIds.length
      ? (await supabaseSelect<SendRow>("aiow_email_sends", `select=id,lead_id,email_job_id,provider,provider_message_id,status,subject,created_at&email_job_id=in.(${jobIds.map(encodeFilterValue).join(",")})&order=created_at.desc`)) || []
      : [];

    const leadById = new Map(leads.map((lead) => [lead.id, lead]));
    const latestSendByJob = new Map<string, SendRow>();
    for (const send of sends) if (!latestSendByJob.has(send.email_job_id)) latestSendByJob.set(send.email_job_id, send);

    const queue = jobs.map((job) => {
      const lead = leadById.get(job.lead_id);
      const snapshot = job.personalization_snapshot || {};
      const send = latestSendByJob.get(job.id);
      return {
        jobId: job.id,
        jobType: job.job_type,
        status: job.status,
        attempts: job.attempts || 0,
        scheduledFor: job.scheduled_for,
        updatedAt: job.updated_at || null,
        lastError: job.last_error || null,
        subject: asText(snapshot.subject) || send?.subject || defaultSubject(job.job_type),
        decision: asText(snapshot.decision),
        accountId: asText(snapshot.accountId) || lead?.customer_account_id || "",
        lead: lead ? {
          id: lead.id,
          email: maskEmail(lead.email),
          name: lead.name || "",
          company: lead.company || "",
          status: lead.status || "",
        } : null,
        send: send ? {
          status: send.status,
          provider: send.provider || "",
          providerMessageId: send.provider_message_id || "",
          createdAt: send.created_at || "",
        } : null,
      };
    });

    return NextResponse.json({ ok: true, admin, storageMode, queue, count: queue.length, summary: summarize(queue), health: buildHealth(queue) });
  } catch (error) {
    console.error("[admin/followups] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function summarize(queue: Array<{ status: string; send: { status: string } | null }>) {
  return {
    pending: queue.filter((item) => item.status === "pending").length,
    sent: queue.filter((item) => item.status === "sent" || item.send?.status === "sent").length,
    skipped: queue.filter((item) => item.status === "skipped").length,
    failed: queue.filter((item) => item.status === "failed" || item.send?.status === "failed").length,
  };
}

function buildHealth(queue: Array<{ status: string; scheduledFor: string; lastError: string | null; attempts: number }>) {
  const now = Date.now();
  const due = queue.filter((item) => item.status === "pending" && new Date(item.scheduledFor).getTime() <= now).length;
  const stuck = queue.filter((item) => {
    const scheduledAt = new Date(item.scheduledFor).getTime();
    return item.status === "pending" && Number.isFinite(scheduledAt) && scheduledAt < now - 2 * 60 * 60 * 1000;
  }).length;
  const failed = queue.filter((item) => item.status === "failed" || Boolean(item.lastError)).length;
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const cronSecretConfigured = Boolean(process.env.AIOW_CRON_SECRET || process.env.CRON_SECRET);
  const attention = stuck > 0 || failed > 0 || due > 0 && !resendConfigured || !cronSecretConfigured;
  return {
    status: attention ? "needs_attention" : "healthy",
    dueJobs: due,
    stuckJobs: stuck,
    failedJobs: failed,
    resendConfigured,
    cronSecretConfigured,
    storageMode: "supabase",
    nextAction: attention
      ? !cronSecretConfigured
        ? "Configureer AIOW_CRON_SECRET of CRON_SECRET voordat cron veilig kan draaien."
        : !resendConfigured && due > 0
          ? "RESEND_API_KEY ontbreekt terwijl er due follow-ups klaarstaan."
          : stuck > 0
            ? "Controleer cron scheduling of draai een dry-run, want jobs blijven pending."
            : "Controleer gefaalde follow-ups en consent/mailprovider logs."
      : "Geen directe actie nodig. Queue en configuratie lijken gezond.",
  };
}

function buildEmptyHealth(storageMode: string) {
  return {
    status: storageMode === "supabase" ? "healthy" : "needs_attention",
    dueJobs: 0,
    stuckJobs: 0,
    failedJobs: 0,
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
    cronSecretConfigured: Boolean(process.env.AIOW_CRON_SECRET || process.env.CRON_SECRET),
    storageMode,
    nextAction: storageMode === "supabase" ? "Geen directe actie nodig." : "Supabase storage ontbreekt, follow-up queue kan lokaal niet worden bewaakt.",
  };
}

function emptySummary() {
  return { pending: 0, sent: 0, skipped: 0, failed: 0 };
}

function defaultSubject(jobType: string): string {
  if (jobType === "spunky_review_followup") return "Spunky review follow-up";
  if (jobType === "admin_decision_followup") return "AIOW review update";
  return "AIOW persoonlijke opvolging";
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function encodeFilterValue(value: string): string {
  return `"${value.replace(/"/g, "")}"`;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "[redacted]";
  return `${name.slice(0, 2)}***@${domain}`;
}
