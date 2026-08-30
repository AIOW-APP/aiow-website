import { createHash } from "node:crypto";

export const PROVIDER_GATE_APPROVAL_FIELDS = Object.freeze([
  "gateId",
  "environment",
  "provider",
  "tenantId",
  "applicationId",
  "mailbox",
  "sender",
  "controlMailbox",
  "secretPresent",
  "oauthClientCredentialsPresent",
  "exchangeApplicationRole",
  "exchangeRbacSenderInScope",
  "exchangeRbacControlMailboxInScope",
  "entraUnscopedMailSendAssigned",
  "evidenceSha256",
  "revision",
  "ownerApprovedBy",
  "approvedAt",
  "expiresAt",
  "runtimeCapability",
  "fallbackProvider",
]);

// PostgreSQL UUID equality is case-insensitive. Canonical lowercase wire UUIDs
// keep application uniqueness/order semantics identical to the database.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const SHA256 = /^[0-9a-f]{64}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OUTBOX_OPERATIONS = new Set(["claim", "stale_recovery", "mail_run"]);
const OUTBOX_KINDS = new Set(["customer_booking", "internal_booking", "customer_quote", "internal_lead"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function hasExactKeys(value, keys) {
  return isPlainObject(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (isPlainObject(value)) return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new TypeError("value is not canonical JSON");
  return encoded;
}

function isDateTime(value) {
  return typeof value === "string" && DATE_TIME.test(value) && Number.isFinite(Date.parse(value));
}

export function buildProviderGateApprovalBindingDigestV1(record) {
  if (!isPlainObject(record) || !PROVIDER_GATE_APPROVAL_FIELDS.every((field) => Object.hasOwn(record, field))) return null;
  try {
    const binding = Object.fromEntries(PROVIDER_GATE_APPROVAL_FIELDS.map((field) => [field, record[field]]));
    const canonical = stableJson(binding);
    return typeof canonical === "string" ? createHash("sha256").update(canonical, "utf8").digest("hex") : null;
  } catch {
    return null;
  }
}

export function validateProviderGateCurrentV1(record, { serverNow, target = record } = {}) {
  const keys = ["schemaKind", "state", ...PROVIDER_GATE_APPROVAL_FIELDS, "approvalBindingSha256"];
  if (!hasExactKeys(record, keys) || !isPlainObject(target)) return false;
  if (record.schemaKind !== "provider_gate_record" || !["approved", "activated"].includes(record.state)) return false;
  if (record.gateId !== "mail_provider_production_v1" || record.environment !== "production" || record.provider !== "microsoft_graph") return false;
  if (![record.tenantId, record.applicationId].every((value) => UUID.test(value))) return false;
  if (![record.mailbox, record.sender, record.controlMailbox].every((value) => typeof value === "string" && EMAIL.test(value))) return false;
  if (record.secretPresent !== true || record.oauthClientCredentialsPresent !== true) return false;
  if (record.exchangeApplicationRole !== "Application Mail.Send" || record.exchangeRbacSenderInScope !== true || record.exchangeRbacControlMailboxInScope !== false) return false;
  if (record.entraUnscopedMailSendAssigned !== false || record.ownerApprovedBy !== "richard") return false;
  if (!SHA256.test(record.evidenceSha256) || !Number.isInteger(record.revision) || record.revision < 1) return false;
  if (record.runtimeCapability !== "mail_send" || record.fallbackProvider !== null) return false;
  if (!isDateTime(record.approvedAt) || !isDateTime(record.expiresAt) || !isDateTime(serverNow)) return false;
  const now = Date.parse(serverNow);
  if (!(Date.parse(record.approvedAt) <= now && now < Date.parse(record.expiresAt))) return false;
  for (const field of ["gateId", "environment", "provider", "tenantId", "applicationId", "mailbox", "sender", "controlMailbox", "runtimeCapability", "fallbackProvider"]) {
    if (!Object.hasOwn(target, field) || target[field] !== record[field]) return false;
  }
  const digest = buildProviderGateApprovalBindingDigestV1(record);
  return digest !== null && record.approvalBindingSha256 === digest;
}

const OUTBOX_ITEM_KEYS = [
  "id", "commercialLeadId", "kind", "revision", "payloadSha256", "attempts", "leaseOwner", "leaseToken", "leaseExpiresAt", "nextAttemptAt", "createdAt",
];

function validOutboxItem(item) {
  if (!hasExactKeys(item, OUTBOX_ITEM_KEYS)) return false;
  if (!UUID.test(item.id) || !UUID.test(item.commercialLeadId) || !OUTBOX_KINDS.has(item.kind)) return false;
  if (!Number.isInteger(item.revision) || item.revision < 1 || !SHA256.test(item.payloadSha256)) return false;
  if (!Number.isInteger(item.attempts) || item.attempts < 0 || item.attempts > 5) return false;
  if (typeof item.leaseOwner !== "string" || item.leaseOwner.length < 1 || item.leaseOwner.length > 100) return false;
  if (!UUID.test(item.leaseToken) || !isDateTime(item.leaseExpiresAt) || !isDateTime(item.createdAt)) return false;
  return item.nextAttemptAt === null || isDateTime(item.nextAttemptAt);
}

function compareOutboxOrder(left, right) {
  if (left.nextAttemptAt === null && right.nextAttemptAt !== null) return -1;
  if (left.nextAttemptAt !== null && right.nextAttemptAt === null) return 1;
  if (left.nextAttemptAt !== null && right.nextAttemptAt !== null) {
    const nextDifference = Date.parse(left.nextAttemptAt) - Date.parse(right.nextAttemptAt);
    if (nextDifference !== 0) return nextDifference;
  }
  const createdDifference = Date.parse(left.createdAt) - Date.parse(right.createdAt);
  if (createdDifference !== 0) return createdDifference;
  return left.id.localeCompare(right.id);
}

export function validateOutboxBatchAckV1(ack, { operation, requestedLimit } = {}) {
  if (!hasExactKeys(ack, ["schemaKind", "operation", "requestedLimit", "itemCount", "items"])) return false;
  if (ack.schemaKind !== "outbox_batch_ack" || !OUTBOX_OPERATIONS.has(operation) || ack.operation !== operation) return false;
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 50 || ack.requestedLimit !== requestedLimit) return false;
  if (!Array.isArray(ack.items)) return false;
  if (!Number.isInteger(ack.itemCount) || ack.itemCount < 0 || ack.itemCount !== ack.items?.length || ack.items.length > requestedLimit) return false;
  if (!ack.items.every(validOutboxItem)) return false;
  if (new Set(ack.items.map((item) => item.id)).size !== ack.items.length) return false;
  if (new Set(ack.items.map((item) => item.leaseToken)).size !== ack.items.length) return false;
  for (let index = 1; index < ack.items.length; index += 1) {
    if (compareOutboxOrder(ack.items[index - 1], ack.items[index]) >= 0) return false;
  }
  return true;
}

export function validateQuoteAbandonBatchAckV1(ack, { requestedLimit } = {}) {
  if (!hasExactKeys(ack, ["schemaKind", "operation", "requestedLimit", "itemCount", "items"])) return false;
  if (ack.schemaKind !== "quote_abandon_batch_ack" || ack.operation !== "quote_abandon_expired") return false;
  if (!Number.isInteger(requestedLimit) || requestedLimit < 1 || requestedLimit > 100 || ack.requestedLimit !== requestedLimit) return false;
  if (!Array.isArray(ack.items)) return false;
  if (!Number.isInteger(ack.itemCount) || ack.itemCount !== ack.items?.length || ack.items.length > requestedLimit) return false;
  const keys = ["quoteId", "commercialLeadId", "previousRevision", "revision", "status", "quoteState", "terminalAt", "abandonedAt", "auditId"];
  if (!ack.items.every((item) => hasExactKeys(item, keys)
    && UUID.test(item.quoteId) && UUID.test(item.commercialLeadId) && UUID.test(item.auditId)
    && Number.isInteger(item.previousRevision) && item.previousRevision >= 1 && item.revision === item.previousRevision + 1
    && item.status === "lost" && item.quoteState === "abandoned"
    && isDateTime(item.terminalAt) && item.abandonedAt === item.terminalAt)) return false;
  return new Set(ack.items.map((item) => item.quoteId)).size === ack.items.length
    && new Set(ack.items.map((item) => item.commercialLeadId)).size === ack.items.length;
}
