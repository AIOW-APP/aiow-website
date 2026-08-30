import test from "node:test";
import assert from "node:assert/strict";
import { buildAnalyticsEvent, track, TRACKABLE_EVENTS } from "../../core/analytics/client.ts";

const runtime = {
  pathname: "/",
  width: 390,
  now: () => new Date("2026-08-30T12:00:00.000Z"),
  uuid: () => "123e4567-e89b-42d3-a456-426614174000",
};

test("analytics client builds only closed canonical allowlist events", () => {
  assert.deepEqual(TRACKABLE_EVENTS, ["page_view", "calculator_changed", "context_opened", "quote_opened", "quote_succeeded", "quote_failed", "booking_opened", "booking_succeeded", "booking_failed", "scan_cta_clicked", "knowledge_cta_clicked", "experiment_exposed"]);
  assert.deepEqual(buildAnalyticsEvent("page_view", {}, runtime), {
    schemaKind: "analytics_page_view", eventId: runtime.uuid(), event: "page_view", occurredAt: runtime.now().toISOString(), route: "/", locale: "nl", viewport: "mobile",
  });
  assert.deepEqual(buildAnalyticsEvent("calculator_changed", { segment: "business", serviceRoute: "standard" }, runtime), {
    schemaKind: "analytics_calculator_changed", eventId: runtime.uuid(), event: "calculator_changed", occurredAt: runtime.now().toISOString(), route: "/", locale: "nl", segment: "business", serviceRoute: "standard",
  });
});

test("analytics client rejects unknown events, PII, free text and extra fields before fetch", async () => {
  let calls = 0;
  const fetcher = async () => { calls += 1; return new Response(null, { status: 202 }); };
  for (const [event, fields] of [
    ["identify", {}],
    ["booking_opened", { email: "person@example.com" }],
    ["booking_failed", { failureClass: "unavailable", note: "customer supplied text" }],
    ["scan_cta_clicked", { referrer: "https://example.com" }],
    ["page_view", { query: "?utm_source=x" }],
  ]) {
    const result = await track(event, fields, { ...runtime, fetcher });
    assert.equal(result.sent, false);
    assert.equal(result.reason, "rejected");
  }
  assert.equal(calls, 0);
});

test("analytics delivery uses first-party endpoint and stays silent but testable on failure", async () => {
  const requests = [];
  const accepted = await track("booking_succeeded", { experiment: null }, { ...runtime, fetcher: async (url, init) => { requests.push({ url, init }); return new Response(null, { status: 202 }); } });
  assert.equal(accepted.sent, true);
  assert.equal(requests[0].url, "/api/events");
  assert.equal(requests[0].init.headers["idempotency-key"], runtime.uuid());
  assert.equal(JSON.parse(requests[0].init.body).event, "booking_succeeded");
  const failed = await track("booking_failed", { failureClass: "unavailable" }, { ...runtime, fetcher: async () => { throw new Error("offline"); } });
  assert.deepEqual(failed, { accepted: true, sent: false, reason: "delivery_failed" });
});

test("route, locale, viewport, context and experiment dimensions are contract-bound", () => {
  assert.equal(buildAnalyticsEvent("page_view", {}, { ...runtime, pathname: "/bedrijfsgegevens" }), null);
  assert.equal(buildAnalyticsEvent("context_opened", { contextSlug: "care" }, { ...runtime, pathname: "/en/rates/care" }), null);
  assert.equal(buildAnalyticsEvent("context_opened", { contextSlug: "care" }, { ...runtime, pathname: "/tarieven/care" }).route, "/context");
  assert.equal(buildAnalyticsEvent("page_view", {}, { ...runtime, pathname: "/en", width: 768 }).viewport, "tablet");
  assert.equal(buildAnalyticsEvent("page_view", {}, { ...runtime, width: 1440 }).viewport, "desktop");
  assert.equal(buildAnalyticsEvent("scan_cta_clicked", { experiment: { experimentId: "other", variant: "control" } }, runtime), null);
  assert.equal(buildAnalyticsEvent("experiment_exposed", { experiment: null }, runtime), null);
});
