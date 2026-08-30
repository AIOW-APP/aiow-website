import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const sources = await Promise.all([
  "components/aiow-v1/PriceCalculator.tsx",
  "components/aiow-v1/AiowV1Homepage.tsx",
  "components/aiow-v1/QuoteModal.tsx",
  "components/aiow-v1/PricingContextPage.tsx",
  "components/aiow-v1/booking-request.ts",
].map(async (path) => ({ path, source: await readFile(new URL(path, root), "utf8") })));
const joined = sources.map(({ source }) => source).join("\n");

test("declared consumer events are wired at production interaction and result callsites", () => {
  for (const event of ["calculator_changed", "quote_opened", "quote_succeeded", "quote_failed", "scan_cta_clicked", "context_opened", "booking_succeeded", "booking_failed"]) {
    assert.match(joined, new RegExp(`(?:track|emit)\\(\\"${event}\\"`), event);
  }
  const byPath = Object.fromEntries(sources.map(({ path, source }) => [path, source]));
  assert.match(byPath["components/aiow-v1/PriceCalculator.tsx"], /changeMode[^]*changeHomeType[^]*changeServiceRoute[^]*changeInput/);
  assert.match(byPath["components/aiow-v1/AiowV1Homepage.tsx"], /openBooking[^]*scan_cta_clicked[^]*openQuote[^]*quote_opened/);
  assert.match(byPath["components/aiow-v1/QuoteModal.tsx"], /quote_failed[^]*quote_succeeded/);
  assert.match(byPath["components/aiow-v1/PricingContextPage.tsx"], /useEffect[^]*context_opened/);
});

test("production analytics calls carry only closed aggregate fields", () => {
  const calls = [...joined.matchAll(/(?:track|emit)\("[a-z_]+",\s*\{[^}]*\}/g)].map((match) => match[0]);
  assert.ok(calls.length >= 8);
  for (const call of calls) {
    assert.doesNotMatch(call, /contact|email|phone|name|company|note|details|freeText|url|href|query|utm|visitor|requestId/i, call);
  }
  assert.match(joined, /calculator_changed", \{ segment, serviceRoute: route \}/);
  assert.match(joined, /scan_cta_clicked", \{ experiment: null \}/);
  assert.match(joined, /context_opened", \{ contextSlug \}/);
});
