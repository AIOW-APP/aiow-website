import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("venture-score knowledge route is bilingual, crawlable and authority-bounded", async () => {
  const [locale, sitemap, llms, llmsFull, content, nl, en] = await Promise.all([
    read("lib/aiow-v1/locale.ts"),
    read("app/sitemap.ts"),
    read("app/llms.txt/route.ts"),
    read("app/llms-full.txt/route.ts"),
    read("components/aiow-v1/KnowledgePages.tsx"),
    read("app/nl/kennis/startup-idee-laten-beoordelen-venture-score/page.tsx"),
    read("app/en/knowledge/startup-idea-venture-score/page.tsx"),
  ]);
  for (const path of ["/nl/kennis", "/en/knowledge", "/nl/kennis/startup-idee-laten-beoordelen-venture-score", "/en/knowledge/startup-idea-venture-score"]) {
    assert.ok(locale.includes(path), `locale contract missing ${path}`);
    assert.ok(llms.includes(path), `llms.txt contract missing ${path}`);
    assert.ok(llmsFull.includes(path), `llms-full.txt contract missing ${path}`);
  }
  assert.match(sitemap, /PUBLIC_ROUTE_PAIRS/);
  for (const phrase of ["geen automatische acceptatie", "verplichte menselijke beslisgate", "does not grant a contract", "not legal, tax or investment advice"]) assert.ok(content.includes(phrase), `authority boundary missing: ${phrase}`);
  assert.match(nl, /"@type": "Article"/);
  assert.match(en, /"@type": "Article"/);
  assert.match(nl, /dateModified: "2026-08-31"/);
  assert.match(en, /dateModified: "2026-08-31"/);
  for (const source of [nl, en]) {
    assert.match(source, /"@type": "Organization"/);
    assert.match(source, /name: "AIOW B\.V\."/);
    assert.match(source, /url: SITE_URL/);
  }
  for (const source of [nl, en]) assert.doesNotMatch(source, /title: ".*\| AIOW"/);
});