import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";

const contractUrl = new URL("../../docs/contracts/aiow-commercial-control-plane-v1.json", import.meta.url);
const contract = JSON.parse(await readFile(contractUrl, "utf8"));
const ajv = new Ajv2020({ strict: true, allErrors: true, validateFormats: true });
for (const keyword of Object.keys(contract).filter((key) => key.startsWith("x-"))) ajv.addKeyword({ keyword, valid: true });
ajv.addFormat("uuid", /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
ajv.addFormat("date", /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat("date-time", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
ajv.addFormat("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
const validateRoot = ajv.compile(contract);
const uuid = "123e4567-e89b-42d3-a456-426614174000";

function deref(schema) {
  if (schema.$ref) {
    const name = schema.$ref.match(/^#\/\$defs\/(.+)$/)?.[1];
    assert.ok(name && contract.$defs[name], `unresolved ref ${schema.$ref}`);
    return contract.$defs[name];
  }
  return schema;
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
    return result;
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
      assert.equal(schema.additionalProperties === false || schema.unevaluatedProperties === false, true, `${path} is open`);
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
  const rpcNames = ["aiow_quote_prepare_v1","aiow_quote_commit_v1","aiow_booking_commit_v1","aiow_commercial_queue_v1","aiow_commercial_mutate_v1","aiow_commercial_report_v1","aiow_commercial_event_v1","aiow_mail_outbox_claim_v2","aiow_mail_outbox_sent_v2","aiow_mail_outbox_retry_v2","aiow_mail_outbox_dead_v2","aiow_mail_outbox_review_v2","aiow_mail_outbox_resolve_v2","aiow_commercial_retention_dry_run_v1"];
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

test("Node 24 is pinned without changing package manager semantics", async () => {
  const packageJson=JSON.parse(await readFile(new URL("../../package.json", import.meta.url),"utf8"));
  const nvmrc=(await readFile(new URL("../../.nvmrc", import.meta.url),"utf8")).trim();
  assert.equal(packageJson.engines.node,">=24 <25"); assert.equal(nvmrc,"24.20.0"); assert.equal(packageJson.devDependencies.ajv,"8.17.1");
});
