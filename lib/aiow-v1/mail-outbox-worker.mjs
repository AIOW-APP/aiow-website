import { validateOutboxBatchAckV1 } from "./commercial-contract-validator.mjs";
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
function retryAt(nowMs, attempt, retryAfterSeconds) {
  const exponential = Math.min(30 * (2 ** Math.max(0, attempt - 1)), 3600);
  const seconds = retryAfterSeconds ?? exponential;
  return new Date(nowMs + seconds * 1000).toISOString();
}
function exhausted(result) {
  return { schemaKind:"provider_permanent_pre_acceptance", category:"permanent_pre_acceptance", code:"retry_exhausted", receipt:{...result.receipt,acceptanceKind:null} };
}
function acceptedFinalizeAmbiguous(result) {
  return { schemaKind:"provider_ambiguous", category:"ambiguous", code:"unknown_acceptance", receipt:{...result.receipt,acceptanceKind:null} };
}

export async function executeMailOutboxRun({ limit, workerId, now = () => Date.now(), claim, loadJobs, loadProviderGate, finalize, send = sendMicrosoftGraphJob, providerOptions = {} }) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 || typeof workerId !== "string" || workerId.length < 1 || workerId.length > 100) throw new MailOutboxWorkerError("invalid_request", 409);
  const nowIso = new Date(now()).toISOString();
  const claimAck = await claim({ p_worker_id:workerId, p_limit:limit, p_now:nowIso });
  if (!validateOutboxBatchAckV1(claimAck, { operation:"claim", requestedLimit:limit })) throw new MailOutboxWorkerError("invalid_claim_ack");
  if (claimAck.items.some((item) => item.leaseOwner !== workerId)) throw new MailOutboxWorkerError("lease_owner_mismatch");
  if (claimAck.itemCount === 0) return { ...claimAck, operation:"mail_run" };
  const [jobs, gate] = await Promise.all([loadJobs(claimAck.items), loadProviderGate()]);
  if (!Array.isArray(jobs) || jobs.length !== claimAck.itemCount) throw new MailOutboxWorkerError("mail_job_count_mismatch");
  const byId = new Map();
  for (const job of jobs) { if (byId.has(job?.jobId)) throw new MailOutboxWorkerError("duplicate_mail_job"); byId.set(job?.jobId, job); }
  const failures = [];
  for (const item of claimAck.items) {
    const job = byId.get(item.id);
    let providerResult;
    let retryAfterSeconds = null;
    if (!exactJobForItem(job, item)) {
      providerResult = await send(job ?? {}, gate, { ...providerOptions, now });
      if (providerResult.category !== "permanent_pre_acceptance" || providerResult.code !== "invalid_payload") throw new MailOutboxWorkerError("malformed_job_not_permanent");
    } else {
      providerResult = await send(job, gate, { ...providerOptions, now, onRetryAfter:(seconds) => { retryAfterSeconds = seconds; } });
    }
    let rpc;
    let result = providerResult;
    const args = finalizeArgs(item, result);
    if (result.category === "accepted") rpc = "aiow_mail_outbox_sent_v2";
    else if (result.category === "ambiguous") rpc = "aiow_mail_outbox_review_v2";
    else if (result.category === "permanent_pre_acceptance") rpc = "aiow_mail_outbox_dead_v2";
    else if (result.category === "transient_pre_acceptance" && item.attempts >= 5) { rpc = "aiow_mail_outbox_dead_v2"; result = exhausted(result); args.p_result = result; }
    else if (result.category === "transient_pre_acceptance") { rpc = "aiow_mail_outbox_retry_v2"; args.p_next_attempt_at = retryAt(now(), item.attempts, retryAfterSeconds); }
    else throw new MailOutboxWorkerError("provider_category_crossing");
    try { await finalize(rpc, args); }
    catch (error) {
      if (result.category === "accepted") {
        try { await finalize("aiow_mail_outbox_review_v2", finalizeArgs(item, acceptedFinalizeAmbiguous(result))); }
        catch { failures.push(item.id); }
      } else failures.push(item.id);
    }
  }
  if (failures.length) throw new MailOutboxWorkerError("finalize_conflict");
  return { ...claimAck, operation:"mail_run" };
}
