import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizationBearerMatches } from "@/lib/aiow-v1/quote-adapter-auth.mjs";
import { executeMailOutboxRun, MailOutboxWorkerError } from "@/lib/aiow-v1/mail-outbox-worker.mjs";
import { createMailOutboxStore, mailOutboxConfigured } from "@/lib/aiow-v1/mail-outbox-store";

export const runtime = "nodejs";
const noStore = { "cache-control":"no-store" };
function error(status: number, code: "invalid_request"|"unauthenticated"|"unavailable"|"provider_failure", message: string) { return NextResponse.json({ schemaKind:"error",code,message,requestId:randomUUID() }, {status,headers:noStore}); }
function providerOptions() {
  const target = { gateId:"mail_provider_production_v1", environment:"production", provider:"microsoft_graph", tenantId:process.env.AIOW_MICROSOFT_TENANT_ID, applicationId:process.env.AIOW_MICROSOFT_APPLICATION_ID, mailbox:process.env.AIOW_MICROSOFT_MAILBOX, sender:process.env.AIOW_MICROSOFT_SENDER, controlMailbox:process.env.AIOW_MICROSOFT_CONTROL_MAILBOX, runtimeCapability:"mail_send", fallbackProvider:null };
  const options: Record<string, unknown> = { clientSecret:process.env.AIOW_MICROSOFT_CLIENT_SECRET, target };
  if (process.env.AIOW_MAIL_PROVIDER_TEST_MODE === "1") {
    const tokenUrl = process.env.AIOW_MICROSOFT_TOKEN_URL; const graphUrl = process.env.AIOW_MICROSOFT_GRAPH_SEND_URL;
    for (const value of [tokenUrl,graphUrl]) if (value) { const url = new URL(value); if (url.protocol !== "http:" || !["127.0.0.1","localhost","::1"].includes(url.hostname)) throw new Error("invalid provider mock URL"); }
    if (tokenUrl) options.tokenUrl = tokenUrl;
    if (graphUrl) options.graphUrl = graphUrl;
  }
  return options;
}
export async function POST(request: Request) {
  if (!mailOutboxConfigured() || process.env.AIOW_MICROSOFT_CONTROL_MAILBOX === "info@aiow.io") return error(503,"unavailable","Mail provider unavailable");
  if (!authorizationBearerMatches(request.headers.get("authorization"), [process.env.AIOW_MAIL_WORKER_SECRET])) return error(401,"unauthenticated","Authentication required");
  const length = Number(request.headers.get("content-length") ?? "0"); if (length > 1024) return error(409,"invalid_request","Invalid request");
  let body: unknown; try { body = JSON.parse(await request.text()); } catch { return error(409,"invalid_request","Invalid request"); }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 || !Object.hasOwn(body,"limit")) return error(409,"invalid_request","Invalid request");
  const limit = (body as {limit: unknown}).limit; if (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 50) return error(409,"invalid_request","Invalid request");
  try {
    const store = createMailOutboxStore();
    const ack = await executeMailOutboxRun({ limit:Number(limit), workerId:process.env.AIOW_MAIL_WORKER_ID || "aiow-mail-outbox-v2", claim:store.claim, loadJobs:store.loadJobs, loadProviderGate:store.loadProviderGate, finalize:store.finalize, providerOptions:providerOptions() });
    return NextResponse.json(ack,{status:200,headers:noStore});
  } catch (caught) {
    const status = caught instanceof MailOutboxWorkerError ? caught.status : 503;
    return error(status === 409 ? 409 : 503, status === 409 ? "provider_failure" : "unavailable", status === 409 ? "Mail dispatch conflict" : "Mail provider unavailable");
  }
}
