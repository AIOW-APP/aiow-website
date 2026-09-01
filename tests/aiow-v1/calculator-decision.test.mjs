import test from "node:test";
import assert from "node:assert/strict";
import { buildCalculatorDecision } from "../../lib/aiow-v1/calculator-decision.mjs";

test("business decision summary derives exact canonical tier, money and minimum", () => {
  assert.deepEqual(buildCalculatorDecision({ segment:"business", serviceRoute:"standard", people:11 }, "nl"), {
    schemaKind:"calculator_decision_summary", recommendation:"Growth", fit:"11 mensen valt binnen het gepubliceerde pakket Growth.", quantity:"11 mensen",
    setupCents:750000, monthlyCents:79500, from:false, estimate:false,
    minimums:["Het maandminimum voor beheer is van toepassing."], route:"Standaard laat abonnementen en hardware rechtstreeks bij u.",
    exclusions:["Btw","Hardware en fysieke installatie","Cloud-, AI- en leveranciersgebruik"],
    finalPriceDrivers:["Geverifieerde scope van proces of ruimte","Technische en fysieke afhankelijkheden","Werkelijk derdegebruik en gekozen serviceroute"],
    dominantAction:"Genereer offerte-indicatie", secondaryAction:"Vraag in plaats daarvan een scan aan", boundary:"Dit is een beslissteun, geen eindofferte of technische toezegging.",
  });
});

test("building and home decisions retain XL, package, route and English boundaries", () => {
  const xl=buildCalculatorDecision({ segment:"building", serviceRoute:"comfort", squareMetres:2500 }, "en");
  assert.equal(xl.recommendation,"Smart Office XL"); assert.equal(xl.setupCents,11250000); assert.equal(xl.monthlyCents,195000); assert.equal(xl.from,true); assert.equal(xl.estimate,true);
  assert.match(xl.route,/automatic direct debit/); assert.match(xl.boundary,/not a final offer/);
  const home=buildCalculatorDecision({ segment:"home", serviceRoute:"standard", squareMetres:120, homeSubtype:"signature" }, "nl");
  assert.equal(home.recommendation,"AIOW Signature"); assert.equal(home.setupCents,1980000); assert.equal(home.monthlyCents,49500);
  assert.deepEqual(home.minimums,["Het maandminimum voor beheer is van toepassing."]);
});

test("decision config is closed and rejects client-authored or out-of-range variants", () => {
  for (const value of [
    { segment:"business",serviceRoute:"standard",people:10,setupCents:1 },
    { segment:"business",serviceRoute:"standard",people:0 },
    { segment:"building",serviceRoute:"comfort",squareMetres:4001 },
    { segment:"home",serviceRoute:"standard",squareMetres:120,homeSubtype:"castle" },
    { segment:"home",serviceRoute:"credit",squareMetres:120,homeSubtype:"home" },
  ]) assert.throws(()=>buildCalculatorDecision(value,"nl"));
  assert.throws(()=>buildCalculatorDecision({ segment:"business",serviceRoute:"standard",people:10 },"de"));
});
