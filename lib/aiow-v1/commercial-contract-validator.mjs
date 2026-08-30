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

function providerGateScalar(value) {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number" && Number.isSafeInteger(value)) return String(value);
  if (typeof value === "string") return value;
  throw new TypeError("provider gate field is not a canonical scalar");
}

export function buildProviderGateApprovalBindingBytesV2(record) {
  if (!isPlainObject(record) || !PROVIDER_GATE_APPROVAL_FIELDS.every((field) => Object.hasOwn(record, field))) return null;
  try {
    return PROVIDER_GATE_APPROVAL_FIELDS.map((field) => {
      const value = providerGateScalar(record[field]);
      return `${field}:${Buffer.byteLength(value, "utf8")}:${value}\n`;
    }).join("");
  } catch {
    return null;
  }
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
  const canonical = buildProviderGateApprovalBindingBytesV2(record);
  return canonical === null ? null : createHash("sha256").update(canonical, "utf8").digest("hex");
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

function validateOutboxBatchAckUnsafe(ack, { operation, requestedLimit } = {}) {
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

export function validateOutboxBatchAckV1(ack, context = {}) {
  try { return validateOutboxBatchAckUnsafe(ack, context); } catch { return false; }
}

const MAIL_RUN_IDEMPOTENCY_KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const MAIL_RUN_ERROR_CODES = new Set([
  "invalid_request", "idempotency_conflict", "idempotency_in_progress", "revision_conflict",
  "unauthenticated", "forbidden", "not_found", "rate_limited", "unavailable", "provider_failure",
]);

const CANONICAL_JSON_MAX_DEPTH = 64;
const CANONICAL_JSON_MAX_NODES = 100_000;
const CANONICAL_JSON_MAX_BYTES = 264_192;

function isWellFormedString(value) {
  if (typeof value !== "string") return false;
  if (typeof value.isWellFormed === "function") return value.isWellFormed();
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) return false;
  }
  return true;
}

// Iterative and bounded so hostile persisted JSON cannot exhaust the JS stack.
// The active set tracks ancestry, accepting shared acyclic values but rejecting cycles.
function isCanonicalJson(value, {
  maxDepth = CANONICAL_JSON_MAX_DEPTH,
  maxNodes = CANONICAL_JSON_MAX_NODES,
  maxBytes = CANONICAL_JSON_MAX_BYTES,
} = {}) {
  try {
    const active = new WeakSet();
    const stack = [{ value, depth: 0, exit: false }];
    let nodes = 0;
    while (stack.length > 0) {
      const current = stack.pop();
      const item = current.value;
      if (current.exit) { active.delete(item); continue; }
      nodes += 1;
      if (nodes > maxNodes || current.depth > maxDepth) return false;
      if (item === null || typeof item === "boolean") continue;
      if (typeof item === "string") { if (!isWellFormedString(item)) return false; continue; }
      if (typeof item === "number") { if (!Number.isFinite(item)) return false; continue; }
      if (typeof item !== "object" || (!Array.isArray(item) && !isPlainObject(item))) return false;
      if (active.has(item)) return false;
      active.add(item);
      stack.push({ value: item, depth: current.depth, exit: true });
      if (Array.isArray(item)) {
        for (let index = item.length - 1; index >= 0; index -= 1) {
          if (!Object.hasOwn(item, index)) return false;
          stack.push({ value: item[index], depth: current.depth + 1, exit: false });
        }
      } else {
        const keys = Object.keys(item);
        for (let index = keys.length - 1; index >= 0; index -= 1) {
          const key = keys[index];
          if (!isWellFormedString(key)) return false;
          stack.push({ value: item[key], depth: current.depth + 1, exit: false });
        }
      }
    }
    return Buffer.byteLength(stableJson(value), "utf8") <= maxBytes;
  } catch { return false; }
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

function validateMailRunStoredResponseUnsafe(response, { requestId, requestedLimit, persistedResponse } = {}) {
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

export function validateMailRunStoredResponseV1(response, context = {}) {
  try { return validateMailRunStoredResponseUnsafe(response, context); } catch { return false; }
}

export function serializeMailRunResponseBodyV1(response, context = {}) {
  if (!validateMailRunStoredResponseV1(response, context)) return null;
  try { return stableJson(response.responseBody); } catch { return null; }
}

function matchesMailRunIdentity(ack, { originalRequestId, idempotencyKey, bodyDigest } = {}) {
  return UUID.test(ack.requestId) && MAIL_RUN_IDEMPOTENCY_KEY.test(ack.idempotencyKey) && SHA256.test(ack.bodyDigest)
    && (originalRequestId === undefined || ack.requestId === originalRequestId)
    && (idempotencyKey === undefined || ack.idempotencyKey === idempotencyKey)
    && (bodyDigest === undefined || ack.bodyDigest === bodyDigest);
}

function validateMailRunBeginAckUnsafe(ack, context = {}) {
  if (!isPlainObject(ack) || ack.schemaKind !== "mail_run_begin_ack" || !matchesMailRunIdentity(ack, context)) return false;
  if (!Number.isInteger(ack.revision) || ack.revision < 1) return false;
  const base = ["schemaKind", "disposition", "requestId", "idempotencyKey", "bodyDigest", "revision"];
  if (ack.disposition === "execute") return hasExactKeys(ack, [...base, "leaseToken", "leaseExpiresAt"]) && UUID.test(ack.leaseToken) && isDateTime(ack.leaseExpiresAt);
  if (ack.disposition === "in_progress") return hasExactKeys(ack, [...base, "leaseExpiresAt"]) && isDateTime(ack.leaseExpiresAt);
  if (ack.disposition !== "replay" || !hasExactKeys(ack, [...base, "responseStatus", "responseHeaders", "responseBody", "completedAt"]) || !isDateTime(ack.completedAt)) return false;
  return validateMailRunStoredResponseV1(mailRunResponseFrom(ack), { requestId: ack.requestId, requestedLimit: context.requestedLimit, persistedResponse: context.persistedResponse });
}

export function validateMailRunBeginAckV1(ack, context = {}) {
  try { return validateMailRunBeginAckUnsafe(ack, context); } catch { return false; }
}

function validateMailRunCompleteAckUnsafe(ack, context = {}) {
  const keys = ["schemaKind", "disposition", "requestId", "idempotencyKey", "bodyDigest", "revision", "responseStatus", "responseHeaders", "responseBody", "completedAt"];
  if (!hasExactKeys(ack, keys) || ack.schemaKind !== "mail_run_complete_ack" || !["completed", "replay"].includes(ack.disposition)) return false;
  if (!matchesMailRunIdentity(ack, context) || !Number.isInteger(ack.revision) || ack.revision < 1 || (context.expectedRevision !== undefined && ack.revision !== context.expectedRevision) || !isDateTime(ack.completedAt)) return false;
  return validateMailRunStoredResponseV1(mailRunResponseFrom(ack), { requestId: ack.requestId, requestedLimit: context.requestedLimit, persistedResponse: context.persistedResponse });
}

export function validateMailRunCompleteAckV1(ack, context = {}) {
  try {
    const strictContext = context.originalRequestId === undefined && context.requestId !== undefined
      ? { ...context, originalRequestId: context.requestId }
      : context;
    return validateMailRunCompleteAckUnsafe(ack, strictContext);
  } catch { return false; }
}

const OUTBOX_PROJECTION_KEYS = ["schemaKind","id","commercialLeadId","kind","revision","payloadSha256","attempts","state","leaseOwner","leaseToken","leaseExpiresAt","nextAttemptAt","lastResult","cancellationReason"];
const PROVIDER_RESULT_KEYS = ["schemaKind","category","code","receipt"];
const GRAPH_RECEIPT_KEYS = ["provider","httpStatus","graphRequestId","providerMessageId","acceptanceKind","attemptReceipt","observedAt"];
const RESULT_SHAPES = Object.freeze({
  accepted:{ schemaKind:"provider_accepted", codes:new Set([null]), acceptanceKind:"graph_http_202" },
  transient_pre_acceptance:{ schemaKind:"provider_transient_pre_acceptance", codes:new Set(["timeout_before_response","network_before_response","throttled_429","graph_5xx"]), acceptanceKind:null },
  permanent_pre_acceptance:{ schemaKind:"provider_permanent_pre_acceptance", codes:new Set(["oauth_authentication_failed","exchange_rbac_denied","invalid_recipient","invalid_payload","retry_exhausted"]), acceptanceKind:null },
  ambiguous:{ schemaKind:"provider_ambiguous", codes:new Set(["timeout_after_request_body","connection_lost_after_dispatch","unknown_acceptance"]), acceptanceKind:null },
});
function validProviderResult(result) {
  if (!hasExactKeys(result, PROVIDER_RESULT_KEYS) || !hasExactKeys(result.receipt, GRAPH_RECEIPT_KEYS)) return false;
  const shape = RESULT_SHAPES[result.category];
  if (!shape || result.schemaKind !== shape.schemaKind || !shape.codes.has(result.code)) return false;
  const receipt = result.receipt;
  if (receipt.provider !== "microsoft_graph" || !Number.isInteger(receipt.httpStatus) || receipt.httpStatus < 100 || receipt.httpStatus > 599) return false;
  if (!(receipt.graphRequestId === null || (typeof receipt.graphRequestId === "string" && receipt.graphRequestId.length >= 1 && receipt.graphRequestId.length <= 200))) return false;
  if (!(receipt.providerMessageId === null || (typeof receipt.providerMessageId === "string" && receipt.providerMessageId.length >= 1 && receipt.providerMessageId.length <= 512))) return false;
  return receipt.acceptanceKind === shape.acceptanceKind && typeof receipt.attemptReceipt === "string" && receipt.attemptReceipt.length >= 1 && receipt.attemptReceipt.length <= 2000 && isDateTime(receipt.observedAt);
}
export function validateOutboxProjectionV1(projection, { item, state, result, nextAttemptAt = null } = {}) {
  if (!hasExactKeys(projection, OUTBOX_PROJECTION_KEYS) || !validOutboxItem(item)) return false;
  if (!["retry","sent","dead","review"].includes(state) || projection.schemaKind !== "outbox_projection" || projection.state !== state) return false;
  if (projection.id !== item.id || projection.commercialLeadId !== item.commercialLeadId || projection.kind !== item.kind || projection.payloadSha256 !== item.payloadSha256) return false;
  if (projection.revision !== item.revision + 1 || projection.attempts !== item.attempts) return false;
  if (projection.leaseOwner !== null || projection.leaseToken !== null || projection.leaseExpiresAt !== null || projection.cancellationReason !== null) return false;
  if (!validProviderResult(result) || !validProviderResult(projection.lastResult) || stableJson(projection.lastResult) !== stableJson(result)) return false;
  if (state === "retry") return isDateTime(nextAttemptAt) && projection.nextAttemptAt === nextAttemptAt && result.category === "transient_pre_acceptance";
  if (projection.nextAttemptAt !== null) return false;
  return (state === "sent" && result.category === "accepted") || (state === "dead" && ["permanent_pre_acceptance","transient_pre_acceptance"].includes(result.category)) || (state === "review" && result.category === "ambiguous");
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
