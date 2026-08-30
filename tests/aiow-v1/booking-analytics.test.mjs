import test from "node:test";
import assert from "node:assert/strict";
import { requestBooking } from "../../components/aiow-v1/booking-request.ts";

const jsonResponse = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

async function exercise(fetcher) {
  const events = [];
  const result = await requestBooking(fetcher, { method: "POST", body: JSON.stringify({ date: "2026-09-30", slot: "09:00", subject: "bedrijf" }) }, (event, fields) => { events.push({ event, fields }); });
  return { result, events };
}

test("booking transport and malformed-success failures emit unavailable exactly once", async () => {
  for (const fetcher of [
    async () => { throw new TypeError("network unavailable"); },
    async () => new Response("not-json", { status: 200 }),
    async () => jsonResponse(200, { schemaKind: "booking_ack", accepted: true }),
    async () => jsonResponse(200, { schemaKind: "booking_ack", accepted: false, requestId: "id" }),
    async () => jsonResponse(200, { schemaKind: "booking_ack", accepted: true, requestId: "", preference: { date: "2026-09-30", slot: "09:00", subject: "bedrijf" } }),
    async () => jsonResponse(200, { schemaKind: "booking_ack", accepted: true, requestId: "id", preference: { date: "2026-09-30", slot: "10:30", subject: "bedrijf" } }),
  ]) {
    const { result, events } = await exercise(fetcher);
    assert.deepEqual(events, [{ event: "booking_failed", fields: { failureClass: "unavailable" } }]);
    assert.equal(result.ok, false);
    assert.equal(result.failureClass, "unavailable");
  }
});

test("booking HTTP failures retain their closed class and emit once even with malformed bodies", async () => {
  for (const [status, failureClass] of [[400, "validation"], [422, "validation"], [409, "conflict"], [429, "rate_limit"], [500, "unavailable"], [503, "unavailable"]]) {
    for (const response of [jsonResponse(status, { fields: { email: "Controleer e-mail" } }), new Response("invalid", { status })]) {
      const { result, events } = await exercise(async () => response);
      assert.deepEqual(events, [{ event: "booking_failed", fields: { failureClass } }], String(status));
      assert.equal(result.ok, false);
      assert.equal(result.failureClass, failureClass);
    }
  }
});

test("booking valid durable pending-confirmation ACK emits only the aggregate success event", async () => {
  const { result, events } = await exercise(async () => jsonResponse(202, { schemaKind: "booking_ack", accepted: true, requestId: "123e4567-e89b-42d3-a456-426614174000", preference: { date: "2026-09-30", slot: "09:00", subject: "bedrijf" } }));
  assert.deepEqual(result, { ok: true, requestId: "123e4567-e89b-42d3-a456-426614174000" });
  assert.deepEqual(events, [{ event: "booking_succeeded", fields: { experiment: null } }]);
});
