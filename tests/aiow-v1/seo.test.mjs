import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PRICING_CONTEXT_SLUGS, PUBLIC_ROUTE_PAIRS } from "../../lib/aiow-v1/public-route-manifest.mjs";

const root = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const slugs = PRICING_CONTEXT_SLUGS;

function luminance(hex) {
  const values = hex.match(/[a-f\d]{2}/gi).map((part) => Number.parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}
function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

test("Human Industrial text roles meet WCAG AA on every Day and Evening surface", async () => {
  const themes = [
    { name: "Day", surfaces: ["#E4E5E0", "#D6D8D2", "#F5F4EE"], text: ["#8B2418", "#50514C", "#8F1D18"] },
    { name: "Evening", surfaces: ["#17382E", "#10271F", "#21483B"], text: ["#FFB5A3", "#B9CDBF", "#FFB4A8"] },
  ];
  for (const theme of themes) for (const foreground of theme.text) for (const background of theme.surfaces) {
    assert.ok(contrast(foreground, background) >= 4.5, `${theme.name} ${foreground} on ${background} is ${contrast(foreground, background)}`);
  }
  assert.ok(contrast("#11110F", "#D94B30") >= 4.49);
  assert.ok(contrast("#10271F", "#F56A4D") >= 4.5);
  assert.ok(contrast("#FFB5A3", "#11110F") >= 4.5);
  assert.ok(contrast("#FFB5A3", "#10271F") >= 4.5);
  const shell = await read("components/aiow-v1/HumanIndustrialPublicShell.module.css");
  const living = await read("components/aiow-v1/LivingBlueprintHomepage.module.css");
  const shared = await read("components/aiow-v1/AiowV1Homepage.module.css");
  const tariffs = await read("components/aiow-v1/TariffsPage.module.css");
  for (const token of ["--accent-text:#8b2418", "--muted:#50514c", "--error-text:#8f1d18", "--accent-text:#ffb5a3", "--muted:#b9cdbf", "--error-text:#ffb4a8", "--accent-on-steel:#ffb5a3"]) {
    assert.ok(shell.includes(token) && living.includes(token), token);
  }
  assert.match(tariffs, /\.smartDesign\{[^}]*background:var\(--copper\);color:var\(--on-copper\)/);
  assert.match(shared, /\.headerCta,\.primaryButton\{[^}]*color:var\(--on-copper\)/);
  assert.match(shared, /\.formFields small,\.error\{color:var\(--error-text\)\}/);
});

test("all tariff row headers have row scope and all six regions have unique names", async () => {
  const source = await read("components/aiow-v1/TariffsPage.tsx");
  assert.match(source, /<th scope="row">\{row\[0\]\}<\/th>/);
  assert.match(source, /className=\{styles\.tableWrap\} tabIndex=\{0\} role="region" onKeyDown=\{scrollTariffTable\} aria-label=\{table\.label\}/);
  for (const localeMarker of ["nl:", "en:"]) assert.ok(source.includes(localeMarker));
  const labels = [...source.matchAll(/label: "([^"]+(?:scrollbaar|scrollable))"/g)].map((match) => match[1]);
  assert.equal(labels.length, 12);
  assert.equal(new Set(labels).size, 12);
});

test("pricing contexts, sitemap and LLM documents retain all 15 routes", async () => {
  const [contexts, sitemap, llms, full] = await Promise.all([
    read("lib/aiow-v1/pricing-contexts.ts"), read("app/sitemap.ts"), read("app/llms.txt/route.ts"), read("app/llms-full.txt/route.ts"),
  ]);
  for (const slug of slugs) assert.match(contexts, new RegExp(`slug:\\"${slug}\\"`));
  assert.match(sitemap, /SITEMAP_ROUTE_PAIRS/);
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
  assert.match(source, /offers:localizedSchema\(packageOffers\[data\.package\], locale\)/);
  assert.match(source, /"@type":"Service"/);
});

test("every public route publishes reciprocal NL, EN and x-default alternates", async () => {
  const [seo, sitemap, enContext] = await Promise.all([read("lib/aiow-v1/seo.tsx"), read("app/sitemap.ts"), read("app/en/rates/[slug]/page.tsx")]);
  assert.match(seo, /pairedPaths: \{ nl: string; en: string \}/);
  assert.match(seo, /"x-default": `\$\{SITE_URL\}\$\{pairedPaths\.nl\}`/);
  assert.match(sitemap, /SITEMAP_ROUTE_PAIRS/);
  assert.match(sitemap, /alternates: \{ languages \}/);
  for (const pair of [["/tarieven", "/en/rates"], ["/ai-automatisering", "/en/ai-automation"], ["/lokale-ai", "/en/local-ai"], ["/ventures", "/en/ventures"], ["/privacy", "/en/privacy"]]) {
    assert.ok(PUBLIC_ROUTE_PAIRS.some(([nlPath,enPath])=>nlPath===pair[0]&&enPath===pair[1]), `missing locale pair ${pair}`);
  }
  assert.match(enContext, /dynamicParams = false/);
  assert.match(enContext, /generateStaticParams/);
  assert.match(enContext, /\/en\/rates\/\$\{context\.slug\}/);
});

test("English routes, complete tariff translation and durable privacy meaning are present", async () => {
  const [tariffs, info, controls] = await Promise.all([read("components/aiow-v1/TariffsPage.tsx"), read("components/aiow-v1/InfoPage.tsx"), read("components/aiow-v1/ThemeLanguageControls.tsx")]);
  for (const phrase of ["Automatic direct debit is mandatory", "Provider price increases: passed through 1-to-1 plus the 25% margin", "full prepayment", "never provides interest-free financing", "50% of the Scan", "Above 10 homes", "€ 135/hour", "€ 1,200"]) assert.ok(tariffs.includes(phrase), `English tariff parity missing: ${phrase}`);
  for (const phrase of ["Release takes place in two phases", "durably accept the lead, PDF and exactly two transactional mail tasks", "no PDF or receipt is issued", "do not constitute a newsletter subscription", "do not process a raw IP address", "no more than 90 days"]) assert.ok(info.includes(phrase), `English privacy parity missing: ${phrase}`);
  assert.match(controls, /location\.search/);
  assert.match(controls, /location\.hash/);
  assert.match(controls, /localStorage\.setItem\("aiow-locale", targetLocale\)/);
});

test("English tariff JSON-LD browser oracle is independent and fixture-backed", async () => {
  const [browser, fixture] = await Promise.all([read("tests/aiow-v1/browser-smoke.mjs"), read("tests/aiow-v1/fixtures/dutch-schema-terms.json")]);
  const terms = JSON.parse(fixture);
  assert.ok(terms.length >= 74);
  for (const required of ["Eenmalig.", "Aansluiting", "Beheer per persoon per maand", "vierkante meter", "Smart Design Blauwdruk"]) assert.ok(terms.includes(required), `stable Dutch schema fixture missing ${required}`);
  assert.match(browser, /fixtures\/dutch-schema-terms\.json/);
  assert.doesNotMatch(browser, /seo-schema-localized\.ts/);
});
