import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, ui, css, middleware, authority] = await Promise.all([
  readFile(new URL("../../app/portal/admin/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../components/aiow-v1/OpsDashboard.tsx", import.meta.url), "utf8"),
  readFile(new URL("../../components/aiow-v1/OpsDashboard.module.css", import.meta.url), "utf8"),
  readFile(new URL("../../middleware.ts", import.meta.url), "utf8"),
  readFile(new URL("../../middleware-ops-authority.ts", import.meta.url), "utf8"),
]);

test("ops consumer mounts only after the existing middleware authority marker", () => {
  assert.ok(page.indexOf("await headers()") < page.indexOf("<OpsDashboard />"));
  assert.match(page, /x-aiow-operator-id/);
  assert.match(page, /x-aiow-operator-role/);
  assert.match(page, /notFound\(\)/);
  assert.doesNotMatch(page, /fetch\(|listVentureAccounts/);
  assert.match(authority, /access\.kind === "not_found"[^]*status: 404/);
  assert.match(authority, /hostname: requestHeaders\.get\("host"\)/);
  assert.match(middleware, /applyOperationsAuthority/);
});

test("ops UI closes loading, empty, error, report and retry states", () => {
  for (const state of ["Queue laden", "Queue niet geladen", "Geen aanvragen in de queue", "Rapport laden", "Rapport niet geladen", "Nog geen gebeurtenissen", "Opnieuw proberen"]) assert.match(ui, new RegExp(state));
  assert.match(ui, /Promise\.allSettled/);
  assert.match(ui, /role="alert"/);
  assert.match(ui, /role="status"/);
});

test("ops queue exposes contract fields and revision-bound controls", () => {
  for (const label of ["Ongelezen", "Actie", "SLA verlopen", "Uitzondering", "Bron \/ route", "Status \/ prioriteit", "Volgende actie", "Aflevering klant", "Aflevering intern"]) assert.match(ui, new RegExp(label));
  assert.match(ui, /expectedRevision: lead\.revision/);
  assert.match(ui, /method: "PATCH"/);
  assert.match(ui, /idempotency-key/);
  assert.match(ui, /response\.status === 409/);
  assert.match(ui, /result\.currentRevision/);
  assert.match(ui, /Markeer gelezen/);
  assert.match(ui, /Bewaar prioriteit/);
  assert.match(ui, /Bewaar status/);
  assert.match(ui, /Bewaar actie/);
});

test("ops queue exposes only legal lifecycle edges and closes terminal next actions", () => {
  assert.match(ui, /availableLeadStatuses\(lead\.status\)/);
  assert.match(ui, /buildStatusTransition\(lead\.status, status, reopenReason\)/);
  assert.match(ui, /Heropeningsreden/);
  assert.match(ui, /maxLength=\{MAX_REOPEN_REASON_LENGTH\}/);
  assert.match(ui, /reopenReason: requestedTransition!\.reopenReason/);
  assert.match(ui, /disabled=\{terminalSelection\}/);
  assert.match(ui, /value=\{terminalSelection \? "" : nextActionAt\}/);
});

test("ops surface is responsive, theme-aware, keyboard-visible and reduced-motion safe", () => {
  assert.match(css, /@media\(max-width:640px\)/);
  assert.match(css, /@media\(max-width:360px\)/);
  assert.match(css, /data-theme="light"/);
  assert.match(css, /data-theme="dark"/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:44px/);
  assert.doesNotMatch(css, /backdrop-filter|overflow-x:\s*(auto|scroll)/);
});
