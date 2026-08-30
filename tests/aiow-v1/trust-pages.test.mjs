import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const [trust, nl, en, locale, sitemap, llms, header, footer] = await Promise.all([
  readFile(new URL("components/aiow-v1/TrustPage.tsx", root), "utf8"), readFile(new URL("app/bedrijfsgegevens/page.tsx", root), "utf8"),
  readFile(new URL("app/en/company/page.tsx", root), "utf8"), readFile(new URL("lib/aiow-v1/locale.ts", root), "utf8"),
  readFile(new URL("app/sitemap.ts", root), "utf8"), readFile(new URL("app/llms.txt/route.ts", root), "utf8"),
  readFile(new URL("components/aiow-v1/PublicHeader.tsx", root), "utf8"), readFile(new URL("components/aiow-v1/PublicFooter.tsx", root), "utf8"),
]);

test("trust pages publish only the verified company facts and honest scope boundary", () => {
  for (const fact of ["AIOW B.V.", "71887466", "info@aiow.io", "Nederland", "Netherlands"]) assert.match(trust, new RegExp(fact.replace(".", "\\.")));
  assert.match(trust, /written proposal/); assert.match(trust, /schriftelijke voorstel/); assert.match(trust, /maximaal 90 dagen/);
  assert.doesNotMatch(trust, /streetAddress|postalCode|vatID|accredit|testimonial|client list/i);
});

test("trust metadata, locale alternates, sitemap and navigation remain paired", () => {
  assert.match(nl, /path: "\/bedrijfsgegevens"/); assert.match(en, /path: "\/en\/company"/);
  assert.match(nl, /pairedPaths: \{ nl: "\/bedrijfsgegevens", en: "\/en\/company" \}/);
  assert.match(en, /locale: "en"/);
  assert.match(locale, /\["\/bedrijfsgegevens", "\/en\/company"\]/);
  assert.match(sitemap, /PUBLIC_ROUTE_PAIRS/);
  assert.match(header, /\/en\/company/); assert.match(footer, /\/bedrijfsgegevens/);
});

test("trust layer exposes closed Organization schema and llms facts", () => {
  assert.match(trust, /application\/ld\+json/); assert.match(trust, /"@type": "Organization"/); assert.match(trust, /propertyID: "KvK"/); assert.match(trust, /"@type": "Country"/);
  for (const value of ["AIOW B.V.", "71887466", "info@aiow.io", "/bedrijfsgegevens", "/en/company", "90 days"]) assert.match(llms, new RegExp(value.replace(".", "\\.")));
});
