import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { MAIL_OUTBOX_PATH, verifyMailOutboxHttpRequest } from "@/lib/aiow-v1/mail-outbox-auth.mjs";
import { buildMailProviderOptions } from "@/lib/aiow-v1/mail-provider-options.mjs";
import { executeMailOutboxRun, MailOutboxWorkerError } from "@/lib/aiow-v1/mail-outbox-worker.mjs";
import { createMailOutboxStore, mailOutboxConfigured } from "@/lib/aiow-v1/mail-outbox-store";

export const runtime = "nodejs";
const noStore = { "cache-control":"no-store" };
function error(status: number, code: "invalid_request"|"unauthenticated"|"unavailable"|"provider_failure", message: string) { return NextResponse.json({ schemaKind:"error",code,message,requestId:randomUUID() }, {status,headers:noStore}); }
export async function POST(request: Request) {
  let requestUrl: URL;
  try { requestUrl = new URL(request.url); } catch { return error(401,"unauthenticated","Authentication required"); }
  if (requestUrl.protocol !== "https:" || requestUrl.pathname !== MAIL_OUTBOX_PATH || requestUrl.search !== "") return error(401,"unauthenticated","Authentication required");
  const length = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(length) || length < 0 || length > 1024) return error(409,"invalid_request","Invalid request");
  let bodyBytes: Uint8Array;
  try { bodyBytes = new Uint8Array(await request.arrayBuffer()); } catch { return error(409,"invalid_request","Invalid request"); }
  if (bodyBytes.byteLength > 1024 || !verifyMailOutboxHttpRequest({ request, bodyBytes, secret:process.env.AIOW_MAIL_WORKER_SECRET })) return error(401,"unauthenticated","Authentication required");
  if (!mailOutboxConfigured() || process.env.AIOW_MICROSOFT_CONTROL_MAILBOX === "info@aiow.io") return error(503,"unavailable","Mail provider unavailable");
  let body: unknown; try { body = JSON.parse(Buffer.from(bodyBytes).toString("utf8")); } catch { return error(409,"invalid_request","Invalid request"); }
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 1 || !Object.hasOwn(body,"limit")) return error(409,"invalid_request","Invalid request");
  const limit = (body as {limit: unknown}).limit; if (!Number.isInteger(limit) || Number(limit) < 1 || Number(limit) > 50) return error(409,"invalid_request","Invalid request");
  try {
    const providerOptions = buildMailProviderOptions();
    const store = createMailOutboxStore();
    const ack = await executeMailOutboxRun({ limit:Number(limit), workerId:process.env.AIOW_MAIL_WORKER_ID || "aiow-mail-outbox-v2", claim:store.claim, loadJobs:store.loadJobs, loadProviderGate:store.loadProviderGate, finalize:store.finalize, providerOptions });
    return NextResponse.json(ack,{status:200,headers:noStore});
  } catch (caught) {
    const status = caught instanceof MailOutboxWorkerError ? caught.status : 503;
    return error(status === 409 ? 409 : 503, status === 409 ? "provider_failure" : "unavailable", status === 409 ? "Mail dispatch conflict" : "Mail provider unavailable");
  }
}
