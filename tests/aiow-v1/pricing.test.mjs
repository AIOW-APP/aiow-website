import test from "node:test";
import assert from "node:assert/strict";
import { calculateBusinessPrice, calculateBuildingPrice, formatEuroCents } from "../../lib/aiow-v1/pricing.mjs";

test("business thresholds select the published tier", () => {
  assert.equal(calculateBusinessPrice(10).tier, "start");
  assert.equal(calculateBusinessPrice(11).tier, "growth");
  assert.equal(calculateBusinessPrice(50).tier, "growth");
  assert.equal(calculateBusinessPrice(51).tier, "accelerated");
  assert.equal(calculateBusinessPrice(250).tier, "accelerated");
  assert.equal(calculateBusinessPrice(251).tier, "private");
});

test("business setup and monthly prices are deterministic", () => {
  assert.deepEqual(calculateBusinessPrice(1), { kind: "business", tier: "start", label: "Start", input: 1, setupCents: 495000, monthlyCents: 24500, from: false });
  assert.equal(calculateBusinessPrice(10).monthlyCents, 29000);
  assert.equal(calculateBusinessPrice(11).monthlyCents, 53900);
  assert.equal(calculateBusinessPrice(251).setupCents, 4950000);
  assert.equal(calculateBusinessPrice(251).monthlyCents, 2484900);
  assert.equal(calculateBusinessPrice(251).from, true);
});

test("building setup and monthly minimums apply", () => {
  assert.equal(calculateBuildingPrice("office", 10).setupCents, 495000);
  assert.equal(calculateBuildingPrice("office", 10).monthlyCents, 34500);
  assert.equal(calculateBuildingPrice("home", 10).setupCents, 995000);
  assert.equal(calculateBuildingPrice("home", 10).monthlyCents, 39500);
  assert.equal(calculateBuildingPrice("signature", 10).setupCents, 1950000);
  assert.equal(calculateBuildingPrice("signature", 10).monthlyCents, 59500);
});

test("building variable prices and cent rounding are correct", () => {
  assert.equal(calculateBuildingPrice("office", 500).setupCents, 1750000);
  assert.equal(calculateBuildingPrice("office", 500).monthlyCents, 37500);
  assert.equal(calculateBuildingPrice("home", 401.234).monthlyCents, 50154);
  assert.equal(calculateBuildingPrice("signature", 400).monthlyCents, 78000);
});

test("invalid calculator inputs fail closed", () => {
  for (const input of [0, -1, NaN, Infinity, 1.5]) assert.throws(() => calculateBusinessPrice(input));
  assert.throws(() => calculateBuildingPrice("castle", 100));
  assert.throws(() => calculateBuildingPrice("home", 0));
});

test("currency formatting retains cents only when needed", () => {
  assert.match(formatEuroCents(495000), /4[.\s]950/);
  assert.match(formatEuroCents(50154), /501,54/);
});
