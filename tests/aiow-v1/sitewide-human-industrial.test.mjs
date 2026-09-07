import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const files = {
  shell: "components/aiow-v1/HumanIndustrialPublicShell.module.css",
  pillar: "components/aiow-v1/PillarPage.tsx",
  capabilities: "components/aiow-v1/CapabilitiesExperience.tsx",
  tariffs: "components/aiow-v1/TariffsPage.tsx",
  pricing: "components/aiow-v1/PricingContextPage.tsx",
  info: "components/aiow-v1/InfoPage.tsx",
  trust: "components/aiow-v1/TrustPage.tsx",
  scan: "components/aiow-v1/ScanRequestPage.tsx",
  infoCss: "app/info.module.css",
  portal: "app/portal/page.tsx",
  project: "app/portal/project/[accountId]/page.tsx",
  portalCss: "app/portal/Portal.module.css",
  adminCss: "components/aiow-v1/OpsDashboard.module.css",
  header: "components/aiow-v1/PublicHeader.tsx",
  controls: "components/aiow-v1/ThemeLanguageControls.tsx",
  layout: "app/layout.tsx",
  legacy: "app/legacy-aiow/page.tsx",
  sharedCss: "components/aiow-v1/AiowV1Homepage.module.css",
};
const source = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, file]) => [key, await readFile(new URL(file, root), "utf8")])));

test("every mounted public page family uses the Human Industrial shell", () => {
  for (const key of ["pillar", "capabilities", "tariffs", "pricing", "info", "trust", "scan"]) {
    assert.match(source[key], /HumanIndustrialPublicShell\.module\.css/, key);
    assert.match(source[key], /variant="human-industrial"/, key);
  }
});

test("public shell owns the approved day and evening material worlds", () => {
  for (const token of ["--bg:#e4e5e0", "--copper:#d94b30", "--bg:#17382e", "--copper:#f56a4d", '"Avenir Next Condensed"', "prefers-reduced-motion"]) assert.ok(source.shell.includes(token), token);
  assert.doesNotMatch(source.shell, /Fraunces|Georgia|border-radius|backdrop-filter/);
});

test("editorial evidence pages no longer use the cream-serif rounded-card template", () => {
  assert.doesNotMatch(source.infoCss, /Fraunces|Georgia|border-radius/);
  assert.match(source.infoCss, /grid-template-columns:minmax\(190px,280px\)/);
  assert.match(source.infoCss, /text-transform:uppercase/);
});

test("portal and operator surfaces use the same material world without generic AI glass", () => {
  for (const page of [source.portal, source.project]) assert.match(page, /HumanIndustrialPublicShell\.module\.css/);
  assert.equal((source.portal.match(/<h1/g) || []).length, 1);
  assert.equal((source.project.match(/<h1/g) || []).length, 2, "expired and authenticated branches each own one H1");
  assert.doesNotMatch(source.portalCss, /radial-gradient|backdrop-filter|border-radius:(?!0)|#050713|#00e8a7/i);
  assert.match(source.adminCss, /--bg:#17382e/);
  assert.match(source.adminCss, /--bg:#e4e5e0/);
  assert.doesNotMatch(source.adminCss, /Fraunces|Georgia/);
});

test("route state, conversion surfaces and browser chrome share the Human Industrial authority", () => {
  assert.match(source.header, /smart-office[^]*return "capabilities"/);
  assert.match(source.header, /home[^]*return "company"/);
  assert.match(source.header, /currentNavKey\(pathname, variant\)/);
  for (const label of ["Dag", "Day", "Avond", "Evening"]) assert.ok(source.controls.includes(label), label);
  assert.match(source.layout, /#17382E/);
  assert.match(source.layout, /#E4E5E0/);
  assert.match(source.sharedCss, /\.modal\{[^}]*border-radius:0/);
  assert.match(source.sharedCss, /\.formFields input[^}]*border-radius:0/);
  assert.match(source.legacy, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(source.info, /href="\/legacy-aiow"/);
});
