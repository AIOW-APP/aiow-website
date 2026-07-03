import { appendFile, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { aiowDurableStoreMode, supabaseInsert, supabaseSelect } from "./aiow-durable-store";

export type AiowProofEventType =
  | "ADMIN_DECISION_RECORDED"
  | "CONTRACT_DRAFT_CREATED"
  | "CONTRACT_SENT"
  | "CONTRACT_SIGNED"
  | "CUSTOMER_ACCOUNT_CREATED"
  | "CUSTOMER_SCOPE_REVIEW_REQUESTED"
  | "CUSTOMER_FOLLOWUP_DRAFTED"
  | "SPUNKY_HANDOFF_REQUESTED"
  | "SPUNKY_PROJECT_GROUP_TASK_CREATED"
  | "SPUNKY_PROJECT_GROUP_PREPARED";

export type AiowProofEvent = {
  eventId: string;
  createdAt: string;
  accountId: string;
  type: AiowProofEventType;
  actorEmail: string;
  summary: string;
  payload: Record<string, unknown>;
};

export type NewAiowProofEventInput = {
  accountId: string;
  type: AiowProofEventType;
  actorEmail: string;
  summary: string;
  payload?: Record<string, unknown>;
};

export async function appendAiowProofEvent(input: NewAiowProofEventInput): Promise<AiowProofEvent> {
  const createdAt = new Date().toISOString();
  const event: AiowProofEvent = {
    eventId: `aiow_evt_${createdAt.replace(/[-:.TZ]/g, "").slice(0, 14)}_${Math.random().toString(16).slice(2, 8)}`,
    createdAt,
    accountId: input.accountId,
    type: input.type,
    actorEmail: input.actorEmail.toLowerCase(),
    summary: input.summary,
    payload: input.payload || {},
  };
  if (aiowDurableStoreMode() === "supabase") {
    await supabaseInsert("aiow_proof_events", toSupabaseProofEvent(event));
  } else {
    const filePath = proofEventStorePath();
    await mkdir(path.dirname(filePath), { recursive: true });
    await appendFile(filePath, `${JSON.stringify(event)}\n`, "utf8");
  }
  return event;
}

export async function listAiowProofEvents(accountId?: string): Promise<AiowProofEvent[]> {
  if (aiowDurableStoreMode() === "supabase") {
    const filters = ["select=event_id,created_at,account_id,type,actor_email,summary,payload", "order=created_at.desc"];
    if (accountId) filters.push(`account_id=eq.${encodeURIComponent(accountId)}`);
    const rows = await supabaseSelect<SupabaseProofEventRow>("aiow_proof_events", filters.join("&"));
    return (rows || []).map(fromSupabaseProofEvent);
  }
  const filePath = proofEventStorePath();
  try {
    const raw = await readFile(filePath, "utf8");
    return raw
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as AiowProofEvent)
      .filter((event) => !accountId || event.accountId === accountId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error: any) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

type SupabaseProofEventRow = {
  event_id: string;
  created_at: string;
  account_id: string;
  type: AiowProofEventType;
  actor_email: string;
  summary: string;
  payload: Record<string, unknown> | null;
};

function toSupabaseProofEvent(event: AiowProofEvent): SupabaseProofEventRow {
  return {
    event_id: event.eventId,
    created_at: event.createdAt,
    account_id: event.accountId,
    type: event.type,
    actor_email: event.actorEmail,
    summary: event.summary,
    payload: event.payload,
  };
}

function fromSupabaseProofEvent(row: SupabaseProofEventRow): AiowProofEvent {
  return {
    eventId: row.event_id,
    createdAt: row.created_at,
    accountId: row.account_id,
    type: row.type,
    actorEmail: row.actor_email,
    summary: row.summary,
    payload: row.payload || {},
  };
}

export function proofEventStorePath(): string {
  return process.env.AIOW_PROOF_EVENT_STORE || path.join(os.tmpdir(), "aiow-customer-onboarding", "proof-events.jsonl");
}
