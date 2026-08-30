import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mergeQueuePage, queuePageUrl } from "../../components/aiow-v1/ops-pagination.mjs";

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

test("ops queue cursor pagination preserves every lead and exposes load-more announcements", () => {
  const leads = Array.from({ length: 137 }, (_, index) => ({ id: `lead-${index}`, overdue: index === 112, exception: index === 136 ? "delivery_dead" : null }));
  const first = { schemaKind: "queue_projection", items: leads.slice(0, 100), counts: { total: 137 }, nextCursor: { schemaKind: "queue_cursor", createdAt: "2026-08-30T12:00:00.000Z", id: "123e4567-e89b-42d3-a456-426614174000" } };
  const second = { ...first, items: leads.slice(100), nextCursor: null };
  const merged = mergeQueuePage(first, second);
  assert.equal(merged.items.length, 137);
  assert.equal(merged.items.filter((lead) => lead.overdue).length, 1);
  assert.equal(merged.items.filter((lead) => lead.exception).length, 1);
  assert.equal(merged.nextCursor, null);
  assert.match(queuePageUrl(first.nextCursor, 100), /^\/api\/ops\/leads\?limit=100&cursor=/);
  for (const text of ["Meer aanvragen laden", "Meer aanvragen laden…", "extra aanvragen geladen", "Meer aanvragen niet geladen", "Opnieuw proberen"]) assert.match(ui, new RegExp(text));
  assert.match(ui, /aria-live="polite"/);
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
  assert.match(ui, /const terminalSelection = isTerminalStatus\(lead\.status\)/);
  assert.doesNotMatch(ui, /const terminalSelection = isTerminalStatus\(status\)/);
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
