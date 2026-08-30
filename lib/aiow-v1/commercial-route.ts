import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { hmacSignature, validIdempotencyKey } from "./commercial-api-runtime.mjs";
import { secureServiceUrl } from "./quote-adapter-auth.mjs";

export const NO_STORE = { "cache-control": "no-store" };
export function requestId() { return randomUUID(); }
export function json(value: unknown, status = 200, headers: Record<string,string> = {}) { return NextResponse.json(value, { status, headers: { ...NO_STORE, ...headers } }); }
export function apiError(kind: "booking"|"analytics"|"ops"|"quote_prepare"|"quote_commit", code: string, requestIdValue: string, status: number, message = "Request rejected") {
  return json({ schemaKind: `${kind}_error`, code, message, requestId: requestIdValue, retriable: status === 429 || status >= 500 }, status);
}
export function requireJson(request: Request) { return request.headers.get("content-type")?.toLowerCase().split(";",1)[0].trim() === "application/json"; }
export function idempotency(request: Request) { const value=request.headers.get("idempotency-key")??""; return validIdempotencyKey(value)?value:null; }
export async function internalPost(urlValue: string, secret: string, body: unknown, requestIdValue: string, key: string, testMode=false) {
  const url=secureServiceUrl(urlValue,testMode); const bytes=Buffer.from(JSON.stringify(body)); const timestamp=String(Math.floor(Date.now()/1000));
  const signature=hmacSignature({secret,method:"POST",path:`${url.pathname}${url.search}`,timestamp,requestId:requestIdValue,idempotencyKey:key,bodyBytes:bytes});
  return fetch(url,{method:"POST",headers:{"content-type":"application/json","x-aiow-request-id":requestIdValue,"idempotency-key":key,"x-aiow-webhook-timestamp":timestamp,"x-aiow-webhook-signature":signature},body:bytes,signal:AbortSignal.timeout(10000),cache:"no-store",redirect:"error"});
}
export function trustedOps(request: Request) { const id=request.headers.get("x-aiow-operator-id"),role=request.headers.get("x-aiow-operator-role"); return id==="richard"&&role==="ops_admin"; }
