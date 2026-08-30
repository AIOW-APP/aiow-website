export type ProviderGateApprovalField =
  | "gateId" | "environment" | "provider" | "tenantId" | "applicationId" | "mailbox" | "sender" | "controlMailbox"
  | "secretPresent" | "oauthClientCredentialsPresent" | "exchangeApplicationRole" | "exchangeRbacSenderInScope"
  | "exchangeRbacControlMailboxInScope" | "entraUnscopedMailSendAssigned" | "evidenceSha256" | "revision"
  | "ownerApprovedBy" | "approvedAt" | "expiresAt" | "runtimeCapability" | "fallbackProvider";

export const PROVIDER_GATE_APPROVAL_FIELDS: readonly ProviderGateApprovalField[];
export function buildProviderGateApprovalBindingDigestV1(record: Readonly<Record<string, unknown>>): string | null;
export function validateProviderGateCurrentV1(
  record: unknown,
  context?: { serverNow?: string; target?: Readonly<Record<string, unknown>> },
): boolean;
export function validateOutboxBatchAckV1(
  ack: unknown,
  context?: { operation?: "claim" | "stale_recovery" | "mail_run"; requestedLimit?: number },
): boolean;
export interface MailRunValidationContext {
  /** Incoming correlation. Begin ACK validation does not use this as identity. */
  requestId?: string;
  /** Immutable request ID persisted by the first begin, when known. */
  originalRequestId?: string;
  idempotencyKey?: string;
  bodyDigest?: string;
  requestedLimit?: number;
  persistedResponse?: Readonly<Record<string, unknown>>;
}
export function validateMailRunStoredResponseV1(
  response: unknown,
  context?: Pick<MailRunValidationContext, "requestId" | "requestedLimit" | "persistedResponse">,
): boolean;
/** Validates the full stored response and returns RFC 8785 responseBody JSON only. */
export function serializeMailRunResponseBodyV1(
  response: unknown,
  context?: Pick<MailRunValidationContext, "requestId" | "requestedLimit" | "persistedResponse">,
): string | null;
export function validateMailRunBeginAckV1(ack: unknown, context?: MailRunValidationContext): boolean;
export function validateMailRunCompleteAckV1(ack: unknown, context?: MailRunValidationContext): boolean;
export function validateQuoteAbandonBatchAckV1(
  ack: unknown,
  context?: { requestedLimit?: number },
): boolean;
