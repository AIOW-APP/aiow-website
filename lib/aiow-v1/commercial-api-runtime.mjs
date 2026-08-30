import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createRequire } from "node:module";
import { secureServiceUrl } from "./quote-adapter-auth.mjs";

const require = createRequire(import.meta.url);
const contract = require("../../docs/contracts/aiow-commercial-control-plane-v1.json");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDEMPOTENCY = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const HEX = /^[0-9a-f]{64}$/;
const REQUEST_ID = UUID;
const plain = (value) => value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;

function resolveRef(ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) return null;
  return ref.slice(2).split("/").reduce((value, token) => value?.[token.replaceAll("~1", "/").replaceAll("~0", "~")], contract);
}
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function formatValid(name, value) {
  if (typeof value !== "string") return false;
  if (name === "uuid") return UUID.test(value);
  if (name === "date") { if (!DATE.test(value)) return false; const [y,m,d]=value.split("-").map(Number); const x=new Date(Date.UTC(y,m-1,d)); return x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d; }
  if (name === "date-time") return DATE_TIME.test(value) && Number.isFinite(Date.parse(value));
  if (name === "email") return EMAIL.test(value);
  return false;
}
function schemaValid(value, input, depth = 0) {
  if (depth > 80 || !input || typeof input !== "object") return false;
  const schema = input.$ref ? resolveRef(input.$ref) : input;
  if (!schema) return false;
  if (Object.hasOwn(schema, "const") && !same(value, schema.const)) return false;
  if (schema.enum && !schema.enum.some((item) => same(item, value))) return false;
  if (schema.oneOf && schema.oneOf.filter((part) => schemaValid(value, part, depth + 1)).length !== 1) return false;
  if (schema.anyOf && !schema.anyOf.some((part) => schemaValid(value, part, depth + 1))) return false;
  if (schema.allOf && !schema.allOf.every((part) => schemaValid(value, part, depth + 1))) return false;
  if (schema.if && schemaValid(value, schema.if, depth + 1) && schema.then && !schemaValid(value, schema.then, depth + 1)) return false;
  if (schema.if && !schemaValid(value, schema.if, depth + 1) && schema.else && !schemaValid(value, schema.else, depth + 1)) return false;
  if (schema.type === "null" && value !== null) return false;
  if (schema.type === "boolean" && typeof value !== "boolean") return false;
  if (schema.type === "string") {
    if (typeof value !== "string" || (schema.minLength !== undefined && value.length < schema.minLength) || (schema.maxLength !== undefined && value.length > schema.maxLength)) return false;
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) return false;
    if (schema.format && !formatValid(schema.format, value)) return false;
  }
  if (schema.type === "integer" && !Number.isSafeInteger(value)) return false;
  if (schema.type === "number" && (typeof value !== "number" || !Number.isFinite(value))) return false;
  if (["integer","number"].includes(schema.type)) {
    if (schema.minimum !== undefined && value < schema.minimum) return false;
    if (schema.maximum !== undefined && value > schema.maximum) return false;
  }
  if (schema.type === "array") {
    if (!Array.isArray(value) || (schema.minItems !== undefined && value.length < schema.minItems) || (schema.maxItems !== undefined && value.length > schema.maxItems)) return false;
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) return false;
    if (schema.items && !value.every((item) => schemaValid(item, schema.items, depth + 1))) return false;
  }
  if (schema.type === "object") {
    if (!plain(value)) return false;
    if (schema.required?.some((key) => !Object.hasOwn(value, key))) return false;
    if (schema.additionalProperties === false && Object.keys(value).some((key) => !Object.hasOwn(schema.properties ?? {}, key))) return false;
    for (const [key, child] of Object.entries(schema.properties ?? {})) if (Object.hasOwn(value, key) && !schemaValid(value[key], child, depth + 1)) return false;
  }
  return true;
}
export function validateContractDefinition(name, value) { return schemaValid(value, contract.$defs[name]); }
export function validateOpsMutationAck(value) {
  if (!validateContractDefinition("OpsMutationACK", value)) return false;
  if (value.revision !== value.previousRevision + 1 || value.projection.revision !== value.revision) return false;
  const fields={mark_read:"unread",set_priority:"priority",transition_status:"status",set_next_action:"nextActionAt",set_legal_hold:"legalHold",set_active_customer_relation:"activeCustomerRelation"};
  const field=fields[value.operation]; return !field || same(value.effect[field], value.projection[field]);
}
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (plain(value)) return `{${Object.keys(value).sort().map((key)=>`${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function payloadDigest(value) { return createHash("sha256").update(canonicalJson(value), "utf8").digest("hex"); }
export function validIdempotencyKey(value) { return typeof value === "string" && IDEMPOTENCY.test(value); }
export function validRequestId(value) { return typeof value === "string" && REQUEST_ID.test(value); }
export function validSha256(value) { return typeof value === "string" && HEX.test(value); }
export class CommercialError extends Error { constructor(code, status, message, payload=null) { super(message); this.name="CommercialError"; this.code=code; this.status=status; this.payload=payload; } }
export async function readBoundedJson(request, limit) {
  const declared=Number(request.headers.get("content-length")??"0"); if (Number.isFinite(declared)&&declared>limit) throw new CommercialError("invalid_request",413,"body too large");
  if (!request.body) throw new CommercialError("invalid_request",400,"body missing"); const reader=request.body.getReader(); const chunks=[]; let size=0;
  try { while(true){const {done,value}=await reader.read(); if(done) break; size+=value.byteLength; if(size>limit){await reader.cancel();throw new CommercialError("invalid_request",413,"body too large");} chunks.push(value);} } finally {reader.releaseLock();}
  const body=Buffer.concat(chunks.map((chunk)=>Buffer.from(chunk)),size); try { return { value: JSON.parse(body.toString("utf8")), bytes: body }; } catch { throw new CommercialError("invalid_request",400,"invalid JSON"); }
}
async function boundedResponseJson(response, limit=4*1024*1024){ const text=await response.text(); if(Buffer.byteLength(text)>limit) throw new CommercialError("unavailable",502,"RPC response too large"); try{return JSON.parse(text);}catch{throw new CommercialError("unavailable",502,"RPC response malformed");} }
export function serviceConfigured(env=process.env){return Boolean(env.AIOW_SUPABASE_URL&&env.AIOW_SUPABASE_SERVICE_ROLE_KEY&&env.AIOW_SUPABASE_SERVICE_ROLE_KEY.length<=4096);}
export async function commercialRpc(name,args,{env=process.env,fetchImpl=fetch,timeoutMs=8000}={}){
  if(!/^[a-z][a-z0-9_]{2,63}$/.test(name)||!plain(args)) throw new TypeError("invalid RPC request");
  if(!serviceConfigured(env)) throw new CommercialError("unavailable",503,"service unavailable");
  let root; try{root=secureServiceUrl(env.AIOW_SUPABASE_URL,env.AIOW_COMMERCIAL_TEST_MODE==="1");}catch{throw new CommercialError("unavailable",503,"service unavailable");}
  let response; try{response=await fetchImpl(new URL(`/rest/v1/rpc/${name}`,root),{method:"POST",headers:{"content-type":"application/json",apikey:env.AIOW_SUPABASE_SERVICE_ROLE_KEY,authorization:`Bearer ${env.AIOW_SUPABASE_SERVICE_ROLE_KEY}`},body:JSON.stringify(args),signal:AbortSignal.timeout(Math.min(Math.max(timeoutMs,100),15000)),cache:"no-store",redirect:"error"});}catch{throw new CommercialError("unavailable",502,"RPC unavailable");}
  const payload=await boundedResponseJson(response); if(!response.ok){const pg=plain(payload)&&typeof payload.code==="string"?payload.code:""; const conflict=["P0001","23505"].includes(pg)||response.status===409; throw new CommercialError(conflict?"idempotency_conflict":"invalid_request",conflict?409:(response.status===400?400:502),"RPC rejected",payload);} return payload;
}
export function hmacSignature({secret,method,path,timestamp,requestId,idempotencyKey,bodyBytes}){ if(typeof secret!=="string"||Buffer.byteLength(secret)<32||Buffer.byteLength(secret)>256) throw new TypeError("invalid secret"); const digest=createHash("sha256").update(bodyBytes).digest("hex"); return createHmac("sha256",secret).update(`${method}\n${path}\n${timestamp}\n${requestId}\n${idempotencyKey}\n${digest}`,"utf8").digest("hex"); }
export function verifyHmac(input){try{if(!/^[0-9]{10}$/.test(input.timestamp)||Math.abs(Math.floor((input.now??Date.now())/1000)-Number(input.timestamp))>300||!validRequestId(input.requestId)||!validIdempotencyKey(input.idempotencyKey)||!/^[0-9a-f]{64}$/.test(input.signature))return false; const expected=Buffer.from(hmacSignature(input),"hex"),actual=Buffer.from(input.signature,"hex"); return expected.length===actual.length&&timingSafeEqual(expected,actual);}catch{return false;}}
