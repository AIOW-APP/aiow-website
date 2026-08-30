#!/usr/bin/env python3
"""Apply every Supabase migration lexically once and prove the effective chain."""
from __future__ import annotations

import base64
import concurrent.futures
import copy
import datetime as dt
import hashlib
import json
import os
import pathlib
import re
import shutil
import socket
import subprocess
import tempfile
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[2]
MIGRATION_DIR = ROOT / "supabase" / "migrations"
FIXTURES = json.loads((ROOT / "tests/fixtures/aiow-commercial-contract-v1.json").read_text())
VERSION = re.compile(r"^(\d+)_")
SHA_A = "a" * 64


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


def q(value: object) -> str:
    return "'" + str(value).replace("'", "''") + "'"


def j(value: object) -> str:
    return q(json.dumps(value, separators=(",", ":"), sort_keys=True)) + "::jsonb"


def digest(value: object) -> str:
    return hashlib.sha256(json.dumps(value, separators=(",", ":"), sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def call(env: dict[str, str], expression: str, role: str = "service_role") -> dict:
    return json.loads(sql(env, f"select ({expression})::text;", role=role).stdout.strip())


def assert_error(result: subprocess.CompletedProcess[str], marker: str) -> None:
    assert result.returncode != 0 and marker in result.stderr, (result.returncode, result.stdout, result.stderr)


def discover_migrations() -> list[pathlib.Path]:
    paths = sorted(path for path in MIGRATION_DIR.iterdir() if path.is_file() and path.suffix == ".sql")
    versions: list[str] = []
    for path in paths:
        match = VERSION.match(path.name)
        assert match, f"migration lacks numeric prefix: {path.name}"
        versions.append(match.group(1))
    duplicates = sorted({version for version in versions if versions.count(version) > 1})
    assert not duplicates, f"duplicate migration versions: {duplicates}"
    assert paths == sorted(paths, key=lambda path: path.name)
    return paths


def setup_roles(env: dict[str, str]) -> None:
    sql(env, """create role anon nologin; create role authenticated nologin; create role service_role nologin;
      alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
      alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;
      alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
      create schema supabase_migrations;
      create table supabase_migrations.schema_migrations(version text primary key,name text unique not null);""")


def seed_pre_v2_jobs(env: dict[str, str]) -> None:
    rows = []
    for index, state in enumerate(("pending", "retry"), 1):
        lead_id = f"30000000-0000-4000-8000-{index:012d}"
        job_id = f"31000000-0000-4000-8000-{index:012d}"
        source_id = f"32000000-0000-4000-8000-{index:012d}"
        payload = {
            "schemaKind": "mail_job", "jobId": str(uuid.uuid4()), "commercialLeadId": str(uuid.uuid4()),
            "kind": "customer_booking", "from": "booking@aiow.ai", "to": [f"legacy-{index}@example.com"],
            "subject": f"Legacy {index}", "text": "Legacy queued body", "html": "<p>Legacy queued body</p>",
            "attachments": [], "payloadSha256": SHA_A, "attempt": 1, "leaseOwner": "pending",
            "leaseToken": str(uuid.uuid4()), "leaseExpiresAt": "2026-08-30T12:00:00.000Z",
        }
        rows.append((lead_id, job_id, source_id, state, payload))
    for lead_id, job_id, source_id, state, payload in rows:
        sql(env, f"""insert into public.commercial_leads(id,source,source_id,route,locale,display_name,email,sla_due_at)
          values({q(lead_id)}::uuid,'booking',{q(source_id)}::uuid,'/','nl','Legacy','legacy@example.com',transaction_timestamp());
          insert into public.commercial_mail_outbox(id,commercial_lead_id,kind,state,payload,payload_sha256,next_attempt_at)
          values({q(job_id)}::uuid,{q(lead_id)}::uuid,'customer_booking',{q(state)},{j(payload)},{q(SHA_A)},transaction_timestamp());""")


def apply_discovered_once(env: dict[str, str], migrations: list[pathlib.Path]) -> None:
    seeded = False
    for path in migrations:
        version = VERSION.match(path.name).group(1)  # type: ignore[union-attr]
        assert sql(env, f"select count(*) from supabase_migrations.schema_migrations where version={q(version)};").stdout.strip() == "0"
        apply(env, path)
        sql(env, f"insert into supabase_migrations.schema_migrations(version,name) values({q(version)},{q(path.name)});")
        if path.name.endswith("aiow_mail_run_runtime_remediation.sql"):
            seed_pre_v2_jobs(env)
            seeded = True
    assert seeded, "mail runtime predecessor boundary not discovered"
    applied = sql(env, "select version||':'||name from supabase_migrations.schema_migrations order by name;").stdout.splitlines()
    assert applied == [f"{VERSION.match(path.name).group(1)}:{path.name}" for path in migrations]  # type: ignore[union-attr]
    assert len(applied) == len(migrations)


def browser_booking() -> tuple[dict, str]:
    script = """import {buildBookingRequest} from './components/aiow-v1/commercial-form-payloads.mjs';
import {endpointPayloadDigest} from './lib/aiow-v1/commercial-api-runtime.mjs';
const request=buildBookingRequest({subject:'bedrijf',details:'  ordered chain proof  ',date:'2026-09-30',slot:'10:00',name:'  Ada Proof  ',email:'ADA.ORDERED@example.com',company:'  AIOW  ',consentAccepted:true,consentVersion:'aiow-booking-v1'},'nl');
process.stdout.write(JSON.stringify({request,digest:endpointPayloadDigest('booking',request)}));"""
    result = json.loads(run(["node", "--input-type=module", "-e", script], os.environ.copy()).stdout)
    return result["request"], result["digest"]


def activated_gate(env: dict[str, str]) -> dict:
    now = dt.datetime.now(dt.timezone.utc)
    gate = {
        "schemaKind": "provider_gate_record", "gateId": "mail_provider_production_v1", "state": "activated",
        "environment": "production", "provider": "microsoft_graph", "tenantId": str(uuid.uuid4()), "applicationId": str(uuid.uuid4()),
        "mailbox": "info@aiow.io", "sender": "info@aiow.io", "controlMailbox": "control@aiow.io",
        "secretPresent": True, "oauthClientCredentialsPresent": True, "exchangeApplicationRole": "Application Mail.Send",
        "exchangeRbacSenderInScope": True, "exchangeRbacControlMailboxInScope": False, "entraUnscopedMailSendAssigned": False,
        "evidenceSha256": SHA_A, "revision": 1, "ownerApprovedBy": "richard",
        "approvedAt": (now - dt.timedelta(minutes=1)).isoformat(), "expiresAt": (now + dt.timedelta(days=1)).isoformat(),
        "runtimeCapability": "mail_send", "fallbackProvider": None, "approvalBindingSha256": None,
    }
    gate["approvalBindingSha256"] = sql(env, f"select public.aiow_provider_gate_binding_v1({j(gate)});").stdout.strip()
    expression = f"public.aiow_provider_gate_write_v1('ordered-gate-key-0001',{q(digest(gate))},{j(gate)})"
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda _: call(env, expression), range(2)))
    assert results == [gate, gate]
    counts = sql(env, "select (select count(*)::text from commercial_provider_gates)||(select count(*)::text from commercial_idempotency where endpoint='provider_gate')||(select count(*)::text from commercial_audit where action='provider_gate_write');").stdout.strip()
    assert counts == "111", counts
    return gate


def accepted_result(label: str) -> dict:
    return {
        "schemaKind": "provider_accepted", "category": "accepted", "code": None,
        "receipt": {"provider": "microsoft_graph", "httpStatus": 202, "graphRequestId": label, "providerMessageId": "message", "acceptanceKind": "graph_http_202", "attemptReceipt": label, "observedAt": dt.datetime.now(dt.timezone.utc).isoformat()},
    }


def permanent_result(code: str) -> dict:
    return {
        "schemaKind": "provider_permanent_pre_acceptance", "category": "permanent_pre_acceptance", "code": code,
        "receipt": {"provider": "microsoft_graph", "httpStatus": 400, "graphRequestId": None, "providerMessageId": None, "acceptanceKind": None, "attemptReceipt": code, "observedAt": dt.datetime.now(dt.timezone.utc).isoformat()},
    }


def lease_args(item: dict) -> str:
    return f"{q(item['id'])}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{item['revision']},{q(item['payloadSha256'])}"


def dispatch_and_finalize(env: dict[str, str], item: dict, gate: dict, label: str) -> dict:
    loaded = call(env, f"public.aiow_mail_outbox_load_leased_job_v1({lease_args(item)})")
    assert loaded["jobId"] == item["id"] and loaded["payloadSha256"] == item["payloadSha256"]
    loaded_gate = call(env, f"public.aiow_mail_provider_gate_load_for_lease_v1({lease_args(item)})")
    assert loaded_gate == gate
    call(env, f"public.aiow_mail_outbox_dispatch_v2({q(item['id'])}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{q(item['payloadSha256'])},{item['revision']})")
    result = accepted_result(label)
    projection = call(env, f"public.aiow_mail_outbox_sent_v2({q(item['id'])}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{q(item['payloadSha256'])},{item['revision']},{j(result)})")
    assert projection["state"] == "sent"
    return loaded


def prove_legacy_upgrade(env: dict[str, str], gate: dict) -> None:
    boundary = sql(env, """select count(*)||','||count(*) filter(where payload->>'jobId'=lower(id::text))||','||count(*) filter(where payload->>'commercialLeadId'=lower(commercial_lead_id::text))||','||count(*) filter(where payload->>'from'='info@aiow.io')||','||count(*) filter(where payload_sha256=public.aiow_mail_payload_digest_v2(payload)) from commercial_mail_outbox where id::text like '31000000-%';""").stdout.strip()
    assert boundary == "2,2,2,2,2", boundary
    batch = call(env, "public.aiow_mail_outbox_claim_v2('legacy-upgrade-worker',2,transaction_timestamp())")
    assert batch["itemCount"] == 2 and {item["attempts"] for item in batch["items"]} == {1}
    for index, item in enumerate(batch["items"]):
        loaded = dispatch_and_finalize(env, item, gate, f"legacy-{index}")
        assert loaded["from"] == "info@aiow.io" and loaded["jobId"] == item["id"]


def prove_browser_to_sql(env: dict[str, str]) -> tuple[dict, dict]:
    booking, js_digest = browser_booking()
    assert booking["schemaKind"] == "booking_request"
    assert js_digest == digest(booking)
    without_schema = {key: value for key, value in booking.items() if key != "schemaKind"}
    assert js_digest != digest(without_schema)
    ack = call(env, f"public.aiow_booking_commit_v1({q(str(uuid.uuid4()))}::uuid,'ordered-booking-key-0001',{q(js_digest)},{j(booking)},'{{\"route\":\"/\",\"locale\":\"nl\"}}'::jsonb)")
    stored = sql(env, f"select payload_digest from booking_leads where commercial_lead_id={q(ack['leadId'])}::uuid;").stdout.strip()
    assert stored == js_digest
    return booking, ack


def quote_jobs(env: dict[str, str]) -> dict:
    quote = copy.deepcopy(FIXTURES["requests"]["QuoteRequest"])
    quote["contact"].update(name="Ordered Quote", email="ordered-quote@example.com")
    now = dt.datetime.now(dt.timezone.utc)
    key = "ordered-quote-key-00001"
    prepared = call(env, f"public.aiow_quote_prepare_v1({q(str(uuid.uuid4()))}::uuid,{q(key)},{q(now.isoformat())}::timestamptz,{q(quote['country'])},{j(quote)},{j(quote['contact'])},{j(quote['consent'])},{j(quote['source'])})")
    pdf = b"%PDF-1.7\nordered-chain\n%%EOF"
    encoded = base64.b64encode(pdf).decode()
    pdf_sha = hashlib.sha256(pdf).hexdigest()
    args = FIXTURES["rpcBoundaries"]["aiow_quote_commit_v1"]["args"]
    customer = copy.deepcopy(next(arg["value"] for arg in args if arg["name"] == "p_customer_mail"))
    internal = copy.deepcopy(next(arg["value"] for arg in args if arg["name"] == "p_internal_mail"))
    call(env, f"public.aiow_quote_commit_v1({q(str(uuid.uuid4()))}::uuid,{q(key)},{q(prepared['quoteNumber'])},{q(prepared['leadId'])}::uuid,{q(prepared['quoteNumber']+'.pdf')},'application/pdf',{q(encoded)},{q(pdf_sha)},{j(customer)},{j(internal)},{j(quote)},{j(quote['contact'])},{j(quote['source'])},{q(quote['country'])})")
    return prepared


def prove_booking_quote_lifecycle(env: dict[str, str], gate: dict, booking_ack: dict) -> None:
    quote = quote_jobs(env)
    batch = call(env, "public.aiow_mail_outbox_claim_v2('fresh-chain-worker',4,transaction_timestamp())")
    assert batch["itemCount"] == 4
    assert {item["kind"] for item in batch["items"]} == {"customer_booking", "internal_booking", "customer_quote", "internal_lead"}
    assert {item["commercialLeadId"] for item in batch["items"]} == {booking_ack["leadId"], quote["commercialLeadId"]}
    for index, item in enumerate(batch["items"]):
        dispatch_and_finalize(env, item, gate, f"fresh-{index}")


def prove_malformed_predispatch(env: dict[str, str]) -> None:
    lead_id, job_id, source_id = [str(uuid.uuid4()) for _ in range(3)]
    payload = {
        "schemaKind": "mail_job", "jobId": job_id, "commercialLeadId": lead_id, "kind": "customer_booking",
        "from": "info@aiow.io", "to": [], "subject": "Malformed", "text": "Malformed", "html": "<p>Malformed</p>",
        "attachments": [], "payloadSha256": SHA_A, "attempt": 1, "leaseOwner": "pending", "leaseToken": str(uuid.uuid4()), "leaseExpiresAt": "2026-09-01T00:00:00.000Z",
    }
    payload_digest = sql(env, f"select public.aiow_mail_payload_digest_v2({j(payload)});").stdout.strip()
    payload["payloadSha256"] = payload_digest
    sql(env, f"""insert into commercial_leads(id,source,source_id,route,locale,display_name,email,sla_due_at) values({q(lead_id)}::uuid,'booking',{q(source_id)}::uuid,'/','nl','Malformed','malformed@example.com',transaction_timestamp());
      insert into commercial_mail_outbox(id,commercial_lead_id,kind,payload,payload_sha256,next_attempt_at) values({q(job_id)}::uuid,{q(lead_id)}::uuid,'customer_booking',{j(payload)},{q(payload_digest)},transaction_timestamp());""")
    item = call(env, "public.aiow_mail_outbox_claim_v2('malformed-worker',1,transaction_timestamp())")["items"][0]
    loaded = call(env, f"public.aiow_mail_outbox_load_leased_job_v1({lease_args(item)})")
    assert loaded["to"] == []
    other = permanent_result("oauth_authentication_failed")
    denied = sql(env, f"select public.aiow_mail_outbox_dead_v2({q(item['id'])}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{q(item['payloadSha256'])},{item['revision']},{j(other)});", False, "service_role")
    assert_error(denied, "AIOW_OUTBOX_LEASE_CONFLICT")
    invalid = permanent_result("invalid_payload")
    projection = call(env, f"public.aiow_mail_outbox_dead_v2({q(item['id'])}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{q(item['payloadSha256'])},{item['revision']},{j(invalid)})")
    assert projection["state"] == "dead"
    assert sql(env, f"select dispatch_started_at is null from commercial_mail_outbox where id={q(job_id)}::uuid;").stdout.strip() == "t"


SERVICE = {
    "aiow_quote_prepare_v1(uuid,text,timestamp with time zone,text,jsonb,jsonb,jsonb,jsonb)",
    "aiow_quote_commit_v1(uuid,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text)",
    "aiow_booking_commit_v1(uuid,text,text,jsonb,jsonb)", "aiow_commercial_queue_v1(timestamp with time zone,uuid,integer)",
    "aiow_commercial_mutate_v1(text,text,jsonb)", "aiow_commercial_report_v1(date,date)", "aiow_commercial_event_v1(text,text,jsonb)",
    "aiow_mail_outbox_claim_v2(text,integer,timestamp with time zone)", "aiow_mail_outbox_sent_v2(uuid,text,uuid,text,bigint,jsonb)",
    "aiow_mail_outbox_retry_v2(uuid,text,uuid,text,bigint,jsonb,timestamp with time zone)", "aiow_mail_outbox_dead_v2(uuid,text,uuid,text,bigint,jsonb)",
    "aiow_mail_outbox_review_v2(uuid,text,uuid,text,bigint,jsonb)", "aiow_mail_outbox_resolve_v2(text,text,jsonb)",
    "aiow_commercial_retention_dry_run_v1(timestamp with time zone)", "aiow_mail_outbox_recover_stale_v2(text,timestamp with time zone,integer)",
    "aiow_mail_outbox_cancel_v2(uuid,uuid,bigint,text,text,text,text)", "aiow_provider_gate_write_v1(text,text,jsonb)",
    "aiow_active_customer_relation_set_v1(uuid,bigint,text,text,boolean,text)", "aiow_quote_abandon_expired_v1(timestamp with time zone,integer)",
    "aiow_quote_prepared_load_v1(uuid,text,uuid,uuid,text)", "aiow_quote_committed_pdf_load_v1(uuid,text,uuid,uuid,text,text)",
    "aiow_mail_run_begin_v1(uuid,text,text,text)", "aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb)",
    "aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text)", "aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text)",
    "aiow_mail_outbox_dispatch_v2(uuid,text,uuid,text,bigint)", "aiow_analytics_retention_purge_v1(boolean,timestamp with time zone)",
}
RUNTIME_READER = {"aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text)", "aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text)", "aiow_iso_v1(timestamp with time zone)", "aiow_sha256_json_v1(jsonb)", "aiow_json_canonical_v1(jsonb)", "aiow_provider_gate_binding_v1(jsonb)", "aiow_mail_payload_digest_v2(jsonb)", "aiow_provider_gate_binding_bytes_v2(jsonb)"}
RECEIPT_OWNER = {"aiow_mail_run_begin_v1(uuid,text,text,text)", "aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb)", "aiow_mail_run_receipts_delete_expired_v1(integer)", "aiow_iso_v1(timestamp with time zone)", "aiow_jsonb_exact_keys_v1(jsonb,text[])"}


def effective_exec(env: dict[str, str], role: str) -> set[str]:
    return set(sql(env, f"""select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'aiow_%' and has_function_privilege({q(role)},p.oid,'EXECUTE') order by 1;""").stdout.splitlines())


def prove_acl_and_obsolete_absent(env: dict[str, str]) -> int:
    assert sql(env, "select to_regprocedure('public.aiow_mail_outbox_resolve_v2(text,text,uuid,bigint,text,text,text)') is null;").stdout.strip() == "t"
    all_count = int(sql(env, "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'aiow_%';").stdout.strip())
    assert effective_exec(env, "public") == set()
    assert effective_exec(env, "anon") == set()
    assert effective_exec(env, "authenticated") == set()
    service = effective_exec(env, "service_role")
    assert service == SERVICE, {"missing": sorted(SERVICE - service), "extra": sorted(service - SERVICE)}
    assert effective_exec(env, "aiow_mail_runtime_reader") == RUNTIME_READER
    assert effective_exec(env, "aiow_mail_run_receipt_owner") == RECEIPT_OWNER
    assert effective_exec(env, "aiow_mail_run_retention_worker") == {"aiow_mail_run_receipts_delete_expired_v1(integer)"}
    return all_count


def main() -> None:
    def step(name: str) -> None:
        print(f"PG_ORDERED_CHAIN_PROOF_STEP {name}", flush=True)

    migrations = discover_migrations()
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="aiow-ordered-chain-", dir="/tmp"))
    data, sock = tmp / "data", tmp / "socket"
    sock.mkdir()
    with socket.socket() as handle:
        handle.bind(("127.0.0.1", 0))
        port = handle.getsockname()[1]
    env = os.environ.copy()
    env.update(PGHOST=str(sock), PGPORT=str(port), PGUSER="postgres", PGDATABASE="postgres", LC_ALL="C", LANG="C")
    started = False
    try:
        step("postgres17-lc-all-c")
        assert "17." in run(["postgres", "--version"], env).stdout
        run(["initdb", "-D", str(data), "-A", "trust", "-U", "postgres", "--no-locale", "--encoding=UTF8"], env)
        run(["pg_ctl", "-D", str(data), "-l", str(tmp / "postgres.log"), "-o", f"-k {sock} -p {port} -c listen_addresses=''", "-w", "start"], env)
        started = True
        setup_roles(env)
        step("discover-unique-sort-apply-once")
        apply_discovered_once(env, migrations)
        step("provider-gate-concurrent-replay")
        gate = activated_gate(env)
        step("pre-0004-queued-retry-upgrade")
        prove_legacy_upgrade(env, gate)
        step("browser-booking-adapter-digest-final-sql")
        _, booking_ack = prove_browser_to_sql(env)
        step("booking-quote-claim-load-dispatch-finalize")
        prove_booking_quote_lifecycle(env, gate, booking_ack)
        step("malformed-predispatch-dead-marker-boundary")
        prove_malformed_predispatch(env)
        step("obsolete-overload-and-exhaustive-effective-acl")
        acl_count = prove_acl_and_obsolete_absent(env)
        print(f"POSTGRES_ORDERED_MIGRATION_CHAIN_PROOF_PASS migrations={len(migrations)} apply=lexical-once duplicate-prefix=reject booking=browser-adapter-js-sql legacy=pending+retry-v2 lifecycle=booking+quote gate=concurrent-replay malformed=predispatch-dead marker=provider-results-bound obsolete-overload=absent aiow-acl-inventory={acl_count}", flush=True)
    finally:
        if started:
            run(["pg_ctl", "-D", str(data), "-m", "fast", "-w", "stop"], env, False)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
