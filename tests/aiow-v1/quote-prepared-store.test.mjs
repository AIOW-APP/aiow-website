import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { endpointPayloadDigest } from "../../lib/aiow-v1/commercial-api-runtime.mjs";
import { loadDurableCommittedQuote,loadDurablePreparedQuote } from "../../lib/aiow-v1/quote-prepared-store.mjs";

const fixtures=JSON.parse(await readFile(new URL("../fixtures/aiow-commercial-contract-v1.json",import.meta.url),"utf8"));
const quote=fixtures.requests.QuoteRequest;
const ids={requestId:"123e4567-e89b-42d3-a456-426614174000",idempotencyKey:"quote-key-000001",leadId:"223e4567-e89b-42d3-a456-426614174000",commercialLeadId:"323e4567-e89b-42d3-a456-426614174000",quoteNumber:"AIOW-2026-0001"};
const digest=endpointPayloadDigest("quote_prepare",quote);
const prepared={schemaKind:"prepared_quote_authority",...ids,state:"prepared",requestPayloadDigest:digest,quote,receivedAt:"2026-08-30T12:00:00.000Z",expiresAt:"2026-08-31T12:00:00.000Z"};
const pdf=Buffer.from("%PDF-original-durable-bytes");
const committed={schemaKind:"committed_quote_pdf",requestId:ids.requestId,leadId:ids.leadId,commercialLeadId:ids.commercialLeadId,quoteNumber:ids.quoteNumber,filename:`${ids.quoteNumber}.pdf`,mimeType:"application/pdf",base64:pdf.toString("base64"),sha256:createHash("sha256").update(pdf).digest("hex")};
const env={AIOW_SUPABASE_URL:"http://127.0.0.1:54321",AIOW_SUPABASE_SERVICE_ROLE_KEY:"service-role",AIOW_COMMERCIAL_TEST_MODE:"1"};
function rpc(value,expectedName){return async(url,init)=>{assert.equal(url.pathname,`/rest/v1/rpc/${expectedName}`);assert.equal(init.method,"POST");assert.equal(init.headers.authorization,"Bearer service-role");return new Response(JSON.stringify(value),{headers:{"content-type":"application/json"}});};}

test("prepare then restarted instance loads via the narrow identity-bound RPC",async()=>{
  const options={env,fetchImpl:rpc(prepared,"aiow_quote_prepared_load_v1"),now:Date.parse("2026-08-30T13:00:00Z")};
  assert.deepEqual(await loadDurablePreparedQuote(ids,options),{quote,receivedAt:prepared.receivedAt,state:"prepared",requestPayloadDigest:digest});
});

test("prepared loader rejects wrong identity, digest and expiry as conflicts",async()=>{
  const cases=[{...prepared,requestId:"423e4567-e89b-42d3-a456-426614174000"},{...prepared,requestPayloadDigest:"0".repeat(64)},{...prepared,expiresAt:"2026-08-30T12:30:00.000Z"}];
  for(const value of cases)await assert.rejects(()=>loadDurablePreparedQuote(ids,{env,fetchImpl:rpc(value,"aiow_quote_prepared_load_v1"),now:Date.parse("2026-08-30T13:00:00Z")}),error=>error.status===409);
});

test("committed PDF loader returns exact persisted bytes and rejects mutation",async()=>{
  const options={env,fetchImpl:rpc(committed,"aiow_quote_committed_pdf_load_v1")};
  const loaded=await loadDurableCommittedQuote({...ids,requestPayloadDigest:digest},options);
  assert.deepEqual(loaded.bytes,pdf);assert.equal(loaded.sha256,committed.sha256);
  await assert.rejects(()=>loadDurableCommittedQuote({...ids,requestPayloadDigest:digest},{env,fetchImpl:rpc({...committed,base64:Buffer.from("%PDF-mutated").toString("base64")},"aiow_quote_committed_pdf_load_v1")}),error=>error.status===409);
});
