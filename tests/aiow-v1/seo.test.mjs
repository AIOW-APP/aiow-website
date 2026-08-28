import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const slugs = ["accountants", "logistiek", "bouw", "makelaars", "advocatuur", "zorg", "horeca-retail", "industrie", "vermogende-particulieren", "kantoorpand", "bedrijfshal-industrie", "woning", "villa-signature", "woonproject-vve", "nieuwbouwproject"];

function luminance(hex) {
  const values = hex.match(/[a-f\d]{2}/gi).map((part) => Number.parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}
function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

test("light-theme pricing accent meets WCAG AA on every light surface", async () => {
  for (const background of ["#F4EFE6", "#E9E2D6", "#FFFAF1"]) {
    assert.ok(contrast("#795000", background) >= 4.5, `#795000 contrast on ${background} is ${contrast("#795000", background)}`);
  }
  const shared = await read("components/aiow-v1/AiowV1Homepage.module.css");
  assert.match(shared, /html\[data-theme="light"\][^}]*--copper:#795000/);
  assert.match(shared, /prefers-color-scheme:light[\s\S]*--copper:#795000/);
});

test("all tariff row headers have row scope and all six regions have unique names", async () => {
  const source = await read("components/aiow-v1/TariffsPage.tsx");
  const bodyHeaders = [...source.matchAll(/<tbody>(.*?)<\/tbody>/gs)].flatMap(([, body]) => [...body.matchAll(/<th([^>]*)>/g)]);
  assert.ok(bodyHeaders.length > 0);
  assert.equal(bodyHeaders.every(([, attributes]) => attributes.includes('scope="row"')), true);
  const regions = [...source.matchAll(/<div className=\{styles\.tableWrap\}([^>]*)>/g)].map((match) => match[1]);
  assert.equal(regions.length, 6);
  assert.equal(regions.every((attributes) => attributes.includes('role="region"') && attributes.includes("onKeyDown={scrollTariffTable}")), true);
  const names = regions.map((attributes) => attributes.match(/aria-label="([^"]+)"/)?.[1]);
  assert.equal(names.every(Boolean), true);
  assert.equal(new Set(names).size, 6);
});

test("pricing contexts, sitemap and LLM documents retain all 15 routes", async () => {
  const [contexts, sitemap, llms, full] = await Promise.all([
    read("lib/aiow-v1/pricing-contexts.ts"), read("app/sitemap.ts"), read("app/llms.txt/route.ts"), read("app/llms-full.txt/route.ts"),
  ]);
  for (const slug of slugs) assert.match(contexts, new RegExp(`slug:\\"${slug}\\"`));
  assert.match(sitemap, /PRICING_CONTEXT_SLUGS\.map/);
  assert.match(llms, /pricingContexts\.map/);
  assert.match(full, /pricingContexts\.map/);
  for (const phrase of ["automatic direct debit", "provider price increases", "full prepayment", "never provides interest-free financing", "50% of the Scan", "above 10 homes"]) {
    assert.ok(llms.includes(phrase) && full.includes(phrase), `LLM parity missing: ${phrase}`);
  }
});

test("tariff and context schema source encodes public commercial terms", async () => {
  const source = await read("lib/aiow-v1/seo.tsx");
  for (const value of ["Smart Office XL", '"135"', '"195"', '"95"', '"175"', '"650"', '"1200"', '"1950"']) assert.ok(source.includes(value), `schema missing ${value}`);
  assert.match(source, /referenceQuantity: quantity\(unitCode, unitText\)/);
  assert.match(source, /billingDuration: month/);
  assert.match(source, /const month = quantity\("MON", "maand"\)/);
  assert.match(source, /Comfort requires|Comfort\",description:\"Optioneel en alleen met verplichte automatische incasso/);
  assert.match(source, /offers:packageOffers\[data\.package\]/);
  assert.match(source, /"@type":"Service"/);
});

test("tariff pages do not advertise false English alternates", async () => {
  const [seo, sitemap] = await Promise.all([read("lib/aiow-v1/seo.tsx"), read("app/sitemap.ts")]);
  assert.match(seo, /path === "\/" \|\| path === "\/en"/);
  assert.match(sitemap, /path === "" \|\| path === "\/en"/);
});
