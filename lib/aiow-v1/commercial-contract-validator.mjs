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

function compareDateTime(left, right) {
  const split = (value) => {
    const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d+))?Z$/);
    if (!match) return null;
    const wholeSecond = Date.parse(`${match[1]}Z`);
    return Number.isFinite(wholeSecond) ? { wholeSecond, fraction: match[2] ?? "" } : null;
  };
  const leftParts = split(left), rightParts = split(right);
  if (!leftParts || !rightParts) return Number.NaN;
  if (leftParts.wholeSecond !== rightParts.wholeSecond) return leftParts.wholeSecond - rightParts.wholeSecond;
  const width = Math.max(leftParts.fraction.length, rightParts.fraction.length);
  const leftFraction = leftParts.fraction.padEnd(width, "0");
  const rightFraction = rightParts.fraction.padEnd(width, "0");
  return leftFraction < rightFraction ? -1 : leftFraction > rightFraction ? 1 : 0;
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
    const nextDifference = compareDateTime(left.nextAttemptAt, right.nextAttemptAt);
    if (nextDifference !== 0) return nextDifference;
  }
  const createdDifference = compareDateTime(left.createdAt, right.createdAt);
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

const MAIL_RUN_IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const MAIL_RUN_ERROR_CODES = new Set([
  "invalid_request", "idempotency_conflict", "idempotency_in_progress", "revision_conflict",
  "unauthenticated", "forbidden", "not_found", "rate_limited", "unavailable", "provider_failure",
]);

function isCanonicalJson(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isCanonicalJson);
  return isPlainObject(value) && Object.values(value).every(isCanonicalJson);
}

function validMailRunHeaders(headers, requestId) {
  return hasExactKeys(headers, ["contentType", "cacheControl", "xAiowRequestId"])
    && headers.contentType === "application/json; charset=utf-8"
    && headers.cacheControl === "no-store"
    && UUID.test(headers.xAiowRequestId)
    && (requestId === undefined || headers.xAiowRequestId === requestId);
}

function validClosedError(error, requestId, { stored = false } = {}) {
  if (!isPlainObject(error)) return false;
  const required = ["schemaKind", "code", "message", "requestId"];
  const optional = ["fieldErrors", "retriable"];
  if (!required.every((key) => Object.hasOwn(error, key)) || Object.keys(error).some((key) => !required.includes(key) && !optional.includes(key))) return false;
  if (error.schemaKind !== "error" || !MAIL_RUN_ERROR_CODES.has(error.code) || typeof error.message !== "string" || error.message.length < 1 || error.message.length > 200) return false;
  if (!UUID.test(error.requestId) || (requestId !== undefined && error.requestId !== requestId)) return false;
  if (Object.hasOwn(error, "retriable") && typeof error.retriable !== "boolean") return false;
  if (error.code === "idempotency_in_progress" && error.retriable !== true) return false;
  if (stored && !["unavailable", "provider_failure"].includes(error.code)) return false;
  if (Object.hasOwn(error, "fieldErrors")) {
    if (!isPlainObject(error.fieldErrors) || Object.keys(error.fieldErrors).length > 20) return false;
    for (const [key, message] of Object.entries(error.fieldErrors)) {
      if (!/^[A-Za-z][A-Za-z0-9]{0,39}$/.test(key) || typeof message !== "string" || message.length < 1 || message.length > 160) return false;
    }
  }
  return isCanonicalJson(error);
}

function mailRunResponseFrom(value) {
  return { responseStatus: value.responseStatus, responseHeaders: value.responseHeaders, responseBody: value.responseBody };
}

export function validateMailRunStoredResponseV1(response, { requestId, requestedLimit, persistedResponse } = {}) {
  if (!hasExactKeys(response, ["responseStatus", "responseHeaders", "responseBody"]) || !isCanonicalJson(response)) return false;
  if (!validMailRunHeaders(response.responseHeaders, requestId)) return false;
  if (response.responseStatus === 200) {
    const limit = requestedLimit ?? response.responseBody?.requestedLimit;
    if (!validateOutboxBatchAckV1(response.responseBody, { operation: "mail_run", requestedLimit: limit })) return false;
  } else if (response.responseStatus === 503) {
    if (!validClosedError(response.responseBody, requestId, { stored: true })) return false;
  } else return false;
  try {
    if (Buffer.byteLength(stableJson(response.responseHeaders), "utf8") > 2048) return false;
    if (Buffer.byteLength(stableJson(response.responseBody), "utf8") > 262144) return false;
  } catch { return false; }
  if (persistedResponse !== undefined) {
    if (!isCanonicalJson(persistedResponse)) return false;
    try { if (stableJson(response) !== stableJson(persistedResponse)) return false; } catch { return false; }
  }
  return true;
}

export function serializeMailRunStoredResponseV1(response, context = {}) {
  if (!validateMailRunStoredResponseV1(response, context)) return null;
  try { return stableJson(response); } catch { return null; }
}

function matchesMailRunIdentity(ack, { requestId, idempotencyKey, bodyDigest } = {}) {
  return UUID.test(ack.requestId) && MAIL_RUN_IDEMPOTENCY_KEY.test(ack.idempotencyKey) && SHA256.test(ack.bodyDigest)
    && (requestId === undefined || ack.requestId === requestId)
    && (idempotencyKey === undefined || ack.idempotencyKey === idempotencyKey)
    && (bodyDigest === undefined || ack.bodyDigest === bodyDigest);
}

export function validateMailRunBeginAckV1(ack, context = {}) {
  if (!isPlainObject(ack) || ack.schemaKind !== "mail_run_begin_ack" || !matchesMailRunIdentity(ack, context)) return false;
  if (!Number.isInteger(ack.revision) || ack.revision < 1) return false;
  const base = ["schemaKind", "disposition", "requestId", "idempotencyKey", "bodyDigest", "revision"];
  if (ack.disposition === "execute") return hasExactKeys(ack, [...base, "leaseToken", "leaseExpiresAt"]) && UUID.test(ack.leaseToken) && isDateTime(ack.leaseExpiresAt);
  if (ack.disposition === "in_progress") return hasExactKeys(ack, [...base, "leaseExpiresAt"]) && isDateTime(ack.leaseExpiresAt);
  if (ack.disposition !== "replay" || !hasExactKeys(ack, [...base, "responseStatus", "responseHeaders", "responseBody", "completedAt"]) || !isDateTime(ack.completedAt)) return false;
  return validateMailRunStoredResponseV1(mailRunResponseFrom(ack), { requestId: ack.requestId, requestedLimit: context.requestedLimit, persistedResponse: context.persistedResponse });
}

export function validateMailRunCompleteAckV1(ack, context = {}) {
  const keys = ["schemaKind", "disposition", "requestId", "idempotencyKey", "bodyDigest", "revision", "responseStatus", "responseHeaders", "responseBody", "completedAt"];
  if (!hasExactKeys(ack, keys) || ack.schemaKind !== "mail_run_complete_ack" || !["completed", "replay"].includes(ack.disposition)) return false;
  if (!matchesMailRunIdentity(ack, context) || !Number.isInteger(ack.revision) || ack.revision < 1 || !isDateTime(ack.completedAt)) return false;
  return validateMailRunStoredResponseV1(mailRunResponseFrom(ack), { requestId: ack.requestId, requestedLimit: context.requestedLimit, persistedResponse: context.persistedResponse });
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
