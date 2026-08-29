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
export function validateQuoteAbandonBatchAckV1(
  ack: unknown,
  context?: { requestedLimit?: number },
): boolean;
