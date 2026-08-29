import test from "node:test";
import assert from "node:assert/strict";
import { BookingRequestError, amsterdamDateISO, createRateLimiter, readBoundedJson } from "../../lib/aiow-v1/booking-runtime.mjs";

test("Amsterdam calendar wins when UTC is still the previous day", () => {
  assert.equal(amsterdamDateISO(new Date("2026-08-26T22:30:00.000Z")), "2026-08-27");
  assert.equal(amsterdamDateISO(new Date("2026-10-24T22:30:00.000Z"), 1), "2026-10-26");
});

test("bounded reader rejects chunked bodies before full buffering", async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode("x".repeat(6))); controller.enqueue(new TextEncoder().encode("y".repeat(6))); controller.close(); } });
  const request = new Request("http://localhost/api/booking", { method: "POST", body: stream, duplex: "half" });
  await assert.rejects(() => readBoundedJson(request, 10), (error) => error instanceof BookingRequestError && error.status === 413);
});

test("bounded reader parses valid JSON", async () => {
  const request = new Request("http://localhost/api/booking", { method: "POST", body: JSON.stringify({ ok: true }) });
  assert.deepEqual(await readBoundedJson(request, 100), { ok: true });
});

test("rate limiter enforces per-client and global windows", () => {
  const limiter = createRateLimiter({ perKey: 2, global: 3, windowMs: 1000 });
  assert.equal(limiter.consume("a", 0).ok, true);
  assert.equal(limiter.consume("a", 1).ok, true);
  assert.equal(limiter.consume("a", 2).ok, false);
  assert.equal(limiter.consume("b", 3).ok, true);
  assert.equal(limiter.consume("c", 4).ok, false);
  assert.equal(limiter.consume("a", 1001).ok, true);
});
