import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { payloadDigest } from "../../lib/aiow-v1/commercial-api-runtime.mjs";

const fixtures = JSON.parse(await readFile(new URL("../fixtures/aiow-commercial-contract-v1.json", import.meta.url), "utf8"));
const quote = fixtures.requests.QuoteRequest;
const ids = {
  requestId: "123e4567-e89b-42d3-a456-426614174000",
  idempotencyKey: "quote-key-000001",
  leadId: "223e4567-e89b-42d3-a456-426614174000",
  commercialLeadId: "323e4567-e89b-42d3-a456-426614174000",
  quoteNumber: "AIOW-2026-0001",
};
const digestInput = { country: quote.country, quote, contact: quote.contact, consent: quote.consent, source: quote.source };
const record = {
  id: ids.leadId,
  commercial_lead_id: ids.commercialLeadId,
  idempotency_key: ids.idempotencyKey,
  request_id: ids.requestId,
  quote_number: ids.quoteNumber,
  state: "prepared",
  request_payload_hash: payloadDigest(digestInput),
  normalized_quote: quote,
  contact: quote.contact,
  consent: quote.consent,
  source: quote.source,
  country: quote.country,
  received_at: "2026-08-30T12:00:00.000Z",
  expires_at: "2026-08-31T12:00:00.000Z",
};
const env = { AIOW_SUPABASE_URL: "http://127.0.0.1:54321", AIOW_SUPABASE_SERVICE_ROLE_KEY: "service-role", AIOW_COMMERCIAL_TEST_MODE: "1" };
const response = (value = record, status = 200) => async (url, init) => {
  assert.equal(url.pathname, "/rest/v1/quote_leads");
  assert.equal(url.searchParams.get("id"), `eq.${ids.leadId}`);
  assert.equal(init.headers.authorization, "Bearer service-role");
  return new Response(JSON.stringify([value]), { status, headers: { "content-type": "application/json" } });
};

async function freshLoader(tag) {
  return (await import(`../../lib/aiow-v1/quote-prepared-store.mjs?instance=${tag}-${Date.now()}-${Math.random()}`)).loadDurablePreparedQuote;
}

test("prepare then a simulated restarted/second instance commit loads durable prepared authority", async () => {
  const first = await freshLoader("first");
  const second = await freshLoader("second");
  assert.deepEqual(await first(ids, { env, fetchImpl: response(), now: Date.parse("2026-08-30T13:00:00Z") }), { quote, receivedAt: record.received_at, state: "prepared" });
  assert.deepEqual(await second(ids, { env, fetchImpl: response(), now: Date.parse("2026-08-30T13:00:00Z") }), { quote, receivedAt: record.received_at, state: "prepared" });
});

test("durable prepared authority rejects wrong IDs, digest and expiry as conflicts", async () => {
  const load = await freshLoader("conflicts");
  const cases = [
    { input: { ...ids, requestId: "423e4567-e89b-42d3-a456-426614174000" }, value: record },
    { input: { ...ids, commercialLeadId: "423e4567-e89b-42d3-a456-426614174000" }, value: record },
    { input: ids, value: { ...record, request_payload_hash: "0".repeat(64) } },
    { input: ids, value: { ...record, expires_at: "2026-08-30T12:30:00.000Z" } },
  ];
  for (const { input, value } of cases) {
    await assert.rejects(() => load(input, { env, fetchImpl: response(value), now: Date.parse("2026-08-30T13:00:00Z") }), (error) => error.status === 409 && error.code === "idempotency_conflict");
  }
});

test("committed durable records remain loadable for byte-identical replay after prepare expiry", async () => {
  const load = await freshLoader("committed");
  const saved = await load(ids, { env, fetchImpl: response({ ...record, state: "committed", expires_at: "2026-08-29T12:00:00.000Z" }), now: Date.parse("2026-08-30T13:00:00Z") });
  assert.equal(saved.state, "committed");
});
