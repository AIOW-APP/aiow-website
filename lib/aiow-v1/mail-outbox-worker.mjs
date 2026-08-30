import { createHash } from "node:crypto";
import { validateOutboxBatchAckV1, validateOutboxProjectionV1 } from "./commercial-contract-validator.mjs";
import { sendMicrosoftGraphJob, validateMailJobV2 } from "./microsoft-graph-provider.mjs";

export class MailOutboxWorkerError extends Error {
  constructor(code, status = 409) { super(code); this.name = "MailOutboxWorkerError"; this.code = code; this.status = status; }
}
function exactJobForItem(job, item) {
  return validateMailJobV2(job) && job.jobId === item.id && job.commercialLeadId === item.commercialLeadId && job.kind === item.kind && job.payloadSha256 === item.payloadSha256 && job.attempt === item.attempts && job.leaseOwner === item.leaseOwner && job.leaseToken === item.leaseToken && job.leaseExpiresAt === item.leaseExpiresAt;
}
function finalizeArgs(item, result) {
  return { p_job_id:item.id, p_lease_owner:item.leaseOwner, p_lease_token:item.leaseToken, p_payload_digest:item.payloadSha256, p_expected_revision:item.revision, p_result:result };
}
function retryAt(item, retryAfterSeconds) {
  const seconds = [60, 300, 1800, 7200][item.attempts - 1];
  if (!seconds) throw new MailOutboxWorkerError("retry_schedule_invalid");
  // Retry-After remains bounded provider diagnostics. PostgreSQL owns the
  // exact retry schedule so an advisory header cannot conflict at finalize.
  void retryAfterSeconds;
  const claimStartedAt = Date.parse(item.leaseExpiresAt) - 300_000;
  if (!Number.isFinite(claimStartedAt)) throw new MailOutboxWorkerError("retry_schedule_invalid");
  // PostgreSQL's canonical aiow_iso_v1 formatter emits six fractional
  // digits. Preserve that wire representation so the finalize projection
  // can be compared byte-for-byte instead of rejecting a successful retry.
  return new Date(claimStartedAt + seconds * 1000).toISOString().replace(/(\.\d{3})Z$/, "$1000Z");
}
function exhausted(result) {
  return { schemaKind:"provider_permanent_pre_acceptance", category:"permanent_pre_acceptance", code:"retry_exhausted", receipt:{...result.receipt,acceptanceKind:null} };
}
function acceptedFinalizeAmbiguous(result) {
  return { schemaKind:"provider_ambiguous", category:"ambiguous", code:"unknown_acceptance", receipt:{...result.receipt,acceptanceKind:null} };
}
function invalidPayloadResult(item, now) {
  const observedAt = new Date(now()).toISOString();
  const attemptReceipt = createHash("sha256").update(`${item.id}:${item.attempts}:400::${observedAt}`).digest("hex");
  return {
    schemaKind:"provider_permanent_pre_acceptance",
    category:"permanent_pre_acceptance",
    code:"invalid_payload",
    receipt:{ provider:"microsoft_graph", httpStatus:400, graphRequestId:null, providerMessageId:null, acceptanceKind:null, attemptReceipt, observedAt },
  };
}
const FINAL_STATE = Object.freeze({ aiow_mail_outbox_sent_v2:"sent", aiow_mail_outbox_retry_v2:"retry", aiow_mail_outbox_dead_v2:"dead", aiow_mail_outbox_review_v2:"review" });
async function finalizeExact(finalize, rpc, args, item) {
  const projection = await finalize(rpc, args);
  if (!validateOutboxProjectionV1(projection, { item, state:FINAL_STATE[rpc], result:args.p_result, nextAttemptAt:args.p_next_attempt_at ?? null })) throw new MailOutboxWorkerError("invalid_finalize_ack");
  return projection;
}

export async function executeMailOutboxRun({ limit, workerId, now = () => Date.now(), claim, loadJobs, loadProviderGate, markDispatch, finalize, send = sendMicrosoftGraphJob, providerOptions = {}, beforeProviderCall, afterProviderResult, beforeFinalize }) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || typeof workerId !== "string" || workerId.length < 1 || workerId.length > 100) throw new MailOutboxWorkerError("invalid_request", 409);
  const nowIso = new Date(now()).toISOString();
  const claimAck = await claim({ p_worker_id:workerId, p_limit:limit, p_now:nowIso });
  if (!validateOutboxBatchAckV1(claimAck, { operation:"claim", requestedLimit:limit })) throw new MailOutboxWorkerError("invalid_claim_ack");
  if (claimAck.items.some((item) => item.leaseOwner !== workerId)) throw new MailOutboxWorkerError("lease_owner_mismatch");
  if (claimAck.itemCount === 0) return { ...claimAck, operation:"mail_run" };
  const [jobs, gate] = await Promise.all([loadJobs(claimAck.items), loadProviderGate(claimAck.items)]);
  if (!Array.isArray(jobs) || jobs.length !== claimAck.itemCount) throw new MailOutboxWorkerError("mail_job_count_mismatch");
  const byId = new Map();
  for (const job of jobs) { if (byId.has(job?.jobId)) throw new MailOutboxWorkerError("duplicate_mail_job"); byId.set(job?.jobId, job); }
  const failures = [];
  for (const item of claimAck.items) {
    const job = byId.get(item.id);
    let providerResult;
    let retryAfterSeconds = null;
    if (!validateMailJobV2(job)) {
      if (beforeProviderCall) await beforeProviderCall({ item, job, valid:false });
      providerResult = invalidPayloadResult(item, now);
    } else if (!exactJobForItem(job, item)) {
      throw new MailOutboxWorkerError("mail_job_lease_mismatch", 503);
    } else {
      if (beforeProviderCall) await beforeProviderCall({ item, job, valid:true });
      if (typeof markDispatch !== "function") throw new MailOutboxWorkerError("dispatch_marker_unavailable", 503);
      await markDispatch(item);
      providerResult = await send(job, gate, { ...providerOptions, now, onRetryAfter:(seconds) => { retryAfterSeconds = seconds; } });
    }
    if (afterProviderResult) await afterProviderResult({ item, job, providerResult });
    let rpc;
    let result = providerResult;
    const args = finalizeArgs(item, result);
    if (result.category === "accepted") rpc = "aiow_mail_outbox_sent_v2";
    else if (result.category === "ambiguous") rpc = "aiow_mail_outbox_review_v2";
    else if (result.category === "permanent_pre_acceptance") rpc = "aiow_mail_outbox_dead_v2";
    else if (result.category === "transient_pre_acceptance" && item.attempts >= 5) { rpc = "aiow_mail_outbox_dead_v2"; result = exhausted(result); args.p_result = result; }
    else if (result.category === "transient_pre_acceptance") { rpc = "aiow_mail_outbox_retry_v2"; args.p_next_attempt_at = retryAt(item, retryAfterSeconds); }
    else throw new MailOutboxWorkerError("provider_category_crossing");
    if (beforeFinalize) await beforeFinalize({ item, job, rpc, args });
    try { await finalizeExact(finalize, rpc, args, item); }
    catch (error) {
      if (result.category === "accepted") {
        const reviewResult = acceptedFinalizeAmbiguous(result);
        const reviewArgs = finalizeArgs(item, reviewResult);
        try { await finalizeExact(finalize, "aiow_mail_outbox_review_v2", reviewArgs, item); }
        catch { failures.push(item.id); }
      } else failures.push(item.id);
    }
  }
  if (failures.length) throw new MailOutboxWorkerError("finalize_conflict");
  return { ...claimAck, operation:"mail_run" };
}
