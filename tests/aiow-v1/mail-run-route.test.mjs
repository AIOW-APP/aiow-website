import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { signMailOutboxRequest } from "../../lib/aiow-v1/mail-outbox-auth.mjs";
import { handleMailOutboxRunV1 } from "../../lib/aiow-v1/mail-run-route.mjs";

const SECRET="s".repeat(40);
const NOW=Date.parse("2026-08-30T12:00:00.000Z");
const INCOMING="123e4567-e89b-42d3-a456-426614174000";
const ORIGINAL="123e4567-e89b-42d3-a456-426614174099";
const KEY="mail-run-route-0001";
const TOKEN="123e4567-e89b-42d3-a456-426614174050";
const BODY=Buffer.from('{"limit":2}',"utf8");
const DIGEST=createHash("sha256").update(BODY).digest("hex");
const baseEnv={AIOW_MAIL_WORKER_SECRET:SECRET,AIOW_MAIL_WORKER_ID:"worker-1"};
function request(body=BODY,overrides={}) {
  const timestamp=String(Math.floor(NOW/1000));
  const signature=signMailOutboxRequest({secret:SECRET,method:"POST",path:"/api/internal/mail-outbox/run",timestamp,requestId:INCOMING,idempotencyKey:KEY,bodyBytes:body});
  return new Request("https://worker.aiow.io/api/internal/mail-outbox/run",{method:"POST",headers:{"content-type":"application/json","x-aiow-webhook-timestamp":timestamp,"x-aiow-request-id":INCOMING,"idempotency-key":KEY,"x-aiow-webhook-signature":signature,...overrides},body});
}
function headers(requestId=ORIGINAL){return {cacheControl:"no-store",contentType:"application/json; charset=utf-8",xAiowRequestId:requestId};}
function workerAck(){return {schemaKind:"outbox_batch_ack",operation:"mail_run",requestedLimit:2,itemCount:0,items:[]};}
function executeBegin(overrides={}) { return {schemaKind:"mail_run_begin_ack",disposition:"execute",requestId:ORIGINAL,idempotencyKey:KEY,bodyDigest:DIGEST,revision:3,leaseToken:TOKEN,leaseExpiresAt:"2026-08-30T12:05:00.000Z",...overrides}; }
function deps(begin,{execute=async()=>workerAck(),completeFailure=false}={}) {
  const calls=[];
  return {calls,options:{env:baseEnv,now:()=>NOW,randomUUID:()=>"123e4567-e89b-42d3-a456-426614174088",configured:()=>true,createStore:()=>({}),buildProviderOptions:()=>({}),execute,rpc:async(name,args)=>{calls.push([name,args]);if(name==="aiow_mail_run_begin_v1") return begin;if(completeFailure) throw Object.assign(new Error("08006"),{code:"RPC"});return {schemaKind:"mail_run_complete_ack",disposition:"completed",requestId:ORIGINAL,idempotencyKey:KEY,bodyDigest:DIGEST,revision:3,responseStatus:args.p_response_status,responseHeaders:args.p_response_headers,responseBody:args.p_response_body,completedAt:"2026-08-30T12:00:01.000Z"};}}};
}
async function body(response){return JSON.parse(await response.text());}

test("execute is begun once, completed durably, then returned with original correlation",async()=>{
  let workerCalls=0; const d=deps(executeBegin(),{execute:async(options)=>{workerCalls++;assert.equal(options.limit,2);assert.equal(options.workerId,"worker-1");return workerAck();}});
  const response=await handleMailOutboxRunV1(request(),d.options);
  assert.equal(response.status,200);assert.equal(workerCalls,1);assert.deepEqual(await body(response),workerAck());assert.equal(response.headers.get("x-aiow-request-id"),ORIGINAL);
  assert.deepEqual(d.calls.map(([name])=>name),["aiow_mail_run_begin_v1","aiow_mail_run_complete_v1"]);
  assert.deepEqual(d.calls[0][1],{p_request_id:INCOMING,p_idempotency_key:KEY,p_body_digest:DIGEST,p_worker_id:"worker-1"});
  assert.equal(d.calls[1][1].p_lease_token,TOKEN);assert.deepEqual(d.calls[1][1].p_response_headers,headers());
});

test("in-progress and replay never call worker or complete",async()=>{
  let workerCalls=0;
  const inProgress={schemaKind:"mail_run_begin_ack",disposition:"in_progress",requestId:ORIGINAL,idempotencyKey:KEY,bodyDigest:DIGEST,revision:3,leaseExpiresAt:"2026-08-30T12:05:00.000Z"};
  let d=deps(inProgress,{execute:async()=>{workerCalls++;}});let response=await handleMailOutboxRunV1(request(),d.options);
  assert.equal(response.status,409);assert.deepEqual(await body(response),{schemaKind:"error",code:"idempotency_in_progress",message:"Mail run is already in progress",requestId:ORIGINAL,retriable:true});assert.equal(d.calls.length,1);
  const replay={schemaKind:"mail_run_begin_ack",disposition:"replay",requestId:ORIGINAL,idempotencyKey:KEY,bodyDigest:DIGEST,revision:3,responseStatus:200,responseHeaders:headers(),responseBody:workerAck(),completedAt:"2026-08-30T12:00:01.000Z"};
  d=deps(replay,{execute:async()=>{workerCalls++;}});response=await handleMailOutboxRunV1(request(),d.options);
  assert.equal(response.status,200);assert.equal(await response.text(),'{"itemCount":0,"items":[],"operation":"mail_run","requestedLimit":2,"schemaKind":"outbox_batch_ack"}');assert.equal(d.calls.length,1);assert.equal(workerCalls,0);
});

test("authenticated malformed body is 400 before begin; pre-auth failures do not echo incoming correlation",async()=>{
  const malformed=Buffer.from('{"limit":0}',"utf8");let d=deps(executeBegin());let response=await handleMailOutboxRunV1(request(malformed),d.options);
  assert.equal(response.status,400);assert.equal((await body(response)).requestId,INCOMING);assert.equal(d.calls.length,0);
  response=await handleMailOutboxRunV1(request(BODY,{"x-aiow-webhook-signature":"0".repeat(64)}),d.options);
  assert.equal(response.status,401);assert.equal((await body(response)).requestId,"123e4567-e89b-42d3-a456-426614174088");assert.equal(response.headers.get("x-aiow-request-id"),"123e4567-e89b-42d3-a456-426614174088");assert.equal(d.calls.length,0);
});

test("worker failure is stored as 503, while complete failure is an unstored 503 without a second execution",async()=>{
  let workerCalls=0;let d=deps(executeBegin(),{execute:async()=>{workerCalls++;throw new Error("boom");}});let response=await handleMailOutboxRunV1(request(),d.options);
  assert.equal(response.status,503);assert.equal((await body(response)).code,"unavailable");assert.equal(d.calls.length,2);assert.equal(d.calls[1][1].p_response_status,503);
  d=deps(executeBegin(),{execute:async()=>{workerCalls++;return workerAck();},completeFailure:true});response=await handleMailOutboxRunV1(request(),d.options);
  assert.equal(response.status,503);assert.equal((await body(response)).retriable,true);assert.equal(d.calls.length,2);assert.equal(workerCalls,2);
});

test("begin SQLSTATE mappings are closed and worker identity fails before begin",async()=>{
  for(const [sqlstate,status,code] of [["22023",400,"invalid_request"],["23505",409,"idempotency_conflict"],["P0001",409,"revision_conflict"]]){
    const d=deps(executeBegin());d.options.rpc=async()=>{throw Object.assign(new Error(sqlstate),{code:"RPC"});};const response=await handleMailOutboxRunV1(request(),d.options);assert.equal(response.status,status);assert.equal((await body(response)).code,code);
  }
  const d=deps(executeBegin());d.options.env={...baseEnv,AIOW_MAIL_WORKER_ID:"bad worker"};const response=await handleMailOutboxRunV1(request(),d.options);assert.equal(response.status,503);assert.equal(d.calls.length,0);
});
