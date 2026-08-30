import { createHash, randomUUID as nodeRandomUUID } from "node:crypto";
import { verifyMailOutboxHttpRequest } from "./mail-outbox-auth.mjs";
import { validateMailRunBeginAckV1, validateMailRunCompleteAckV1, validateOutboxBatchAckV1, serializeMailRunResponseBodyV1 } from "./commercial-contract-validator.mjs";

const WORKER=/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/;
const JSON_TYPE=/^application\/json$/i;
const WIRE_HEADERS=(requestId)=>({"cache-control":"no-store","content-type":"application/json; charset=utf-8","x-aiow-request-id":requestId});
const STORED_HEADERS=(requestId)=>({cacheControl:"no-store",contentType:"application/json; charset=utf-8",xAiowRequestId:requestId});
function closedError(code,message,requestId,retriable){const value={schemaKind:"error",code,message,requestId};if(retriable!==undefined)value.retriable=retriable;return value;}
function response(status,body,requestId,serialized){return new Response(serialized??JSON.stringify(body),{status,headers:WIRE_HEADERS(requestId)});}
function sqlstate(error){return typeof error?.message==="string"&&["22023","23505","P0001"].includes(error.message)?error.message:null;}
function beginFailure(error,requestId){const state=sqlstate(error);if(state==="22023")return response(400,closedError("invalid_request","Invalid request",requestId),requestId);if(state==="23505")return response(409,closedError("idempotency_conflict","Idempotency key conflicts with another request",requestId),requestId);if(state==="P0001")return response(409,closedError("revision_conflict","Mail run revision conflict",requestId),requestId);return response(503,closedError("unavailable","Mail run unavailable",requestId,true),requestId);}
function authenticatedHeaders(request){return {requestId:request.headers.get("x-aiow-request-id"),idempotencyKey:request.headers.get("idempotency-key")};}

export async function handleMailOutboxRunV1(request,options){
  const env=options.env??process.env, now=options.now??Date.now, makeId=options.randomUUID??nodeRandomUUID;
  let url;try{url=new URL(request.url);}catch{const id=makeId();return response(401,closedError("unauthenticated","Authentication required",id),id);}
  if(url.protocol!=="https:"||url.pathname!=="/api/internal/mail-outbox/run"||url.search!=="") {const id=makeId();return response(401,closedError("unauthenticated","Authentication required",id),id);}
  const lengthHeader=request.headers.get("content-length");
  if(lengthHeader!==null&&!/^[0-9]{1,4}$/.test(lengthHeader)){const id=makeId();return response(401,closedError("unauthenticated","Authentication required",id),id);}
  if(lengthHeader!==null&&Number(lengthHeader)>1024){const id=makeId();return response(401,closedError("unauthenticated","Authentication required",id),id);}
  let bodyBytes;try{bodyBytes=new Uint8Array(await request.arrayBuffer());}catch{const id=makeId();return response(401,closedError("unauthenticated","Authentication required",id),id);}
  if(bodyBytes.byteLength>1024||!verifyMailOutboxHttpRequest({request,bodyBytes,secret:env.AIOW_MAIL_WORKER_SECRET,now:now()})){const id=makeId();return response(401,closedError("unauthenticated","Authentication required",id),id);}
  const {requestId,idempotencyKey}=authenticatedHeaders(request);
  if(!JSON_TYPE.test(request.headers.get("content-type")??""))return response(400,closedError("invalid_request","Invalid request",requestId),requestId);
  let parsed;try{parsed=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bodyBytes));}catch{return response(400,closedError("invalid_request","Invalid request",requestId),requestId);}
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)||Object.getPrototypeOf(parsed)!==Object.prototype||Object.keys(parsed).length!==1||!Object.hasOwn(parsed,"limit")||!Number.isInteger(parsed.limit)||parsed.limit<1||parsed.limit>50)return response(400,closedError("invalid_request","Invalid request",requestId),requestId);
  const workerId=env.AIOW_MAIL_WORKER_ID||"mail-run-worker";
  if(!WORKER.test(workerId)||!options.configured(env))return response(503,closedError("unavailable","Mail run unavailable",requestId,true),requestId);
  const bodyDigest=createHash("sha256").update(bodyBytes).digest("hex");
  let begin;
  try{begin=await options.rpc("aiow_mail_run_begin_v1",{p_request_id:requestId,p_idempotency_key:idempotencyKey,p_body_digest:bodyDigest,p_worker_id:workerId});}
  catch(error){return beginFailure(error,requestId);}
  if(!validateMailRunBeginAckV1(begin,{idempotencyKey,bodyDigest,requestedLimit:parsed.limit}))return response(503,closedError("unavailable","Mail run unavailable",requestId,true),requestId);
  if(begin.disposition==="in_progress")return response(409,closedError("idempotency_in_progress","Mail run is already in progress",begin.requestId,true),begin.requestId);
  if(begin.disposition==="replay"){
    const stored={responseStatus:begin.responseStatus,responseHeaders:begin.responseHeaders,responseBody:begin.responseBody};
    const serialized=serializeMailRunResponseBodyV1(stored,{requestId:begin.requestId,requestedLimit:parsed.limit,persistedResponse:stored});
    if(serialized===null)return response(503,closedError("unavailable","Mail run unavailable",begin.requestId,true),begin.requestId);
    return response(begin.responseStatus,begin.responseBody,begin.requestId,serialized);
  }
  let stored;
  try{
    const store=options.createStore();const providerOptions=options.buildProviderOptions();
    const ack=await options.execute({limit:parsed.limit,workerId,claim:store.claim,loadJobs:store.loadJobs,loadProviderGate:store.loadProviderGate,finalize:store.finalize,providerOptions});
    if(!validateOutboxBatchAckV1(ack,{operation:"mail_run",requestedLimit:parsed.limit}))throw new Error("invalid mail run ACK");
    stored={responseStatus:200,responseHeaders:STORED_HEADERS(begin.requestId),responseBody:ack};
  }catch{
    stored={responseStatus:503,responseHeaders:STORED_HEADERS(begin.requestId),responseBody:closedError("unavailable","Mail run unavailable",begin.requestId,true)};
  }
  let completed;
  try{completed=await options.rpc("aiow_mail_run_complete_v1",{p_request_id:begin.requestId,p_idempotency_key:begin.idempotencyKey,p_body_digest:begin.bodyDigest,p_lease_token:begin.leaseToken,p_response_status:stored.responseStatus,p_response_headers:stored.responseHeaders,p_response_body:stored.responseBody});}
  catch{return response(503,closedError("unavailable","Mail run unavailable",begin.requestId,true),begin.requestId);}
  if(!validateMailRunCompleteAckV1(completed,{originalRequestId:begin.requestId,idempotencyKey,bodyDigest,requestedLimit:parsed.limit,expectedRevision:begin.revision,persistedResponse:stored}))return response(503,closedError("unavailable","Mail run unavailable",begin.requestId,true),begin.requestId);
  const serialized=serializeMailRunResponseBodyV1(stored,{requestId:begin.requestId,requestedLimit:parsed.limit,persistedResponse:stored});
  if(serialized===null)return response(503,closedError("unavailable","Mail run unavailable",begin.requestId,true),begin.requestId);
  return response(stored.responseStatus,stored.responseBody,begin.requestId,serialized);
}
