import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const [pillar, pillarCss, booking, requestPage, scanNl, scanEn, intent] = await Promise.all([
  readFile(new URL("components/aiow-v1/PillarPage.tsx", root), "utf8"),
  readFile(new URL("components/aiow-v1/PillarPage.module.css", root), "utf8"),
  readFile(new URL("components/aiow-v1/BookingModal.tsx", root), "utf8"),
  readFile(new URL("components/aiow-v1/ScanRequestPage.tsx", root), "utf8"),
  readFile(new URL("app/scan/page.tsx", root), "utf8"),
  readFile(new URL("app/en/scan/page.tsx", root), "utf8"),
  readFile(new URL("lib/aiow-v1/scan-intent.ts", root), "utf8"),
]);

test("pillar scan CTAs carry the selected environment into the canonical modal", () => {
  assert.match(pillar, /scanSubjectForPillar\(data\.slug\)/);
  assert.match(pillar, /scanHrefForPillar\(data\.slug, locale\)/);
  assert.match(pillar, /initialSubject=\{initialSubject\}/);
  assert.match(booking, /initialSubject = "bedrijf"/);
  assert.match(booking, /subject: initialSubject/);
  assert.match(pillar, /href=\{scanHref\}[^>]*onClick=\{openBooking\}/);
  assert.match(pillar, /event\.preventDefault\(\)/);
  for (const token of ['slug === "smart-office") return "pand"', 'slug === "home") return "woning"', 'return "bedrijf"']) assert.ok(intent.includes(token), token);
});

test("dedicated scan routes parse bounded NL and EN intent aliases", () => {
  for (const source of [scanNl, scanEn]) {
    assert.match(source, /searchParams:Promise/);
    assert.match(source, /scanSubjectFromIntent\(intent\)/);
    assert.match(source, /safeScanReturnPath\(returnTo\)/);
  }
  assert.match(requestPage, /initialSubject=\{initialSubject\}/);
  assert.match(requestPage, /router\.push\(returnTo\|\|/);
  for (const token of ['proces: "bedrijf"', 'process: "bedrijf"', 'pand: "pand"', 'building: "pand"', 'woning: "woning"', 'home: "woning"']) assert.ok(intent.includes(token), token);
  assert.match(intent, /scanHrefForPillar/);
  assert.match(intent, /returnTo=\$\{encodeURIComponent\(returnTo\)\}/);
  assert.match(intent, /PILLAR_RETURN_PATHS\.has\(value\)/);
});

test("route pages preserve Human Industrial visual and first-viewport conversion continuity", () => {
  assert.match(pillar, /shell\.site/);
  assert.match(pillar, /data-pillar=\{data\.slug\}/);
  assert.match(pillarCss, /data-pillar="home"[^}]*font-size:clamp\(30px,9vw,36px\)/);
  assert.match(pillar, /variant="human-industrial"/);
  assert.match(pillar, /className=\{styles\.mobileScan\}/);
  assert.match(pillar, /Gratis · circa 30 minuten · uitkomst: een beslismemo/);
  assert.match(pillar, /Free · about 30 minutes · outcome: a decision memo/);
  assert.match(pillarCss, /\.mobileScan\{display:none\}/);
  assert.match(pillarCss, /@media\(max-width:600px\)\{\.mobileScan\{display:grid/);
  assert.doesNotMatch(pillar, /heroDetailCta/);
  assert.match(pillarCss, /\.scanButton\{[^}]*border-radius:0!important/);
  assert.match(pillarCss, /\.hero h1\{[^}]*text-transform:uppercase/);
  assert.doesNotMatch(pillarCss, /font-family:var\(--font-fraunces\)/);
});
