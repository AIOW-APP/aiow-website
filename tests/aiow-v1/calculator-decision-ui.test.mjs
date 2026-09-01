import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root=new URL("../../",import.meta.url);

test("calculator mounts one canonical bilingual decision summary with one dominant action",async()=>{
  const [calculator,decision,css]=await Promise.all([
    readFile(new URL("components/aiow-v1/PriceCalculator.tsx",root),"utf8"),
    readFile(new URL("lib/aiow-v1/calculator-decision.mjs",root),"utf8"),
    readFile(new URL("components/aiow-v1/AiowV1Homepage.module.css",root),"utf8"),
  ]);
  assert.match(calculator,/buildCalculatorDecision\(quoteConfiguration, locale\)/);
  assert.match(calculator,/Beslissamenvatting/); assert.match(calculator,/Decision summary/);
  assert.match(calculator,/decision\.recommendation/); assert.match(calculator,/decision\.fit/);
  assert.match(calculator,/decision\.exclusions/); assert.match(calculator,/decision\.finalPriceDrivers/);
  assert.match(calculator,/decision\.dominantAction/); assert.match(calculator,/decision\.secondaryAction/);
  assert.equal((calculator.match(/decisionPrimary/g)||[]).length,1);
  assert.match(decision,/calculateBusinessPrice\(config\.people\)/); assert.match(decision,/calculateBuildingPrice/);
  assert.doesNotMatch(decision,/fetch\(|Math\.random|Date\(|localStorage|document|window/);
  assert.match(css,/\.decisionSummary/); assert.match(css,/\.decisionPrimary/); assert.match(css,/\.decisionSecondary/);
  assert.match(css,/@media\(max-width:600px\)[^]*\.decisionMoney,\.decisionColumns\{grid-template-columns:1fr\}/);
});
