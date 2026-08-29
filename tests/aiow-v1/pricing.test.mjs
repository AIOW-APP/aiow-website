import test from "node:test";
import assert from "node:assert/strict";
import { calculateBusinessPrice, calculateBuildingPrice, calculateSmartDesignPrice, formatEuroCents } from "../../lib/aiow-v1/pricing.mjs";

test("business thresholds select the v3.2 tier", () => {
  assert.equal(calculateBusinessPrice(10).tier, "start");
  assert.equal(calculateBusinessPrice(11).tier, "growth");
  assert.equal(calculateBusinessPrice(50).tier, "growth");
  assert.equal(calculateBusinessPrice(51).tier, "accelerated");
  assert.equal(calculateBusinessPrice(250).tier, "accelerated");
  assert.equal(calculateBusinessPrice(251).tier, "private");
});

test("business setup, rates and hard monthly minima are deterministic", () => {
  assert.deepEqual(calculateBusinessPrice(1), { kind: "business", tier: "start", label: "Start", input: 1, setupCents: 295000, monthlyCents: 29500, minimumApplied: { setup: false, monthly: true }, from: false, estimate: false });
  assert.equal(calculateBusinessPrice(10).monthlyCents, 49000);
  assert.equal(calculateBusinessPrice(11).monthlyCents, 79500);
  assert.equal(calculateBusinessPrice(11).minimumApplied.monthly, true);
  assert.equal(calculateBusinessPrice(14).monthlyCents, 82600);
  assert.equal(calculateBusinessPrice(51).setupCents, 1950000);
  assert.equal(calculateBusinessPrice(251).setupCents, 4950000);
  assert.equal(calculateBusinessPrice(251).monthlyCents, 2233900);
  assert.equal(calculateBusinessPrice(251).from, true);
  assert.equal(calculateBusinessPrice(251).estimate, true);
});

test("building setup and monthly minima apply and are exposed", () => {
  const office = calculateBuildingPrice("office", 10);
  assert.equal(office.setupCents, 950000);
  assert.equal(office.monthlyCents, 49500);
  assert.deepEqual(office.minimumApplied, { setup: true, monthly: true });
  assert.equal(calculateBuildingPrice("home", 10).setupCents, 750000);
  assert.equal(calculateBuildingPrice("home", 10).monthlyCents, 22500);
  assert.equal(calculateBuildingPrice("signature", 10).setupCents, 1950000);
  assert.equal(calculateBuildingPrice("signature", 10).monthlyCents, 49500);
});

test("building variable prices, exact XL boundary and cent rounding are correct", () => {
  assert.equal(calculateBuildingPrice("office", 500).setupCents, 3250000);
  assert.equal(calculateBuildingPrice("office", 500).monthlyCents, 49500);
  assert.equal(calculateBuildingPrice("home", 401.234).monthlyCents, 50154);
  assert.equal(calculateBuildingPrice("signature", 400).monthlyCents, 78000);
  assert.equal(calculateBuildingPrice("office", 2000).tier, "office");
  const xl = calculateBuildingPrice("office", 2000.01);
  assert.equal(xl.tier, "office-xl");
  assert.equal(xl.setupCents, 9000045);
  assert.equal(xl.monthlyCents, 195000);
  assert.equal(xl.from, true);
  assert.equal(xl.estimate, true);
  assert.deepEqual(xl.minimumApplied, { setup: false, monthly: true });
});

test("Smart Design uses the highest square-metre, budget or minimum anchor", () => {
  assert.deepEqual(calculateSmartDesignPrice("scan", 300), { kind: "smart-design", service: "scan", label: "Smart Design Scan", squareMetres: 300, technologyBudgetEuros: 0, squareMetreCents: 105000, technologyBudgetCents: 0, totalCents: 295000, minimumApplied: true, determiningAnchor: "minimum", determiningAnchors: ["minimum"], from: true });
  const blueprint = calculateSmartDesignPrice("blueprint", 300, 80000);
  assert.equal(blueprint.squareMetreCents, 375000);
  assert.equal(blueprint.technologyBudgetCents, 960000);
  assert.equal(blueprint.totalCents, 960000);
  assert.equal(blueprint.determiningAnchor, "technology-budget");
  const supervision = calculateSmartDesignPrice("supervision", 300, 80000);
  assert.equal(supervision.totalCents, 750000);
  assert.equal(supervision.minimumApplied, true);
});

test("Smart Design ties retain every determining anchor in documented order", () => {
  const minimumAndArea = calculateSmartDesignPrice("blueprint", 760);
  assert.equal(minimumAndArea.totalCents, 950000);
  assert.deepEqual(minimumAndArea.determiningAnchors, ["minimum", "square-metres"]);
  assert.equal(minimumAndArea.determiningAnchor, "minimum");

  const areaAndBudget = calculateSmartDesignPrice("blueprint", 960, 100000);
  assert.equal(areaAndBudget.squareMetreCents, 1200000);
  assert.equal(areaAndBudget.technologyBudgetCents, 1200000);
  assert.deepEqual(areaAndBudget.determiningAnchors, ["technology-budget", "square-metres"]);
  assert.equal(areaAndBudget.determiningAnchor, "technology-budget");
});

test("Smart Design reproduces the 4,000 m² binder example", () => {
  assert.equal(calculateSmartDesignPrice("blueprint", 4000).totalCents, 5000000);
  assert.equal(calculateSmartDesignPrice("supervision", 4000).totalCents, 3000000);
});

test("invalid calculator inputs fail closed", () => {
  for (const input of [0, -1, NaN, Infinity, 1.5]) assert.throws(() => calculateBusinessPrice(input));
  assert.throws(() => calculateBuildingPrice("castle", 100));
  assert.throws(() => calculateBuildingPrice("home", 0));
  assert.throws(() => calculateSmartDesignPrice("drawing", 100, 10000));
  assert.throws(() => calculateSmartDesignPrice("blueprint", 100, -1));
  assert.throws(() => calculateBuildingPrice("office", Number.MAX_VALUE));
  assert.throws(() => calculateSmartDesignPrice("blueprint", Number.MAX_VALUE));
  assert.throws(() => calculateSmartDesignPrice("blueprint", 100, Number.MAX_VALUE));
  assert.throws(() => calculateBusinessPrice(Number.MAX_SAFE_INTEGER));
});

test("every returned cent field is a finite safe integer", () => {
  const results = [
    calculateBusinessPrice(1), calculateBusinessPrice(251),
    calculateBuildingPrice("office", 2000), calculateBuildingPrice("office", 2000.01),
    calculateBuildingPrice("home", 401.234), calculateBuildingPrice("signature", 300),
    calculateSmartDesignPrice("scan", 300), calculateSmartDesignPrice("blueprint", 960, 100000),
    calculateSmartDesignPrice("supervision", 4000, 80000),
  ];
  for (const result of results) {
    for (const [key, value] of Object.entries(result)) {
      if (key.endsWith("Cents")) assert.ok(Number.isFinite(value) && Number.isSafeInteger(value), `${key} is not safe: ${value}`);
    }
  }
});

test("currency formatting retains cents only when needed", () => {
  assert.match(formatEuroCents(295000), /2[.\s]950/);
  assert.match(formatEuroCents(50154), /501,54/);
});
