import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [booking, css] = await Promise.all([
  readFile(new URL("../../components/aiow-v1/BookingModal.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../components/aiow-v1/AiowV1Homepage.module.css", import.meta.url), "utf8"),
]);

test("booking copy describes a preferred request, durable 2xx receipt and human confirmation", () => {
  assert.match(booking, /response\.ok/);
  assert.ok(booking.indexOf("response.ok") < booking.indexOf('setStatus("success")'));
  assert.match(booking, /Voorkeursaanvraag/);
  assert.match(booking, /Duurzaam ontvangstbewijs/);
  assert.match(booking, /Een mens bevestigt datum en tijd apart/);
  assert.match(booking, /does not reserve provider calendar capacity/);
});

test("ICS is a local reminder and modal accessibility behavior remains intact", () => {
  assert.match(booking, /Download lokale herinnering \(\.ics\)/);
  assert.match(booking, /only a local reminder generated on your device/);
  assert.match(booking, /aria-modal="true"/);
  assert.match(booking, /node\.inert = true/);
  assert.match(booking, /event\.key === "Escape"/);
  assert.match(booking, /previous\?\.focus\(\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("booking accepted and failure states emit only allowlisted aggregate events", () => {
  assert.match(booking, /track\("booking_opened"/);
  assert.match(booking, /track\("booking_succeeded", \{ experiment: null \}\)/);
  assert.match(booking, /track\("booking_failed", \{ failureClass:/);
  assert.doesNotMatch(booking, /track\([^\n]*(email|name|details|company)/);
  assert.match(booking, /role="alert"/);
  assert.match(booking, /role="status"/);
});
