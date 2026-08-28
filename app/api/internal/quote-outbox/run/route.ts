import { NextResponse } from "next/server";
import { authorizationBearerMatches } from "@/lib/aiow-v1/quote-adapter-auth.mjs";
import { quoteAdapterRpc, supabaseConfigured, validateClaimRpcResponse } from "@/lib/aiow-v1/quote-adapter-store";
import { classifyGmailFailure, GmailProviderError, sendGmailJob } from "@/lib/aiow-v1/gmail-provider.mjs";

export const runtime = "nodejs";
function disabled() { return !supabaseConfigured() || !process.env.AIOW_QUOTE_WORKER_SECRET || !process.env.AIOW_GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.AIOW_GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || process.env.AIOW_GOOGLE_DELEGATED_SUBJECT !== "offerte@aiow.ai"; }
function providerOverrides() {
  if (process.env.AIOW_QUOTE_PROVIDER_TEST_MODE !== "1") return {};
  const tokenUrl = process.env.AIOW_GOOGLE_TOKEN_URL; const gmailUrl = process.env.AIOW_GMAIL_SEND_URL;
  for (const value of [tokenUrl,gmailUrl]) if (value) { const url = new URL(value); if (!(url.hostname === "127.0.0.1" || url.hostname === "localhost") || url.protocol !== "http:") throw new Error("invalid provider mock URL"); }
  return { tokenUrl, gmailUrl };
}
export async function POST(request: Request) {
  if (disabled()) return NextResponse.json({ ok:false,claimed:0,sent:0,retried:0,dead:0,review:0,failed:0 }, { status:503,headers:{"cache-control":"no-store"} });
  if (!authorizationBearerMatches(request.headers.get("authorization"), [process.env.AIOW_QUOTE_WORKER_SECRET, process.env.CRON_SECRET])) return NextResponse.json({ ok:false,claimed:0,sent:0,retried:0,dead:0,review:0,failed:0 }, { status:401,headers:{"cache-control":"no-store"} });
  const counts = { claimed:0,sent:0,retried:0,dead:0,review:0,failed:0 };
  try {
    const jobs = validateClaimRpcResponse(await quoteAdapterRpc("aiow_quote_claim_outbox_v1", { p_limit: 5, p_lease_seconds: 120 })); counts.claimed=jobs.length;
    const overrides = providerOverrides();
    for (const job of jobs) {
      let providerId: string;
      try {
        const result = await sendGmailJob(job, overrides);
        providerId = result.id;
      } catch (caught) {
        const kind = classifyGmailFailure(caught); const code = caught instanceof GmailProviderError ? caught.code : "WORKER_FAILURE";
        try {
          if (kind === "ambiguous") { await quoteAdapterRpc("aiow_quote_outbox_review_v1", { p_outbox_id:job.id,p_lease_token:job.leaseToken,p_error_code:code,p_provider_message_id:null }); counts.review++; }
          else if (kind === "transient") { const result = await quoteAdapterRpc("aiow_quote_outbox_retry_v1", { p_outbox_id:job.id,p_lease_token:job.leaseToken,p_error_code:code }); if (typeof result === "object" && result && "state" in result && result.state === "dead") counts.dead++; else counts.retried++; }
          else { await quoteAdapterRpc("aiow_quote_outbox_dead_v1", { p_outbox_id:job.id,p_lease_token:job.leaseToken,p_error_code:code }); counts.dead++; }
        } catch { counts.failed++; }
        continue;
      }
      try {
        await quoteAdapterRpc("aiow_quote_outbox_sent_v1", { p_outbox_id:job.id,p_lease_token:job.leaseToken,p_provider_message_id:providerId }); counts.sent++;
      } catch {
        try { await quoteAdapterRpc("aiow_quote_outbox_review_v1", { p_outbox_id:job.id,p_lease_token:job.leaseToken,p_error_code:"PROVIDER_ACCEPTED_DB_FINALIZE",p_provider_message_id:providerId }); counts.review++; }
        catch { counts.failed++; }
      }
    }
    return NextResponse.json({ ok:counts.failed===0,...counts }, { status:counts.failed===0?200:502,headers:{"cache-control":"no-store"} });
  } catch (caught) {
    console.warn("AIOW quote outbox worker failed", { status:502, reason:caught instanceof Error?caught.name:"unknown" });
    return NextResponse.json({ ok:false,...counts,failed:counts.failed+1 }, { status:502,headers:{"cache-control":"no-store"} });
  }
}
