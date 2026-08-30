#!/usr/bin/env python3
"""Deterministic native PostgreSQL proof for the commercial control-plane migration."""
from __future__ import annotations
import base64, concurrent.futures, copy, datetime as dt, hashlib, json, os, pathlib, shutil, socket, subprocess, tempfile, uuid

ROOT = pathlib.Path(__file__).resolve().parents[2]
PREDECESSOR = ROOT / "supabase/migrations/20260828_aiow_quote_adapter_v1.sql"
MIGRATION = ROOT / "supabase/migrations/20260830_aiow_commercial_control_plane_v1.sql"
REMEDIATION = ROOT / "supabase/migrations/20260830_1301_aiow_cross_lane_digest_quote_ops_remediation.sql"
FIXTURES = json.loads((ROOT / "tests/fixtures/aiow-commercial-contract-v1.json").read_text())
EXPECTED_TABLES = {"commercial_leads","booking_leads","commercial_mail_outbox","commercial_events","commercial_event_daily","commercial_audit","commercial_provider_gates","commercial_idempotency"}
EXPECTED_RPCS = {"aiow_quote_prepare_v1","aiow_quote_commit_v1","aiow_quote_prepared_load_v1","aiow_quote_committed_pdf_load_v1","aiow_booking_commit_v1","aiow_commercial_queue_v1","aiow_commercial_mutate_v1","aiow_commercial_report_v1","aiow_commercial_event_v1","aiow_mail_outbox_claim_v2","aiow_mail_outbox_sent_v2","aiow_mail_outbox_retry_v2","aiow_mail_outbox_dead_v2","aiow_mail_outbox_review_v2","aiow_mail_outbox_resolve_v2","aiow_commercial_retention_dry_run_v1","aiow_mail_outbox_recover_stale_v2","aiow_mail_outbox_cancel_v2","aiow_provider_gate_write_v1","aiow_active_customer_relation_set_v1","aiow_quote_abandon_expired_v1"}
DIGEST_A = "a" * 64
DIGEST_B = "b" * 64

def run(command, env, check=True):
    result = subprocess.run(command, cwd=ROOT, env=env, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError(f"command failed {command}:\nstdout:\n{result.stdout}\nstderr:\n{result.stderr}")
    return result

def sql(env, text, db="postgres", check=True, role=None):
    prefix = f"set role {role};" if role else ""
    return run(["psql","-X","-v","ON_ERROR_STOP=1","-qAt","-U","postgres","-d",db,"-c",prefix+text], env, check)

def apply(env, path, db="postgres"):
    return run(["psql","-X","-v","ON_ERROR_STOP=1","-U","postgres","-d",db,"-f",str(path)], env)

def q(value):
    return "'" + str(value).replace("'", "''") + "'"

def j(value):
    return q(json.dumps(value, separators=(",", ":"), sort_keys=True)) + "::jsonb"

def digest(value):
    return hashlib.sha256(json.dumps(value,separators=(",",":"),sort_keys=True,ensure_ascii=False).encode()).hexdigest()

def without_replayed(value):
    return {k:v for k,v in value.items() if k != "replayed"}

def node_digest(value, endpoint):
    script = "import {endpointPayloadDigest} from './lib/aiow-v1/commercial-api-runtime.mjs';const v=JSON.parse(process.argv[1]);process.stdout.write(endpointPayloadDigest(process.argv[2],v));"
    return run(["node","--input-type=module","-e",script,json.dumps(value,separators=(",",":"),ensure_ascii=False),endpoint],os.environ.copy()).stdout

def call(env, expression, db="postgres"):
    result = sql(env, f"select ({expression})::text;", db, True, "service_role")
    return json.loads(result.stdout.strip())

def normalized_booking(booking):
    canonical={k:booking[k] for k in ("subject","details","date","slot","name","email","company","locale","consentAccepted","consentVersion")}
    canonical.update(details=canonical["details"].strip(),name=canonical["name"].strip(),email=canonical["email"].lower(),company=canonical["company"].strip())
    return canonical

def booking_expr(key, booking, payload_digest=None, request_id=None, source_override=None):
    request_id = request_id or str(uuid.uuid4())
    source = source_override or {"route":"/" if booking["locale"] == "nl" else "/en", "locale":booking["locale"]}
    return f"public.aiow_booking_commit_v1({q(request_id)}::uuid,{q(key)},{q(payload_digest or digest(booking))},{j(booking)},{j(source)})"

def mutation_expr(key, mutation, payload_digest=None):
    return f"public.aiow_commercial_mutate_v1({q(key)},{q(payload_digest or digest(mutation))},{j(mutation)})"

def event_expr(key, event, payload_digest=None):
    return f"public.aiow_commercial_event_v1({q(key)},{q(payload_digest or digest(event))},{j(event)})"

def quote_request_fixture(name, email):
    value=copy.deepcopy(FIXTURES["requests"]["QuoteRequest"])
    value["contact"].update(name=name,email=email)
    return value

def quote_mail_fixture(argument_name, commercial_lead_id):
    args=FIXTURES["rpcBoundaries"]["aiow_quote_commit_v1"]["args"]
    value=copy.deepcopy(next(arg["value"] for arg in args if arg["name"]==argument_name))
    value.update(jobId=str(uuid.uuid4()),commercialLeadId=commercial_lead_id,leaseToken=str(uuid.uuid4()))
    return value

def assert_error(result, marker):
    assert result.returncode != 0 and marker in result.stderr, (result.returncode, result.stdout, result.stderr)

def setup_roles(env, db):
    sql(env, """do $$ begin
      if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
      if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
      if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
    end $$;
    alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
    alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;
    alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;""", db)

def prove_catalog_and_acl(env):
    tables = set(sql(env, "select tablename from pg_tables where schemaname='public' and tablename like 'commercial_%' or schemaname='public' and tablename='booking_leads';").stdout.splitlines())
    assert tables == EXPECTED_TABLES, tables
    rpcs = set(sql(env, "select distinct proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname=any(array[" + ",".join(q(x) for x in sorted(EXPECTED_RPCS)) + "]);" ).stdout.splitlines())
    assert rpcs == EXPECTED_RPCS, rpcs
    acl = sql(env, """with r as (
      select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=any(array[%s]))
      select count(*)||','||count(*) filter(where has_function_privilege('service_role',oid,'EXECUTE'))||','||
       count(*) filter(where has_function_privilege('anon',oid,'EXECUTE'))||','||count(*) filter(where has_function_privilege('authenticated',oid,'EXECUTE'))||','||count(*) filter(where has_function_privilege('public',oid,'EXECUTE')) from r;""" % ",".join(q(x) for x in sorted(EXPECTED_RPCS))).stdout.strip()
    assert acl == "22,22,0,0,0", acl
    table_acl = sql(env, "select count(*) filter(where has_table_privilege('service_role','public.'||x,'SELECT,INSERT,UPDATE,DELETE'))||','||count(*) filter(where has_table_privilege('anon','public.'||x,'SELECT,INSERT,UPDATE,DELETE'))||','||count(*) filter(where has_table_privilege('authenticated','public.'||x,'SELECT,INSERT,UPDATE,DELETE')) from unnest(array[" + ",".join(q(x) for x in sorted(EXPECTED_TABLES)) + "]) x;").stdout.strip()
    assert table_acl == "0,0,0", table_acl
    denied = sql(env, "select count(*) from public.commercial_leads;", check=False, role="service_role")
    assert_error(denied, "permission denied")

def prove_booking_and_idempotency(env):
    booking = {"schemaKind":"booking_request","subject":"bedrijf","details":"proof","date":"2026-09-01","slot":"10:00","name":"Proof User","email":"proof@example.com","company":"AIOW","locale":"nl","consentAccepted":True,"consentVersion":"aiow-booking-v1"}
    before = sql(env, "select (select count(*) from commercial_leads)||','||(select count(*) from booking_leads)||','||(select count(*) from commercial_mail_outbox);").stdout.strip()
    bad = sql(env, f"select {booking_expr('booking-invalid-0001',booking,source_override={'route':'/booking','locale':'nl'})};", check=False, role="service_role")
    assert_error(bad, "AIOW_BOOKING_INVALID")
    assert sql(env, "select (select count(*) from commercial_leads)||','||(select count(*) from booking_leads)||','||(select count(*) from commercial_mail_outbox);").stdout.strip() == before
    first = call(env, booking_expr("booking-proof-0001", booking))
    replay = call(env, booking_expr("booking-proof-0001", booking, request_id=str(uuid.uuid4())))
    assert without_replayed(replay) == without_replayed(first) and first["replayed"] is False and replay["replayed"] is True
    counts = sql(env, f"select (select count(*) from booking_leads b where b.commercial_lead_id={q(first['leadId'])}::uuid)||','||(select count(*) from commercial_mail_outbox o where o.commercial_lead_id={q(first['leadId'])}::uuid);").stdout.strip()
    assert counts == "1,2", counts
    conflict = sql(env, f"select {booking_expr('booking-proof-0001',{**booking,'details':'changed'},digest(booking))};", check=False, role="service_role")
    assert_error(conflict, "AIOW_PAYLOAD_DIGEST_INVALID")
    key = "booking-race-0001"
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda _: call(env, booking_expr(key, booking, request_id=str(uuid.uuid4()))), range(2)))
    assert without_replayed(results[0]) == without_replayed(results[1]) and sorted(x["replayed"] for x in results) == [False,True]
    race_counts = sql(env, f"select count(*)||','||(select count(*) from commercial_mail_outbox where commercial_lead_id=c.id) from commercial_leads c where c.id={q(results[0]['leadId'])}::uuid group by c.id;").stdout.strip()
    assert race_counts == "1,2", race_counts
    return booking, first

def prove_cross_runtime_digest_goldens(env, booking):
    samples=[("booking",booking),("quote_prepare",FIXTURES["requests"]["QuoteRequest"])]
    for event in FIXTURES["events"].values(): samples.append(("analytics",event))
    for name in ("OpsMarkRead","OpsSetPriority","OpsTransitionStatus","OpsSetNextAction","OpsResolveOutbox","OpsLegalHold"):
        samples.append(("ops_mutation",FIXTURES["requests"][name]))
    for endpoint,value in samples:
        js_digest=node_digest(value,endpoint); pg=sql(env,f"select public.aiow_sha256_json_v1({j(value)});").stdout.strip()
        assert js_digest==pg==digest(value),(endpoint,js_digest,pg,digest(value))

def prove_queue_mutate_events(env, lead):
    queue = call(env, "public.aiow_commercial_queue_v1(null,null,100)")
    assert any(x["id"] == lead["leadId"] for x in queue["items"])
    mutation = {"schemaKind":"ops_mark_read","idempotencyKey":"mutate-read-0001","leadId":lead["leadId"],"expectedRevision":1,"operation":"mark_read","unread":False}
    ack = call(env, mutation_expr("mutate-read-0001", mutation)); assert ack["revision"] == 2 and ack["projection"]["unread"] is False
    replay = call(env, mutation_expr("mutate-read-0001", mutation)); assert without_replayed(replay) == without_replayed(ack) and ack["replayed"] is False and replay["replayed"] is True
    changed_mutation={**mutation,"expectedRevision":999}
    changed_replay = sql(env, f"select {mutation_expr('mutate-read-0001',changed_mutation,digest(mutation))};", check=False, role="service_role")
    assert_error(changed_replay,"AIOW_PAYLOAD_DIGEST_INVALID")
    conflict = sql(env, f"select {mutation_expr('mutate-read-0001',changed_mutation,digest(changed_mutation))};", check=False, role="service_role"); assert_error(conflict,"AIOW_IDEMPOTENCY_CONFLICT")
    wrong = {**mutation,"idempotencyKey":"mutate-wrong-cas-1","expectedRevision":1,"operation":"set_priority","priority":"urgent"}
    denied = sql(env, f"select {mutation_expr('mutate-wrong-cas-1',wrong)};", check=False, role="service_role"); assert_error(denied,"AIOW_REVISION_CONFLICT")
    assert '"schemaKind": "revision_conflict"' in denied.stderr and '"currentRevision": 2' in denied.stderr, denied.stderr
    now = dt.datetime.now(dt.timezone.utc)
    event = {"schemaKind":"analytics_page_view","eventId":str(uuid.uuid4()),"event":"page_view","occurredAt":now.isoformat(),"route":"/","locale":"nl","viewport":"desktop"}
    first = call(env,event_expr("event-proof-00001",event)); replay = call(env,event_expr("event-proof-00001",event))
    assert replay == first and first["deduplicated"] is False
    pii = {**event,"eventId":str(uuid.uuid4()),"email":"person@example.com"}
    rejected = sql(env,f"select {event_expr('event-proof-pii01',pii)};",check=False,role="service_role"); assert_error(rejected,"AIOW_EVENT_INVALID")
    report = call(env,f"public.aiow_commercial_report_v1({q(now.date())}::date,{q(now.date())}::date)")
    assert any(x["event"] == "page_view" and x["count"] == 1 for x in report["buckets"])

def make_more_bookings(env, booking, count):
    batch = uuid.uuid4().hex[:8]
    return [call(env, booking_expr(f"booking-{batch}-{i:04d}",booking,None,str(uuid.uuid4()))) for i in range(count)]

def prove_claims_and_results(env, booking):
    sql(env,"update commercial_mail_outbox set next_attempt_at=transaction_timestamp()+interval '1 hour' where state='pending';")
    zero = call(env,"public.aiow_mail_outbox_claim_v2('worker-zero',10,transaction_timestamp())"); assert zero["itemCount"] == 0
    leads = make_more_bookings(env,booking,3)
    expected = sql(env,"select lower(id::text) from commercial_mail_outbox where state='pending' and next_attempt_at<=transaction_timestamp() order by coalesce(next_attempt_at,created_at),created_at,id;").stdout.splitlines()
    one = call(env,"public.aiow_mail_outbox_claim_v2('worker-one',1,transaction_timestamp())"); assert one["itemCount"] == 1 and one["items"][0]["id"] == expected[0]
    multi = call(env,"public.aiow_mail_outbox_claim_v2('worker-many',5,transaction_timestamp())"); assert multi["itemCount"] == 5 and [x["id"] for x in multi["items"]] == expected[1:]
    jobs = one["items"] + multi["items"]
    assert len({x["id"] for x in jobs}) == 6 and len({x["leaseToken"] for x in jobs}) == 6
    empty = call(env,"public.aiow_mail_outbox_claim_v2('worker-empty',5,transaction_timestamp())"); assert empty["itemCount"] == 0
    # Two connections must divide four newly eligible jobs without duplicates.
    make_more_bookings(env,booking,2)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        batches = list(pool.map(lambda worker: call(env,f"public.aiow_mail_outbox_claim_v2({q(worker)},2,transaction_timestamp())"),["worker-race-a","worker-race-b"]))
    raced = [x for batch in batches for x in batch["items"]]
    assert sum(b["itemCount"] for b in batches) == 4, batches
    assert len(raced) == 4 and len({x["id"] for x in raced}) == 4 and len({x["leaseToken"] for x in raced}) == 4, batches
    jobs += raced
    accepted = {"schemaKind":"provider_accepted","category":"accepted","code":None,"receipt":{"provider":"microsoft_graph","httpStatus":202,"graphRequestId":"g","providerMessageId":"m","acceptanceKind":"graph_http_202","attemptReceipt":"r","observedAt":dt.datetime.now(dt.timezone.utc).isoformat()}}
    transient = {"schemaKind":"provider_transient_pre_acceptance","category":"transient_pre_acceptance","code":"timeout_before_response","receipt":{"provider":"microsoft_graph","httpStatus":429,"graphRequestId":"g","providerMessageId":None,"acceptanceKind":None,"attemptReceipt":"r","observedAt":dt.datetime.now(dt.timezone.utc).isoformat()}}
    permanent = {"schemaKind":"provider_permanent_pre_acceptance","category":"permanent_pre_acceptance","code":"oauth_authentication_failed","receipt":{"provider":"microsoft_graph","httpStatus":403,"graphRequestId":"g","providerMessageId":None,"acceptanceKind":None,"attemptReceipt":"r","observedAt":dt.datetime.now(dt.timezone.utc).isoformat()}}
    ambiguous = {"schemaKind":"provider_ambiguous","category":"ambiguous","code":"timeout_after_request_body","receipt":{"provider":"microsoft_graph","httpStatus":504,"graphRequestId":"g","providerMessageId":None,"acceptanceKind":None,"attemptReceipt":"r","observedAt":dt.datetime.now(dt.timezone.utc).isoformat()}}
    a,b,c,d = jobs[:4]
    wrong = sql(env,f"select public.aiow_mail_outbox_sent_v2({q(a['id'])}::uuid,{q(a['leaseOwner'])},{q(uuid.uuid4())}::uuid,{q(a['payloadSha256'])},{a['revision']},{j(accepted)});",check=False,role="service_role"); assert_error(wrong,"AIOW_OUTBOX_LEASE_CONFLICT")
    sent = call(env,f"public.aiow_mail_outbox_sent_v2({q(a['id'])}::uuid,{q(a['leaseOwner'])},{q(a['leaseToken'])}::uuid,{q(a['payloadSha256'])},{a['revision']},{j(accepted)})"); assert sent["state"] == "sent"
    updated = sql(env,f"select updated_at+interval '60 seconds' from commercial_mail_outbox where id={q(b['id'])}::uuid;").stdout.strip()
    retry = call(env,f"public.aiow_mail_outbox_retry_v2({q(b['id'])}::uuid,{q(b['leaseOwner'])},{q(b['leaseToken'])}::uuid,{q(b['payloadSha256'])},{b['revision']},{j(transient)},{q(updated)}::timestamptz)"); assert retry["state"] == "retry"
    dead = call(env,f"public.aiow_mail_outbox_dead_v2({q(c['id'])}::uuid,{q(c['leaseOwner'])},{q(c['leaseToken'])}::uuid,{q(c['payloadSha256'])},{c['revision']},{j(permanent)})"); assert dead["state"] == "dead"
    review = call(env,f"public.aiow_mail_outbox_review_v2({q(d['id'])}::uuid,{q(d['leaseOwner'])},{q(d['leaseToken'])}::uuid,{q(d['payloadSha256'])},{d['revision']},{j(ambiguous)})"); assert review["state"] == "review"
    lead_revision=int(sql(env,f"select revision from commercial_leads where id={q(d['commercialLeadId'])}::uuid;").stdout.strip())
    mutation={"schemaKind":"ops_resolve_outbox","idempotencyKey":"resolve-review-001","leadId":d["commercialLeadId"],"expectedRevision":lead_revision,"operation":"resolve_outbox","jobId":d["id"],"jobExpectedRevision":review["revision"],"resolution":"mark_sent","reason":"verified","evidence":"ticket-1"}
    expression=f"public.aiow_mail_outbox_resolve_v2('resolve-review-001',{q(digest(mutation))},{j(mutation)})"
    audit_before=int(sql(env,f"select count(*) from commercial_audit where commercial_lead_id={q(d['commercialLeadId'])}::uuid and action='resolve_outbox';").stdout.strip())
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: resolved=list(pool.map(lambda _:call(env,expression),range(2)))
    assert without_replayed(resolved[0])==without_replayed(resolved[1]) and sorted(x["replayed"] for x in resolved)==[False,True] and resolved[0]["operation"]=="resolve_outbox" and resolved[0]["effect"]["outboxResolution"]=="sent"
    state=sql(env,f"select revision||','||state from commercial_mail_outbox where id={q(d['id'])}::uuid;").stdout.strip(); assert state==f"{review['revision']+1},sent",state
    assert int(sql(env,f"select count(*) from commercial_audit where commercial_lead_id={q(d['commercialLeadId'])}::uuid and action='resolve_outbox';").stdout.strip())==audit_before+1
    changed={**mutation,"reason":"changed"}; conflict=sql(env,f"select public.aiow_mail_outbox_resolve_v2('resolve-review-001',{q(digest(changed))},{j(changed)});",check=False,role="service_role"); assert_error(conflict,"AIOW_IDEMPOTENCY_CONFLICT")
    return leads

def prove_quote_v2(env):
    now = dt.datetime.now(dt.timezone.utc); request = str(uuid.uuid4()); key="quote-v2-proof-01"
    quote=quote_request_fixture("Quote Proof","quote@example.com"); contact=quote["contact"]; consent=quote["consent"]; source=quote["source"]
    prepare=f"public.aiow_quote_prepare_v1({q(request)}::uuid,{q(key)},{q(now.isoformat())}::timestamptz,{q(quote['country'])},{j(quote)},{j(contact)},{j(consent)},{j(source)})"
    first=call(env,prepare); replay=call(env,prepare); assert without_replayed(replay)==without_replayed(first) and first["replayed"] is False and replay["replayed"] is True
    prepared=call(env,f"public.aiow_quote_prepared_load_v1({q(request)}::uuid,{q(key)},{q(first['leadId'])}::uuid,{q(first['commercialLeadId'])}::uuid,{q(first['quoteNumber'])})")
    assert prepared["state"]=="prepared" and prepared["requestPayloadDigest"]==digest(quote) and prepared["quote"]==quote
    pdf=b"%PDF-commercial-proof"; pdf_digest=hashlib.sha256(pdf).hexdigest(); encoded=base64.b64encode(pdf).decode()
    customer=quote_mail_fixture("p_customer_mail",first["commercialLeadId"]); internal=quote_mail_fixture("p_internal_mail",first["commercialLeadId"])
    commit=f"public.aiow_quote_commit_v1({q(str(uuid.uuid4()))}::uuid,{q(key)},{q(first['quoteNumber'])},{q(first['leadId'])}::uuid,{q(first['quoteNumber']+'.pdf')},'application/pdf',{q(encoded)},{q(pdf_digest)},{j(customer)},{j(internal)},{j(quote)},{j(contact)},{j(source)},{q(quote['country'])})"
    ack=call(env,commit); replay_commit=call(env,commit); assert ack["state"]=="committed" and without_replayed(replay_commit)==without_replayed(ack) and ack["replayed"] is False and replay_commit["replayed"] is True
    committed=call(env,f"public.aiow_quote_committed_pdf_load_v1({q(request)}::uuid,{q(key)},{q(first['leadId'])}::uuid,{q(first['commercialLeadId'])}::uuid,{q(first['quoteNumber'])},{q(digest(quote))})")
    assert base64.b64decode(committed["base64"])==pdf and committed["sha256"]==pdf_digest
    assert sql(env,f"select (select count(*) from quote_documents where lead_id={q(first['leadId'])}::uuid)||','||(select count(*) from commercial_mail_outbox where commercial_lead_id={q(first['commercialLeadId'])}::uuid);").stdout.strip()=="1,2"
    return first

def prove_gate_retention_abandon(env, booking):
    now=dt.datetime.now(dt.timezone.utc); approved=now-dt.timedelta(minutes=1); expires=now+dt.timedelta(days=1)
    gate={"schemaKind":"provider_gate_record","gateId":"mail_provider_production_v1","state":"approved","environment":"production","provider":"microsoft_graph","tenantId":str(uuid.uuid4()),"applicationId":str(uuid.uuid4()),"mailbox":"mail@aiow.ai","sender":"mail@aiow.ai","controlMailbox":"control@aiow.ai","secretPresent":True,"oauthClientCredentialsPresent":True,"exchangeApplicationRole":"Application Mail.Send","exchangeRbacSenderInScope":True,"exchangeRbacControlMailboxInScope":False,"entraUnscopedMailSendAssigned":False,"evidenceSha256":DIGEST_A,"revision":1,"ownerApprovedBy":"richard","approvedAt":approved.isoformat(),"expiresAt":expires.isoformat(),"runtimeCapability":"mail_send","fallbackProvider":None,"approvalBindingSha256":None}
    binding=sql(env,f"select public.aiow_provider_gate_binding_v1({j(gate)});").stdout.strip(); gate["approvalBindingSha256"]=binding
    gate_expr=f"public.aiow_provider_gate_write_v1('provider-gate-0001',{q(digest(gate))},{j(gate)})"
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: gate_results=list(pool.map(lambda _:call(env,gate_expr),range(2)))
    assert gate_results[0]==gate_results[1] and gate_results[0]["approvalBindingSha256"]==binding
    invalid={**gate,"sender":"evil@example.com","revision":2}
    denied=sql(env,f"select public.aiow_provider_gate_write_v1('provider-gate-0002',{q(digest(invalid))},{j(invalid)});",check=False,role="service_role"); assert_error(denied,"AIOW_GATE_BINDING_INVALID")
    leads=make_more_bookings(env,booking,3)
    for i,lead in enumerate(leads):
        m={"schemaKind":"ops_transition_status","idempotencyKey":f"lost-retain-{i:04d}","leadId":lead["leadId"],"expectedRevision":1,"operation":"transition_status","status":"lost","reopenReason":None}
        call(env,mutation_expr(m["idempotencyKey"],m))
    hold={"schemaKind":"ops_legal_hold","idempotencyKey":"hold-retain-0001","leadId":leads[1]["leadId"],"expectedRevision":2,"operation":"set_legal_hold","enabled":True,"reason":"litigation"}
    call(env,mutation_expr(hold["idempotencyKey"],hold))
    relation_expr=f"public.aiow_active_customer_relation_set_v1({q(leads[2]['leadId'])}::uuid,2,'relation-retain01',{q(DIGEST_A)},true,'active contract')"
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: relations=list(pool.map(lambda _:call(env,relation_expr),range(2)))
    assert without_replayed(relations[0])==without_replayed(relations[1]) and sorted(x["replayed"] for x in relations)==[False,True] and relations[0]["projection"]["activeCustomerRelation"] is True
    sql(env,"update commercial_leads set terminal_at=transaction_timestamp()-interval '100 days',abandoned_at=transaction_timestamp()-interval '100 days' where id=any(array["+",".join(q(x["leadId"])+"::uuid" for x in leads)+"]);")
    retention=call(env,"public.aiow_commercial_retention_dry_run_v1(transaction_timestamp())")
    assert retention["eligible"]["leadPii"]==1 and retention["excludedLegalHold"]==1 and retention["excludedActiveCustomerRelation"]==1
    # Expired prepared quote is abandoned atomically, then reopened through the only legal lost transition.
    qlead=prove_quote_prepare_only(env)
    sql(env,f"update quote_leads set expires_at=transaction_timestamp()-interval '2 hours' where id={q(qlead['leadId'])}::uuid;")
    abandoned=call(env,"public.aiow_quote_abandon_expired_v1(transaction_timestamp(),10)"); item=next(x for x in abandoned["items"] if x["quoteId"]==qlead["leadId"])
    reopen={"schemaKind":"ops_transition_status","idempotencyKey":"reopen-quote-0001","leadId":qlead["commercialLeadId"],"expectedRevision":item["revision"],"operation":"transition_status","status":"qualified","reopenReason":"customer returned"}
    reopened=call(env,mutation_expr(reopen["idempotencyKey"],reopen)); assert reopened["projection"]["status"]=="qualified"
    state=sql(env,f"select q.state||','||c.status||','||(c.terminal_at is null)||','||(c.abandoned_at is null) from quote_leads q join commercial_leads c on c.id=q.commercial_lead_id where q.id={q(qlead['leadId'])}::uuid;").stdout.strip(); assert state=="abandoned,qualified,true,true",state

def prove_quote_prepare_only(env):
    now=dt.datetime.now(dt.timezone.utc); key="quote-abandon-001"; quote=quote_request_fixture("Abandon","abandon@example.com"); contact=quote["contact"]; consent=quote["consent"]; source=quote["source"]
    return call(env,f"public.aiow_quote_prepare_v1({q(str(uuid.uuid4()))}::uuid,{q(key)},{q(now.isoformat())}::timestamptz,{q(quote['country'])},{j(quote)},{j(contact)},{j(consent)},{j(source)})")

def prove_upgrade_route(env):
    db="upgrade_proof"; setup_roles(env,db); apply(env,PREDECESSOR,db)
    now=dt.datetime.now(dt.timezone.utc).isoformat()
    sql(env,f"""insert into quote_leads(id,idempotency_key,request_id,quote_number,quote_year,quote_sequence,state,request_payload_hash,normalized_quote,contact,consent,source,country,received_at,prepared_at,committed_at)
      values('10000000-0000-4000-8000-000000000001','upgrade-prepared1','upgrade-prepared','AIOW-2026-9001',2026,9001,'prepared',{q(DIGEST_A)},'{{}}','{{"name":"Prepared","email":"prepared@example.com"}}','{{}}','{{"route":"/quote","locale":"nl"}}','NL',{q(now)},{q(now)},null),
      ('10000000-0000-4000-8000-000000000002','upgrade-committed','upgrade-committed','AIOW-2026-9002',2026,9002,'committed',{q(DIGEST_B)},'{{}}','{{"name":"Committed","email":"committed@example.com"}}','{{}}','{{"route":"/quote","locale":"nl"}}','NL',{q(now)},{q(now)},{q(now)});""",db)
    apply(env,MIGRATION,db); apply(env,REMEDIATION,db)
    mapped=sql(env,"select count(*)||','||count(distinct commercial_lead_id)||','||(select count(*) from commercial_leads where source='quote') from quote_leads;",db).stdout.strip(); assert mapped=="2,2,2",mapped
    visible=call(env,"public.aiow_commercial_queue_v1(null,null,100)",db); assert len(visible["items"])==1 and visible["items"][0]["sourceId"]=="10000000-0000-4000-8000-000000000002"

def main():
    def step(message): print(f"PG_COMMERCIAL_PROOF_STEP {message}",flush=True)
    tmp=pathlib.Path(tempfile.mkdtemp(prefix="acp-", dir="/tmp")); data=tmp/"data"; sock=tmp/"socket"; sock.mkdir()
    with socket.socket() as s: s.bind(("127.0.0.1",0)); port=s.getsockname()[1]
    env=os.environ.copy(); env.update(PGHOST=str(sock),PGPORT=str(port),PGUSER="postgres",PGDATABASE="postgres",LC_ALL="C",LANG="C")
    started=False
    try:
        step("initdb"); run(["initdb","-D",str(data),"-A","trust","-U","postgres","--no-locale","--encoding=UTF8"],env)
        step("start-owned-cluster"); run(["pg_ctl","-D",str(data),"-l",str(tmp/"postgres.log"),"-o",f"-k {sock} -p {port} -c listen_addresses=''","-w","start"],env); started=True
        setup_roles(env,"postgres"); sql(env,"create database upgrade_proof;")
        step("fresh-predecessor-successor-chain"); apply(env,PREDECESSOR); apply(env,MIGRATION); apply(env,REMEDIATION)
        step("catalog-acl"); prove_catalog_and_acl(env)
        step("booking-atomic-idempotency-concurrency"); booking,lead=prove_booking_and_idempotency(env)
        step("cross-runtime-digest-goldens"); prove_cross_runtime_digest_goldens(env,booking)
        step("queue-mutate-event"); prove_queue_mutate_events(env,lead)
        step("claim-order-concurrency-results"); prove_claims_and_results(env,booking)
        step("quote-v2"); prove_quote_v2(env)
        step("provider-retention-hold-relation-abandon-reopen"); prove_gate_retention_abandon(env,booking)
        step("predecessor-upgrade"); prove_upgrade_route(env)
        sentinel=sql(env,"select (select count(*) from commercial_leads)>0 and (select count(*) from commercial_idempotency)>0 and (select count(*) from commercial_audit)>0;").stdout.strip(); assert sentinel=="t",sentinel
        print("POSTGRES_COMMERCIAL_CONTROL_PLANE_PROOF_PASS routes=fresh-chain+predecessor-upgrade acl=service-role-only booking=atomic+replay+conflict queue=mutate+cas events=reject+dedupe claims=zero+one+multi+ordered+concurrent results=sent+retry+dead+review+resolve gate=binding retention=hold+relation quote=v2+abandon+reopen",flush=True)
    finally:
        step("cleanup-owned-cluster")
        if started: run(["pg_ctl","-D",str(data),"-m","fast","-w","stop"],env,False)
        shutil.rmtree(tmp,ignore_errors=True)

if __name__=="__main__": main()
