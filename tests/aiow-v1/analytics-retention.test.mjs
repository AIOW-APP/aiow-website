import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL("../../supabase/migrations/20260830_1305_aiow_analytics_retention_remediation.sql", import.meta.url);

test("analytics retention migration provides a narrow dry-run-capable purge authority", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  assert.match(sql, /create function public\.aiow_analytics_retention_purge_v1\(\s*p_dry_run boolean default true,\s*p_as_of timestamptz default transaction_timestamp\(\)\s*\)/i);
  assert.match(sql, /where expires_at <= p_as_of/i); assert.match(sql, /endpoint = 'event_ingest'/i); assert.match(sql, /outcome->>'eventId'/i);
  assert.match(sql, /if not p_dry_run then/i); assert.match(sql, /delete from public\.commercial_events/i); assert.doesNotMatch(sql, /delete from public\.commercial_event_daily/i);
  assert.match(sql, /revoke all on function public\.aiow_analytics_retention_purge_v1/i); assert.match(sql, /grant execute on function public\.aiow_analytics_retention_purge_v1[^]*to service_role/i);
  assert.doesNotMatch(sql, /cron|schedule\s*\(/i);
});