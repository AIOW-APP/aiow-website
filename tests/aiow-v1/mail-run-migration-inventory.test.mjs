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
  assert.match(sql,/create temporary table aiow_temporary_role_memberships/i);
  assert.match(sql,/if not pg_has_role\(current_user,v_role,'SET'\) then/i);
  assert.match(sql,/insert into aiow_temporary_role_memberships\(role_name\) values\(v_role\)/i);
  assert.match(sql,/with admin false, inherit false, set true/i);
  assert.match(sql,/for v_role in select role_name from aiow_temporary_role_memberships/i);
  assert.match(sql,/execute format\('revoke %I from %I',v_role,current_user\)/i);
  assert.match(sql,/create temporary table aiow_temporary_schema_create_privileges/i);
  assert.match(sql,/if not has_schema_privilege\(v_role,'public','CREATE'\) then/i);
  assert.match(sql,/grant create on schema public to %I/i);
  assert.match(sql,/revoke create on schema public from %I/i);
  assert.doesNotMatch(sql,/grant\s+(?:insert|update|delete|all).*commercial_mail_run_receipts.*service_role/is);
});

test("leased-load authority replaces direct service-role REST table reads",async()=>{
  const store=await readFile(resolve(root,"lib/aiow-v1/mail-outbox-store.ts"),"utf8");
  assert.doesNotMatch(store,/\/rest\/v1\/commercial_(?:mail_outbox|provider_gates)/);
  assert.match(store,/aiow_mail_outbox_load_leased_job_v1/);
  assert.match(store,/aiow_mail_provider_gate_load_for_lease_v1/);
  for(const binding of ["p_job_id","p_lease_owner","p_lease_token","p_expected_revision","p_payload_digest"]) assert.match(store,new RegExp(binding));
});

test("managed migration closes ACLs before ownership transfer without harness privilege injection",async()=>{
  const sql=await readFile(resolve(root,"supabase/migrations",migrationName),"utf8");
  const harness=await readFile(resolve(root,"tests/aiow-v1/run-ordered-migration-chain-postgres-proof.py"),"utf8");
  const tableAclEnd=sql.indexOf("end $table_acl$;");
  const tableOwner=sql.indexOf("alter table public.commercial_mail_run_receipts owner to aiow_mail_run_receipt_owner;");
  const functionAclEnd=sql.indexOf("end $function_acl$;");
  const retentionGrant=sql.indexOf("grant execute on function public.aiow_mail_run_receipts_delete_expired_v1(integer) to aiow_mail_run_retention_worker;");
  const firstFunctionOwner=sql.indexOf("alter function public.aiow_mail_run_begin_v1(uuid,text,text,text) owner to aiow_mail_run_receipt_owner;");
  assert.ok(tableAclEnd>=0 && tableOwner>tableAclEnd,"receipt table ACLs must close before OWNER TO");
  assert.ok(functionAclEnd>=0 && retentionGrant>functionAclEnd && firstFunctionOwner>retentionGrant,"function ACLs and retention grant must close before OWNER TO");
  assert.doesNotMatch(harness,/bootstrap_managed_owner_roles/);
  assert.doesNotMatch(harness,/grant aiow_mail_run_receipt_owner to \{MANAGED_LOGIN\}/);
  assert.doesNotMatch(harness,/grant aiow_mail_runtime_reader to \{MANAGED_LOGIN\}/);
});
