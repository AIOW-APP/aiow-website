"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { availableLeadStatuses, buildStatusTransition, isTerminalStatus, MAX_REOPEN_REASON_LENGTH, type LeadStatus } from "./ops-lifecycle";
import styles from "./OpsDashboard.module.css";

type DeliveryState = "pending" | "leased" | "retry" | "sent" | "dead" | "review" | "cancelled";
type Priority = "normal" | "high" | "urgent";
type Lead = {
  schemaKind: "lead_projection"; id: string; source: "booking" | "quote"; sourceId: string; createdAt: string; updatedAt: string;
  revision: number; unread: boolean; status: LeadStatus; priority: Priority; displayName: string; email: string; phone: string | null;
  organisation: string | null; route: string; locale: "nl" | "en"; nextActionAt: string | null; slaDueAt: string; overdue: boolean;
  exception: "delivery_review" | "delivery_dead" | "next_action_overdue" | null;
  deliverySummary: { schemaKind: "delivery_summary"; customer: DeliveryState; internal: DeliveryState; hasAmbiguity: boolean; lastAttemptAt: string | null };
  legalHold: boolean; activeCustomerRelation: boolean;
};
type Queue = { schemaKind: "queue_projection"; items: Lead[]; counts: { schemaKind: "queue_counts"; total: number; unread: number; actionable: number; overdue: number; exceptions: number }; nextCursor: unknown | null };
type Report = { schemaKind: "analytics_aggregate_report"; from: string; through: string; generatedAt: string; buckets: { date: string; count: number; event: string; route: string; locale: string; experimentId: string | null; variant: string | null }[] };
type LoadState<T> = { kind: "loading" } | { kind: "ready"; data: T } | { kind: "empty"; data: T } | { kind: "error"; message: string };
type MutationState = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; message: string } | { kind: "conflict"; message: string } | { kind: "error"; message: string };

const PRIORITY: Priority[] = ["normal", "high", "urgent"];

export function replaceLead(queue: Queue, lead: Lead): Queue { return { ...queue, items: queue.items.map((item) => item.id === lead.id ? lead : item) }; }
export function reduceReport(report: Report) {
  const totals: Record<string, number> = {};
  for (const bucket of report.buckets) totals[bucket.event] = (totals[bucket.event] || 0) + bucket.count;
  return totals;
}
function isQueue(value: unknown): value is Queue { return !!value && typeof value === "object" && (value as Queue).schemaKind === "queue_projection" && Array.isArray((value as Queue).items); }
function isReport(value: unknown): value is Report { return !!value && typeof value === "object" && (value as Report).schemaKind === "analytics_aggregate_report" && Array.isArray((value as Report).buckets); }
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Niet gepland"; }
function localInput(value: string | null) { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.valueOf()) ? "" : new Date(date.valueOf() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16); }
function reportRange() { const through = new Date(); const from = new Date(through); from.setUTCDate(from.getUTCDate() - 29); return { from: from.toISOString().slice(0, 10), through: through.toISOString().slice(0, 10) }; }

export function OpsDashboard() {
  const [queue, setQueue] = useState<LoadState<Queue>>({ kind: "loading" });
  const [report, setReport] = useState<LoadState<Report>>({ kind: "loading" });
  const range = useMemo(reportRange, []);
  const load = useCallback(async () => {
    setQueue({ kind: "loading" }); setReport({ kind: "loading" });
    const [queueResult, reportResult] = await Promise.allSettled([
      fetch("/api/ops/leads?limit=100", { headers: { accept: "application/json" }, cache: "no-store" }),
      fetch(`/api/ops/report?from=${range.from}&through=${range.through}`, { headers: { accept: "application/json" }, cache: "no-store" }),
    ]);
    if (queueResult.status === "fulfilled" && queueResult.value.ok) {
      try { const data = await queueResult.value.json(); setQueue(isQueue(data) ? { kind: data.items.length ? "ready" : "empty", data } : { kind: "error", message: "De queue gaf een onbekend antwoord." }); }
      catch { setQueue({ kind: "error", message: "De queue kon niet worden gelezen." }); }
    } else setQueue({ kind: "error", message: "De commerciële queue is niet beschikbaar." });
    if (reportResult.status === "fulfilled" && reportResult.value.ok) {
      try { const data = await reportResult.value.json(); setReport(isReport(data) ? { kind: data.buckets.length ? "ready" : "empty", data } : { kind: "error", message: "Het rapport gaf een onbekend antwoord." }); }
      catch { setReport({ kind: "error", message: "Het rapport kon niet worden gelezen." }); }
    } else setReport({ kind: "error", message: "Het conversierapport is niet beschikbaar." });
  }, [range.from, range.through]);
  useEffect(() => { void load(); }, [load]);

  const updateLead = useCallback((lead: Lead) => setQueue((current) => current.kind === "ready" || current.kind === "empty" ? { kind: "ready", data: replaceLead(current.data, lead) } : current), []);
  return <main className={styles.page}>
    <header className={styles.header}><div><p className={styles.eyebrow}>AIOW · besloten operatie</p><h1>Commerciële wachtrij</h1><p>Ongelezen aanvragen, opvolging, SLA en afleveruitzonderingen. Beslissingen blijven revisiegebonden.</p></div><button type="button" onClick={() => void load()} className={styles.refresh}>Vernieuwen</button></header>
    <section aria-labelledby="queue-title" className={styles.section}>
      <div className={styles.sectionTitle}><div><p className={styles.index}>01 / Queue</p><h2 id="queue-title">Aanvragen die aandacht vragen</h2></div>{queue.kind === "ready" || queue.kind === "empty" ? <QueueCounts queue={queue.data} /> : null}</div>
      {queue.kind === "loading" && <State role="status" title="Queue laden" body="De actuele serverstatus wordt opgehaald." />}
      {queue.kind === "error" && <State role="alert" title="Queue niet geladen" body={queue.message} action={load} />}
      {queue.kind === "empty" && <State role="status" title="Geen aanvragen in de queue" body="Er is nu niets om te beoordelen of op te volgen." />}
      {queue.kind === "ready" && <div className={styles.leadList}>{queue.data.items.map((lead) => <LeadCard key={lead.id} lead={lead} onUpdate={updateLead} />)}</div>}
    </section>
    <section aria-labelledby="report-title" className={styles.section}>
      <div className={styles.sectionTitle}><div><p className={styles.index}>02 / Rapport</p><h2 id="report-title">Aggregaten zonder persoonsprofielen</h2></div><p className={styles.range}>{range.from} — {range.through}</p></div>
      {report.kind === "loading" && <State role="status" title="Rapport laden" body="Alleen gesloten dagtotalen worden opgehaald." />}
      {report.kind === "error" && <State role="alert" title="Rapport niet geladen" body={report.message} action={load} />}
      {report.kind === "empty" && <State role="status" title="Nog geen gebeurtenissen" body="Voor deze periode zijn geen geaggregeerde conversies beschikbaar." />}
      {report.kind === "ready" && <ReportView report={report.data} />}
    </section>
  </main>;
}

function QueueCounts({ queue }: { queue: Queue }) {
  const entries = [["Totaal", queue.counts.total], ["Ongelezen", queue.counts.unread], ["Actie", queue.counts.actionable], ["SLA verlopen", queue.counts.overdue], ["Uitzondering", queue.counts.exceptions]];
  return <dl className={styles.counts}>{entries.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
function State({ role, title, body, action }: { role: "status" | "alert"; title: string; body: string; action?: () => void | Promise<void> }) {
  return <div className={styles.state} role={role}><strong>{title}</strong><p>{body}</p>{action && <button type="button" onClick={() => void action()}>Opnieuw proberen</button>}</div>;
}
function ReportView({ report }: { report: Report }) {
  const totals = reduceReport(report);
  return <div className={styles.report}><p>Gegenereerd {formatDate(report.generatedAt)}</p><dl>{Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)).map(([event, count]) => <div key={event}><dt>{event.replaceAll("_", " ")}</dt><dd>{count}</dd></div>)}</dl></div>;
}

function LeadCard({ lead, onUpdate }: { lead: Lead; onUpdate: (lead: Lead) => void }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status); const [priority, setPriority] = useState<Priority>(lead.priority);
  const [nextActionAt, setNextActionAt] = useState(localInput(lead.nextActionAt)); const [reopenReason, setReopenReason] = useState(""); const [mutation, setMutation] = useState<MutationState>({ kind: "idle" });
  useEffect(() => { setStatus(lead.status); setPriority(lead.priority); setNextActionAt(isTerminalStatus(lead.status) ? "" : localInput(lead.nextActionAt)); setReopenReason(""); }, [lead]);
  const statusChoices = availableLeadStatuses(lead.status);
  const terminalSelection = isTerminalStatus(status);
  const transition = buildStatusTransition(lead.status, status, reopenReason);
  async function mutate(operation: "mark_read" | "set_priority" | "transition_status" | "set_next_action") {
    const requestedTransition = operation === "transition_status" ? buildStatusTransition(lead.status, status, reopenReason) : null;
    if (requestedTransition && !requestedTransition.ok) { setMutation({ kind: "error", message: requestedTransition.reason === "reopen_reason_required" ? "Een heropeningsreden is verplicht." : requestedTransition.reason === "reopen_reason_too_long" ? `De heropeningsreden mag maximaal ${MAX_REOPEN_REASON_LENGTH} tekens bevatten.` : "Deze statusovergang is niet toegestaan." }); return; }
    if (operation === "set_next_action" && terminalSelection) { setNextActionAt(""); setMutation({ kind: "error", message: "Een afgesloten lead kan geen volgende actie hebben." }); return; }
    const idempotencyKey = crypto.randomUUID();
    const common = { idempotencyKey, leadId: lead.id, expectedRevision: lead.revision, operation };
    const body = operation === "mark_read" ? { schemaKind: "ops_mark_read", ...common, unread: false }
      : operation === "set_priority" ? { schemaKind: "ops_set_priority", ...common, priority }
      : operation === "transition_status" ? { schemaKind: "ops_transition_status", ...common, status: requestedTransition!.status, reopenReason: requestedTransition!.reopenReason }
      : { schemaKind: "ops_set_next_action", ...common, nextActionAt: nextActionAt ? new Date(nextActionAt).toISOString() : null };
    setMutation({ kind: "saving" });
    try {
      const response = await fetch(`/api/ops/leads/${lead.id}`, { method: "PATCH", headers: { "content-type": "application/json", "idempotency-key": idempotencyKey }, body: JSON.stringify(body) });
      const result = await response.json();
      if (response.status === 409 && result?.schemaKind === "revision_conflict" && result.current) { onUpdate(result.current); setMutation({ kind: "conflict", message: `Gewijzigd door een andere actie. Revisie ${result.currentRevision} is opnieuw geladen; controleer en probeer opnieuw.` }); return; }
      if (!response.ok || result?.schemaKind !== "ops_mutation_ack" || !result.projection) throw new Error("mutation rejected");
      onUpdate(result.projection); setMutation({ kind: "saved", message: `Opgeslagen in revisie ${result.revision}.` });
    } catch { setMutation({ kind: "error", message: "Wijziging niet opgeslagen. De queue is ongewijzigd; probeer opnieuw." }); }
  }
  return <article className={`${styles.lead} ${lead.unread ? styles.unread : ""}`} aria-labelledby={`lead-${lead.id}`}>
    <div className={styles.leadHead}><div><p className={styles.meta}>{lead.source} · {lead.locale.toUpperCase()} · revisie {lead.revision}</p><h3 id={`lead-${lead.id}`}>{lead.displayName}</h3><p>{lead.organisation || lead.email}</p></div><div className={styles.badges}>{lead.unread && <span>Ongelezen</span>}{lead.overdue && <span data-tone="danger">SLA verlopen</span>}{lead.exception && <span data-tone="danger">{lead.exception.replaceAll("_", " ")}</span>}</div></div>
    <dl className={styles.facts}><div><dt>Bron / route</dt><dd>{lead.source} · {lead.route}</dd></div><div><dt>Status / prioriteit</dt><dd>{lead.status} · {lead.priority}</dd></div><div><dt>Volgende actie</dt><dd>{formatDate(lead.nextActionAt)}</dd></div><div><dt>SLA</dt><dd>{formatDate(lead.slaDueAt)}</dd></div><div><dt>Aflevering klant</dt><dd>{lead.deliverySummary.customer}</dd></div><div><dt>Aflevering intern</dt><dd>{lead.deliverySummary.internal}{lead.deliverySummary.hasAmbiguity ? " · controle nodig" : ""}</dd></div></dl>
    <div className={styles.controls} aria-label={`Acties voor ${lead.displayName}`}>
      {lead.unread && <button type="button" onClick={() => void mutate("mark_read")} disabled={mutation.kind === "saving"}>Markeer gelezen</button>}
      <label>Prioriteit<select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>{PRIORITY.map((value) => <option key={value}>{value}</option>)}</select></label><button type="button" onClick={() => void mutate("set_priority")} disabled={mutation.kind === "saving" || priority === lead.priority}>Bewaar prioriteit</button>
      <label>Status<select value={status} onChange={(event) => { const next = event.target.value as LeadStatus; setStatus(next); if (isTerminalStatus(next)) setNextActionAt(""); }}>{statusChoices.map((value) => <option key={value}>{value}</option>)}</select></label><button type="button" onClick={() => void mutate("transition_status")} disabled={mutation.kind === "saving" || status === lead.status || !transition.ok}>Bewaar status</button>
      {lead.status === "lost" && status === "qualified" && <label>Heropeningsreden<textarea required maxLength={MAX_REOPEN_REASON_LENGTH} value={reopenReason} onChange={(event) => setReopenReason(event.target.value)} /></label>}
      <label>Volgende actie<input type="datetime-local" value={terminalSelection ? "" : nextActionAt} onChange={(event) => setNextActionAt(event.target.value)} disabled={terminalSelection} /></label><button type="button" onClick={() => void mutate("set_next_action")} disabled={mutation.kind === "saving" || terminalSelection}>Bewaar actie</button>
    </div>
    {mutation.kind !== "idle" && <p className={styles.mutation} role={mutation.kind === "error" || mutation.kind === "conflict" ? "alert" : "status"}>{mutation.kind === "saving" ? "Wijziging veilig opslaan…" : mutation.message}</p>}
  </article>;
}
