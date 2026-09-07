import test from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  MOUNTED_ROUTE_POLICIES,
  PARAMETERIZED_PUBLIC_ROUTES,
  PROOF_ONLY_ROUTES,
  PUBLIC_ROUTE_PAIRS,
  SITEMAP_ROUTES,
} from "../../lib/aiow-v1/public-route-manifest.mjs";
import { findRegionRuleViolations } from "./human-industrial-proof-rules.mjs";

const root = path.resolve(new URL("../../", import.meta.url).pathname);

async function collectPageFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectPageFiles(absolute);
    return entry.isFile() && entry.name === "page.tsx" ? [absolute] : [];
  }));
  return nested.flat();
}

function mountedPattern(file) {
  const relative = path.relative(path.join(root, "app"), file).replaceAll(path.sep, "/").replace(/(?:^|\/)page\.tsx$/, "");
  return relative ? `/${relative}` : "/";
}

test("every mounted page is public, parameterized, proof-only, private, or legacy by one canonical manifest", async () => {
  const mounted = (await collectPageFiles(path.join(root, "app"))).map(mountedPattern).sort();
  const declared = [
    ...PUBLIC_ROUTE_PAIRS.flat(),
    ...PARAMETERIZED_PUBLIC_ROUTES.map(({ pattern }) => pattern),
    ...MOUNTED_ROUTE_POLICIES.map(({ pattern }) => pattern),
  ].sort();
  assert.deepEqual(mounted, declared);
  assert.equal(new Set(declared).size, declared.length, "mounted route declarations must be unique");
});

test("sitemap and proof routes are derived from the same canonical route manifest", () => {
  const sitemap = new Set(SITEMAP_ROUTES);
  for (const route of PUBLIC_ROUTE_PAIRS.flat()) assert.ok(sitemap.has(route), route);
  for (const declaration of PARAMETERIZED_PUBLIC_ROUTES) {
    assert.ok(declaration.expandedRoutes.length > 0, declaration.pattern);
    for (const route of declaration.expandedRoutes) assert.ok(sitemap.has(route), route);
  }
  assert.deepEqual(PROOF_ONLY_ROUTES, ["/portal", "/portal/project/not-found"]);
  for (const policy of MOUNTED_ROUTE_POLICIES.filter(({ classification }) => classification !== "proof-only")) {
    assert.equal(policy.proofRoutes.length, 0, `${policy.pattern} must remain excluded from public proof`);
    assert.ok(!sitemap.has(policy.pattern), policy.pattern);
  }
});

test("top-level region rules reject legacy geometry, palette, fonts and background effects", () => {
  const valid = {
    tag: "section", id: "proof", className: "proof", left: 0, right: 390, width: 390, height: 200,
    fontFamily: '"Avenir Next", "Segoe UI", system-ui, sans-serif',
    backgroundColor: "rgb(228, 229, 224)", borderRadius: "0px", backgroundImage: "none",
  };
  assert.deepEqual(findRegionRuleViolations([valid]), []);
  const legacy = [
    { ...valid, id: "rounded", borderRadius: "12px" },
    { ...valid, id: "serif", fontFamily: "Georgia" },
    { ...valid, id: "palette", backgroundColor: "rgb(20, 22, 26)" },
    { ...valid, id: "effect", backgroundImage: "radial-gradient(circle, red, blue)" },
    { ...valid, id: "purple-linear", backgroundImage: "linear-gradient(135deg, rgb(121, 49, 255), rgb(255, 56, 214))" },
    { ...valid, id: "cyan-computed", backgroundImage: "linear-gradient(color(srgb 0 0.91 0.65) 1px, rgba(0, 0, 0, 0) 1px)" },
    { ...valid, id: "unrelated-multilayer", backgroundImage: "linear-gradient(rgb(228, 229, 224), rgb(214, 216, 210)), linear-gradient(45deg, transparent, rgb(217, 75, 48))" },
  ];
  assert.deepEqual(findRegionRuleViolations(legacy).map(({ id }) => id), ["rounded", "serif", "palette", "effect", "purple-linear", "cyan-computed", "unrelated-multilayer"]);
});
