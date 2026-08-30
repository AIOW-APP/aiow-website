#!/usr/bin/env python3
"""Native PostgreSQL proof for the 1303 mail-provider remediation."""
from __future__ import annotations

import base64
import copy
import datetime as dt
import hashlib
import importlib.util
import json
import os
import pathlib
import shutil
import socket
import subprocess
import tempfile
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[2]
PREDECESSOR = ROOT / "supabase/migrations/20260828_aiow_quote_adapter_v1.sql"
CONTROL_PLANE = ROOT / "supabase/migrations/20260830_aiow_commercial_control_plane_v1.sql"
REMEDIATION = ROOT / "supabase/migrations/20260830_1303_aiow_mail_provider_remediation.sql"
FIXTURES = json.loads((ROOT / "tests/fixtures/aiow-commercial-contract-v1.json").read_text())
GOLDEN_DIGEST = "5e485190eeab178c230198af385cf87103b65313d20fe8968083915e936f1d63"
GOLDEN_BYTES = "gateId:27:mail_provider_production_v1\nenvironment:10:production\nprovider:15:microsoft_graph\ntenantId:36:123e4567-e89b-42d3-a456-426614174010\napplicationId:36:123e4567-e89b-42d3-a456-426614174011\nmailbox:12:info@aiow.io\nsender:12:info@aiow.io\ncontrolMailbox:20:rbac-control@aiow.io\nsecretPresent:4:true\noauthClientCredentialsPresent:4:true\nexchangeApplicationRole:21:Application Mail.Send\nexchangeRbacSenderInScope:4:true\nexchangeRbacControlMailboxInScope:5:false\nentraUnscopedMailSendAssigned:5:false\nevidenceSha256:64:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\nrevision:1:1\nownerApprovedBy:7:richard\napprovedAt:24:2026-08-30T11:00:00.000Z\nexpiresAt:24:2026-08-30T13:00:00.000Z\nruntimeCapability:9:mail_send\nfallbackProvider:4:null\n"


def run(command, env, check=True):
    result = subprocess.run(command, cwd=ROOT, env=env, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError(f"command failed {command}:\nstdout:\n{result.stdout}\nstderr:\n{result.stderr}")
    return result


def sql(env, text, check=True, role=None):
    prefix = f"set role {role};" if role else ""
    return run(["psql", "-X", "-v", "ON_ERROR_STOP=1", "-qAt", "-U", "postgres", "-d", "postgres", "-c", prefix + text], env, check)


def apply(env, path):
    return run(["psql", "-X", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres", "-f", str(path)], env)


def q(value):
    return "'" + str(value).replace("'", "''") + "'"


def j(value):
    return q(json.dumps(value, separators=(",", ":"), sort_keys=True)) + "::jsonb"


def digest(value):
    return hashlib.sha256(json.dumps(value, separators=(",", ":"), sort_keys=True, ensure_ascii=False).encode()).hexdigest()


def call(env, expression):
    return json.loads(sql(env, f"select ({expression})::text;", role="service_role").stdout.strip())


def assert_error(result, marker):
    assert result.returncode != 0 and marker in result.stderr, (result.returncode, result.stdout, result.stderr)


def setup_roles(env):
    sql(env, """do $$ begin
      if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
      if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
      if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
    end $$;
    alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
    alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;
    alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;""")


def normalized_booking(booking):
    value = {key: booking[key] for key in ("subject", "details", "date", "slot", "name", "email", "company", "locale", "consentAccepted", "consentVersion")}
    value.update(details=value["details"].strip(), name=value["name"].strip(), email=value["email"].lower(), company=value["company"].strip())
    return value


def create_booking(env, key):
    booking = {"schemaKind":"booking_request","subject":"bedrijf","details":"mail provider proof","date":"2026-09-01","slot":"10:00","name":"Proof User","email":"proof@example.com","company":"AIOW","locale":"nl","consentAccepted":True,"consentVersion":"aiow-booking-v1"}
    source = {"route":"/", "locale":"nl"}
    ack = call(env, f"public.aiow_booking_commit_v1({q(str(uuid.uuid4()))}::uuid,{q(key)},{q(digest(normalized_booking(booking)))},{j(booking)},{j(source)})")
    return booking, ack


def prove_booking_jobs(env):
    booking, ack = create_booking(env, "mail-provider-booking-0001")
    rows = json.loads(sql(env, f"select jsonb_agg(jsonb_build_object('kind',kind,'payload',payload) order by kind)::text from commercial_mail_outbox where commercial_lead_id={q(ack['leadId'])}::uuid;").stdout.strip())
    assert [row["kind"] for row in rows] == ["customer_booking", "internal_booking"]
    customer, internal = rows
    assert customer["payload"]["from"] == "info@aiow.io" and customer["payload"]["to"] == [booking["email"]]
    assert customer["payload"]["attachments"] == []
    assert "voorkeursdatum en -tijd ontvangen" in customer["payload"]["text"]
    assert "bevestigt de afspraak afzonderlijk" in customer["payload"]["text"]
    assert internal["payload"]["from"] == "info@aiow.io" and internal["payload"]["to"] == ["info@aiow.io"]
    assert internal["payload"]["attachments"] == []
    valid = sql(env, f"select bool_and(public.aiow_mail_job_valid_v1(payload,kind,commercial_lead_id)) from commercial_mail_outbox where commercial_lead_id={q(ack['leadId'])}::uuid;").stdout.strip()
    assert valid == "t"
    return booking


def quote_fixture(name, email):
    value = copy.deepcopy(FIXTURES["requests"]["QuoteRequest"])
    value["contact"].update(name=name, email=email)
    return value


def mail_fixture(argument_name, commercial_lead_id):
    args = FIXTURES["rpcBoundaries"]["aiow_quote_commit_v1"]["args"]
    value = copy.deepcopy(next(arg["value"] for arg in args if arg["name"] == argument_name))
    value.update(jobId=str(uuid.uuid4()), commercialLeadId=commercial_lead_id, leaseToken=str(uuid.uuid4()))
    return value


def prove_quote_jobs_and_pdf(env):
    now = dt.datetime.now(dt.timezone.utc)
    key = "mail-provider-quote-0001"
    quote = quote_fixture("Quote Proof", "quote@example.com")
    contact, consent, source = quote["contact"], quote["consent"], quote["source"]
    prepared = call(env, f"public.aiow_quote_prepare_v1({q(str(uuid.uuid4()))}::uuid,{q(key)},{q(now.isoformat())}::timestamptz,{q(quote['country'])},{j(quote)},{j(contact)},{j(consent)},{j(source)})")
    pdf = b"%PDF-1.7\nmail-provider-proof\n%%EOF"
    pdf_sha = hashlib.sha256(pdf).hexdigest()
    encoded = base64.b64encode(pdf).decode()
    customer = mail_fixture("p_customer_mail", prepared["commercialLeadId"])
    internal = mail_fixture("p_internal_mail", prepared["commercialLeadId"])
    committed = call(env, f"public.aiow_quote_commit_v1({q(str(uuid.uuid4()))}::uuid,{q(key)},{q(prepared['quoteNumber'])},{q(prepared['leadId'])}::uuid,{q(prepared['quoteNumber']+'.pdf')},'application/pdf',{q(encoded)},{q(pdf_sha)},{j(customer)},{j(internal)},{j(quote)},{j(contact)},{j(source)},{q(quote['country'])})")
    assert committed["state"] == "committed" and committed["pdfSha256"] == pdf_sha
    rows = json.loads(sql(env, f"select jsonb_agg(jsonb_build_object('kind',kind,'payload',payload) order by kind)::text from commercial_mail_outbox where commercial_lead_id={q(prepared['commercialLeadId'])}::uuid;").stdout.strip())
    assert [row["kind"] for row in rows] == ["customer_quote", "internal_lead"]
    customer_job, internal_job = rows
    assert customer_job["payload"]["from"] == "info@aiow.io" and customer_job["payload"]["to"] == [contact["email"]]
    assert len(customer_job["payload"]["attachments"]) == 1
    attachment = customer_job["payload"]["attachments"][0]
    assert attachment == {"filename":prepared["quoteNumber"]+".pdf", "mimeType":"application/pdf", "base64":encoded, "sha256":pdf_sha}
    assert internal_job["payload"]["to"] == ["info@aiow.io"] and internal_job["payload"]["attachments"] == []
    binding = sql(env, f"select encode(decode(payload#>>'{{attachments,0,base64}}','base64'),'hex')=encode(d.document_bytes,'hex') and payload#>>'{{attachments,0,sha256}}'=d.sha256 from commercial_mail_outbox o join quote_documents d on d.quote_lead_id={q(prepared['leadId'])}::uuid where o.commercial_lead_id={q(prepared['commercialLeadId'])}::uuid and o.kind='customer_quote';").stdout.strip()
    assert binding == "t"


def provider_result(category, code, status=503):
    schema = {"transient_pre_acceptance":"provider_transient_pre_acceptance", "ambiguous":"provider_ambiguous"}[category]
    return {"schemaKind":schema,"category":category,"code":code,"receipt":{"provider":"microsoft_graph","httpStatus":status,"graphRequestId":None,"providerMessageId":None,"acceptanceKind":None,"attemptReceipt":"postgres-proof","observedAt":dt.datetime.now(dt.timezone.utc).isoformat()}}


def dispatch(env, item):
    return call(env, f"public.aiow_mail_outbox_dispatch_v2({q(item['id'])}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{q(item['payloadSha256'])},{item['revision']})")


def prove_retry_schedule(env):
    sql(env, "update commercial_mail_outbox set state='dead',next_attempt_at=null,lease_owner=null,lease_token=null,lease_expires_at=null where state in ('pending','retry');")
    _, ack = create_booking(env, "mail-provider-retry-0001")
    target = sql(env, f"select lower(id::text) from commercial_mail_outbox where commercial_lead_id={q(ack['leadId'])}::uuid and kind='customer_booking';").stdout.strip()
    sql(env, f"update commercial_mail_outbox set state='dead' where commercial_lead_id={q(ack['leadId'])}::uuid and id<>{q(target)}::uuid;")
    transient = provider_result("transient_pre_acceptance", "graph_5xx")
    for attempt, seconds in enumerate((60, 300, 1800, 7200), 1):
        sql(env, f"update commercial_mail_outbox set state='retry',next_attempt_at=transaction_timestamp(),lease_owner=null,lease_token=null,lease_expires_at=null,dispatch_started_at=null where id={q(target)}::uuid;")
        batch = call(env, "public.aiow_mail_outbox_claim_v2('schedule-worker',1,transaction_timestamp())")
        item = batch["items"][0]
        assert item["id"] == target and item["attempts"] == attempt
        dispatch(env, item)
        expected = (dt.datetime.fromisoformat(item["leaseExpiresAt"].replace("Z", "+00:00")) - dt.timedelta(seconds=300) + dt.timedelta(seconds=seconds)).isoformat(timespec="microseconds").replace("+00:00", "Z")
        next_at = sql(env, f"select lease_expires_at-interval '5 minutes'+interval '{seconds} seconds' from commercial_mail_outbox where id={q(target)}::uuid;").stdout.strip()
        wrong = sql(env, f"select public.aiow_mail_outbox_retry_v2({q(target)}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{q(item['payloadSha256'])},{item['revision']},{j(transient)},({q(next_at)}::timestamptz+interval '1 second'));", check=False, role="service_role")
        assert_error(wrong, "AIOW_OUTBOX_BACKOFF_INVALID")
        projection = call(env, f"public.aiow_mail_outbox_retry_v2({q(target)}::uuid,{q(item['leaseOwner'])},{q(item['leaseToken'])}::uuid,{q(item['payloadSha256'])},{item['revision']},{j(transient)},{q(next_at)}::timestamptz)")
        assert projection["state"] == "retry" and projection["nextAttemptAt"] == expected, (projection, expected, next_at)
    stored = sql(env, f"select attempts from commercial_mail_outbox where id={q(target)}::uuid;").stdout.strip()
    assert stored == "4"


def prove_expired_lease_review(env):
    sql(env, "update commercial_mail_outbox set state='dead',next_attempt_at=null,lease_owner=null,lease_token=null,lease_expires_at=null where state in ('pending','retry','leased');")
    _, ack = create_booking(env, "mail-provider-stale-0001")
    ids = sql(env, f"select lower(id::text) from commercial_mail_outbox where commercial_lead_id={q(ack['leadId'])}::uuid order by kind;").stdout.splitlines()
    sql(env, f"update commercial_mail_outbox set next_attempt_at=transaction_timestamp()+interval '1 hour' where id={q(ids[1])}::uuid;")
    dispatched = call(env, "public.aiow_mail_outbox_claim_v2('stale-worker',1,transaction_timestamp())")["items"][0]
    dispatch(env, dispatched)
    sql(env, f"update commercial_mail_outbox set lease_expires_at=transaction_timestamp()-interval '1 second' where id={q(dispatched['id'])}::uuid;")
    recovered = call(env, "public.aiow_mail_outbox_recover_stale_v2('recovery-worker',transaction_timestamp(),10)")
    assert recovered["itemCount"] == 1
    state = json.loads(sql(env, f"select jsonb_build_object('state',state,'category',provider_result->>'category','code',provider_result->>'code')::text from commercial_mail_outbox where id={q(dispatched['id'])}::uuid;").stdout.strip())
    assert state == {"state":"review", "category":"ambiguous", "code":"unknown_acceptance"}

    sql(env, f"update commercial_mail_outbox set next_attempt_at=transaction_timestamp() where id={q(ids[1])}::uuid;")
    unmarked = call(env, "public.aiow_mail_outbox_claim_v2('stale-worker-2',1,transaction_timestamp())")["items"][0]
    sql(env, f"update commercial_mail_outbox set lease_expires_at=transaction_timestamp()-interval '1 second' where id={q(unmarked['id'])}::uuid;")
    call(env, "public.aiow_mail_outbox_recover_stale_v2('recovery-worker',transaction_timestamp(),10)")
    boundary = sql(env, f"select state||','||(dispatch_started_at is null)||','||(provider_result->>'category') from commercial_mail_outbox where id={q(unmarked['id'])}::uuid;").stdout.strip()
    assert boundary == "retry,true,transient_pre_acceptance"


def prove_gate_golden(env):
    gate = {"gateId":"mail_provider_production_v1","environment":"production","provider":"microsoft_graph","tenantId":"123e4567-e89b-42d3-a456-426614174010","applicationId":"123e4567-e89b-42d3-a456-426614174011","mailbox":"info@aiow.io","sender":"info@aiow.io","controlMailbox":"rbac-control@aiow.io","secretPresent":True,"oauthClientCredentialsPresent":True,"exchangeApplicationRole":"Application Mail.Send","exchangeRbacSenderInScope":True,"exchangeRbacControlMailboxInScope":False,"entraUnscopedMailSendAssigned":False,"evidenceSha256":"b"*64,"revision":1,"ownerApprovedBy":"richard","approvedAt":"2026-08-30T11:00:00.000Z","expiresAt":"2026-08-30T13:00:00.000Z","runtimeCapability":"mail_send","fallbackProvider":None}
    encoded = sql(env, f"select encode(convert_to(public.aiow_provider_gate_binding_bytes_v2({j(gate)}),'UTF8'),'base64');").stdout.strip()
    assert base64.b64decode(encoded).decode() == GOLDEN_BYTES
    assert sql(env, f"select public.aiow_provider_gate_binding_v1({j(gate)});").stdout.strip() == GOLDEN_DIGEST


def prove_acl(env):
    oid = "'public.aiow_mail_outbox_dispatch_v2(uuid,text,uuid,text,bigint)'::regprocedure"
    acl = sql(env, f"select has_function_privilege('service_role',{oid},'EXECUTE')||','||has_function_privilege('anon',{oid},'EXECUTE')||','||has_function_privilege('authenticated',{oid},'EXECUTE')||','||has_function_privilege('public',{oid},'EXECUTE');").stdout.strip()
    assert acl == "true,false,false,false", acl


def main():
    def step(message):
        print(f"PG_MAIL_PROVIDER_PROOF_STEP {message}", flush=True)

    tmp = pathlib.Path(tempfile.mkdtemp(prefix="aiow-mail-provider-pg-proof-", dir="/tmp"))
    data, sock = tmp / "data", tmp / "socket"
    sock.mkdir()
    with socket.socket() as handle:
        handle.bind(("127.0.0.1", 0))
        port = handle.getsockname()[1]
    env = os.environ.copy()
    env.update(PGHOST=str(sock), PGPORT=str(port), PGUSER="postgres", PGDATABASE="postgres", LC_ALL="C")
    started = False
    try:
        step("initdb")
        run(["initdb", "-D", str(data), "-A", "trust", "-U", "postgres", "--no-locale", "--encoding=UTF8"], env)
        step("start-owned-cluster")
        run(["pg_ctl", "-D", str(data), "-l", str(tmp / "postgres.log"), "-o", f"-k {sock} -p {port} -c listen_addresses=''", "-w", "start"], env)
        started = True
        setup_roles(env)
        step("predecessor-control-plane-1303-chain")
        apply(env, PREDECESSOR)
        apply(env, CONTROL_PLANE)
        apply(env, REMEDIATION)
        step("acl")
        prove_acl(env)
        step("booking-jobs")
        booking = prove_booking_jobs(env)
        step("quote-jobs-pdf-binding")
        prove_quote_jobs_and_pdf(env)
        step("sql-js-gate-golden")
        prove_gate_golden(env)
        step("retry-60-300-1800-7200")
        prove_retry_schedule(env)
        step("expired-lease-ambiguous-review")
        prove_expired_lease_review(env)
        assert booking["email"] == "proof@example.com"
        print("POSTGRES_MAIL_PROVIDER_REMEDIATION_PROOF_PASS chain=predecessor+control-plane+1303 jobs=booking+quote pdf=byte+sha256-bound gate=sql-js-golden retry=60+300+1800+7200 stale=dispatch-review+predispatch-retry acl=service-role-only", flush=True)
    finally:
        step("cleanup-owned-cluster")
        if started:
            run(["pg_ctl", "-D", str(data), "-m", "fast", "-w", "stop"], env, False)
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
