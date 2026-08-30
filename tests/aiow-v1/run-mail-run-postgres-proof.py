#!/usr/bin/env python3
"""Native PostgreSQL proof for durable mail-run receipts and leased reads."""
from __future__ import annotations

import concurrent.futures
import datetime as dt
import hashlib
import json
import os
import pathlib
import shutil
import socket
import subprocess
import tempfile
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[2]
MIGRATIONS = [
    ROOT / "supabase/migrations/20260828_aiow_quote_adapter_v1.sql",
    ROOT / "supabase/migrations/20260830_aiow_commercial_control_plane_v1.sql",
    ROOT / "supabase/migrations/20260830_1302_aiow_mail_run_runtime_remediation.sql",
]
DIGEST_A = "a" * 64
DIGEST_B = "b" * 64


def run(command: list[str], env: dict[str, str], check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, cwd=ROOT, env=env, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError(f"command failed {command}:\nstdout:\n{result.stdout}\nstderr:\n{result.stderr}")
    return result


def sql(env: dict[str, str], text: str, check: bool = True, role: str | None = None) -> subprocess.CompletedProcess[str]:
    prefix = f"set role {role};" if role else ""
    return run(["psql", "-X", "-v", "ON_ERROR_STOP=1", "-qAt", "-U", "postgres", "-d", "postgres", "-c", prefix + text], env, check)


def apply(env: dict[str, str], path: pathlib.Path) -> None:
    run(["psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-f", str(path)], env)


def quote(value: object) -> str:
    return "'" + str(value).replace("'", "''") + "'"


def jsonb(value: object) -> str:
    return quote(json.dumps(value, separators=(",", ":"), sort_keys=True)) + "::jsonb"


def call(env: dict[str, str], expression: str, role: str = "service_role") -> dict:
    result = sql(env, f"select ({expression})::text;", role=role)
    return json.loads(result.stdout.strip())


def assert_error(result: subprocess.CompletedProcess[str], marker: str) -> None:
    assert result.returncode != 0 and marker in result.stderr, (result.returncode, result.stdout, result.stderr)


def begin_expr(request_id: str, key: str, digest: str = DIGEST_A, worker: str = "worker-1") -> str:
    return f"public.aiow_mail_run_begin_v1({quote(request_id)}::uuid,{quote(key)},{quote(digest)},{quote(worker)})"


def complete_expr(request_id: str, key: str, lease_token: str, status: int, headers: dict, body: dict, digest: str = DIGEST_A) -> str:
    return (
        f"public.aiow_mail_run_complete_v1({quote(request_id)}::uuid,{quote(key)},{quote(digest)},"
        f"{quote(lease_token)}::uuid,{status},{jsonb(headers)},{jsonb(body)})"
    )


def setup_roles(env: dict[str, str]) -> None:
    sql(env, """create role anon nologin; create role authenticated nologin; create role service_role nologin;
      alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
      alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;
      alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;""")


def prove_catalog_acl(env: dict[str, str]) -> None:
    roles = sql(env, """select string_agg(rolname||':'||rolcanlogin||':'||rolbypassrls,',' order by rolname)
      from pg_roles where rolname in ('aiow_mail_run_receipt_owner','aiow_mail_run_retention_worker','aiow_mail_runtime_reader');""").stdout.strip()
    assert roles == "aiow_mail_run_receipt_owner:false:true,aiow_mail_run_retention_worker:false:false,aiow_mail_runtime_reader:false:true", roles
    owners = sql(env, """select string_agg(p.proname||':'||r.rolname,',' order by p.proname)
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner
      where n.nspname='public' and p.proname in ('aiow_mail_run_begin_v1','aiow_mail_run_complete_v1','aiow_mail_run_receipts_delete_expired_v1','aiow_mail_outbox_load_leased_job_v1','aiow_mail_provider_gate_load_for_lease_v1');""").stdout.strip()
    assert owners == (
        "aiow_mail_outbox_load_leased_job_v1:aiow_mail_runtime_reader,"
        "aiow_mail_provider_gate_load_for_lease_v1:aiow_mail_runtime_reader,"
        "aiow_mail_run_begin_v1:aiow_mail_run_receipt_owner,"
        "aiow_mail_run_complete_v1:aiow_mail_run_receipt_owner,"
        "aiow_mail_run_receipts_delete_expired_v1:aiow_mail_run_receipt_owner"
    ), owners
    acl = sql(env, """select
      has_table_privilege('service_role','public.commercial_mail_run_receipts','SELECT')||','||
      has_table_privilege('service_role','public.commercial_mail_run_receipts','INSERT,UPDATE,DELETE')||','||
      has_function_privilege('service_role','public.aiow_mail_run_begin_v1(uuid,text,text,text)','EXECUTE')||','||
      has_function_privilege('service_role','public.aiow_mail_run_receipts_delete_expired_v1(integer)','EXECUTE')||','||
      has_function_privilege('aiow_mail_run_retention_worker','public.aiow_mail_run_receipts_delete_expired_v1(integer)','EXECUTE')||','||
      has_table_privilege('aiow_mail_runtime_reader','public.commercial_mail_outbox','SELECT')||','||
      has_table_privilege('aiow_mail_runtime_reader','public.commercial_provider_gates','SELECT');""").stdout.strip()
    assert acl == "true,false,true,false,true,true,true", acl
    direct = sql(env, "delete from public.commercial_mail_run_receipts;", False, "service_role")
    assert_error(direct, "permission denied")
    retention = sql(env, "select public.aiow_mail_run_receipts_delete_expired_v1(1);", False, "service_role")
    assert_error(retention, "permission denied")


def prove_begin_race_and_replay(env: dict[str, str]) -> None:
    key = "mail-run-race-0001"
    request_ids = [str(uuid.uuid4()), str(uuid.uuid4())]
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda request_id: call(env, begin_expr(request_id, key)), request_ids))
    dispositions = sorted(item["disposition"] for item in results)
    assert dispositions == ["execute", "in_progress"], results
    original = next(item["requestId"] for item in results if item["disposition"] == "execute")
    assert all(item["requestId"] == original for item in results), results
    assert sql(env, f"select count(*) from public.commercial_mail_run_receipts where idempotency_key={quote(key)};").stdout.strip() == "1"

    replay_key = "mail-run-replay-0001"
    request_id = str(uuid.uuid4())
    begun = call(env, begin_expr(request_id, replay_key))
    headers = {"cacheControl": "no-store", "contentType": "application/json; charset=utf-8", "xAiowRequestId": request_id}
    body = {"schemaKind": "outbox_batch_ack", "operation": "mail_run", "requestedLimit": 2, "itemCount": 0, "items": []}
    expression = complete_expr(request_id, replay_key, begun["leaseToken"], 200, headers, body)
    completed = call(env, expression)
    repeated = call(env, expression)
    replayed = call(env, begin_expr(str(uuid.uuid4()), replay_key))
    assert completed["disposition"] == "completed"
    assert repeated["disposition"] == "replay" and repeated["responseBody"] == body
    assert replayed["disposition"] == "replay" and replayed["requestId"] == request_id and replayed["responseBody"] == body
    conflict = sql(env, f"select {complete_expr(request_id, replay_key, begun['leaseToken'], 503, headers, {'schemaKind':'error','code':'unavailable','message':'changed','requestId':request_id,'retriable':True})};", False, "service_role")
    assert_error(conflict, "AIOW_MAIL_RUN_REVISION_CONFLICT")
    digest_conflict = sql(env, f"select {begin_expr(str(uuid.uuid4()), replay_key, DIGEST_B)};", False, "service_role")
    assert_error(digest_conflict, "AIOW_MAIL_RUN_IDEMPOTENCY_CONFLICT")


def prove_leased_loads(env: dict[str, str]) -> None:
    booking = {
        "schemaKind": "booking_request", "subject": "bedrijf", "details": "mail runtime proof",
        "date": "2026-09-01", "slot": "10:00", "name": "Mail Proof", "email": "mail-proof@example.com",
        "company": "AIOW", "locale": "nl", "consentAccepted": True, "consentVersion": "aiow-booking-v1",
    }
    canonical = {key: booking[key] for key in ("subject", "details", "date", "slot", "name", "email", "company", "locale", "consentAccepted", "consentVersion")}
    digest = hashlib.sha256(json.dumps(canonical, separators=(",", ":"), sort_keys=True).encode()).hexdigest()
    call(env, f"public.aiow_booking_commit_v1({quote(str(uuid.uuid4()))}::uuid,'mail-lease-booking-0001',{quote(digest)},{jsonb(booking)},'{{\"route\":\"/\",\"locale\":\"nl\"}}'::jsonb)")
    claimed = call(env, "public.aiow_mail_outbox_claim_v2('mail-proof-worker',1,transaction_timestamp())")
    assert claimed["itemCount"] == 1
    item = claimed["items"][0]
    args = f"{quote(item['id'])}::uuid,{quote(item['leaseOwner'])},{quote(item['leaseToken'])}::uuid,{item['revision']},{quote(item['payloadSha256'])}"
    loaded = call(env, f"public.aiow_mail_outbox_load_leased_job_v1({args})")
    assert loaded["jobId"] == item["id"] and loaded["leaseToken"] == item["leaseToken"] and loaded["payloadSha256"] == item["payloadSha256"]
    wrong = sql(env, f"select public.aiow_mail_outbox_load_leased_job_v1({quote(item['id'])}::uuid,{quote(item['leaseOwner'])},{quote(str(uuid.uuid4()))}::uuid,{item['revision']},{quote(item['payloadSha256'])});", False, "service_role")
    assert_error(wrong, "AIOW_OUTBOX_LEASE_CONFLICT")

    now = dt.datetime.now(dt.timezone.utc)
    gate = {
        "schemaKind": "provider_gate_record", "gateId": "mail_provider_production_v1", "state": "activated",
        "environment": "production", "provider": "microsoft_graph", "tenantId": str(uuid.uuid4()), "applicationId": str(uuid.uuid4()),
        "mailbox": "info@aiow.io", "sender": "info@aiow.io", "controlMailbox": "control@aiow.io",
        "secretPresent": True, "oauthClientCredentialsPresent": True, "exchangeApplicationRole": "Application Mail.Send",
        "exchangeRbacSenderInScope": True, "exchangeRbacControlMailboxInScope": False, "entraUnscopedMailSendAssigned": False,
        "evidenceSha256": DIGEST_A, "revision": 1, "ownerApprovedBy": "richard",
        "approvedAt": (now - dt.timedelta(minutes=1)).isoformat(), "expiresAt": (now + dt.timedelta(days=1)).isoformat(),
        "runtimeCapability": "mail_send", "fallbackProvider": None, "approvalBindingSha256": None,
    }
    gate["approvalBindingSha256"] = sql(env, f"select public.aiow_provider_gate_binding_v1({jsonb(gate)});").stdout.strip()
    call(env, f"public.aiow_provider_gate_write_v1('mail-gate-proof-0001',{quote(DIGEST_A)},{jsonb(gate)})")
    loaded_gate = call(env, f"public.aiow_mail_provider_gate_load_for_lease_v1({args})")
    assert loaded_gate == gate


def prove_retention(env: dict[str, str]) -> None:
    sql(env, """insert into public.commercial_mail_run_receipts
      (request_id,idempotency_key,body_digest,state,worker_id,lease_expires_at,response_status,response_headers,response_body,created_at,updated_at,completed_at)
      values
      ('20000000-0000-4000-8000-000000000001','retention-completed-old',repeat('c',64),'completed','worker',transaction_timestamp()-interval '91 days',503,'{}','{}',transaction_timestamp()-interval '91 days',transaction_timestamp()-interval '91 days',transaction_timestamp()-interval '91 days'),
      ('20000000-0000-4000-8000-000000000002','retention-completed-new',repeat('c',64),'completed','worker',transaction_timestamp(),503,'{}','{}',transaction_timestamp(),transaction_timestamp(),transaction_timestamp()),
      ('20000000-0000-4000-8000-000000000003','retention-pending-old',repeat('c',64),'pending','worker',transaction_timestamp()-interval '1 day',null,null,null,transaction_timestamp()-interval '91 days',transaction_timestamp()-interval '91 days',null),
      ('20000000-0000-4000-8000-000000000004','retention-pending-live',repeat('c',64),'pending','worker',transaction_timestamp()+interval '1 day',null,null,null,transaction_timestamp()-interval '91 days',transaction_timestamp()-interval '91 days',null);""")
    first = call(env, "public.aiow_mail_run_receipts_delete_expired_v1(1)", "aiow_mail_run_retention_worker")
    second = call(env, "public.aiow_mail_run_receipts_delete_expired_v1(50)", "aiow_mail_run_retention_worker")
    assert first["deletedIdempotencyKeys"] == ["retention-completed-old"]
    assert second["deletedIdempotencyKeys"] == ["retention-pending-old"]
    survivors = sql(env, "select string_agg(idempotency_key,',' order by idempotency_key) from public.commercial_mail_run_receipts where idempotency_key like 'retention-%';").stdout.strip()
    assert survivors == "retention-completed-new,retention-pending-live", survivors


def main() -> None:
    def step(name: str) -> None:
        print(f"PG_MAIL_RUN_PROOF_STEP {name}", flush=True)

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="aiow-mail-run-pg-proof-", dir="/tmp"))
    data = tmp / "data"
    sock = tmp / "socket"
    sock.mkdir()
    with socket.socket() as port_socket:
        port_socket.bind(("127.0.0.1", 0))
        port = port_socket.getsockname()[1]
    env = os.environ.copy()
    env.update(PGHOST=str(sock), PGPORT=str(port), PGUSER="postgres", PGDATABASE="postgres")
    started = False
    try:
        step("initdb")
        run(["initdb", "-D", str(data), "-A", "trust", "-U", "postgres", "--no-locale", "--encoding=UTF8"], env)
        step("start-owned-cluster")
        run(["pg_ctl", "-D", str(data), "-l", str(tmp / "postgres.log"), "-o", f"-k {sock} -p {port} -c listen_addresses=''", "-w", "start"], env)
        started = True
        step("roles-and-exact-migration-chain")
        setup_roles(env)
        for migration in MIGRATIONS:
            apply(env, migration)
        step("catalog-and-acl")
        prove_catalog_acl(env)
        step("begin-race-and-durable-replay")
        prove_begin_race_and_replay(env)
        step("leased-job-and-provider-gate-loads")
        prove_leased_loads(env)
        step("retention-boundary-and-order")
        prove_retention(env)
        sentinel = sql(env, "select count(*)||','||(select count(*) from public.commercial_mail_run_receipts where state='completed') from public.commercial_mail_run_receipts;").stdout.strip()
        assert sentinel == "4,2", sentinel
        print("POSTGRES_MAIL_RUN_PROOF_PASS apply=exact-chain acl=closed race=execute+in_progress replay=durable+conflict leased-load=job+gate retention=clock+limit+stable-order sentinel=" + sentinel, flush=True)
    finally:
        step("cleanup-owned-cluster")
        if started:
            run(["pg_ctl", "-D", str(data), "-m", "fast", "-w", "stop"], env, False)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
