import { NextResponse } from "next/server";
import { findAiowCustomerAccount } from "@/lib/aiow-customer-accounts";
import { listAiowProofEvents, type AiowProofEvent } from "@/lib/aiow-proof-events";

type CustomerProofStep = {
  id: string;
  createdAt: string;
  label: string;
  detail: string;
  state: "done" | "active" | "waiting";
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const accountId = url.searchParams.get("accountId") || "";
    const accessCode = url.searchParams.get("accessCode") || "";
    if (!accountId || !accessCode) {
      return NextResponse.json({ error: "Account ID and access code required" }, { status: 400 });
    }
    const account = await findAiowCustomerAccount(accountId, accessCode);
    if (!account) return NextResponse.json({ error: "Account not found or invalid access code" }, { status: 404 });

    let events: AiowProofEvent[] = [];
    try {
      events = await listAiowProofEvents(accountId);
    } catch (error) {
      console.error("[customer-proof] proof events unavailable", error);
    }
    const steps = buildCustomerProofSteps(account.createdAt, account.status, events);
    return NextResponse.json({ ok: true, accountId, status: account.status, steps, count: steps.length });
  } catch (error) {
    console.error("[customer-proof] GET error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function buildCustomerProofSteps(accountCreatedAt: string, status: string, events: AiowProofEvent[]): CustomerProofStep[] {
  const steps: CustomerProofStep[] = [];
  const safeEvents = [...events].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(safeCustomerEvent).filter(Boolean) as CustomerProofStep[];

  if (!safeEvents.some((step) => step.label === "Intake ontvangen")) {
    steps.push({
      id: "account-created",
      createdAt: accountCreatedAt,
      label: "Intake ontvangen",
      detail: "Je private AIOW account en eerste Deal Card zijn aangemaakt.",
      state: "done",
    });
  }
  steps.push(...safeEvents);

  const hasReview = steps.some((step) => step.label === "AIOW review aangevraagd" || step.label === "AIOW besluit genomen");
  const hasContract = steps.some((step) => step.label.includes("Contract"));
  const hasSpunky = steps.some((step) => step.label.includes("Spunky") || step.label === "Projectruimte voorbereid" || step.label === "Operating setup actief");

  if (!hasReview && status === "READY_FOR_SCOPE_REVIEW") {
    steps.push({
      id: "review-requested-current",
      createdAt: new Date().toISOString(),
      label: "AIOW review aangevraagd",
      detail: "Je aanvraag staat klaar voor beoordeling door Team Richard.",
      state: "active",
    });
  }
  if (!hasContract && ["CONTRACT_DRAFTED", "CONTRACT_SENT"].includes(status)) {
    steps.push({
      id: "contract-current",
      createdAt: new Date().toISOString(),
      label: "Contractfase gestart",
      detail: "AIOW bereidt scope, voorwaarden en signing voor.",
      state: "active",
    });
  }
  if (!hasSpunky && ["SIGNED", "SPUNKY_HANDOFF_READY", "SPUNKY_PROJECT_GROUP_PREPARED"].includes(status)) {
    steps.push({
      id: "spunky-current",
      createdAt: new Date().toISOString(),
      label: "Operating setup actief",
      detail: "Team Richard bereidt de volgende projectstap en Spunky-context voor.",
      state: "active",
    });
  }

  return steps.slice(-8).map((step, index, list) => ({
    ...step,
    state: step.state === "waiting" ? step.state : index === list.length - 1 ? "active" : "done",
  }));
}

function safeCustomerEvent(event: AiowProofEvent): CustomerProofStep | null {
  const base = { id: event.eventId, createdAt: event.createdAt };
  switch (event.type) {
    case "CUSTOMER_ACCOUNT_CREATED":
      return { ...base, label: "Intake ontvangen", detail: "Je private AIOW account en eerste Deal Card zijn aangemaakt.", state: "done" };
    case "CUSTOMER_SCOPE_REVIEW_REQUESTED":
      return { ...base, label: "AIOW review aangevraagd", detail: "Je aanvraag staat klaar voor beoordeling door Team Richard.", state: "done" };
    case "ADMIN_DECISION_RECORDED":
      return { ...base, label: "AIOW besluit genomen", detail: "Team Richard heeft je case beoordeeld en de volgende route bepaald.", state: "done" };
    case "CUSTOMER_FOLLOWUP_DRAFTED":
      return { ...base, label: "Opvolging voorbereid", detail: "AIOW heeft een persoonlijk vervolgbericht of volgende actie voorbereid.", state: "done" };
    case "CONTRACT_DRAFT_CREATED":
      return { ...base, label: "Contract voorbereid", detail: "AIOW heeft een voorstel of contractdraft voorbereid voor de volgende stap.", state: "done" };
    case "CONTRACT_SENT":
      return { ...base, label: "Contract verzonden", detail: "De signing route is klaargezet of gedeeld.", state: "done" };
    case "CONTRACT_SIGNED":
      return { ...base, label: "Akkoord getekend", detail: "De operating setup kan worden voorbereid. Livegang blijft apart bevestigd.", state: "done" };
    case "SPUNKY_HANDOFF_REQUESTED":
    case "SPUNKY_PROJECT_GROUP_TASK_CREATED":
      return { ...base, label: "Spunky handoff voorbereid", detail: "AIOW bereidt de private projectcontext en kickoff voor.", state: "done" };
    case "SPUNKY_PROJECT_GROUP_PREPARED":
      return { ...base, label: "Projectruimte voorbereid", detail: "De Spunky projectruimte is voorbereid voor context, vragen en bewijs.", state: "done" };
    default:
      return null;
  }
}
