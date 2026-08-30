import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root=resolve(import.meta.dirname,"../..");
const migrationName="202608300003_aiow_mail_run_runtime_remediation.sql";
const requiredRoutines=[
  "aiow_mail_run_begin_v1",
  "aiow_mail_run_complete_v1",
  "aiow_mail_run_receipts_delete_expired_v1",
  "aiow_mail_outbox_load_leased_job_v1",
  "aiow_mail_provider_gate_load_for_lease_v1",
];

test("mail-run contract inventory is closed by one append-only successor migration",async()=>{
  const contract=JSON.parse(await readFile(resolve(root,"docs/contracts/aiow-commercial-control-plane-v1.json"),"utf8"));
  const files=(await readdir(resolve(root,"supabase/migrations"))).filter((name)=>name.endsWith(".sql")).sort();
  assert.ok(files.includes(migrationName));
  const sql=await readFile(resolve(root,"supabase/migrations",migrationName),"utf8");
  const contractRoutines=["aiow_mail_run_begin_v1","aiow_mail_run_complete_v1","aiow_mail_run_receipts_delete_expired_v1"];
  assert.deepEqual(contractRoutines.map((name)=>contract["x-aiow-operations"][name].name),contractRoutines);
  for(const name of requiredRoutines){
    const definitions=[...sql.matchAll(new RegExp(`create\\s+(?:or\\s+replace\\s+)?function\\s+public\\.${name}\\s*\\(`,"gi"))];
    assert.equal(definitions.length,1,`${name} must have exactly one effective successor definition`);
    assert.match(sql,new RegExp(`revoke\\s+all\\s+on\\s+function\\s+public\\.${name}\\s*\\(`,"i"));
  }
  assert.match(sql,/alter table public\.commercial_mail_run_receipts force row level security/i);
  assert.match(sql,/alter table public\.commercial_mail_run_receipts owner to aiow_mail_run_receipt_owner/i);
  assert.doesNotMatch(sql,/grant\s+(?:insert|update|delete|all).*commercial_mail_run_receipts.*service_role/is);
});

test("leased-load authority replaces direct service-role REST table reads",async()=>{
  const store=await readFile(resolve(root,"lib/aiow-v1/mail-outbox-store.ts"),"utf8");
  assert.doesNotMatch(store,/\/rest\/v1\/commercial_(?:mail_outbox|provider_gates)/);
  assert.match(store,/aiow_mail_outbox_load_leased_job_v1/);
  assert.match(store,/aiow_mail_provider_gate_load_for_lease_v1/);
  for(const binding of ["p_job_id","p_lease_owner","p_lease_token","p_expected_revision","p_payload_digest"]) assert.match(store,new RegExp(binding));
});
