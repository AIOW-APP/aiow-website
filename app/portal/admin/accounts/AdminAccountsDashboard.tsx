"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "../../AiowPortal.module.css";

type Account = {
  accountId: string;
  createdAt: string;
  status: string;
  companyName: string;
  legalName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  projectName: string;
  projectType: string;
  moduleInterests: string[];
  addOns: string[];
  aiowRevenueSharePercent: number;
  analysisReadinessScore: number;
  analysis?: {
    successProbabilityScore: number;
    uniquenessScore: number;
    ventureFitScore?: number;
    scorecard?: {
      founderScore: number;
      marketScore: number;
      executionScore: number;
      aiOpportunityScore: number;
      investmentScore: number;
    };
    verdict: string;
    recommendedRevenueSharePercent: number;
    recommendedResaleSharePercent: number;
    firstSprintRecommendation?: string;
    risks?: string[];
    requiredProof?: string[];
    requiredCustomerProof?: string[];
  };
  paymentState: string;
  productionBoundary: string;
  customerNextSteps: string[];
  aiowNextSteps: string[];
  onboardingId?: string;
};

type MemoryEvent = {
  id: string;
  role: string;
  type: string;
  content: string;
  createdAt: string;
  retention: string;
  hasCanvas: boolean;
};

type VentureCanvas = {
  project: string;
  founder: string;
  problem: string;
  solution: string;
  businessModel: string;
  audience: string;
  aiOpportunities: string;
  risk: string;
  automation: string;
  growth: string;
  collaboration: string;
  confidence: number;
  marketScore: number;
  riskScore: number;
  aiScore: number;
  automationScore: number;
  memoryEventCount: number;
  lastUpdatedAt: string;
};

type VentureDealCard = {
  title?: string;
  founder?: string;
  company?: string;
  problem?: string;
  opportunity?: string;
  likelyRoute?: string;
  missing?: string[];
  nextStep?: string;
  confidence?: number;
  memoryEventCount?: number;
  updatedAt?: string;
};

type WorkspaceCardSummary = {
  title: string;
  status: "answered" | "requested" | "missing";
  lastAnsweredAt?: string;
  lastRequestedAt?: string;
  prompt?: string;
  answer?: string;
  requestedQuestion?: string;
  nextAction: string;
  owner: string;
};

type VentureMemoryDetails = {
  storageMode: string;
  memorySessionId: string;
  canvas: VentureCanvas | null;
  dealCard: VentureDealCard | null;
  workspaceSummary?: WorkspaceCardSummary[];
  workspaceCompleteness?: number;
  events: MemoryEvent[];
  message?: string;
};

type CustomerFollowUpDraft = {
  to: string;
  subject: string;
  body: string;
  nextAction: string;
};

type SpunkyReviewAdvice = {
  verdict: "GO" | "CONDITIONAL_GO" | "ADJUST_DEAL" | "NO_GO";
  confidence: number;
  readinessScore: number;
  dealStrength: number;
  automationValue: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  why: string[];
  missingProof: string[];
  risks: string[];
  recommendedFirstSprint: string;
  nextBestQuestions: { cardTitle: string; question: string; whyThisQuestion: string; expectedImpact: string; nextCardState: string; automationLevel: string }[];
  customerEmailDraft: { subject: string; body: string };
  adminActions: string[];
  automationNotes: string[];
};

type SpunkyHandoffPackage = {
  status: string;
  groupName: string;
  accountId: string;
  contractId: string;
  customerIntro: string;
  internalSpunkyBriefing: string;
  kickoffChecklist: string[];
  boundaries: string[];
};

type ProofEvent = {
  eventId: string;
  createdAt: string;
  accountId: string;
  type: string;
  actorEmail: string;
  summary: string;
  payload?: Record<string, unknown>;
};


type FollowUpQueueItem = {
  jobId: string;
  jobType: string;
  status: string;
  attempts: number;
  scheduledFor: string;
  updatedAt?: string | null;
  lastError?: string | null;
  subject: string;
  decision?: string;
  accountId?: string;
  lead: { id: string; email: string; name?: string; company?: string; status?: string } | null;
  send: { status: string; provider?: string; providerMessageId?: string; createdAt?: string } | null;
};

type FollowUpQueueSummary = { pending: number; sent: number; skipped: number; failed: number };
type FollowUpQueueHealth = {
  status: "healthy" | "needs_attention" | string;
  dueJobs: number;
  stuckJobs: number;
  failedJobs: number;
  resendConfigured: boolean;
  cronSecretConfigured: boolean;
  storageMode: string;
  nextAction: string;
};

type FollowUpQueueState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; queue: FollowUpQueueItem[]; summary: FollowUpQueueSummary; health?: FollowUpQueueHealth; message?: string; storageMode?: string }
  | { status: "error"; message: string };

type CustomerPortalPreview = {
  label: string;
  headline: string;
  detail: string;
  primaryAction: string;
  stage: number;
};

const customerPortalStages = ["Intake", "Review", "Contract", "Signed", "Spunky room", "Build sprint"] as const;

function customerPortalPreview(status: string): CustomerPortalPreview {
  if (status === "READY_FOR_SCOPE_REVIEW") return {
    label: "Review aangevraagd",
    headline: "Team Richard beoordeelt je Deal Card.",
    detail: "AIOW kijkt nu naar scope, bewijs, dealfit, risico's en eerste proof sprint. Productie start nog niet.",
    primaryAction: "Wacht op besluit of lever ontbrekend bewijs aan.",
    stage: 2,
  };
  if (status.startsWith("ADMIN_DECISION_")) return {
    label: "AIOW besluit genomen",
    headline: "Je aanvraag is beoordeeld.",
    detail: "Team Richard heeft een route gekozen. Als de case doorgaat volgt contract, extra vragen of aangepaste scope.",
    primaryAction: "Bekijk de volgende stappen en reageer op ontbrekende informatie.",
    stage: 2,
  };
  if (status === "CONTRACT_DRAFTED" || status === "CONTRACT_SENT") return {
    label: "Contractfase",
    headline: "AIOW voorstel en voorwaarden staan centraal.",
    detail: "Controleer scope, commerciële basis, verantwoordelijkheden en voorwaarden voordat je tekent.",
    primaryAction: "Onderteken alleen als scope en afspraken kloppen.",
    stage: 3,
  };
  if (status === "SIGNED") return {
    label: "Akkoord getekend",
    headline: "De AIOW operating setup wordt voorbereid.",
    detail: "Na signing bereidt Team Richard de private projectruimte voor met Spunky als contextcollector.",
    primaryAction: "Wacht op de private projectgroep en verzamel alvast databronnen, KPI en beslisser.",
    stage: 4,
  };
  if (status === "SPUNKY_HANDOFF_READY") return {
    label: "Spunky handoff ready",
    headline: "Je projectgroep staat klaar om voorbereid te worden.",
    detail: "Team Richard maakt de Telegram intro, interne Spunky briefing en kickoff checklist klaar.",
    primaryAction: "Bereid je eerste workflow, databronnen en praktische beperkingen voor.",
    stage: 5,
  };
  if (status === "SPUNKY_PROJECT_GROUP_PREPARED") return {
    label: "Projectgroep voorbereid",
    headline: "De private AIOW projectruimte is voorbereid.",
    detail: "Spunky helpt met context verzamelen en vragen structureren. Team Richard bewaakt scope, planning, privacy, prijs en livegang.",
    primaryAction: "Gebruik de projectgroep voor context, vragen en bewijs. Geen livegang zonder Team Richard akkoord.",
    stage: 5,
  };
  return {
    label: "Intake actief",
    headline: "Maak je AIOW Deal Card sterker.",
    detail: "Vul context aan zodat AIOW kan beoordelen of samenwerking, proof sprint of build logisch is.",
    primaryAction: "Vul de guided intake aan en vraag daarna review aan.",
    stage: 1,
  };
}

type AdminState =
  | { status: "locked" }
  | { status: "loading" }
  | { status: "loaded"; accounts: Account[] }
  | { status: "error"; message: string };

type Decision = "GO" | "CONDITIONAL_GO" | "ADJUST_DEAL" | "NO_GO";

const pipelineStages = [
  "Intake",
  "AI Deal Card",
  "Decision",
  "Contract",
  "Signed",
  "Spunky group",
  "Build sprint",
] as const;

export function AdminAccountsDashboard() {
  const [token, setToken] = useState("");
  const [adminEmail, setAdminEmail] = useState("richard@aiow.io");
  const [state, setState] = useState<AdminState>({ status: "locked" });

  useEffect(() => {
    const stored = localStorage.getItem("aiow:adminToken");
    const storedEmail = localStorage.getItem("aiow:adminEmail");
    if (stored) setToken(stored);
    if (storedEmail) setAdminEmail(storedEmail);
  }, []);

  async function loadAccounts(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/customer-accounts", { headers: { "x-aiow-admin-token": token, "x-aiow-admin-email": adminEmail } });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Admin-overzicht kon niet laden.");
      localStorage.setItem("aiow:adminToken", token);
      localStorage.setItem("aiow:adminEmail", adminEmail);
      setState({ status: "loaded", accounts: data.accounts });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <div className={styles.shell}>
      <form onSubmit={loadAccounts} className={styles.stepCard}>
        <div className={styles.aiGuide}>
          <div className={styles.aiAvatar}>AI</div>
          <div>
            <strong>Open het AIOW command center.</strong>
            <p>Hier zie je niet “een dashboard”, maar de beslisrail: welke klant is klaar voor beoordeling, welke bewijzen ontbreken en wanneer Spunky een projectgroep moet oppakken.</p>
          </div>
        </div>
        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Admin</span>
            <select value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} className={styles.select}>
              <option value="richard@aiow.io">Richard@aiow.io, owner admin</option>
              <option value="jeroen@aiow.io">Jeroen@aiow.io, admin</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Admin token</span>
            <input value={token} onChange={(event) => setToken(event.target.value)} required placeholder="AIOW_ADMIN_TOKEN" className={styles.input} />
          </label>
        </div>
        <div className={styles.actions}>
          <p className={styles.muted}>Preview: <span className={styles.accountCode}>AIOW_ADMIN_LOCAL_PREVIEW</span>. Productie vraagt echte auth/RBAC/audit.</p>
          <button type="submit" disabled={state.status === "loading"} className={styles.primaryButton}>{state.status === "loading" ? "Laden..." : "Open command center"}</button>
        </div>
      </form>

      {state.status === "error" && <div className={styles.error}>{state.message}</div>}
      {state.status === "loaded" && <ClientCommandCenter accounts={state.accounts} adminEmail={adminEmail} adminToken={token} />}
      {state.status === "locked" && <p className={styles.notice}>Gebruik lokaal voor preview: <span className={styles.accountCode}>AIOW_ADMIN_LOCAL_PREVIEW</span>. In productie vervangen door echte auth/RBAC/audit.</p>}
    </div>
  );
}

function ClientCommandCenter({ accounts, adminEmail, adminToken }: { accounts: Account[]; adminEmail: string; adminToken: string }) {
  const [followUpState, setFollowUpState] = useState<FollowUpQueueState>({ status: "idle" });

  const loadFollowUps = useCallback(async () => {
    setFollowUpState({ status: "loading" });
    try {
      const params = new URLSearchParams({ adminEmail, adminToken, limit: "24" });
      const response = await fetch(`/api/admin/followups?${params.toString()}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Follow-up queue kon niet laden.");
      setFollowUpState({ status: "loaded", queue: data.queue || [], summary: data.summary || { pending: 0, sent: 0, skipped: 0, failed: 0 }, health: data.health, message: data.message, storageMode: data.storageMode });
    } catch (error) {
      setFollowUpState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }, [adminEmail, adminToken]);

  useEffect(() => {
    void loadFollowUps();
  }, [loadFollowUps]);

  const reviewQueue = useMemo(() => accounts.filter((account) => account.status === "READY_FOR_SCOPE_REVIEW"), [accounts]);
  const handoffQueue = useMemo(() => accounts.filter((account) => account.status === "SPUNKY_HANDOFF_READY" || account.status === "SIGNED"), [accounts]);
  const sortedAccounts = useMemo(() => [...accounts].sort((a, b) => {
    const rank = (account: Account) => account.status === "SPUNKY_HANDOFF_READY" || account.status === "SIGNED" ? 0 : account.status === "READY_FOR_SCOPE_REVIEW" ? 1 : account.status === "INTAKE_ACCOUNT_CREATED" ? 2 : account.status === "SPUNKY_PROJECT_GROUP_PREPARED" ? 3 : 4;
    return rank(a) - rank(b) || (b.analysisReadinessScore || 0) - (a.analysisReadinessScore || 0);
  }), [accounts]);
  const stats = useMemo(() => {
    const total = accounts.length;
    const ready = accounts.filter((account) => (account.analysisReadinessScore || 0) >= 70).length;
    const highUpside = accounts.filter((account) => (account.analysis?.successProbabilityScore || 0) >= 70 || (account.analysis?.recommendedRevenueSharePercent || 0) > 10).length;
    const needsDecision = accounts.filter((account) => account.status === "READY_FOR_SCOPE_REVIEW").length;
    const spunkyReady = accounts.filter((account) => account.status === "SPUNKY_HANDOFF_READY" || account.status === "SIGNED").length;
    const customerMismatchRisk = accounts.filter((account) => account.status === "SIGNED" || account.status === "SPUNKY_HANDOFF_READY" || account.status === "SPUNKY_PROJECT_GROUP_PREPARED").length;
    const averageShare = total ? Math.round((accounts.reduce((sum, account) => sum + (account.analysis?.recommendedRevenueSharePercent || account.aiowRevenueSharePercent || 10), 0) / total) * 10) / 10 : 0;
    return { total, ready, highUpside, needsDecision, spunkyReady, customerMismatchRisk, averageShare };
  }, [accounts]);

  return (
    <div className={styles.stepLayout}>
      <section className={styles.commandHero} id="pipeline">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={styles.eyebrow}>AIOW Client Command Center V1</p>
            <h2>Van aanvraag naar bewijs en build sprint.</h2>
          </div>
          <div className={styles.sideCard}>
            Source-of-truth voor Richard/Jeroen: pipeline, scores, dealadvies, risico’s, contractstatus en eerstvolgende beslissing.
          </div>
        </div>
        <div className={styles.statGrid}>
          <CommandStat label="Accounts" value={String(stats.total)} tone="cyan" />
          <CommandStat label="Analyse-ready" value={String(stats.ready)} tone="emerald" />
          <CommandStat label="Upside kansen" value={String(stats.highUpside)} tone="pink" />
          <CommandStat label="Review queue" value={String(stats.needsDecision)} tone="amber" />
          <CommandStat label="Spunky ready" value={String(stats.spunkyReady)} tone="emerald" />
          <CommandStat label="Klantstatus check" value={String(stats.customerMismatchRisk)} tone="white" />
          <CommandStat label="Gem. upside" value={stats.averageShare ? `${stats.averageShare}%` : "n.t.b."} tone="white" />
        </div>
      </section>

      <AdminFollowUpQueuePanel state={followUpState} onRefresh={loadFollowUps} />

      {reviewQueue.length > 0 && (
        <section className={`${styles.panel} ${styles.notice}`}>
          <p className={styles.cardLabel}>Nieuwe review-aanvragen</p>
          <strong>{reviewQueue.length} Deal Card{reviewQueue.length === 1 ? "" : "s"} klaar voor Team Richard</strong>
          <p className={styles.cardDetail}>Deze aanvragen staan bovenaan de lijst. Open de Deal Card, kies Go, Conditional Go, Adjust Deal of No Go en genereer daarna contract/advies als de case sterk genoeg is.</p>
        </section>
      )}

      {handoffQueue.length > 0 && (
        <section className={`${styles.panel} ${styles.notice}`}>
          <p className={styles.cardLabel}>Spunky handoff queue</p>
          <strong>{handoffQueue.length} account{handoffQueue.length === 1 ? "" : "s"} klaar voor projectgroep</strong>
          <p className={styles.cardDetail}>Deze accounts zijn signed of handoff-ready. Maak de Telegram intro en interne Spunky briefing klaar voordat de build sprint start.</p>
        </section>
      )}

      <section className={styles.panel}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className={styles.cardLabel}>Pipeline</p>
            <h3 className="text-xl font-semibold tracking-[-0.035em] text-white">Operating flow</h3>
          </div>
          <span className={styles.badge}>Spunky na signing</span>
        </div>
        <div className={styles.pipeline}>
          {pipelineStages.map((stage, index) => (
            <div key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage}</strong>
            </div>
          ))}
        </div>
      </section>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-sm text-white/55">Nog geen klantaccounts in lokale preview-store.</div>
      ) : (
        <div className="grid gap-4">
          {sortedAccounts.map((account) => <DealCard key={account.accountId} account={account} adminEmail={adminEmail} adminToken={adminToken} />)}
        </div>
      )}
    </div>
  );
}

function AdminFollowUpQueuePanel({ state, onRefresh }: { state: FollowUpQueueState; onRefresh: () => void }) {
  const summary = state.status === "loaded" ? state.summary : { pending: 0, sent: 0, skipped: 0, failed: 0 };
  const queue = state.status === "loaded" ? state.queue : [];
  const health = state.status === "loaded" ? state.health : undefined;
  return (
    <section className={styles.panel}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className={styles.cardLabel}>AI follow-up queue</p>
          <h3 className="text-xl font-semibold tracking-[-0.035em] text-white">Spunky opvolging onder controle.</h3>
          <p className="mt-1 text-sm leading-6 text-white/60">Bekijk welke persoonlijke AI-follow-ups klaarstaan, verzonden zijn, geskipt zijn of actie nodig hebben. Admin blijft Nederlands, klantmail volgt de klantcontext.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={state.status === "loading"} className="rounded-full border border-cyan-200/25 px-3 py-1 text-xs font-semibold text-cyan-50 disabled:opacity-50">{state.status === "loading" ? "Laden..." : "Ververs queue"}</button>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <QueueStat label="Pending" value={summary.pending} tone="amber" />
        <QueueStat label="Sent" value={summary.sent} tone="emerald" />
        <QueueStat label="Skipped" value={summary.skipped} tone="white" />
        <QueueStat label="Failed" value={summary.failed} tone="pink" />
      </div>
      {health && (
        <div className={`mt-3 rounded-2xl border p-3 ${health.status === "healthy" ? "border-emerald-200/20 bg-emerald-300/[0.06]" : "border-amber-200/20 bg-amber-300/[0.07]"}`}>
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/45">Cron health</p>
              <strong className="mt-1 block text-sm text-white">{health.status === "healthy" ? "Gezond" : "Aandacht nodig"}</strong>
              <p className="mt-1 text-xs leading-5 text-white/62">{health.nextAction}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/58 md:min-w-[360px]">
              <span>Due: <b className="text-white">{health.dueJobs}</b></span>
              <span>Stuck: <b className="text-white">{health.stuckJobs}</b></span>
              <span>Resend: <b className={health.resendConfigured ? "text-emerald-100" : "text-amber-100"}>{health.resendConfigured ? "aan" : "uit"}</b></span>
              <span>Cron secret: <b className={health.cronSecretConfigured ? "text-emerald-100" : "text-amber-100"}>{health.cronSecretConfigured ? "aan" : "uit"}</b></span>
            </div>
          </div>
        </div>
      )}
      {state.status === "error" && <p className="mt-3 rounded-xl border border-red-200/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{state.message}</p>}
      {state.status === "loaded" && state.message && <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/55">{state.message}</p>}
      {state.status === "loaded" && queue.length === 0 && !state.message && <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/55">Geen follow-up jobs gevonden.</p>}
      {queue.length > 0 && (
        <div className="mt-4 grid gap-2">
          {queue.slice(0, 8).map((item) => (
            <article key={item.jobId} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] ${queueStatusClass(item.status)}`}>{item.status}</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/50">{humanJobType(item.jobType)}</span>
                    {item.decision && <span className="rounded-full border border-cyan-200/20 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-cyan-50/75">{item.decision}</span>}
                  </div>
                  <strong className="mt-2 block truncate text-sm text-white">{item.subject}</strong>
                  <p className="mt-1 text-xs text-white/55">{item.lead?.company || item.lead?.name || "Onbekende lead"} · {item.lead?.email || "geen lead"}</p>
                </div>
                <div className="text-left text-xs leading-5 text-white/45 md:text-right">
                  <p>Gepland: {formatDateTime(item.scheduledFor)}</p>
                  <p>Pogingen: {item.attempts}</p>
                  {item.send?.status && <p>Send: {item.send.status}</p>}
                </div>
              </div>
              {item.lastError && <p className="mt-2 rounded-xl border border-red-200/20 bg-red-300/[0.06] p-2 text-xs text-red-50/80">{item.lastError}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function QueueStat({ label, value, tone }: { label: string; value: number; tone: "amber" | "emerald" | "pink" | "white" }) {
  const toneClass = {
    amber: "border-amber-300/15 bg-amber-300/[0.08] text-amber-100",
    emerald: "border-emerald-300/15 bg-emerald-300/[0.08] text-emerald-100",
    pink: "border-pink-300/15 bg-pink-300/[0.08] text-pink-100",
    white: "border-white/10 bg-white/[0.055] text-white",
  }[tone];
  return <div className={`rounded-2xl border p-3 ${toneClass}`}><p className="text-[0.62rem] uppercase tracking-[0.16em] opacity-65">{label}</p><strong className="mt-1 block text-2xl tracking-[-0.05em]">{value}</strong></div>;
}

function queueStatusClass(status: string): string {
  if (status === "sent") return "border-emerald-200/25 text-emerald-50 bg-emerald-300/[0.08]";
  if (status === "failed") return "border-red-200/25 text-red-50 bg-red-300/[0.08]";
  if (status === "skipped") return "border-white/10 text-white/55 bg-white/[0.04]";
  return "border-amber-200/25 text-amber-50 bg-amber-300/[0.08]";
}

function humanJobType(jobType: string): string {
  if (jobType === "spunky_review_followup") return "Spunky review";
  if (jobType === "admin_decision_followup") return "Admin besluit";
  return "Next-day";
}

function formatDateTime(value: string): string {
  if (!value) return "n.t.b.";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" });
}

function DealCard({ account, adminEmail, adminToken }: { account: Account; adminEmail: string; adminToken: string }) {
  const [contractState, setContractState] = useState<{ status: "idle" } | { status: "loading" } | { status: "created"; signUrl: string; contractId: string } | { status: "error"; message: string }>({ status: "idle" });
  const [decisionState, setDecisionState] = useState<{ status: "idle" } | { status: "saving" } | { status: "saved"; bridgeMessage: string; followUpDraft?: CustomerFollowUpDraft; accountStatus?: string } | { status: "error"; message: string }>({ status: "idle" });
  const [handoffState, setHandoffState] = useState<{ status: "idle" } | { status: "loading" } | { status: "ready"; handoff: SpunkyHandoffPackage; accountStatus?: string } | { status: "error"; message: string }>({ status: "idle" });
  const [proofState, setProofState] = useState<{ status: "idle" } | { status: "loading" } | { status: "loaded"; events: ProofEvent[] } | { status: "error"; message: string }>({ status: "idle" });
  const [memoryState, setMemoryState] = useState<{ status: "idle" } | { status: "loading" } | { status: "loaded"; details: VentureMemoryDetails } | { status: "error"; message: string }>({ status: "idle" });
  const [localStatus, setLocalStatus] = useState(account.status);
  const [decision, setDecision] = useState<Decision>((account.analysis?.verdict as Decision) || "CONDITIONAL_GO");
  const [decisionNote, setDecisionNote] = useState("");

  const loadVentureMemory = useCallback(async () => {
    setMemoryState({ status: "loading" });
    try {
      const params = new URLSearchParams({ accountId: account.accountId, adminEmail, adminToken, limit: "40" });
      const response = await fetch(`/api/admin/venture-memory?${params.toString()}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Venture Memory kon niet laden.");
      setMemoryState({ status: "loaded", details: data });
    } catch (error) {
      setMemoryState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }, [account.accountId, adminEmail, adminToken]);

  async function recordDecision(nextDecision: Decision) {
    setDecision(nextDecision);
    setDecisionState({ status: "saving" });
    try {
      const response = await fetch("/api/admin/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminToken, accountId: account.accountId, decision: nextDecision, note: decisionNote, spunkyHandoff: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Besluit kon niet worden vastgelegd.");
      setLocalStatus(data.accountStatus || data.account?.status || localStatus);
      setDecisionState({
        status: "saved",
        bridgeMessage: data.spunkyBridge?.message || "Spunky handoff klaar.",
        followUpDraft: data.followUpDraft,
        accountStatus: data.accountStatus || data.account?.status,
      });
      void loadProofLog();
    } catch (error) {
      setDecisionState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  async function createContract() {
    setContractState({ status: "loading" });
    try {
      const response = await fetch("/api/admin/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminToken, accountId: account.accountId, action: "draft" }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Contract kon niet worden gemaakt.");
      if (data.accountStatus || data.account?.status) setLocalStatus(data.accountStatus || data.account.status);
      setContractState({ status: "created", signUrl: data.signUrl, contractId: data.contract.contractId });
      void loadProofLog();
    } catch (error) {
      setContractState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  async function prepareSpunkyHandoff() {
    setHandoffState({ status: "loading" });
    try {
      const response = await fetch("/api/admin/spunky-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminToken, accountId: account.accountId, markPrepared: true }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Spunky handoff kon niet worden voorbereid.");
      if (data.accountStatus || data.account?.status) setLocalStatus(data.accountStatus || data.account.status);
      setHandoffState({ status: "ready", handoff: data.handoff, accountStatus: data.accountStatus || data.account?.status });
      void loadProofLog();
    } catch (error) {
      setHandoffState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  async function loadProofLog() {
    setProofState({ status: "loading" });
    try {
      const params = new URLSearchParams({ accountId: account.accountId, adminEmail, adminToken });
      const response = await fetch(`/api/admin/decisions?${params.toString()}`);
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Proof log kon niet laden.");
      setProofState({ status: "loaded", events: Array.isArray(data.events) ? data.events : [] });
    } catch (error) {
      setProofState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  useEffect(() => {
    if (localStatus === "READY_FOR_SCOPE_REVIEW" && memoryState.status === "idle") {
      void loadVentureMemory();
    }
  }, [localStatus, memoryState.status, loadVentureMemory]);

  const success = account.analysis?.successProbabilityScore ?? 0;
  const uniqueness = account.analysis?.uniquenessScore ?? 0;
  const scorecard = account.analysis?.scorecard || {
    founderScore: success,
    marketScore: Math.round((success + uniqueness) / 2),
    executionScore: account.analysisReadinessScore || 0,
    aiOpportunityScore: uniqueness,
    investmentScore: account.analysis?.ventureFitScore ?? Math.round((success + uniqueness + (account.analysisReadinessScore || 0)) / 3),
  };
  const ventureFit = account.analysis?.ventureFitScore ?? Math.round((scorecard.founderScore * 0.18) + (scorecard.marketScore * 0.2) + (scorecard.executionScore * 0.2) + (scorecard.aiOpportunityScore * 0.22) + (scorecard.investmentScore * 0.2));
  const revenueShare = account.analysis?.recommendedRevenueSharePercent || account.aiowRevenueSharePercent || 10;
  const resaleShare = account.analysis?.recommendedResaleSharePercent || 10;
  const risks = account.analysis?.risks?.length ? account.analysis.risks : ["Scope, tekenbevoegdheid en commerciële basis eerst bevestigen.", "Bewijs voor eerste sprint meetbaar maken voordat grotere upside wordt beloofd."];
  const proofItems = account.analysis?.requiredCustomerProof?.length ? account.analysis.requiredCustomerProof : account.analysis?.requiredProof;
  const proof = proofItems?.length ? proofItems : ["Founder/bedrijf bewijs", "Klantvraag of kanaal", "Eerste KPI voor proof sprint"];
  const portalPreview = customerPortalPreview(localStatus);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.025))] shadow-2xl shadow-black/20">
      <div className="grid gap-5 p-4 2xl:grid-cols-[1fr_.9fr_.78fr] lg:p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-100">{localStatus || "INTAKE"}</span>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/55">{account.projectType || "Venture"}</span>
          </div>
          <h3 className="mt-4 text-2xl font-semibold leading-none tracking-[-0.05em] text-white md:text-3xl">{account.companyName || account.projectName || "Nieuwe AIOW kans"}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55">{account.legalName || "Geen juridische naam"} · {account.contactName || "Geen contactnaam"} · {account.contactEmail || "Geen e-mail"}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <Score label="Founder" value={scorecard.founderScore} />
            <Score label="Market" value={scorecard.marketScore} />
            <Score label="Execution" value={scorecard.executionScore} />
            <Score label="AI opp." value={scorecard.aiOpportunityScore} />
            <Score label="Invest" value={scorecard.investmentScore} />
          </div>
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/52">Legacy rollup: success {success}% · uniekheid {uniqueness}% · venture fit {ventureFit}%.</div>
          <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4 text-sm leading-6 text-cyan-50/85">
            <strong>Dealadvies:</strong> {decision}. Advies: {revenueShare}% omzet/share · {resaleShare}% doorverkoop. Route: Deal Card → contract → Telegram groep met Spunky → AIOW build context.
          </div>
          <CustomerPortalPreviewBox preview={portalPreview} accountId={account.accountId} />
        </div>

        <div className="grid gap-3">
          <MiniPanel title="Eerste sprint" value={account.analysis?.firstSprintRecommendation || "Proof sprint: scherpste usecase, eerste AI/software-flow en meetbaar KPI-dashboard."} />
          <MiniList title="Risico’s" items={risks.slice(0, 3)} tone="amber" />
          <MiniList title="Benodigd bewijs" items={proof.slice(0, 3)} tone="emerald" />
        </div>

        <div className="grid content-start gap-3 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Decision rail</p>
          <div className="grid grid-cols-2 gap-2">
            {(["GO", "CONDITIONAL_GO", "ADJUST_DEAL", "NO_GO"] as Decision[]).map((item) => (
              <button key={item} type="button" onClick={() => recordDecision(item)} className={`rounded-full border px-3 py-2 text-[0.68rem] font-bold transition ${decision === item ? "border-cyan-200 bg-cyan-200 text-black" : "border-white/10 bg-white/[0.035] text-white/65 hover:border-cyan-200/40"}`}>{item.replace("_", " ")}</button>
            ))}
          </div>
          <textarea value={decisionNote} onChange={(event) => setDecisionNote(event.target.value)} placeholder="Besluitnotitie voor bewijslog / Spunky handoff" className="min-h-20 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs leading-5 text-white outline-none placeholder:text-white/30 focus:border-cyan-300/50" />
          {decisionState.status === "saving" && <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.07] p-3 text-xs text-cyan-50">Besluit wordt vastgelegd...</p>}
          {decisionState.status === "saved" && (
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/[0.08] p-3 text-xs leading-5 text-emerald-50">
              <strong>Besluit vastgelegd.</strong>
              {decisionState.accountStatus && <p className="mt-1 text-emerald-50/75">Nieuwe accountstatus: {decisionState.accountStatus}</p>}
              <button type="button" onClick={() => navigator.clipboard?.writeText(decisionState.bridgeMessage)} className="mt-2 block rounded-full border border-emerald-200/25 px-3 py-1 text-emerald-50">Kopieer Spunky briefing</button>
              {decisionState.followUpDraft && (
                <button type="button" onClick={() => navigator.clipboard?.writeText(`Aan: ${decisionState.followUpDraft?.to}\nOnderwerp: ${decisionState.followUpDraft?.subject}\n\n${decisionState.followUpDraft?.body}`)} className="mt-2 block rounded-full border border-emerald-200/25 px-3 py-1 text-emerald-50">Kopieer klantmail</button>
              )}
              {decisionState.followUpDraft && <p className="mt-2 text-emerald-50/70">Volgende actie: {decisionState.followUpDraft.nextAction}</p>}
            </div>
          )}
          {decisionState.status === "error" && <p className="rounded-xl border border-red-300/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{decisionState.message}</p>}
          <button type="button" onClick={loadVentureMemory} disabled={memoryState.status === "loading"} className="rounded-full border border-cyan-200/30 bg-cyan-200/[0.08] px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:border-cyan-200/60 disabled:opacity-60">{memoryState.status === "loading" ? "Laden..." : "Laad Venture Memory"}</button>
          <button type="button" onClick={loadProofLog} disabled={proofState.status === "loading"} className="rounded-full border border-emerald-200/30 bg-emerald-200/[0.08] px-4 py-2 text-xs font-semibold text-emerald-50 transition hover:border-emerald-200/60 disabled:opacity-60">{proofState.status === "loading" ? "Laden..." : "Toon proof log"}</button>
          <a className="rounded-full border border-white/10 px-4 py-2 text-center text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/50" href={`/portal/customer/${account.accountId}`}>Open klantportaal</a>
          <button type="button" onClick={createContract} disabled={contractState.status === "loading"} className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-semibold text-black transition hover:bg-white disabled:opacity-60">{contractState.status === "loading" ? "Maken..." : "Maak contract + advies"}</button>
          {(localStatus === "SPUNKY_HANDOFF_READY" || localStatus === "SIGNED") && (
            <button type="button" onClick={prepareSpunkyHandoff} disabled={handoffState.status === "loading"} className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-semibold text-black transition hover:bg-white disabled:opacity-60">{handoffState.status === "loading" ? "Voorbereiden..." : "Maak Spunky projectgroep klaar"}</button>
          )}
          <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs leading-5 text-amber-50/85">
            <strong>{account.paymentState || "TERMS_REQUIRED"}</strong>
            <p className="mt-1">Na signing: projectgroep + Spunky contextcollector activeren.</p>
            <p className="mt-2 font-mono text-amber-100/80">{account.accountId}</p>
          </div>
          {contractState.status === "created" && (
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/[0.08] p-3 text-xs leading-5 text-emerald-50">
              <strong>Contract klaar:</strong> {contractState.contractId}
              <a className="mt-2 block break-all text-cyan-100 underline" href={contractState.signUrl}>Open/doorsturen: {contractState.signUrl}</a>
            </div>
          )}
          {handoffState.status === "ready" && (
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/[0.08] p-3 text-xs leading-5 text-emerald-50">
              <strong>Spunky projectgroep klaar:</strong> {handoffState.handoff.groupName}
              {handoffState.accountStatus && <p className="mt-1 text-emerald-50/75">Nieuwe accountstatus: {handoffState.accountStatus}</p>}
              <button type="button" onClick={() => navigator.clipboard?.writeText(handoffState.handoff.customerIntro)} className="mt-2 block rounded-full border border-emerald-200/25 px-3 py-1 text-emerald-50">Kopieer klantintro</button>
              <button type="button" onClick={() => navigator.clipboard?.writeText(handoffState.handoff.internalSpunkyBriefing)} className="mt-2 block rounded-full border border-emerald-200/25 px-3 py-1 text-emerald-50">Kopieer interne Spunky briefing</button>
              <button type="button" onClick={() => navigator.clipboard?.writeText(handoffState.handoff.kickoffChecklist.map((item, index) => `${index + 1}. ${item}`).join("\n"))} className="mt-2 block rounded-full border border-emerald-200/25 px-3 py-1 text-emerald-50">Kopieer checklist</button>
            </div>
          )}
          {proofState.status === "loaded" && <ProofLogPanel events={proofState.events} account={account} />}
          {proofState.status === "error" && <p className="rounded-xl border border-red-300/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{proofState.message}</p>}
          {handoffState.status === "error" && <p className="rounded-xl border border-red-300/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{handoffState.message}</p>}
          {memoryState.status === "error" && <p className="rounded-xl border border-red-300/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{memoryState.message}</p>}
          {contractState.status === "error" && <p className="rounded-xl border border-red-300/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{contractState.message}</p>}
        </div>
      </div>
      {memoryState.status === "loaded" && <VentureMemoryReview details={memoryState.details} account={account} adminEmail={adminEmail} adminToken={adminToken} onRefresh={loadVentureMemory} />}
    </article>
  );
}

function ProofLogPanel({ events, account }: { events: ProofEvent[]; account: Account }) {
  const latest = events[0];
  const exportText = buildProofExport(account, events);
  return (
    <div className="rounded-xl border border-emerald-300/25 bg-emerald-300/[0.07] p-3 text-xs leading-5 text-emerald-50">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <strong>Proof log</strong>
          <p className="mt-1 text-emerald-50/70">{events.length ? `${events.length} event${events.length === 1 ? "" : "s"} vastgelegd.` : "Nog geen proof events voor dit account."}</p>
        </div>
        <button type="button" onClick={() => navigator.clipboard?.writeText(exportText)} className="rounded-full border border-emerald-200/25 px-3 py-1 text-emerald-50">Kopieer proof export</button>
      </div>
      {latest && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-emerald-100/70">Laatste systeemactie</p>
          <strong className="mt-1 block text-white">{humanProofEventType(latest.type)}</strong>
          <p className="mt-1 text-emerald-50/70">{latest.summary}</p>
          <p className="mt-1 font-mono text-[0.66rem] text-emerald-50/45">{new Date(latest.createdAt).toLocaleString("nl-NL")} · {latest.actorEmail}</p>
        </div>
      )}
      {events.length > 0 && (
        <div className="mt-3 grid max-h-72 gap-2 overflow-auto pr-1">
          {events.slice(0, 8).map((event) => (
            <div key={event.eventId} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-emerald-200/20 bg-emerald-300/[0.08] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-emerald-50">{humanProofEventType(event.type)}</span>
                <span className="font-mono text-[0.62rem] text-white/40">{new Date(event.createdAt).toLocaleString("nl-NL")}</span>
              </div>
              <p className="mt-2 text-emerald-50/74">{event.summary}</p>
              <p className="mt-1 text-[0.66rem] text-white/42">Actor: {event.actorEmail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function buildProofExport(account: Account, events: ProofEvent[]): string {
  const lines = [
    `AIOW proof log: ${account.companyName}`,
    `Account: ${account.accountId}`,
    `Status: ${account.status}`,
    `Project: ${account.projectName || "n.t.b."}`,
    "",
    ...events.slice(0, 12).map((event, index) => [
      `${index + 1}. ${humanProofEventType(event.type)}`,
      `   Tijd: ${new Date(event.createdAt).toLocaleString("nl-NL")}`,
      `   Actor: ${event.actorEmail}`,
      `   Summary: ${event.summary}`,
    ].join("\n")),
  ];
  return lines.join("\n");
}

function humanProofEventType(type: string): string {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\w/g, (char) => char.toUpperCase());
}

function CustomerPortalPreviewBox({ preview, accountId }: { preview: CustomerPortalPreview; accountId: string }) {
  const safeStage = Math.max(1, Math.min(preview.stage, customerPortalStages.length));
  return (
    <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4 text-sm leading-6 text-emerald-50/85">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-emerald-100/70">Wat klant ziet</p>
          <strong className="mt-1 block text-white">{preview.headline}</strong>
        </div>
        <a className="rounded-full border border-emerald-200/25 px-3 py-1 text-xs font-semibold text-emerald-50" href={`/portal/customer/${accountId}`} target="_blank" rel="noreferrer">Preview portal</a>
      </div>
      <p className="mt-2 text-emerald-50/72">{preview.detail}</p>
      <p className="mt-2 text-emerald-50/72"><strong>CTA:</strong> {preview.primaryAction}</p>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
        {customerPortalStages.map((stage, index) => (
          <span key={stage} className={`rounded-xl border px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.09em] ${index + 1 <= safeStage ? "border-emerald-200/30 bg-emerald-300/[0.11] text-emerald-50" : "border-white/10 bg-black/20 text-white/35"}`}>{stage}</span>
        ))}
      </div>
      <p className="mt-3 text-[0.72rem] leading-5 text-amber-50/80">Veilige grens: klant ziet dat signing/projectgroep geen automatische livegang, betaling, provider billing of scopewijziging betekent.</p>
    </div>
  );
}

function VentureMemoryReview({ details, account, adminEmail, adminToken, onRefresh }: { details: VentureMemoryDetails; account: Account; adminEmail: string; adminToken: string; onRefresh: () => void }) {
  const canvas = details.canvas;
  const deal = details.dealCard;
  const recentEvents = details.events.slice(-8).reverse();
  return (
    <div className="border-t border-white/10 bg-black/20 p-4 lg:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Live Venture Memory</p>
          <h4 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-white">{deal?.title || canvas?.project || "Nog geen Deal Card titel"}</h4>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">{details.storageMode} · {details.memorySessionId || "geen session"}</div>
      </div>
      {details.message && <p className="mb-4 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] p-3 text-sm text-amber-50/80">{details.message}</p>}
      <AdminSpunkyWorkspaceSummary details={details} account={account} adminEmail={adminEmail} adminToken={adminToken} onRefresh={onRefresh} />
      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_.85fr_.9fr]">
        <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Deal Card</p>
          <p className="mt-3 text-sm leading-6 text-white/70"><strong className="text-white">Probleem:</strong> {deal?.problem || canvas?.problem || "Nog niet scherp"}</p>
          <p className="mt-2 text-sm leading-6 text-white/70"><strong className="text-white">Kans:</strong> {deal?.opportunity || canvas?.aiOpportunities || "Nog niet scherp"}</p>
          <p className="mt-2 text-sm leading-6 text-white/70"><strong className="text-white">Route:</strong> {deal?.likelyRoute || canvas?.collaboration || "Review nodig"}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">{deal?.confidence ?? canvas?.confidence ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Missing info</p>
          <ul className="mt-3 grid gap-2 text-sm leading-5 text-white/65">
            {(deal?.missing?.length ? deal.missing : ["Geen missing fields gevonden"]).map((item) => <li key={item}>• {item}</li>)}
          </ul>
          <p className="mt-4 text-xs leading-5 text-white/45">Volgende stap: {deal?.nextStep || "Team Richard bepaalt aanvullende vraag of voorstel."}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">Laatste memory events</p>
          <div className="mt-3 grid max-h-64 gap-2 overflow-auto pr-1">
            {recentEvents.length === 0 ? <p className="text-sm text-white/45">Geen events gekoppeld.</p> : recentEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <div className="mb-1 flex items-center justify-between gap-2 text-[0.65rem] uppercase tracking-[0.14em] text-white/40"><span>{event.role} · {event.type}</span><span>{new Date(event.createdAt).toLocaleString("nl-NL")}</span></div>
                <p className="line-clamp-3 text-xs leading-5 text-white/65">{event.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function AdminSpunkyWorkspaceSummary({ details, account, adminEmail, adminToken, onRefresh }: { details: VentureMemoryDetails; account: Account; adminEmail: string; adminToken: string; onRefresh: () => void }) {
  const cards = details.workspaceSummary || [];
  const answered = cards.filter((card) => card.status === "answered");
  const completeness = typeof details.workspaceCompleteness === "number" ? details.workspaceCompleteness : cards.length ? Math.round((answered.length / cards.length) * 100) : 0;
  const latest = [...answered].sort((a, b) => (b.lastAnsweredAt || "").localeCompare(a.lastAnsweredAt || ""))[0];
  const exportText = buildWorkspaceExport(details, cards);
  const [requestState, setRequestState] = useState<{ status: "idle" } | { status: "sending"; title: string } | { status: "sent"; title: string; message: string } | { status: "error"; title: string; message: string }>({ status: "idle" });

  async function requestCustomerInput(card: WorkspaceCardSummary) {
    setRequestState({ status: "sending", title: card.title });
    try {
      const response = await fetch("/api/admin/venture-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          adminToken,
          accountId: account.accountId,
          cardTitle: card.title,
          question: card.requestedQuestion || "",
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Vraag kon niet worden klaargezet.");
      setRequestState({ status: "sent", title: card.title, message: data.message || "Vraag klaargezet." });
      onRefresh();
    } catch (error) {
      setRequestState({ status: "error", title: card.title, message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/70">Spunky intake completeness</p>
          <h5 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-white">{completeness}% workspace context</h5>
          <p className="mt-1 text-sm leading-6 text-emerald-50/70">{answered.length} van {cards.length || 4} workspace cards aangevuld. Admin ziet nu dezelfde context die de klant in de portal gaf.</p>
        </div>
        <button type="button" onClick={() => navigator.clipboard?.writeText(exportText)} className="rounded-full border border-emerald-200/25 px-3 py-1 text-xs font-semibold text-emerald-50">Kopieer workspace export</button>
      </div>
      <AdminSpunkyReviewAdvice account={account} adminEmail={adminEmail} adminToken={adminToken} onRefresh={onRefresh} />
      {latest && (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/70">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-emerald-100/70">Laatste klantinput</p>
          <strong className="mt-1 block text-white">{latest.title}</strong>
          <p className="mt-1 line-clamp-3">{latest.answer}</p>
          {latest.lastAnsweredAt && <p className="mt-1 font-mono text-[0.66rem] text-white/42">{new Date(latest.lastAnsweredAt).toLocaleString("nl-NL")}</p>}
        </div>
      )}
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {(cards.length ? cards : fallbackWorkspaceSummary()).map((card) => (
          <div key={card.title} className={`rounded-xl border p-3 ${card.status === "answered" ? "border-emerald-200/25 bg-emerald-300/[0.07]" : "border-amber-200/20 bg-amber-300/[0.055]"}`}>
            <div className="flex items-start justify-between gap-2">
              <strong className="text-sm text-white">{card.title}</strong>
              <span className={`rounded-full border px-2 py-0.5 text-[0.56rem] font-bold uppercase tracking-[0.12em] ${card.status === "answered" ? "border-emerald-200/25 text-emerald-50" : "border-amber-200/25 text-amber-50"}`}>{card.status}</span>
            </div>
            <p className="mt-2 text-[0.72rem] uppercase tracking-[0.14em] text-white/38">Owner</p>
            <p className="text-xs text-white/68">{card.owner}</p>
            <p className="mt-2 text-[0.72rem] uppercase tracking-[0.14em] text-white/38">Next action</p>
            <p className="text-xs leading-5 text-white/68">{card.nextAction}</p>
            {card.requestedQuestion && <p className="mt-2 line-clamp-3 text-xs leading-5 text-amber-50/78">Vraag: {card.requestedQuestion}</p>}
            {card.answer && <p className="mt-2 line-clamp-3 text-xs leading-5 text-emerald-50/72">{card.answer}</p>}
            {card.status !== "answered" && (
              <button type="button" onClick={() => requestCustomerInput(card)} disabled={requestState.status === "sending"} className="mt-3 rounded-full border border-amber-200/25 bg-amber-300/[0.07] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-50 disabled:opacity-50">
                {requestState.status === "sending" && requestState.title === card.title ? "Spunky denkt..." : card.status === "requested" ? "Laat Spunky herformuleren" : "Laat Spunky vragen"}
              </button>
            )}
          </div>
        ))}
      </div>
      {requestState.status === "sent" && <p className="mt-3 rounded-xl border border-emerald-200/25 bg-emerald-300/[0.08] p-3 text-xs text-emerald-50">{requestState.message}</p>}
      {requestState.status === "error" && <p className="mt-3 rounded-xl border border-red-200/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{requestState.message}</p>}
    </div>
  );
}

function AdminSpunkyReviewAdvice({ account, adminEmail, adminToken, onRefresh }: { account: Account; adminEmail: string; adminToken: string; onRefresh: () => void }) {
  const [state, setState] = useState<{ status: "idle" } | { status: "loading" } | { status: "loaded"; advice: SpunkyReviewAdvice; message: string; followUpQueue?: { queued?: boolean; reason?: string; jobId?: string } } | { status: "error"; message: string }>({ status: "idle" });

  async function generateAdvice(persist = false, queueFollowUp = false) {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/spunky/review-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, adminToken, accountId: account.accountId, persist, queueFollowUp }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Spunky review kon niet worden gemaakt.");
      setState({ status: "loaded", advice: data.advice, message: data.message || "Reviewadvies klaar.", followUpQueue: data.followUpQueue });
      if (persist || queueFollowUp) onRefresh();
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Onbekende fout" });
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.055] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Spunky review advice</p>
          <h5 className="mt-1 text-lg font-semibold tracking-[-0.04em] text-white">Laat AI de case eerst beoordelen.</h5>
          <p className="mt-1 text-sm leading-6 text-cyan-50/70">Spunky maakt een reviewadvies met verdict, risico, missing proof, sprintvoorstel en klantmail. Team Richard blijft eindbeslisser.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => generateAdvice(false)} disabled={state.status === "loading"} className="rounded-full border border-cyan-200/25 px-3 py-1 text-xs font-semibold text-cyan-50 disabled:opacity-50">{state.status === "loading" ? "Spunky reviewt..." : "Laat Spunky reviewen"}</button>
          <button type="button" onClick={() => generateAdvice(true, true)} disabled={state.status === "loading"} className="rounded-full border border-emerald-200/25 bg-emerald-300/[0.08] px-3 py-1 text-xs font-semibold text-emerald-50 disabled:opacity-50">Memory + follow-up klaarzetten</button>
        </div>
      </div>
      {state.status === "loaded" && (
        <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-200/25 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cyan-50">{state.advice.verdict}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/60">risk {state.advice.riskLevel}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.14em] text-white/60">ready {state.advice.readinessScore}%</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/72">{state.advice.summary}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-cyan-100/60">Eerste sprint</p>
            <p className="mt-1 text-sm leading-6 text-white/72">{state.advice.recommendedFirstSprint}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <Score label="Deal" value={state.advice.dealStrength} />
              <Score label="AI value" value={state.advice.automationValue} />
              <Score label="Confidence" value={state.advice.confidence} />
            </div>
          </div>
          <div className="grid gap-3">
            <MiniList title="Missing proof" items={state.advice.missingProof.length ? state.advice.missingProof : ["Geen harde missing proof"]} tone="amber" />
            <MiniList title="Admin acties" items={state.advice.adminActions} tone="emerald" />
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/60">Klantmail draft</p>
              <strong className="mt-2 block text-sm text-white">{state.advice.customerEmailDraft.subject}</strong>
              <p className="mt-2 line-clamp-5 whitespace-pre-line text-xs leading-5 text-white/65">{state.advice.customerEmailDraft.body}</p>
            </div>
          </div>
        </div>
      )}
      {state.status === "loaded" && (
        <div className="mt-3 rounded-xl border border-cyan-200/20 bg-cyan-300/[0.07] p-3 text-xs text-cyan-50">
          <p>{state.message}</p>
          {state.followUpQueue && (
            <p className="mt-2 text-cyan-50/72">
              Follow-up queue: {state.followUpQueue.queued ? `klaargezet (${state.followUpQueue.jobId || "job"})` : state.followUpQueue.reason || "niet klaargezet"}. Verzenden blijft afhankelijk van toestemming, cron en mailprovider.
            </p>
          )}
        </div>
      )}
      {state.status === "error" && <p className="mt-3 rounded-xl border border-red-200/25 bg-red-300/[0.08] p-3 text-xs text-red-50">{state.message}</p>}
    </div>
  );
}

function fallbackWorkspaceSummary(): WorkspaceCardSummary[] {
  return ["Deal Card", "Scope en risico", "AIOW reactie", "Spunky projectruimte"].map((title) => ({
    title,
    status: "missing" as const,
    owner: title === "Spunky projectruimte" ? "Na signing" : "Klant + Spunky",
    nextAction: title === "Deal Card" ? "Vraag klant om bewijs, KPI of concrete klantvraag" : title === "Scope en risico" ? "Vraag klant om data, systemen, privacygrenzen en beslisser" : title === "AIOW reactie" ? "Vraag klant waarop Team Richard moet reageren" : "Laat workflow, KPI en toegang alvast voorbereiden",
  }));
}


function buildWorkspaceExport(details: VentureMemoryDetails, cards: WorkspaceCardSummary[]): string {
  const lines = [
    `AIOW Spunky workspace: ${details.memorySessionId || "geen session"}`,
    `Completeness: ${details.workspaceCompleteness ?? 0}%`,
    `Deal Card: ${details.dealCard?.title || details.canvas?.project || "n.t.b."}`,
    "",
    ...(cards.length ? cards : fallbackWorkspaceSummary()).map((card, index) => [
      `${index + 1}. ${card.title} (${card.status})`,
      `   Owner: ${card.owner}`,
      `   Next: ${card.nextAction}`,
      card.prompt ? `   Prompt: ${card.prompt}` : "",
      card.answer ? `   Answer: ${card.answer}` : "",
      card.lastAnsweredAt ? `   Last answered: ${new Date(card.lastAnsweredAt).toLocaleString("nl-NL")}` : "",
    ].filter(Boolean).join("\n")),
  ];
  return lines.join("\n");
}

function CommandStat({ label, value, tone }: { label: string; value: string; tone: "cyan" | "emerald" | "pink" | "amber" | "white" }) {
  const toneClass = {
    cyan: "text-cyan-100 bg-cyan-300/[0.08] border-cyan-300/15",
    emerald: "text-emerald-100 bg-emerald-300/[0.08] border-emerald-300/15",
    pink: "text-pink-100 bg-pink-300/[0.08] border-pink-300/15",
    amber: "text-amber-100 bg-amber-300/[0.08] border-amber-300/15",
    white: "text-white bg-white/[0.055] border-white/10",
  }[tone];
  return <div className={`rounded-2xl border p-4 ${toneClass}`}><p className="text-[0.65rem] uppercase tracking-[0.18em] opacity-65">{label}</p><strong className="mt-2 block text-3xl tracking-[-0.06em]">{value}</strong></div>;
}

function Score({ label, value }: { label: string; value: number }) {
  const safe = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.16em] text-white/45"><span>{label}</span><b className="text-white">{safe}%</b></div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-200" style={{ width: `${safe}%` }} /></div>
    </div>
  );
}

function MiniPanel({ title, value }: { title: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-[0.18em] text-white/40">{title}</p><p className="mt-2 text-sm leading-6 text-white/70">{value}</p></div>;
}

function MiniList({ title, items, tone }: { title: string; items: string[]; tone: "amber" | "emerald" }) {
  const color = tone === "amber" ? "text-amber-100" : "text-emerald-100";
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className={`text-xs uppercase tracking-[0.18em] ${color}`}>{title}</p><ul className="mt-2 grid gap-1.5 text-sm leading-5 text-white/62">{items.map((item) => <li key={item}>• {item}</li>)}</ul></div>;
}
