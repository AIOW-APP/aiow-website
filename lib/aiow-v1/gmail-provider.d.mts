export type OutboxJob = { id: string; kind: "customer_quote" | "internal_lead"; payload: Record<string, unknown>; attempts: number; leaseToken: string; attachmentFilename: string | null; attachmentMimeType: string | null; attachmentBase64: string | null; attachmentSha256: string | null };
export class GmailProviderError extends Error { kind: "transient" | "permanent" | "ambiguous"; code: string; constructor(kind: "transient" | "permanent" | "ambiguous", code: string); }
export function buildGmailMime(job: OutboxJob): string;
export function classifyGmailFailure(error: unknown): "transient" | "permanent" | "ambiguous";
export function sendGmailJob(job: OutboxJob, options?: { env?: NodeJS.ProcessEnv; now?: number; tokenUrl?: string; gmailUrl?: string; fetchImpl?: typeof fetch }): Promise<{ id: string }>;
