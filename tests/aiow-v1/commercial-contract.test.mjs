import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import Ajv2020 from "ajv/dist/2020.js";
import {
  PROVIDER_GATE_APPROVAL_FIELDS,
  buildProviderGateApprovalBindingDigestV1,
  validateMailRunBeginAckV1,
  validateMailRunCompleteAckV1,
  validateMailRunStoredResponseV1,
  serializeMailRunResponseBodyV1,
  validateOutboxBatchAckV1,
  validateProviderGateCurrentV1,
  validateQuoteAbandonBatchAckV1,
} from "../../lib/aiow-v1/commercial-contract-validator.mjs";

const contractUrl = new URL("../../docs/contracts/aiow-commercial-control-plane-v1.json", import.meta.url);
const fixtureUrl = new URL("../fixtures/aiow-commercial-contract-v1.json", import.meta.url);
const contract = JSON.parse(await readFile(contractUrl, "utf8"));
const canonicalFixtures = JSON.parse(await readFile(fixtureUrl, "utf8"));
const ajv = new Ajv2020({ strict: true, allErrors: true, validateFormats: true });
const annotationKeywords = new Set();
function collectAnnotationKeywords(value) {
  if (Array.isArray(value)) return value.forEach(collectAnnotationKeywords);
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key.startsWith("x-aiow-")) annotationKeywords.add(key);
    collectAnnotationKeywords(child);
  }
}
collectAnnotationKeywords(contract);
for (const keyword of annotationKeywords) ajv.addKeyword({ keyword, valid: true });
ajv.addFormat("uuid", /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
ajv.addFormat("date", /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
ajv.addFormat("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const validateRoot = ajv.compile(contract);
const uuid = "123e4567-e89b-42d3-a456-426614174000";

function deref(schema) {
  if (schema.$ref) {
    assert.match(schema.$ref, /^#\//, `external ref ${schema.$ref}`);
    const target = schema.$ref.slice(2).split("/").reduce((value, token) => value?.[token.replaceAll("~1", "/").replaceAll("~0", "~")], contract);
    assert.ok(target, `unresolved ref ${schema.$ref}`);
    return target;
  }
  return schema;
}
function validatorForRef(ref) {
  return ajv.compile({ $schema:"https://json-schema.org/draft/2020-12/schema", $defs:contract.$defs, $ref:ref });
}
function assertSqlValue(name, arg, value) {
  if (value === null) return assert.equal(arg.nullable, true, `${name}/${arg.name} unexpected null`);
  const ok = {
    uuid: typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value),
    text: typeof value === "string",
    integer: Number.isInteger(value),
    bigint: Number.isSafeInteger(value),
    boolean: typeof value === "boolean",
    date: typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value),
    timestamptz: typeof value === "string" && !Number.isNaN(Date.parse(value)),
    jsonb: value !== null && typeof value === "object",
  }[arg.sqlType];
  assert.equal(ok, true, `${name}/${arg.name} SQL ${arg.sqlType}`);
}
function applyFixtureConstraints(value, input) {
  const schema = deref(input);
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  for (const [key, property] of Object.entries(schema.properties ?? {})) {
    if (!Object.hasOwn(value, key)) continue;
    if (Object.hasOwn(property, "const")) value[key] = property.const;
    else if (property.type === "null") value[key] = null;
    else applyFixtureConstraints(value[key], property);
  }
  for (const constraint of schema.allOf ?? []) applyFixtureConstraints(value, constraint);
  return value;
}
function fixture(input) {
  const schema = deref(input);
  if (Object.hasOwn(schema, "const")) return schema.const;
  if (schema.enum) return schema.enum[0];
  if (schema.oneOf) return fixture(schema.oneOf[0]);
  if (schema.type === "null") return null;
  if (schema.type === "boolean") return true;
  if (schema.type === "integer" || schema.type === "number") return schema.minimum ?? 1;
  if (schema.type === "array") return Array.from({ length: schema.minItems ?? 0 }, () => fixture(schema.items));
  if (schema.type === "object") {
    const result = {};
    for (const key of schema.required ?? []) result[key] = fixture(schema.properties[key]);
    return applyFixtureConstraints(result, schema);
  }
  if (schema.type === "string") {
    if (schema.format === "uuid") return uuid;
    if (schema.format === "date-time") return "2026-08-29T12:00:00.000Z";
    if (schema.format === "date") return "2026-08-30";
    if (schema.format === "email") return "operator@example.com";
    if (schema.contentEncoding === "base64") return "UERG";
    const patternSamples = [
      [/AIOW-.*pdf/, "AIOW-2026-0001.pdf"],
      [/AIOW-/, "AIOW-2026-0001"],
      [/0-9a-f.*64/, "a".repeat(64)],
      [/A-Za-z0-9/, "abcdefghijklmnop"],
      [/1-9.*3/, "1234 AB"],
      [/0-9.*8/, "12345678"],
      [/A-Z.*2/, "NL"],
      [/0-2.*0-5/, "10:00"],
    ];
    for (const [match, value] of patternSamples) if (match.test(schema.pattern ?? "")) return value;
    return "x".repeat(Math.max(1, schema.minLength ?? 1));
  }
  throw new Error(`cannot create fixture for ${JSON.stringify(schema)}`);
}
function validDef(name) {
  const value = fixture({ $ref: `#/$defs/${name}` });
  assert.equal(validateRoot(value), true, `${name}: ${ajv.errorsText(validateRoot.errors)}`);
  return value;
}

test("is a valid Draft 2020-12 schema and compiles in Ajv strict mode", () => {
  assert.equal(ajv.validateSchema(contract), true, ajv.errorsText(ajv.errors));
  assert.doesNotThrow(() => ajv.compile(contract));
});

test("every advertised root variant has a valid fixture", () => {
  assert.ok(contract.oneOf.length >= 20);
  for (const branch of contract.oneOf) {
    const name = branch.$ref.split("/").at(-1);
    validDef(name);
  }
  for (const union of ["OpsMutation", "AnalyticsEvent", "ProviderResult"]) {
    for (const branch of contract.$defs[union].oneOf) {
      const value = fixture(branch);
      assert.equal(validateRoot(value), true, `${union}/${branch.$ref}: ${ajv.errorsText(validateRoot.errors)}`);
    }
  }
});

test("root rejects null, scalars, arrays, arbitrary objects and malformed variants", () => {
  for (const value of [null, 123, "x", [], {}, { arbitrary: "shape" }]) assert.equal(validateRoot(value), false);
  const booking = validDef("BookingRequest");
  assert.equal(validateRoot({ ...booking, unknown: true }), false);
  const { subject, ...missing } = booking;
  assert.equal(validateRoot(missing), false);
  assert.equal(validateRoot({ ...booking, subject: "invented" }), false);
  assert.equal(validateRoot({ ...booking, company: null }), false);
});

test("all object boundaries are recursively closed", () => {
  const seen = new Set();
  function walk(input, path = "#") {
    const schema = deref(input);
    if (seen.has(schema)) return;
    seen.add(schema);
    if (schema.type === "object") {
      const definesBoundary = Boolean(schema.required || schema.additionalProperties === false || schema.unevaluatedProperties === false);
      if (definesBoundary) assert.equal(schema.additionalProperties === false || schema.unevaluatedProperties === false, true, `${path} is open`);
      for (const [key, child] of Object.entries(schema.properties ?? {})) walk(child, `${path}/properties/${key}`);
      for (const child of Object.values(schema.patternProperties ?? {})) walk(child, `${path}/patternProperties`);
    }
    for (const keyword of ["oneOf", "anyOf", "allOf"]) for (const child of schema[keyword] ?? []) walk(child, `${path}/${keyword}`);
    if (schema.items) walk(schema.items, `${path}/items`);
  }
  for (const branch of contract.oneOf) walk(branch);
  const lead = validDef("LeadProjection");
  lead.deliverySummary.injected = true;
  assert.equal(validateRoot(lead), false);
});

test("operation registry freezes all HTTP and SQL authorities with resolvable schema refs", () => {
  const ops = contract["x-aiow-operations"];
  const http = {
    booking: ["POST", "/api/booking"], quote: ["POST", "/api/quote"], events: ["POST", "/api/events"],
    ops_queue: ["GET", "/api/ops/leads"], ops_mutate: ["PATCH", "/api/ops/leads/{leadId}"], ops_report: ["GET", "/api/ops/report"],
    booking_adapter: ["POST", "/api/internal/booking-adapter"], quote_adapter: ["POST", "/api/internal/quote-adapter"], mail_run: ["POST", "/api/internal/mail-outbox/run"],
  };
  for (const [name, [method, path]] of Object.entries(http)) {
    assert.equal(ops[name].method, method); assert.equal(ops[name].path, path); assert.ok(ops[name].auth); assert.ok(ops[name].request); assert.ok(ops[name].responses);
  }
  const quotePdf=contract["x-aiow-binary-responses"].quotePdfV1;
  assert.equal(ops.quote.responses["200"],"#/x-aiow-binary-responses/quotePdfV1");
  assert.equal(quotePdf.mediaType,"application/pdf");
  assert.equal(quotePdf.authorityAckRef,"#/$defs/QuoteCommitACK");
  assert.match(quotePdf.replay,/original status, headers and identical PDF bytes/);
  assert.equal(ops.events.responses["503"],"#/$defs/AnalyticsError");
  const rpcNames = ["aiow_mail_run_begin_v1","aiow_mail_run_complete_v1","aiow_mail_run_receipts_delete_expired_v1","aiow_quote_prepare_v1","aiow_quote_commit_v1","aiow_booking_commit_v1","aiow_commercial_queue_v1","aiow_commercial_mutate_v1","aiow_commercial_report_v1","aiow_commercial_event_v1","aiow_mail_outbox_claim_v2","aiow_mail_outbox_sent_v2","aiow_mail_outbox_retry_v2","aiow_mail_outbox_dead_v2","aiow_mail_outbox_review_v2","aiow_mail_outbox_resolve_v2","aiow_commercial_retention_dry_run_v1","aiow_mail_outbox_recover_stale_v2","aiow_mail_outbox_cancel_v2","aiow_provider_gate_write_v1","aiow_active_customer_relation_set_v1","aiow_quote_abandon_expired_v1"];
  assert.deepEqual(Object.keys(ops).filter((name) => ops[name].transport === "sql_rpc"), rpcNames);
  function assertRefs(value) { if (typeof value === "string" && value.startsWith("#/$defs/")) return void deref({$ref:value}); if (Array.isArray(value)) return value.forEach(assertRefs); if (!value || typeof value !== "object") return; for (const child of Object.values(value)) assertRefs(child); }
  assertRefs(ops);
  for (const name of rpcNames) { assert.equal(ops[name].name, name); assert.ok(ops[name].args.length); deref({$ref: ops[name].ackRef}); }
});

test("lifecycle matrix, revision effects and mutation restrictions are exact", () => {
  const life = contract["x-aiow-lifecycle"];
  assert.deepEqual(life.transitions, {new:["qualified","awaiting_info","scan_planned","lost"],qualified:["awaiting_info","scan_planned","proposal","lost"],awaiting_info:["qualified","scan_planned","lost"],scan_planned:["proposal","won","lost"],proposal:["won","lost"],won:[],lost:["qualified"]});
  assert.deepEqual(life.terminal, ["won","lost"]); assert.match(life.acceptedNonReplayMutation, /exactly once/); assert.match(life.replay, /no revision check/);
  assert.deepEqual(life.forbiddenTransitionActors, ["mail","provider","analytics","client"]); assert.match(life.markRead, /true to false only/); assert.match(life.nextActionAt, /must be null/);
});

test("persistence is successor-only and freezes identities, FKs and v2 cutover", () => {
  const db = contract["x-aiow-persistence"];
  assert.equal(db.predecessorMigration, "supabase/migrations/20260828_aiow_quote_adapter_v1.sql"); assert.match(db.successorRule, /never edit/);
  assert.deepEqual(Object.keys(db.tables), ["commercial_leads","booking_leads","commercial_mail_outbox","commercial_mail_run_receipts","commercial_events","commercial_event_daily","commercial_audit","commercial_provider_gates","commercial_idempotency"]);
  assert.deepEqual(db.tables.commercial_leads.unique, [{name:"commercial_leads_source_source_id_uq",columns:["source","source_id"]}]); assert.deepEqual(db.tables.commercial_mail_outbox.unique, [{name:"commercial_mail_outbox_lead_kind_uq",columns:["commercial_lead_id","kind"]}]);
  assert.ok(db.tables.commercial_leads.checks.every((item)=>item.name && item.expression)); assert.equal(db.quoteAlterations[0].foreignKey.references,"commercial_leads(id)");
  assert.match(db.compatibility.quoteBackfill, /one-to-one/); assert.match(db.compatibility.v1OutboxCutover, /no new jobs/); assert.deepEqual(db.activationAcceptance.slice(0,2), ["zero_to_head","production_baseline_to_head"]);
});

test("analytics events are per-event closed, canonical and PII-hostile", () => {
  const union = contract.$defs.AnalyticsEvent.oneOf;
  assert.equal(union.length, 12);
  const names = union.map((branch) => deref(branch).properties.event.const);
  assert.ok(names.includes("experiment_exposed"));
  for (const branch of union) {
    const schema = deref(branch); const value = fixture(branch);
    assert.equal(validateRoot(value), true, schema.properties.event.const);
    assert.equal(validateRoot({...value, email:"person@example.com"}), false);
    if (Object.hasOwn(value, "route")) assert.equal(validateRoot({...value, route:"https://evil.invalid/?email=a@b.io"}), false);
    for (const [key, prop] of Object.entries(schema.properties)) if (key !== "experiment") assert.notEqual(prop.type, "object", "only the closed experiment object may be nested");
  }
  assert.deepEqual(contract["x-aiow-analytics"].metadataNotPersistedOrLogged, ["raw IP","user-agent","referrer","query string","UTM","free text"]);
  assert.match(contract["x-aiow-analytics"].experiment, /same server-validated experimentId and variant/);
});

test("idempotency, outbox, auth, gates and retention are fail closed", () => {
  const idem=contract["x-aiow-idempotency"], outbox=contract["x-aiow-outbox"], auth=contract["x-aiow-operator-auth"], gate=contract["x-aiow-provider-gate"], retention=contract["x-aiow-retention"];
  assert.equal(idem.digest,"sha256_utf8_rfc8785_canonical_json"); assert.equal(idem.atomicOutcome,true); assert.match(idem.sameKeySameDigest,/before_revision_check/); assert.equal(idem.sameKeyDifferentDigest.status,409); assert.equal(idem.covered.length,11);
  assert.deepEqual(outbox.pairs,{booking:["customer_booking","internal_booking"],quote:["customer_quote","internal_lead"]}); assert.equal(outbox.lease.durationSeconds,300); assert.equal(outbox.maxAttempts,5); assert.equal(outbox.mapping.ambiguous,"review"); assert.equal(outbox.ambiguous,"never auto-resend");
  assert.equal(auth.customProductionDomain,"404 before auth or data for UI, API, exports, and PII assets"); assert.equal(auth.allowedHostUnauthenticated.status,401); assert.equal(auth.authenticatedUnauthorized.status,403); assert.deepEqual(auth.capabilities.outbox_resolve,["ops_admin"]); assert.match(auth.vercelSso,/never sole/);
  assert.equal(gate.defaultState,"disabled"); assert.equal(gate.productionProvider,"microsoft_graph"); assert.equal(gate.gmailProductionForbidden,true); assert.equal(gate.fallback,"none"); assert.match(gate.activation,/external separate/);
  const gateRecord=validDef("ProviderGateRecord"); assert.equal(validateRoot({...gateRecord,environment:"production",provider:"gmail_legacy_test_only"}),false); assert.equal(validateRoot({...gateRecord,state:"activated",secretPresent:false}),false);
  assert.equal(retention.activation,"dry-run only; destructive activation is separate owner gate"); assert.equal(retention.classes.booking_quote_lead_pii.days,90); assert.equal(retention.classes.raw_analytics.days,30); assert.equal(retention.classes.analytics_aggregates.months,13); assert.equal(retention.classes.provider_receipts.days,90); assert.equal(retention.classes.non_pii_audit_facts.days,365); assert.match(retention.legalHold,/ops_admin only/);
});

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function sha256(value) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}
function validateOpsMutationAck(value, persistedReplay = value) {
  if (!validateRoot(value)) return false;
  if (value.revision !== value.previousRevision + 1 || value.projection.revision !== value.revision) return false;
  const effectFields = { mark_read:"unread", set_priority:"priority", transition_status:"status", set_next_action:"nextActionAt", set_legal_hold:"legalHold", set_active_customer_relation:"activeCustomerRelation" };
  const field = effectFields[value.operation];
  if (field && value.effect[field] !== value.projection[field]) return false;
  return !value.replayed || stableJson(value) === stableJson(persistedReplay);
}

test("canonical fixture registry contains exactly 79 independently frozen records", () => {
  const expectedCounts = { requests:11, acks:11, errors:7, projections:10, events:12, providerResults:4, rpcBoundaries:22, migrationScenarios:2 };
  const expectedDigests = {
    requests:"991e4fde39e0144c7a378f7a5ceb194fca400286c9a1ab5abebd83fd62e877d2",
    acks:"8610d219732ac8a36b6cfe0c4ad0fe2828768fe8c1f33cb5fa956a3f78f033e6",
    errors:"431fca98f45b3acb589ebc39402c4c63042c0b67f8062f6c5a0abe6368a59e3d",
    projections:"01a4d4ef2134a4f0a779d2ed946556bda56afb5f2a64f8e684ca8c16e0fdaeeb",
    events:"ea4aced2945e90e903d95f27514e90f4b366df6ea4913e028f9029dd51df5d83",
    providerResults:"ce715ea6a8c88bbe647e2ec182fe3e2b691e01706ffb279d52c10df7b377c12d",
    rpcBoundaries:"a9cfb4c93e288985a69d37e2af90a39c965c2c127f814e93366fce20fb50f8fb",
    migrationScenarios:"4cd373a06b638959ecc151112882dd3ed6513b06f15c87f4cd839292589e69de",
  };
  assert.equal(canonicalFixtures.fixtureVersion, 1);
  for (const [group, count] of Object.entries(expectedCounts)) {
    assert.equal(Object.keys(canonicalFixtures[group]).length, count, group);
    assert.equal(new Set(Object.keys(canonicalFixtures[group])).size, count, `${group} duplicate identities`);
    assert.equal(sha256(canonicalFixtures[group]), expectedDigests[group], `${group} digest`);
  }
  const records = Object.entries(expectedCounts).flatMap(([group]) => Object.entries(canonicalFixtures[group]).map(([name, value]) => ({group,name,value}))).sort((a,b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
  assert.equal(records.length, 79);
  assert.equal(sha256(records), "5aa3caa1fbedda9f55c66c4017b87826fe66752c9db3b21e28e723f9a4489014");
  for (const group of ["requests","acks","errors","projections","events","providerResults"])
    for (const [name, value] of Object.entries(canonicalFixtures[group])) assert.equal(validateRoot(value), true, `${group}/${name}: ${ajv.errorsText(validateRoot.errors)}`);
  const ops = contract["x-aiow-operations"];
  for (const [name, boundary] of Object.entries(canonicalFixtures.rpcBoundaries)) {
    for (const arg of boundary.args) {
      const validateArg = validatorForRef(arg.validationRef);
      assert.equal(validateArg(arg.value), true, `${name}/${arg.name}: ${ajv.errorsText(validateArg.errors)}`);
      assertSqlValue(name, arg, arg.value);
    }
    for (const error of Object.values(boundary.errorMap)) {
      const validateError = validatorForRef(error.schemaRef);
      const candidate = {schemaKind:"error",code:error.code,message:"x",requestId:uuid};
      assert.equal(validateError(candidate), true, `${name}/${error.code}: ${ajv.errorsText(validateError.errors)}`);
      const statusByCode = {invalid_request:[400],idempotency_conflict:[409],revision_conflict:[409],unauthenticated:[401],forbidden:[403],not_found:[404],rate_limited:[429],unavailable:[503],provider_failure:[502,503]};
      assert.ok(statusByCode[error.code]?.includes(error.httpStatus), `${name}/${error.code}/${error.httpStatus}`);
    }
    assert.equal(boundary.returnSchemaRef, ops[name].ackRef, `${name} return`);
  }
});

test("operation and RPC registries freeze typed order, private service-role authority and HMAC", () => {
  const ops = contract["x-aiow-operations"], auth = contract["x-aiow-operator-auth"], hmac = contract["x-aiow-internal-hmac"];
  assert.equal(Object.keys(ops).length, 31);
  assert.equal(sha256(ops), "b999b82ba76f3c3e14dfaef6c4472e7e873ea2dbd1f991948da5e8c2d8b3aaa6");
  assert.deepEqual(auth.canonicalActor, {id:"richard",role:"ops_admin",source:"private server configuration AIOW_OPS_OPERATOR_ID; exact value richard; missing or different value fails closed"});
  assert.match(auth.sqlDelegation, /service-role only/); assert.match(auth.rpcActorDerivation, /caller actor\/JWT\/p_operator_id is forbidden/);
  assert.deepEqual(auth.directRpcPolicy, {PUBLIC:"EXECUTE revoked",anon:"EXECUTE revoked",authenticated:"EXECUTE revoked",service_role:"only grantee",browser:"direct invocation denied"});
  assert.equal(stableJson(contract).includes("ops_admin_jwt"), false);
  for (const [name, op] of Object.entries(ops).filter(([,value]) => value.transport === "sql_rpc")) {
    assert.equal(op.visibility, "private_server_only", name);
    const expectedGrants = name === "aiow_mail_run_receipts_delete_expired_v1"
      ? {PUBLIC:false,anon:false,authenticated:false,service_role:false,aiow_mail_run_retention_worker:true}
      : {PUBLIC:false,anon:false,authenticated:false,service_role:true};
    assert.deepEqual(op.grants, expectedGrants, name);
    assert.equal(new Set(op.args.map((arg) => arg.name)).size, op.args.length, `${name} duplicate args`);
    for (const arg of op.args) {
      assert.deepEqual(Object.keys(arg), ["name","sqlType","nullable","default","validationRef"], `${name}/${arg.name}`);
      assert.equal(typeof arg.sqlType, "string"); assert.equal(typeof arg.nullable, "boolean"); assert.equal(typeof arg.validationRef, "string"); assert.ok(arg.validationRef.length > 0);
      if (arg.validationRef.startsWith("#/")) deref({$ref:arg.validationRef});
      assert.doesNotMatch(arg.name, /operator|actor|jwt/i);
    }
    const expectedCardinality = ["aiow_mail_outbox_claim_v2","aiow_mail_outbox_recover_stale_v2","aiow_quote_abandon_expired_v1"].includes(name) ? "exactly_one_batch_ack" : "exactly_one";
    assert.deepEqual(op.returns, {sqlType:"jsonb",schemaRef:op.ackRef,cardinality:expectedCardinality});
    assert.deepEqual(canonicalFixtures.rpcBoundaries[name].args.map(({value,...arg}) => arg), op.args, `${name} canonical boundary`);
  }
  assert.equal(hmac.algorithm,"HMAC-SHA256"); assert.equal(hmac.encoding,"lowercase hexadecimal"); assert.equal(hmac.toleranceSeconds,300);
  assert.equal(hmac.canonicalBytes, "UTF-8(method + \"\\n\" + canonicalPath + \"\\n\" + timestamp + \"\\n\" + requestId + \"\\n\" + idempotencyKey + \"\\n\" + lowercaseHexSha256(rawRequestBodyBytes))");
  assert.deepEqual(hmac.validationOrder,["HTTPS","required headers and syntax","server timestamp within inclusive +/-300 seconds","constant-time signature comparison","atomic replay/idempotency check"]);
  assert.equal(hmac.unauthenticated.code,"unauthenticated");
  for (const name of ["BookingError","QuotePrepareError","QuoteCommitError","Error"]) {
    const candidate = {...canonicalFixtures.errors[name === "Error" ? "Error" : name], code:"unauthenticated"};
    assert.equal(validateRoot(candidate), true, `${name} must represent HTTP 401`);
  }
});

test("mail-run receipt table and RPC boundaries freeze private durable authority", () => {
  const ops=contract["x-aiow-operations"], table=contract["x-aiow-persistence"].tables.commercial_mail_run_receipts;
  assert.deepEqual(table.primaryKey,["idempotency_key"]);
  assert.deepEqual(Object.keys(table.columns),["request_id","idempotency_key","body_digest","state","revision","worker_id","lease_token","lease_expires_at","response_status","response_headers","response_body","created_at","updated_at","completed_at"]);
  assert.deepEqual(table.acl,{PUBLIC:[],anon:[],authenticated:[],service_role:["SELECT"]});
  assert.deepEqual(table.functionOwner.serviceRoleDirectDml,[]);
  assert.equal(table.functionOwner.role,"aiow_mail_run_receipt_owner"); assert.equal(table.functionOwner.login,false); assert.deepEqual(table.functionOwner.serviceRoleExecuteFunctions,["aiow_mail_run_begin_v1","aiow_mail_run_complete_v1"]); assert.deepEqual(table.functionOwner.retentionWorkerExecuteFunctions,["aiow_mail_run_receipts_delete_expired_v1"]);
  for (const rpc of ["aiow_mail_run_begin_v1","aiow_mail_run_complete_v1"]) {
    assert.equal(ops[rpc].functionAuthority.security,"SECURITY DEFINER",rpc);
    assert.equal(ops[rpc].functionAuthority.owner,"aiow_mail_run_receipt_owner",rpc);
    assert.equal(ops[rpc].functionAuthority.ownerRole,"NOLOGIN",rpc);
    assert.deepEqual(ops[rpc].functionAuthority.executeAcl,{PUBLIC:false,anon:false,authenticated:false,service_role:true},rpc);
  }
  const retentionRpc=ops.aiow_mail_run_receipts_delete_expired_v1;
  assert.deepEqual(retentionRpc.args.map((arg)=>arg.name),["p_limit"]);
  assert.equal(retentionRpc.grants.service_role,false); assert.equal(retentionRpc.grants.aiow_mail_run_retention_worker,true);
  assert.equal(retentionRpc.functionAuthority.executeAcl.service_role,false); assert.equal(retentionRpc.functionAuthority.executeAcl.aiow_mail_run_retention_worker,true);
  assert.deepEqual(retentionRpc.retentionWorker,{role:"aiow_mail_run_retention_worker",login:false,applicationServiceRoleMembership:false});
  assert.match(retentionRpc.deletion,/transaction_timestamp\(\) - interval '90 days'.*no caller cutoff/);
  assert.equal(table.retention.days,90); assert.equal(table.bounds.leaseDurationSeconds,300); assert.equal(table.bounds.responseBodyCanonicalBytesMax,262144);
  assert.deepEqual(ops.aiow_mail_run_begin_v1.args.map((arg)=>[arg.name,arg.sqlType]),[["p_request_id","uuid"],["p_idempotency_key","text"],["p_body_digest","text"],["p_worker_id","text"]]);
  assert.deepEqual(ops.aiow_mail_run_complete_v1.args.map((arg)=>[arg.name,arg.sqlType]),[["p_request_id","uuid"],["p_idempotency_key","text"],["p_body_digest","text"],["p_lease_token","uuid"],["p_response_status","integer"],["p_response_headers","jsonb"],["p_response_body","jsonb"]]);
  assert.ok([...ops.aiow_mail_run_begin_v1.args,...ops.aiow_mail_run_complete_v1.args].every((arg)=>!arg.name.includes("time")),"no caller timestamp");
  assert.match(ops.aiow_mail_run_begin_v1.atomicity,/idempotency_key.*SELECT FOR UPDATE.*exactly one first insert\/execute/);
  assert.match(ops.aiow_mail_run_begin_v1.stateMachine.pending_unexpired,/in_progress.*without worker execution/);
  assert.match(ops.aiow_mail_run_begin_v1.stateMachine.pending_expired,/increments revision once.*replaces worker_id, token and expiry.*immutable original request_id/);
  assert.match(ops.aiow_mail_run_complete_v1.cas,/wrong token\/state\/request_id is revision_conflict.*changed digest is idempotency_conflict/);
  assert.match(ops.aiow_mail_run_complete_v1.responseValidation,/200 requires mail_run OutboxBatchACK.*503 requires closed Error.*invalid_request/);
  assert.equal(ops.mail_run.responses["400"],"#/$defs/Error");
  assert.deepEqual(ops.mail_run.workerIdentity,{source:"private server configuration AIOW_MAIL_WORKER_ID",pattern:"^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$",utf8Characters:[1,100],default:"mail-run-worker",failure:ops.mail_run.workerIdentity.failure});
  assert.match(ops.mail_run.routeAlgorithm.orderedSteps.join("\n"),/constant-time compare HMAC-SHA256 before JSON parsing/);
  assert.match(ops.mail_run.preAuthCorrelation.source,/server-generated.*lowercase UUID/); assert.match(ops.mail_run.preAuthCorrelation.incomingRequestId,/never trusted or echoed/);
  assert.match(ops.mail_run.routeAlgorithm.orderedSteps.join("\n"),/executeMailOutboxRun\(\{limit: parsedBody.limit, workerId, store: commercialMailOutboxStoreV2, provider: microsoftGraphMailProvider\}\)/);
  assert.deepEqual(ops.mail_run.routeAlgorithm.sqlstateMap.aiow_mail_run_begin_v1,{"22023":"400 invalid_request","23505":"409 idempotency_conflict",P0001:"409 revision_conflict"});
  assert.deepEqual(ops.mail_run.routeAlgorithm.sqlstateMap.aiow_mail_run_complete_v1,ops.aiow_mail_run_complete_v1.errors);
  assert.notDeepEqual(ops.mail_run.routeAlgorithm.sqlstateMap.aiow_mail_run_complete_v1,ops.mail_run.routeAlgorithm.sqlstateMap.aiow_mail_run_begin_v1);
  assert.equal(contract["x-aiow-persistence"].sourceIdentity.mail_run_receipt,"registered endpoint + exact Idempotency-Key is identity; request_id is immutable first-request correlation only; body_digest is the lowercase SHA-256 conflict digest");
  assert.equal(contract["x-aiow-retention"].classes.mail_run_receipts.days,90);
});

test("every mail-run completion failure is one unstored HTTP 503 policy", () => {
  const ops=contract["x-aiow-operations"];
  const expected={
    all_sqlstate_conflict_connectivity_unexpected:{
      code:"unavailable",
      httpStatus:503,
      schemaRef:"#/$defs/Error",
      retriable:true,
      persistence:"unstored",
      providerAction:"never_call_again_in_this_request",
    },
  };
  const assertClosed=(candidate)=>{
    assert.deepEqual(candidate.aiow_mail_run_complete_v1.errors,expected);
    assert.deepEqual(candidate.mail_run.routeAlgorithm.sqlstateMap.aiow_mail_run_complete_v1,expected);
    assert.deepEqual(candidate.fixture.errorMap,expected);
  };
  assertClosed({...ops,fixture:canonicalFixtures.rpcBoundaries.aiow_mail_run_complete_v1});
  const completionFailures=["22023","23505","P0001","08006","XX000","conflict","connectivity_failure","unexpected_failure"];
  const resolveCompletionFailure=(errorMap,failure)=>errorMap[failure] ?? errorMap.all_sqlstate_conflict_connectivity_unexpected;
  const assertEveryCompletionFailureClosed=(errorMap)=>{
    for (const failure of completionFailures)
      assert.deepEqual(resolveCompletionFailure(errorMap,failure),expected.all_sqlstate_conflict_connectivity_unexpected,`${failure} must resolve to the closed completion policy`);
  };
  const routeMap=ops.mail_run.routeAlgorithm.sqlstateMap.aiow_mail_run_complete_v1;
  assertEveryCompletionFailureClosed(routeMap);
  for (const [failure,httpStatus,code] of [["22023",400,"invalid_request"],["23505",409,"idempotency_conflict"]]) {
    const hostile=structuredClone(routeMap);
    hostile[failure]={code,httpStatus,schemaRef:"#/$defs/Error",retriable:false,persistence:"unstored",providerAction:"never_call_again_in_this_request"};
    assert.throws(()=>assertEveryCompletionFailureClosed(hostile),assert.AssertionError,`completion-specific HTTP ${httpStatus} branch must be rejected`);
  }
  for (const mutate of [
    (value)=>{ value.mail_run.routeAlgorithm.sqlstateMap.aiow_mail_run_complete_v1.all_sqlstate_conflict_connectivity_unexpected.httpStatus=409; },
    (value)=>{ value.fixture.errorMap.all_sqlstate_conflict_connectivity_unexpected.persistence="stored"; },
  ]) {
    const hostile={...structuredClone(ops),fixture:structuredClone(canonicalFixtures.rpcBoundaries.aiow_mail_run_complete_v1)};
    mutate(hostile);
    assert.throws(()=>assertClosed(hostile),assert.AssertionError);
  }
  assert.deepEqual(ops.aiow_mail_run_begin_v1.errors,canonicalFixtures.rpcBoundaries.aiow_mail_run_begin_v1.errorMap,"400/409 mappings remain begin-only");
});

test("mail-run retention deletes only completed-old or expired-lease abandoned-old rows", () => {
  const routine=contract["x-aiow-operations"].aiow_mail_run_receipts_delete_expired_v1.routine;
  assert.deepEqual(routine,{
    databaseClock:"transaction_timestamp()",
    callerCutoffAccepted:false,
    cutoffDays:90,
    maxDeleteRows:50,
    eligibility:{
      completed:{state:"completed",anchor:"completed_at",olderThanDays:90},
      abandonedPending:{state:"pending",anchor:"updated_at",olderThanDays:90,requireExpiredLease:true,leaseField:"lease_expires_at",leaseComparison:"<="},
    },
    stableOrder:["idempotency_key ASC"],
    locking:"FOR UPDATE SKIP LOCKED",
    selectionSql:"WITH eligible AS (SELECT idempotency_key FROM public.commercial_mail_run_receipts WHERE (state = 'completed' AND completed_at < transaction_timestamp() - interval '90 days') OR (state = 'pending' AND lease_expires_at <= transaction_timestamp() AND updated_at < transaction_timestamp() - interval '90 days') ORDER BY idempotency_key ASC LIMIT p_limit FOR UPDATE SKIP LOCKED) DELETE FROM public.commercial_mail_run_receipts AS receipt USING eligible WHERE receipt.idempotency_key = eligible.idempotency_key RETURNING receipt.idempotency_key",
  });
  const eligible=(policy,row,now)=>{
    const branch=row.state==="completed" ? policy.eligibility.completed : row.state==="pending" ? policy.eligibility.abandonedPending : null;
    if (!branch) return false;
    if (branch.requireExpiredLease && Date.parse(row[branch.leaseField])>now) return false;
    return Date.parse(row[branch.anchor]) < now-branch.olderThanDays*86400000;
  };
  const now=Date.parse("2026-08-30T12:00:00.000Z");
  const cutoff=now-90*86400000;
  const completedOld={state:"completed",completed_at:"2026-06-01T11:59:59.999Z"};
  const completedRecent={state:"completed",completed_at:"2026-06-01T12:00:00.001Z"};
  const completedAtCutoff={state:"completed",completed_at:"2026-06-01T12:00:00.000Z"};
  const activeOld={state:"pending",updated_at:"2026-05-01T00:00:00.000Z",lease_expires_at:"2026-08-30T12:00:01.000Z"};
  const expiredRecent={state:"pending",updated_at:"2026-08-29T00:00:00.000Z",lease_expires_at:"2026-08-30T11:59:59.000Z"};
  const abandonedOld={state:"pending",updated_at:"2026-05-01T00:00:00.000Z",lease_expires_at:"2026-05-01T00:05:00.000Z"};
  const leaseAtTransactionTime={state:"pending",updated_at:"2026-05-01T00:00:00.000Z",lease_expires_at:"2026-08-30T12:00:00.000Z"};
  const updatedAtCutoff={state:"pending",updated_at:"2026-06-01T12:00:00.000Z",lease_expires_at:"2026-08-30T11:59:59.000Z"};
  assert.equal(cutoff,Date.parse(completedAtCutoff.completed_at),"fixture freezes the exact 90-day transaction-time cutoff");
  assert.equal(eligible(routine,completedOld,now),true,"completed receipt strictly older than cutoff is deletable");
  assert.equal(eligible(routine,completedRecent,now),false,"recent completed receipt is protected");
  assert.equal(eligible(routine,completedAtCutoff,now),false,"completed_at equal to cutoff is protected by strict <");
  assert.equal(eligible(routine,activeOld,now),false,"active pending lease is protected regardless of age");
  assert.equal(eligible(routine,expiredRecent,now),false,"recent pending receipt is protected after lease expiry");
  assert.equal(eligible(routine,abandonedOld,now),true,"expired-lease old pending receipt is deletable");
  assert.equal(eligible(routine,leaseAtTransactionTime,now),true,"lease_expires_at equal to transaction time is expired by <=");
  assert.equal(eligible(routine,updatedAtCutoff,now),false,"updated_at equal to cutoff is protected by strict <");
  const hostile=structuredClone(routine); hostile.eligibility.abandonedPending.requireExpiredLease=false;
  assert.equal(eligible(hostile,activeOld,now),true,"hostile missing lease fence would delete active work");
  assert.notDeepEqual(hostile,routine,"lease-fence drift is digest-visible");
});

test("mail-run ACK validators reject changed digest, malformed completion and non-exact replay", () => {
  const begin=canonicalFixtures.rpcBoundaries.aiow_mail_run_begin_v1.canonicalResults;
  const complete=canonicalFixtures.rpcBoundaries.aiow_mail_run_complete_v1.canonicalResults;
  const context={requestId:begin.execute.requestId,idempotencyKey:begin.execute.idempotencyKey,bodyDigest:begin.execute.bodyDigest,requestedLimit:2,expectedRevision:complete.completed.revision};
  assert.equal(validateMailRunBeginAckV1(begin.execute,context),true);
  assert.equal(validateMailRunBeginAckV1(begin.inProgress,context),true);
  const stored={responseStatus:begin.replay.responseStatus,responseHeaders:begin.replay.responseHeaders,responseBody:begin.replay.responseBody};
  assert.equal(validateMailRunBeginAckV1(begin.replay,{...context,persistedResponse:stored}),true);
  assert.equal(validateMailRunBeginAckV1(begin.execute,{...context,bodyDigest:"b".repeat(64)}),false,"changed digest conflict");
  assert.equal(validateMailRunBeginAckV1({...begin.inProgress,leaseToken:begin.execute.leaseToken},context),false,"in-progress cannot leak an executable token");
  assert.equal(validateMailRunCompleteAckV1(complete.completed,{...context,persistedResponse:stored}),true);
  assert.equal(validateMailRunCompleteAckV1({...complete.completed,revision:999},context),false,"completion revision is bound to begin lease generation");
  assert.equal(validateMailRunCompleteAckV1({...complete.completed,responseStatus:201},context),false);
  assert.equal(validateMailRunCompleteAckV1({...complete.completed,responseHeaders:{...complete.completed.responseHeaders,cacheControl:"public"}},context),false);
  assert.equal(validateMailRunCompleteAckV1({...complete.completed,responseBody:{...complete.completed.responseBody,itemCount:1}},context),false);
  assert.equal(validateMailRunCompleteAckV1(complete.completed,{...context,persistedResponse:{...stored,responseBody:{...stored.responseBody,items:[] ,itemCount:1}}}),false,"replay body mismatch");
  const error=complete.errorCompleted;
  assert.equal(validateMailRunCompleteAckV1(error,context),true);
  assert.equal(validateMailRunCompleteAckV1({...error,responseBody:{...error.responseBody,code:"idempotency_in_progress"}},context),false,"in-progress is not a storable completion");
  assert.equal(validateMailRunStoredResponseV1({...stored,responseHeaders:{...stored.responseHeaders,injected:"x"}},context),false);
  const reordered={responseBody:structuredClone(stored.responseBody),responseHeaders:{xAiowRequestId:stored.responseHeaders.xAiowRequestId,cacheControl:"no-store",contentType:"application/json; charset=utf-8"},responseStatus:200};
  assert.equal(serializeMailRunResponseBodyV1(stored,context),serializeMailRunResponseBodyV1(reordered,context),"canonical JSON and headers replay byte-equivalently");
  assert.deepEqual(JSON.parse(serializeMailRunResponseBodyV1(stored,context)),stored.responseBody,"initial success is the body, not an envelope");
  assert.deepEqual(JSON.parse(serializeMailRunResponseBodyV1({responseStatus:begin.replay.responseStatus,responseHeaders:begin.replay.responseHeaders,responseBody:begin.replay.responseBody},context)),begin.replay.responseBody,"replay success parses directly as OutboxBatchACK");
  const errorStored={responseStatus:error.responseStatus,responseHeaders:error.responseHeaders,responseBody:error.responseBody};
  assert.deepEqual(JSON.parse(serializeMailRunResponseBodyV1(errorStored,context)),error.responseBody,"initial and replay errors parse directly as Error");
  assert.equal(serializeMailRunResponseBodyV1({...stored,responseBody:{...stored.responseBody,items:[{}]}},context),null);
  const cyclic=structuredClone(stored); cyclic.responseBody.items.push(cyclic.responseBody);
  assert.doesNotThrow(()=>validateMailRunStoredResponseV1(cyclic,context)); assert.equal(validateMailRunStoredResponseV1(cyclic,context),false);
  let nested={leaf:true}; for (let index=0;index<70;index+=1) nested={nested};
  assert.equal(validateMailRunStoredResponseV1({...stored,responseBody:{...stored.responseBody,injected:nested}},context),false,"bounded depth");
  assert.equal(validateMailRunStoredResponseV1({...errorStored,responseBody:{...errorStored.responseBody,message:"\ud800"}},context),false,"ill-formed surrogate string");
  const hostile=new Proxy({}, {ownKeys(){throw new Error("hostile")}});
  assert.doesNotThrow(()=>validateMailRunStoredResponseV1(hostile,context)); assert.equal(validateMailRunStoredResponseV1(hostile,context),false,"validators never throw");
});

test("mail-run authority races on endpoint key and preserves original request correlation", async () => {
  const canonical=canonicalFixtures.rpcBoundaries.aiow_mail_run_begin_v1.canonicalResults.execute;
  const completed=canonicalFixtures.rpcBoundaries.aiow_mail_run_complete_v1.canonicalResults.completed;
  class Authority {
    constructor() { this.row=null; this.tokenSequence=50; }
    token() { return `123e4567-e89b-42d3-a456-4266141740${String(this.tokenSequence++).padStart(2,"0")}`; }
    begin({requestId,idempotencyKey,bodyDigest},now) {
      if (this.row && this.row.idempotencyKey!==idempotencyKey) throw new Error("wrong endpoint key");
      if (this.row && this.row.bodyDigest!==bodyDigest) return {disposition:"conflict",code:"idempotency_conflict",requestId:this.row.requestId};
      if (this.row?.state==="completed") return {disposition:"replay",requestId:this.row.requestId,response:structuredClone(this.row.response)};
      if (this.row && now<this.row.leaseExpiresAt) return {disposition:"in_progress",requestId:this.row.requestId,revision:this.row.revision};
      const revision=(this.row?.revision??0)+1, leaseToken=this.token();
      this.row={requestId:this.row?.requestId??requestId,idempotencyKey,bodyDigest,state:"pending",revision,leaseToken,leaseExpiresAt:now+300000};
      return {disposition:"execute",requestId:this.row.requestId,revision,leaseToken};
    }
    complete({requestId,bodyDigest,leaseToken,response}) {
      if (!this.row || this.row.bodyDigest!==bodyDigest) return {disposition:"conflict",code:"idempotency_conflict"};
      if (this.row.requestId!==requestId || this.row.state!=="pending" || this.row.leaseToken!==leaseToken) return {disposition:"conflict",code:"revision_conflict"};
      if (!validateMailRunStoredResponseV1(response,{requestId:this.row.requestId})) return {disposition:"invalid_request"};
      this.row={...this.row,state:"completed",response:structuredClone(response)};
      return {disposition:"completed",requestId:this.row.requestId,response:structuredClone(response)};
    }
  }
  const request={requestId:canonical.requestId,idempotencyKey:canonical.idempotencyKey,bodyDigest:canonical.bodyDigest};
  const otherRequestId="123e4567-e89b-42d3-a456-426614174099";
  const concurrent=new Authority();
  const pair=await Promise.all([
    Promise.resolve().then(()=>concurrent.begin(request,0)),
    Promise.resolve().then(()=>concurrent.begin({...request,requestId:otherRequestId},0)),
  ]);
  assert.deepEqual(pair.map((item)=>item.disposition).sort(),["execute","in_progress"]);
  const originalRequestId=pair.find((item)=>item.disposition==="execute").requestId;
  assert.ok(pair.every((item)=>item.requestId===originalRequestId),"race loser returns winner correlation");
  assert.deepEqual(concurrent.begin({...request,requestId:otherRequestId,bodyDigest:"b".repeat(64)},1),{disposition:"conflict",code:"idempotency_conflict",requestId:originalRequestId});
  const takeover=new Authority(), first=takeover.begin(request,0);
  assert.equal(takeover.begin({...request,requestId:otherRequestId},299999).requestId,request.requestId);
  const second=takeover.begin({...request,requestId:otherRequestId},300000); assert.equal(second.disposition,"execute"); assert.equal(second.revision,2); assert.equal(second.requestId,request.requestId); assert.notEqual(second.leaseToken,first.leaseToken);
  const response={responseStatus:completed.responseStatus,responseHeaders:completed.responseHeaders,responseBody:completed.responseBody};
  assert.deepEqual(takeover.complete({requestId:request.requestId,bodyDigest:request.bodyDigest,leaseToken:first.leaseToken,response}),{disposition:"conflict",code:"revision_conflict"},"old token cannot complete after takeover");
  assert.equal(takeover.complete({requestId:request.requestId,bodyDigest:request.bodyDigest,leaseToken:second.leaseToken,response}).disposition,"completed");
  const replay=takeover.begin({...request,requestId:otherRequestId},300001); assert.equal(replay.disposition,"replay"); assert.equal(replay.requestId,request.requestId); assert.equal(stableJson(replay.response),stableJson(response));
  assert.equal(validateMailRunBeginAckV1({...canonicalFixtures.rpcBoundaries.aiow_mail_run_begin_v1.canonicalResults.inProgress},{requestId:otherRequestId,idempotencyKey:request.idempotencyKey,bodyDigest:request.bodyDigest}),true,"incoming request ID is not key identity");
  assert.equal(takeover.begin(request,999999).disposition,"replay","completed never executes after lease age");
});

test("mutation ACK custom verifier rejects crossed arithmetic, projection and replay state", () => {
  const ack = structuredClone(canonicalFixtures.acks.OpsMutationACK);
  assert.equal(validateOpsMutationAck(ack), true);
  assert.equal(validateRoot({...ack,previousRevision:99}), true, "hostile arithmetic remains structurally valid and requires custom verifier");
  assert.equal(validateOpsMutationAck({...ack,previousRevision:99}), false);
  assert.equal(validateOpsMutationAck({...ack,revision:3}), false);
  assert.equal(validateOpsMutationAck({...ack,projection:{...ack.projection,revision:1}}), false);
  assert.equal(validateOpsMutationAck({...ack,effect:{unread:true}}), false);
  assert.equal(validateRoot({...ack,operation:"set_priority"}), false, "operation/effect branches must remain correlated");
  assert.equal(validateOpsMutationAck({...ack,replayed:true}, {...ack,replayed:true,serverTime:"2026-08-30T12:00:01.000Z"}), false);
  assert.equal(contract.$defs.OpsMutationACK["x-aiow-custom-validator"],"opsMutationAckV1");
});

test("active-customer relation ACK is closed, revision-correlated and replay-stable", () => {
  const base = structuredClone(canonicalFixtures.acks.OpsMutationACK);
  const ack = {...base,replayed:false,operation:"set_active_customer_relation",effect:{activeCustomerRelation:true},projection:{...base.projection,activeCustomerRelation:true}};
  assert.equal(validateOpsMutationAck(ack),true);
  assert.equal(validateRoot({...ack,effect:{activeCustomerRelation:true,injected:true}}),false);
  assert.equal(validateOpsMutationAck({...ack,effect:{activeCustomerRelation:false}}),false);
  assert.equal(validateOpsMutationAck({...ack,projection:{...ack.projection,revision:3}}),false);
  assert.equal(validateOpsMutationAck({...ack,replayed:true},{...ack,replayed:true,auditId:"123e4567-e89b-42d3-a456-426614174099"}),false);
  assert.match(contract["x-aiow-operations"].aiow_active_customer_relation_set_v1.effect,/previousRevision \+ 1 = revision = projection.revision/);
});

test("outbox batch ACK is exact for zero, one and multiple ordered leases", () => {
  const cases=canonicalFixtures.rpcBoundaries.aiow_mail_outbox_claim_v2.canonicalResults;
  const claimLimit=canonicalFixtures.rpcBoundaries.aiow_mail_outbox_claim_v2.args.find((arg)=>arg.name==="p_limit").value;
  assert.equal(claimLimit,2);
  for (const [name,value] of Object.entries(cases)) assert.equal(validateOutboxBatchAckV1(value,{operation:"claim",requestedLimit:claimLimit}),true,name);
  const multi=structuredClone(cases.multi);
  assert.equal(validateOutboxBatchAckV1({...multi,itemCount:1},{operation:"claim",requestedLimit:2}),false);
  assert.equal(validateOutboxBatchAckV1({...multi,requestedLimit:1},{operation:"claim",requestedLimit:2}),false);
  assert.equal(validateOutboxBatchAckV1(multi,{operation:"claim",requestedLimit:1}),false,"two items for request limit one");
  assert.equal(validateOutboxBatchAckV1(multi,{operation:"mail_run",requestedLimit:2}),false,"operation binding");
  assert.equal(validateRoot({...multi,requestedLimit:0}),false);
  assert.equal(validateRoot({...multi,requestedLimit:51}),false);
  assert.equal(validateOutboxBatchAckV1({...multi,items:[multi.items[0],{...multi.items[1],id:multi.items[0].id}]},{operation:"claim",requestedLimit:2}),false);
  assert.equal(validateOutboxBatchAckV1({...multi,items:[multi.items[0],{...multi.items[1],leaseToken:multi.items[0].leaseToken}]},{operation:"claim",requestedLimit:2}),false);
  assert.equal(validateOutboxBatchAckV1({...multi,items:multi.items.toReversed()},{operation:"claim",requestedLimit:2}),false,"deterministic order");
  const caseAliased=structuredClone(multi);
  caseAliased.items[1].id=caseAliased.items[0].id.toUpperCase();
  caseAliased.items[1].leaseToken=caseAliased.items[0].leaseToken.toUpperCase();
  assert.equal(validateOutboxBatchAckV1(caseAliased,{operation:"claim",requestedLimit:2}),false,"database-equivalent UUID case aliases are rejected");
  const equalInstantWrongTieBreak=structuredClone(multi);
  equalInstantWrongTieBreak.items[0].nextAttemptAt="2026-08-30T12:00:00.000Z";
  equalInstantWrongTieBreak.items[1].nextAttemptAt="2026-08-30T12:00:00Z";
  equalInstantWrongTieBreak.items[0].createdAt="2026-08-30T11:00:01.000Z";
  equalInstantWrongTieBreak.items[1].createdAt="2026-08-30T11:00:00.000Z";
  assert.equal(validateOutboxBatchAckV1(equalInstantWrongTieBreak,{operation:"claim",requestedLimit:2}),false,"equal instants still apply createdAt tie-break order");
  const microsecondReversed=structuredClone(multi);
  microsecondReversed.items[0].nextAttemptAt="2026-08-30T12:00:00.000002Z";
  microsecondReversed.items[1].nextAttemptAt="2026-08-30T12:00:00.000001Z";
  assert.equal(validateOutboxBatchAckV1(microsecondReversed,{operation:"claim",requestedLimit:2}),false,"fractional precision beyond milliseconds remains ordered");
  const {payloadSha256,...incomplete}=multi.items[0];
  assert.equal(validateRoot({...cases.one,items:[incomplete]}),false);
  assert.equal(validateOutboxBatchAckV1({...cases.one,items:[incomplete]},{operation:"claim",requestedLimit:2}),false);
  const stale=canonicalFixtures.rpcBoundaries.aiow_mail_outbox_recover_stale_v2;
  const staleLimit=stale.args.find((arg)=>arg.name==="p_limit").value;
  assert.equal(staleLimit,2);
  assert.equal(validateOutboxBatchAckV1(stale.canonicalResults.one,{operation:"stale_recovery",requestedLimit:staleLimit}),true);
  assert.equal(contract["x-aiow-operations"].aiow_mail_outbox_claim_v2.ackRef,"#/$defs/OutboxBatchACK");
  assert.equal(contract["x-aiow-operations"].aiow_mail_outbox_recover_stale_v2.ackRef,"#/$defs/OutboxBatchACK");
  assert.equal(contract["x-aiow-operations"].mail_run.responses["200"],"#/$defs/OutboxBatchACK");
});

test("outbox state machine, leases and Graph-only provider outcomes reject hostile crossings", () => {
  const outbox = contract["x-aiow-outbox"], ops = contract["x-aiow-operations"];
  const edges = outbox.transitions.flatMap((transition) => transition.from.flatMap((from) => (Array.isArray(transition.to) ? transition.to : [transition.to]).map((to) => `${from}->${to}@${transition.rpc}`))).sort();
  assert.deepEqual(edges, [
    "leased->dead@aiow_mail_outbox_dead_v2","leased->retry@aiow_mail_outbox_retry_v2","leased->review@aiow_mail_outbox_recover_stale_v2","leased->review@aiow_mail_outbox_review_v2","leased->sent@aiow_mail_outbox_sent_v2",
    "pending->cancelled@aiow_mail_outbox_cancel_v2","pending->leased@aiow_mail_outbox_claim_v2","retry->cancelled@aiow_mail_outbox_cancel_v2","retry->leased@aiow_mail_outbox_claim_v2",
    "review->cancelled@aiow_mail_outbox_cancel_v2","review->dead@aiow_mail_outbox_resolve_v2","review->retry@aiow_mail_outbox_resolve_v2","review->sent@aiow_mail_outbox_resolve_v2",
  ].sort());
  assert.deepEqual(outbox.terminal,["sent","dead","cancelled"]); assert.match(outbox.illegal,/absent.*denied/);
  assert.equal(outbox.crashMatrix.length,4);
  assert.ok(outbox.crashMatrix.every((row)=>row.secondProviderCall===false || row.secondProviderCallForAcceptedOrPossiblyAcceptedJob===false));
  assert.match(outbox.lease.staleRecovery,/every expired leased job at every attempt count.*review.*unknown_acceptance.*never retry\/dead/);
  assert.match(outbox.noSecondProviderCallInvariant,/sent is terminal\/unclaimable.*leased expires only to review/);
  const finalizeArgs = ["p_job_id","p_lease_owner","p_lease_token","p_payload_digest","p_expected_revision","p_result"];
  for (const rpc of ["aiow_mail_outbox_sent_v2","aiow_mail_outbox_dead_v2","aiow_mail_outbox_review_v2"])
    assert.deepEqual(ops[rpc].args.map((arg) => arg.name), finalizeArgs, rpc);
  assert.deepEqual(ops.aiow_mail_outbox_retry_v2.args.map((arg) => arg.name), [...finalizeArgs,"p_next_attempt_at"]);
  assert.equal(outbox.manualResolution.sourceState,"review"); assert.match(outbox.lease.finalize,/same lease_owner.*lease_token.*unexpired.*SHA-256.*expected revision/);
  const pending = canonicalFixtures.projections.OutboxProjection;
  assert.equal(validateRoot({...pending,state:"sent"}), false);
  assert.equal(validateRoot({...pending,state:"leased",leaseOwner:"other-worker",leaseToken:uuid,leaseExpiresAt:"2020-01-01T00:00:00.000Z"}), true, "lease ownership/expiry are CAS preconditions, not caller-time schema claims");
  const accepted = canonicalFixtures.providerResults.accepted;
  assert.equal(validateRoot({...accepted,category:"ambiguous"}), false);
  assert.equal(validateRoot({...canonicalFixtures.providerResults.transient_pre_acceptance,code:"invalid_recipient"}), false);
  assert.equal(validateRoot({...canonicalFixtures.providerResults.permanent_pre_acceptance,code:"timeout_before_response"}), false);
  const operationCategories={aiow_mail_outbox_sent_v2:["accepted","#/$defs/ProviderAccepted"],aiow_mail_outbox_retry_v2:["transient_pre_acceptance","#/$defs/ProviderTransientPreAcceptance"],aiow_mail_outbox_dead_v2:["permanent_pre_acceptance","#/$defs/ProviderPermanentPreAcceptance"],aiow_mail_outbox_review_v2:["ambiguous","#/$defs/ProviderAmbiguous"]};
  for (const [rpc,[category,validationRef]] of Object.entries(operationCategories)) {
    const resultArg=canonicalFixtures.rpcBoundaries[rpc].args.find((arg)=>arg.name==="p_result");
    assert.equal(resultArg.validationRef,validationRef,rpc);
    const validateBoundary=validatorForRef(validationRef);
    const result=resultArg.value;
    assert.equal(result.category,category,rpc);
    assert.equal(validateBoundary(result),true,rpc);
    for (const other of Object.values(canonicalFixtures.providerResults).filter((value)=>value.category!==category))
      assert.equal(validateBoundary(other),false,`${rpc} rejects ${other.category}`);
  }
  assert.ok(contract.$defs.ProviderPermanentPreAcceptance.properties.code.enum.includes("retry_exhausted"));
  assert.match(ops.aiow_mail_outbox_dead_v2.resultBoundary,/server-classified.*retry_exhausted/);
  assert.deepEqual(contract["x-aiow-provider-gate"].v2Providers,["microsoft_graph"]);
  assert.equal(validateRoot({...accepted,receipt:{...accepted.receipt,provider:"gmail_legacy_test_only"}}),false);
});

test("provider owner gate binds exact Graph target, RBAC evidence, revision and trusted time", () => {
  const gate = {...canonicalFixtures.projections.ProviderGateRecord,state:"activated",secretPresent:true,oauthClientCredentialsPresent:true,controlMailbox:"negative-control@example.com",exchangeRbacSenderInScope:true,exchangeRbacControlMailboxInScope:false,entraUnscopedMailSendAssigned:false,ownerApprovedBy:"richard",approvedAt:"2026-08-30T12:00:00.000Z",expiresAt:"2026-08-31T12:00:00.000Z"};
  gate.approvalBindingSha256 = buildProviderGateApprovalBindingDigestV1(gate);
  const now="2026-08-30T13:00:00.000Z";
  assert.equal(validateProviderGateCurrentV1(gate,{serverNow:now}),true);
  const mutations={
    gateId:"other_gate",environment:"preview",provider:"gmail_legacy_test_only",tenantId:"123e4567-e89b-42d3-a456-426614174099",applicationId:"123e4567-e89b-42d3-a456-426614174098",
    mailbox:"other@example.com",sender:"attacker@example.com",controlMailbox:"different-control@example.com",secretPresent:false,oauthClientCredentialsPresent:false,
    exchangeApplicationRole:"Mail.Read",exchangeRbacSenderInScope:false,exchangeRbacControlMailboxInScope:true,entraUnscopedMailSendAssigned:true,evidenceSha256:"b".repeat(64),revision:2,
    ownerApprovedBy:"arbitrary",approvedAt:"2026-08-30T12:00:01.000Z",expiresAt:"2026-08-31T12:00:01.000Z",runtimeCapability:"mail_read",fallbackProvider:"gmail_legacy_test_only"
  };
  assert.equal(Object.isFrozen(PROVIDER_GATE_APPROVAL_FIELDS),true);
  assert.deepEqual(PROVIDER_GATE_APPROVAL_FIELDS,contract["x-aiow-provider-gate"].approvalBinding);
  assert.deepEqual(Object.keys(mutations),PROVIDER_GATE_APPROVAL_FIELDS);
  for (const [field,value] of Object.entries(mutations)) assert.equal(validateProviderGateCurrentV1({...gate,[field]:value},{serverNow:now}),false,field);
  assert.equal(validateProviderGateCurrentV1(gate,{serverNow:now,target:{...gate,controlMailbox:"provider-control@example.com"}}),false,"provider target mismatch");
  assert.equal(validateProviderGateCurrentV1(gate,{serverNow:now,target:{...gate,provider:"gmail_legacy_test_only"}}),false,"provider identity mismatch");
  assert.equal(validateProviderGateCurrentV1(gate,{serverNow:"2026-08-29T13:00:00.000Z"}),false);
  assert.equal(validateProviderGateCurrentV1(gate,{serverNow:gate.expiresAt}),false);
  assert.equal(validateProviderGateCurrentV1({...gate,state:"revoked"},{serverNow:now}),false);
  assert.equal(contract.$defs.ProviderGateRecord["x-aiow-custom-validator"],"providerGateCurrentV1");
  assert.match(contract["x-aiow-provider-gate"].runtimeVerifier,/every listed current persisted fact/);
  assert.deepEqual(Object.keys(contract["x-aiow-provider-gate"].runtimeBindings),["write","read","providerCall"]);
  assert.match(contract["x-aiow-operations"].aiow_provider_gate_write_v1.runtimeValidation.currentValidator,/approved\/activated/);
  assert.match(contract["x-aiow-provider-gate"].microsoftAuthority.unionRiskRule,/MUST NOT/);
});

test("runtime validators fail closed on malformed values without secret or logger inputs", () => {
  assert.deepEqual(validateProviderGateCurrentV1.length,1);
  assert.deepEqual(buildProviderGateApprovalBindingDigestV1(null),null);
  assert.equal(buildProviderGateApprovalBindingDigestV1(Object.fromEntries(PROVIDER_GATE_APPROVAL_FIELDS.map((field)=>[field,undefined]))),null);
  for (const value of [null,{},[],"secret",{approvalBindingSha256:"a".repeat(64)}])
    assert.equal(validateProviderGateCurrentV1(value,{serverNow:"2026-08-30T13:00:00.000Z"}),false);
  for (const value of [null,{},[],"secret",{schemaKind:"outbox_batch_ack"}])
    assert.equal(validateOutboxBatchAckV1(value,{operation:"claim",requestedLimit:1}),false);
  assert.equal(validateOutboxBatchAckV1({schemaKind:"outbox_batch_ack",operation:"claim",requestedLimit:1,itemCount:0,items:{length:0}},{operation:"claim",requestedLimit:1}),false);
  assert.equal(validateOutboxBatchAckV1(canonicalFixtures.rpcBoundaries.aiow_mail_outbox_claim_v2.canonicalResults.zero,{operation:"claim",requestedLimit:1.5}),false);
  assert.equal(validateQuoteAbandonBatchAckV1(null,{requestedLimit:1}),false);
  assert.equal(contract["x-aiow-custom-verifiers"].outboxBatchAckV1.module,"lib/aiow-v1/commercial-contract-validator.mjs");
});

test("persistence mappings and retention anchors are exact and exception-complete", () => {
  const db=contract["x-aiow-persistence"], retention=contract["x-aiow-retention"], lead=db.tables.commercial_leads;
  assert.equal(sha256(db),"633910435ea55c6b990e55ef1d032abb1aea7889bd24ceb857621b87123420d4");
  assert.equal(sha256(db.sourceMappings),"f413c8d62f92cb18d60338f7d5a66fd421ea8a89a41085b5211a8e61965a5a85");
  const projectionFields=contract.$defs.LeadProjection.required;
  for (const source of ["booking","quote"]) {
    const mapping=db.sourceMappings[source];
    assert.deepEqual(mapping.map((entry)=>entry.field),projectionFields,source);
    assert.equal(new Set(mapping.map((entry)=>entry.field)).size,projectionFields.length,source);
  }
  assert.equal(db.sourceMappings.booking.find((entry)=>entry.field==="route").expression,"case locale when 'nl' then '/' when 'en' then '/en' end");
  assert.equal(db.sourceMappings.quote.find((entry)=>entry.field==="route").expression,"server-validated QuoteRequest.source.route");
  assert.equal(lead.columns.abandoned_at.sqlType,"timestamptz"); assert.equal(lead.columns.active_customer_relation.default,"false");
  assert.equal(retention.abandonment.field,"commercial_leads.abandoned_at"); assert.match(retention.activeCustomerRelation.source,/server-authoritative/);
  for (const name of ["booking_quote_lead_pii","pdfs_and_outbox_payloads","provider_receipts"])
    assert.deepEqual(retention.classes[name].exceptions,["active customer relation","legal hold"],name);
  assert.deepEqual(retention.exceptionScope.legal_hold,["lead PII","quote PDFs","outbox payloads","provider receipts"]);
  assert.deepEqual(retention.exceptionScope.active_customer_relation,retention.exceptionScope.legal_hold);
  assert.match(retention.exceptionScope.effect,/anchor age does not reset/); assert.match(retention.orphanDocuments,/FK.*ON DELETE RESTRICT/);
});

test("terminal and abandonment anchors have trusted CAS writers and exact no-op boundaries", () => {
  const life=contract["x-aiow-lifecycle"].terminalAnchors, abandonment=contract["x-aiow-retention"].abandonment;
  const boundary=canonicalFixtures.rpcBoundaries.aiow_quote_abandon_expired_v1;
  const limit=boundary.args.find((arg)=>arg.name==="p_limit").value;
  assert.equal(validateQuoteAbandonBatchAckV1(boundary.canonicalResults.zero,{requestedLimit:limit}),true);
  assert.equal(validateQuoteAbandonBatchAckV1(boundary.canonicalResults.one,{requestedLimit:limit}),true);
  const item=boundary.canonicalResults.one.items[0];
  assert.equal(item.revision,item.previousRevision+1);
  assert.equal(item.status,"lost"); assert.equal(item.quoteState,"abandoned"); assert.equal(item.terminalAt,item.abandonedAt);
  assert.equal(validateQuoteAbandonBatchAckV1({...boundary.canonicalResults.one,itemCount:0},{requestedLimit:limit}),false);
  assert.equal(validateQuoteAbandonBatchAckV1({...boundary.canonicalResults.one,items:[{...item,revision:item.revision+1}]},{requestedLimit:limit}),false);
  assert.equal(validateQuoteAbandonBatchAckV1({...boundary.canonicalResults.one,items:[{...item,abandonedAt:"2026-08-30T12:00:01.000Z"}]},{requestedLimit:limit}),false);
  function transition(row,to,serverTime) {
    if (row.status===to) return row;
    const next={...row,status:to,revision:row.revision+1};
    if (row.status==="lost" && to==="qualified") { next.terminalAt=null; next.abandonedAt=null; }
    else if (!["won","lost"].includes(row.status) && ["won","lost"].includes(to)) next.terminalAt=serverTime;
    return next;
  }
  const abandoned={status:"lost",revision:2,terminalAt:item.terminalAt,abandonedAt:item.abandonedAt,legalHold:false,activeCustomerRelation:false};
  const reopened=transition(abandoned,"qualified","2026-09-01T00:00:00.000Z");
  assert.equal(reopened.terminalAt,null); assert.equal(reopened.abandonedAt,null); assert.equal(reopened.revision,3);
  const reterminal=transition(reopened,"won","2026-09-02T00:00:00.000Z"); assert.equal(reterminal.terminalAt,"2026-09-02T00:00:00.000Z");
  const atomic=contract["x-aiow-operations"].aiow_quote_abandon_expired_v1.atomicTransition;
  assert.match(atomic.selection,/prepared.*nonterminal.*legal_hold=false.*active_customer_relation=false/);
  assert.match(atomic.transaction,/status=lost.*revision exactly once.*terminal_at and abandoned_at.*quote.state=abandoned.*audit/);
  assert.match(atomic.noOp,/committed, nonexpired, held, active-relation, terminal/);
  assert.match(atomic.bookingFailure,/never committed.*no retention row/);
  assert.match(life.trustedWriter,/aiow_quote_abandon_expired_v1/); assert.match(life.lostReopen,/clears both terminal_at and abandoned_at/); assert.match(life.reterminalization,/fresh terminal_at/);
  assert.match(abandonment.trustedWriter,/only abandoned_at writer/); assert.match(abandonment.replayOrNoOp,/zero-item/);
});

test("analytics route/locale, experiment dimensions and NULL identity remain correlated", () => {
  const event=canonicalFixtures.events.page_view;
  assert.equal(validateRoot({...event,locale:"en"}),false);
  const validateBucket=ajv.compile({$schema:"https://json-schema.org/draft/2020-12/schema",$defs:contract.$defs,$ref:"#/$defs/AggregateBucket"});
  const base={date:"2026-08-30",count:1,event:"page_view",route:"/",locale:"nl",experimentId:null,variant:null};
  assert.equal(validateBucket(base),true,ajv.errorsText(validateBucket.errors));
  assert.equal(validateBucket({...base,locale:"en"}),false);
  assert.equal(validateBucket({...base,experimentId:"scan_cta_copy_v1"}),false);
  assert.equal(validateBucket({...base,experimentId:"scan_cta_copy_v1",variant:"control"}),false);
  const daily=contract["x-aiow-persistence"].tables.commercial_event_daily;
  assert.equal(daily.columns.experiment_id.nullable,false); assert.equal(daily.columns.experiment_id.default,"'__none__'");
  assert.equal(daily.columns.variant.nullable,false); assert.equal(daily.columns.variant.default,"'__none__'");
  assert.deepEqual(daily.primaryKey,["day","event_name","route","locale","experiment_id","variant"]);
  assert.match(daily.checks.find((item)=>item.name==="commercial_event_daily_experiment_pair_ck").expression,/__none__/);
  assert.match(daily.checks.find((item)=>item.name==="commercial_event_daily_experiment_event_ck").expression,/experiment_exposed/);
});

test("Node 24 is pinned without changing package manager semantics", async () => {
  const packageJson=JSON.parse(await readFile(new URL("../../package.json", import.meta.url),"utf8"));
  const nvmrc=(await readFile(new URL("../../.nvmrc", import.meta.url),"utf8")).trim();
  assert.equal(packageJson.engines.node,">=24 <25"); assert.equal(nvmrc,"24.20.0"); assert.equal(packageJson.devDependencies.ajv,"8.17.1");
});
