import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import Ajv2020 from "ajv/dist/2020.js";

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
  const rpcNames = ["aiow_quote_prepare_v1","aiow_quote_commit_v1","aiow_booking_commit_v1","aiow_commercial_queue_v1","aiow_commercial_mutate_v1","aiow_commercial_report_v1","aiow_commercial_event_v1","aiow_mail_outbox_claim_v2","aiow_mail_outbox_sent_v2","aiow_mail_outbox_retry_v2","aiow_mail_outbox_dead_v2","aiow_mail_outbox_review_v2","aiow_mail_outbox_resolve_v2","aiow_commercial_retention_dry_run_v1","aiow_mail_outbox_recover_stale_v2","aiow_mail_outbox_cancel_v2","aiow_provider_gate_write_v1","aiow_active_customer_relation_set_v1","aiow_quote_abandon_expired_v1"];
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
  assert.deepEqual(Object.keys(db.tables), ["commercial_leads","booking_leads","commercial_mail_outbox","commercial_events","commercial_event_daily","commercial_audit","commercial_provider_gates","commercial_idempotency"]);
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
  assert.equal(idem.digest,"sha256_utf8_rfc8785_canonical_json"); assert.equal(idem.atomicOutcome,true); assert.match(idem.sameKeySameDigest,/before_revision_check/); assert.equal(idem.sameKeyDifferentDigest.status,409); assert.equal(idem.covered.length,10);
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
  const effectFields = { mark_read:"unread", set_priority:"priority", transition_status:"status", set_next_action:"nextActionAt", set_legal_hold:"legalHold" };
  const field = effectFields[value.operation];
  if (field && value.effect[field] !== value.projection[field]) return false;
  return !value.replayed || stableJson(value) === stableJson(persistedReplay);
}
function providerGateBinding(record) {
  const fields = contract["x-aiow-provider-gate"].approvalBinding;
  return sha256(Object.fromEntries(fields.map((field) => [field, record[field]])));
}
function validateCurrentProviderGate(record, serverNow) {
  if (!validateRoot(record)) return false;
  if (!["approved", "activated"].includes(record.state)) return false;
  const now = Date.parse(serverNow), approved = Date.parse(record.approvedAt), expires = Date.parse(record.expiresAt);
  return approved <= now && now < expires && record.approvalBindingSha256 === providerGateBinding(record);
}

test("canonical fixture registry contains exactly 70 independently frozen records", () => {
  const expectedCounts = { requests:11, acks:5, errors:7, projections:10, events:12, providerResults:4, rpcBoundaries:19, migrationScenarios:2 };
  const expectedDigests = {
    requests:"991e4fde39e0144c7a378f7a5ceb194fca400286c9a1ab5abebd83fd62e877d2",
    acks:"ed50fe7d0b0a34b3081023f36688e45b6b38424571118bd9fba47c202b15f73a",
    errors:"90d706434488ca273ac20edc683eb55412bcda0572a67c930e17acdecaeaaa8e",
    projections:"249b2607169e69ff2c1ff5b9bebdfc9808a9cb8dddcfae829701e893cdeb86c3",
    events:"ea4aced2945e90e903d95f27514e90f4b366df6ea4913e028f9029dd51df5d83",
    providerResults:"ce715ea6a8c88bbe647e2ec182fe3e2b691e01706ffb279d52c10df7b377c12d",
    rpcBoundaries:"905baad2eebb0f08fdfa9fc7c00cd072aba37f3e5e45c0daf37504be136b0c9b",
    migrationScenarios:"4cd373a06b638959ecc151112882dd3ed6513b06f15c87f4cd839292589e69de",
  };
  assert.equal(canonicalFixtures.fixtureVersion, 1);
  for (const [group, count] of Object.entries(expectedCounts)) {
    assert.equal(Object.keys(canonicalFixtures[group]).length, count, group);
    assert.equal(new Set(Object.keys(canonicalFixtures[group])).size, count, `${group} duplicate identities`);
    assert.equal(sha256(canonicalFixtures[group]), expectedDigests[group], `${group} digest`);
  }
  const records = Object.entries(expectedCounts).flatMap(([group]) => Object.entries(canonicalFixtures[group]).map(([name, value]) => ({group,name,value}))).sort((a,b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
  assert.equal(records.length, 70);
  assert.equal(sha256(records), "633b5b68cf6b76107bde5c33899107273efa42eed351b428d35c7501a583a6fe");
  for (const group of ["requests","acks","errors","projections","events","providerResults"])
    for (const [name, value] of Object.entries(canonicalFixtures[group])) assert.equal(validateRoot(value), true, `${group}/${name}: ${ajv.errorsText(validateRoot.errors)}`);
});

test("operation and RPC registries freeze typed order, private service-role authority and HMAC", () => {
  const ops = contract["x-aiow-operations"], auth = contract["x-aiow-operator-auth"], hmac = contract["x-aiow-internal-hmac"];
  assert.equal(Object.keys(ops).length, 28);
  assert.equal(sha256(ops), "9c9f00b645f4c3a39e825c66d96735ad71e3769dd27a6481d361cff635ead05f");
  assert.deepEqual(auth.canonicalActor, {id:"richard",role:"ops_admin",source:"private server configuration AIOW_OPS_OPERATOR_ID; exact value richard; missing or different value fails closed"});
  assert.match(auth.sqlDelegation, /service-role only/); assert.match(auth.rpcActorDerivation, /caller actor\/JWT\/p_operator_id is forbidden/);
  assert.deepEqual(auth.directRpcPolicy, {PUBLIC:"EXECUTE revoked",anon:"EXECUTE revoked",authenticated:"EXECUTE revoked",service_role:"only grantee",browser:"direct invocation denied"});
  assert.equal(stableJson(contract).includes("ops_admin_jwt"), false);
  for (const [name, op] of Object.entries(ops).filter(([,value]) => value.transport === "sql_rpc")) {
    assert.equal(op.visibility, "private_server_only", name);
    assert.deepEqual(op.grants, {PUBLIC:false,anon:false,authenticated:false,service_role:true}, name);
    assert.equal(new Set(op.args.map((arg) => arg.name)).size, op.args.length, `${name} duplicate args`);
    for (const arg of op.args) {
      assert.deepEqual(Object.keys(arg), ["name","sqlType","nullable","default","validationRef"], `${name}/${arg.name}`);
      assert.equal(typeof arg.sqlType, "string"); assert.equal(typeof arg.nullable, "boolean"); assert.equal(typeof arg.validationRef, "string"); assert.ok(arg.validationRef.length > 0);
      if (arg.validationRef.startsWith("#/")) deref({$ref:arg.validationRef});
      assert.doesNotMatch(arg.name, /operator|actor|jwt/i);
    }
    assert.deepEqual(op.returns, {sqlType:"jsonb",schemaRef:op.ackRef,cardinality:"exactly_one"});
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

test("outbox state machine, leases and Graph-only provider outcomes reject hostile crossings", () => {
  const outbox = contract["x-aiow-outbox"], ops = contract["x-aiow-operations"];
  const edges = outbox.transitions.flatMap((transition) => transition.from.flatMap((from) => (Array.isArray(transition.to) ? transition.to : [transition.to]).map((to) => `${from}->${to}@${transition.rpc}`))).sort();
  assert.deepEqual(edges, [
    "leased->dead@aiow_mail_outbox_dead_v2","leased->retry@aiow_mail_outbox_recover_stale_v2","leased->retry@aiow_mail_outbox_retry_v2","leased->review@aiow_mail_outbox_review_v2","leased->sent@aiow_mail_outbox_sent_v2",
    "pending->cancelled@aiow_mail_outbox_cancel_v2","pending->leased@aiow_mail_outbox_claim_v2","retry->cancelled@aiow_mail_outbox_cancel_v2","retry->leased@aiow_mail_outbox_claim_v2",
    "review->cancelled@aiow_mail_outbox_cancel_v2","review->dead@aiow_mail_outbox_resolve_v2","review->retry@aiow_mail_outbox_resolve_v2","review->sent@aiow_mail_outbox_resolve_v2",
  ].sort());
  assert.deepEqual(outbox.terminal,["sent","dead","cancelled"]); assert.match(outbox.illegal,/absent.*denied/);
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
  assert.deepEqual(contract["x-aiow-provider-gate"].v2Providers,["microsoft_graph"]);
  assert.equal(validateRoot({...accepted,receipt:{...accepted.receipt,provider:"gmail_legacy_test_only"}}),false);
});

test("provider owner gate binds exact Graph target, RBAC evidence, revision and trusted time", () => {
  const gate = {...canonicalFixtures.projections.ProviderGateRecord,state:"activated",secretPresent:true,oauthClientCredentialsPresent:true,exchangeRbacSenderInScope:true,exchangeRbacControlMailboxInScope:false,entraUnscopedMailSendAssigned:false,ownerApprovedBy:"richard",approvedAt:"2026-08-30T12:00:00.000Z",expiresAt:"2026-08-31T12:00:00.000Z"};
  gate.approvalBindingSha256 = providerGateBinding(gate);
  assert.equal(validateCurrentProviderGate(gate,"2026-08-30T13:00:00.000Z"),true);
  assert.equal(validateRoot({...gate,ownerApprovedBy:"arbitrary"}),false);
  assert.equal(validateRoot({...gate,exchangeRbacSenderInScope:false}),false);
  assert.equal(validateRoot({...gate,exchangeRbacControlMailboxInScope:true}),false);
  assert.equal(validateRoot({...gate,entraUnscopedMailSendAssigned:true}),false);
  assert.equal(validateCurrentProviderGate({...gate,sender:"attacker@example.com"},"2026-08-30T13:00:00.000Z"),false);
  assert.equal(validateCurrentProviderGate({...gate,evidenceSha256:"b".repeat(64)},"2026-08-30T13:00:00.000Z"),false);
  assert.equal(validateCurrentProviderGate({...gate,revision:2},"2026-08-30T13:00:00.000Z"),false);
  assert.equal(validateCurrentProviderGate(gate,"2026-08-29T13:00:00.000Z"),false);
  assert.equal(validateCurrentProviderGate(gate,gate.expiresAt),false);
  assert.equal(validateCurrentProviderGate({...gate,state:"revoked"},"2026-08-30T13:00:00.000Z"),false);
  assert.equal(contract.$defs.ProviderGateRecord["x-aiow-custom-validator"],"providerGateCurrentV1");
  assert.match(contract["x-aiow-provider-gate"].microsoftAuthority.unionRiskRule,/MUST NOT/);
});

test("persistence mappings and retention anchors are exact and exception-complete", () => {
  const db=contract["x-aiow-persistence"], retention=contract["x-aiow-retention"], lead=db.tables.commercial_leads;
  assert.equal(sha256(db),"2c326e2515f8b00c9467b6cfc78ae78cc659040aedeeb9dde6b9768eab26fa4d");
  assert.equal(sha256(db.sourceMappings),"ef2cd092dcb45b9836f4c91c40008c461a6894ee0d422544003ec7c03308f7c4");
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
