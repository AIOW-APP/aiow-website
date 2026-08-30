export type LeadStatus = "new" | "qualified" | "awaiting_info" | "scan_planned" | "proposal" | "won" | "lost";

export const LEGAL_STATUS_TRANSITIONS: Readonly<Record<LeadStatus, readonly LeadStatus[]>> = {
  new: ["qualified", "awaiting_info", "scan_planned", "lost"],
  qualified: ["awaiting_info", "scan_planned", "proposal", "lost"],
  awaiting_info: ["qualified", "scan_planned", "lost"],
  scan_planned: ["proposal", "won", "lost"],
  proposal: ["won", "lost"],
  won: [],
  lost: ["qualified"],
};

export const MAX_REOPEN_REASON_LENGTH = 500;

export function isTerminalStatus(status: LeadStatus): boolean {
  return status === "won" || status === "lost";
}

export function availableLeadStatuses(status: LeadStatus): readonly LeadStatus[] {
  return [status, ...LEGAL_STATUS_TRANSITIONS[status]];
}

type TransitionResult =
  | { ok: true; status: LeadStatus; reopenReason: string | null }
  | { ok: false; reason: "illegal_transition" | "reopen_reason_required" | "reopen_reason_too_long" };

export function buildStatusTransition(current: LeadStatus, target: LeadStatus, rawReopenReason: string): TransitionResult {
  if (!LEGAL_STATUS_TRANSITIONS[current].includes(target)) return { ok: false, reason: "illegal_transition" };
  if (current !== "lost" || target !== "qualified") return { ok: true, status: target, reopenReason: null };
  const reopenReason = rawReopenReason.trim();
  if (!reopenReason) return { ok: false, reason: "reopen_reason_required" };
  if (reopenReason.length > MAX_REOPEN_REASON_LENGTH) return { ok: false, reason: "reopen_reason_too_long" };
  return { ok: true, status: target, reopenReason };
}
