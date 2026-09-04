import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const [stories, page, css, dna] = await Promise.all([
  readFile(new URL("lib/aiow-v1/priority-context-stories.ts", root), "utf8"),
  readFile(new URL("components/aiow-v1/PricingContextPage.tsx", root), "utf8"),
  readFile(new URL("components/aiow-v1/PricingContextPage.module.css", root), "utf8"),
  readFile(new URL("DESIGN-DNA.md", root), "utf8"),
]);

const priority = ["accountants", "advocatuur", "makelaars", "kantoorpand", "woning", "villa-signature"];

test("six priority contexts carry complete bilingual outcome-led stories", () => {
  for (const slug of priority) assert.match(stories, new RegExp(`(?:^|\\n)  [\"]?${slug}[\"]?:`));
  assert.equal((stories.match(/humanDecision:/g) || []).length, 13);
  assert.equal((stories.match(/scanQuestion:/g) || []).length, 13);
  assert.equal((stories.match(/trace:/g) || []).length, 13);
  assert.match(page, /Nu vaak/);
  assert.match(page, /With AIOW/);
  assert.doesNotMatch(stories, /gegarandeerde? besparing|guaranteed savings|klantcase|customer case/i);
});

test("context page renders one optional plain-language journey before feature examples", () => {
  assert.match(page, /getPriorityContextStory\(context\.slug, locale\)/);
  assert.match(page, /\{story && <section[^]*<\/section>\}\n      \{story \? <>\{advice\}\{calculation\}\{applications\}<\/>/);
  for (const marker of ["Wat verandert er praktisch", "Nu vaak", "Met AIOW", "Uw beslissing", "Vraag voor de gratis scan van circa 30 minuten"]) assert.match(page, new RegExp(marker));
  assert.match(page, /aria-label=\{en \? "Reference workflow with human control"/);
  assert.match(page, /\{story \? <>\{advice\}\{calculation\}\{applications\}<\/>/);
  assert.match(css, /\.journey\{background:#14161a/);
  assert.match(css, /@media\(max-width:760px\)[^]*\.journeySteps\{grid-template-columns:1fr\}/);
  assert.match(css, /\.nextStep\{display:grid/);
  assert.match(dna, /Nu vaak → Met AIOW → menselijke beslissing/);
});
