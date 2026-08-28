import test from "node:test";
import assert from "node:assert/strict";
import { BOOKING_SLOTS, validateBooking } from "../../lib/aiow-v1/booking.mjs";

const now = new Date("2026-08-27T10:00:00.000Z");
const valid = { subject: "bedrijf", details: "Procesinventarisatie", date: "2026-08-28", slot: BOOKING_SLOTS[0], name: "Ada Lovelace", email: "ADA@example.com", company: "Analytical Engines", website: "", consentAccepted: true, consentVersion: "aiow-booking-v1" };

test("valid booking is trimmed and normalized", () => {
  const result = validateBooking({ ...valid, name: "  Ada Lovelace ", email: " ADA@Example.COM " }, { now });
  assert.equal(result.ok, true);
  assert.equal(result.data.name, "Ada Lovelace");
  assert.equal(result.data.email, "ada@example.com");
  assert.equal(result.data.locale, "nl");
});

test("English booking locale is preserved and field errors stay English", () => {
  const validEnglish = validateBooking({ ...valid, locale: "en" }, { now });
  assert.equal(validEnglish.ok, true);
  assert.equal(validEnglish.data.locale, "en");
  const invalidEnglish = validateBooking({ ...valid, locale: "en", email: "bad", date: "2026-08-27" }, { now });
  assert.equal(invalidEnglish.ok, false);
  assert.equal(invalidEnglish.errors.email, "Enter a valid email address.");
  assert.equal(invalidEnglish.errors.date, "Choose a future date.");
});

test("malformed input is rejected", () => {
  assert.equal(validateBooking(null, { now }).ok, false);
  assert.equal(validateBooking([], { now }).ok, false);
  const result = validateBooking({ ...valid, email: "not-an-email", subject: "unknown" }, { now });
  assert.equal(result.ok, false);
  assert.ok(result.errors.email);
  assert.ok(result.errors.subject);
});

test("today and past dates are rejected", () => {
  for (const date of ["2026-08-27", "2026-08-26"]) {
    const result = validateBooking({ ...valid, date }, { now });
    assert.equal(result.ok, false);
    assert.ok(result.errors.date);
  }
});

test("Amsterdam day is rejected even while UTC is previous day", () => {
  const amsterdamAfterMidnight = new Date("2026-08-26T22:30:00.000Z");
  const result = validateBooking({ ...valid, date: "2026-08-27" }, { now: amsterdamAfterMidnight });
  assert.equal(result.ok, false);
  assert.ok(result.errors.date);
});

test("impossible dates and invalid slots are rejected", () => {
  const result = validateBooking({ ...valid, date: "2026-02-30", slot: "23:45" }, { now });
  assert.equal(result.ok, false);
  assert.ok(result.errors.date);
  assert.ok(result.errors.slot);
});

test("oversized strings are rejected", () => {
  const result = validateBooking({ ...valid, details: "x".repeat(1201), name: "n".repeat(101), company: "c".repeat(121), email: `${"e".repeat(250)}@x.io` }, { now });
  assert.equal(result.ok, false);
  for (const key of ["details", "name", "company", "email"]) assert.ok(result.errors[key]);
});

test("non-string fields fail instead of being coerced", () => {
  const result = validateBooking({ ...valid, name: 42, date: 20260828 }, { now });
  assert.equal(result.ok, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.date);
});

test("consent and honeypot fail closed", () => {
  const noConsent = validateBooking({ ...valid, consentAccepted: false }, { now });
  assert.equal(noConsent.ok, false);
  assert.ok(noConsent.errors.consentAccepted);
  const bot = validateBooking({ ...valid, website: "https://spam.invalid" }, { now });
  assert.equal(bot.ok, false);
  assert.ok(bot.errors.form);
});
