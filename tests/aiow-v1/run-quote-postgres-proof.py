#!/usr/bin/env python3
"""Fresh PostgreSQL 14 runtime proof for the quote adapter migration."""
import concurrent.futures, datetime as dt, hashlib, json, os, pathlib, shutil, socket, subprocess, tempfile
from zoneinfo import ZoneInfo
ROOT=pathlib.Path(__file__).resolve().parents[2]; MIGRATION=ROOT/"supabase/migrations/20260828_aiow_quote_adapter_v1.sql"
def run(command,env,check=True):
    result=subprocess.run(command,cwd=ROOT,env=env,text=True,capture_output=True)
    if check and result.returncode: raise RuntimeError(f"command failed {command}:\n{result.stdout}\n{result.stderr}")
    return result
def sql(env,text,check=True): return run(["psql","-X","-v","ON_ERROR_STOP=1","-qAt","-U","postgres","-d","postgres","-c",text],env,check)
def q(value): return "'"+str(value).replace("'","''")+"'"
def prepare_sql(key,received,quote,contact,consent,source,request_id=None):
    return f"select public.aiow_quote_prepare_v1({q(request_id or 'request-'+key)},{q(key)},{q(received)}::timestamptz,'NL',{q(json.dumps(quote,separators=(',',':')))}::jsonb,{q(json.dumps(contact,separators=(',',':')))}::jsonb,{q(json.dumps(consent,separators=(',',':')))}::jsonb,{q(json.dumps(source,separators=(',',':')))}::jsonb)::text;"
def main():
    def step(message): print(f"PG_PROOF_STEP {message}", flush=True)
    tmp=pathlib.Path(tempfile.mkdtemp(prefix="aiow-pg-proof-")); data=tmp/"data"; sock=tmp/"socket"; sock.mkdir();
    with socket.socket() as s: s.bind(("127.0.0.1",0)); port=s.getsockname()[1]
    env=os.environ.copy(); env.update(PGHOST=str(sock),PGPORT=str(port),PGUSER="postgres",PGDATABASE="postgres")
    started=False
    try:
        step("initdb"); run(["initdb","-D",str(data),"-A","trust","-U","postgres","--no-locale","--encoding=UTF8"],env)
        step("start")
        run(["pg_ctl","-D",str(data),"-l",str(tmp/"postgres.log"),"-o",f"-k {sock} -p {port} -c listen_addresses=''","-w","start"],env); started=True
        step("supabase-roles-default-acls")
        sql(env,"create role anon nologin; create role authenticated nologin; create role service_role nologin; alter default privileges in schema public grant all on tables to anon,authenticated,service_role; alter default privileges in schema public grant all on sequences to anon,authenticated,service_role; alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;")
        step("migration"); applied=run(["psql","-X","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres","-f",str(MIGRATION)],env); assert applied.returncode==0
        privilege=sql(env,"select (select n.nspname from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto')||','||has_table_privilege('service_role','public.quote_leads','INSERT')||','||has_table_privilege('anon','public.quote_leads','SELECT')||','||has_function_privilege('service_role','public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb)','EXECUTE')||','||has_function_privilege('anon','public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb)','EXECUTE')||','||has_function_privilege('authenticated','public.aiow_quote_claim_outbox_v1(integer,integer)','EXECUTE');").stdout.strip(); assert privilege=="extensions,false,false,true,false,false",privilege
        direct=sql(env,"set role service_role; insert into public.quote_sequences(year,next_value) values(2099,1);",False); assert direct.returncode!=0 and "permission denied" in direct.stderr
        now=dt.datetime.now(dt.timezone.utc); received=now.isoformat(); year=now.astimezone(ZoneInfo("Europe/Amsterdam")).year; issue=now.astimezone(ZoneInfo("Europe/Amsterdam")).date().isoformat()
        quote={"schemaVersion":1,"issueDate":issue}; contact={"name":"Proof","email":"proof@example.com","phone":"0201234567"}; consent={"accepted":True,"version":"aiow-quote-v1"}; source={"route":"/","locale":"nl"}
        step("prepare-replay"); first=json.loads(sql(env,"set role service_role;"+prepare_sql("pg-proof-key-0001",received,quote,contact,consent,source)).stdout)
        replay_received=(now+dt.timedelta(seconds=1)).isoformat(); replay=json.loads(sql(env,prepare_sql("pg-proof-key-0001",replay_received,quote,contact,consent,source,"request-retry-0001")).stdout)
        assert first==replay and first["quoteNumber"]==f"AIOW-{year}-0001"
        changed=prepare_sql("pg-proof-key-0001",received,{**quote,"changed":True},contact,consent,source); conflict=sql(env,changed,False); assert conflict.returncode!=0 and "AIOW_QUOTE_IDEMPOTENCY_CONFLICT" in conflict.stderr
        second=json.loads(sql(env,prepare_sql("pg-proof-key-0002",received,quote,contact,consent,source)).stdout); assert second["quoteNumber"]==f"AIOW-{year}-0002"
        customer={"from":"offerte@aiow.ai","to":"proof@example.com","subject":"Quote","text":"Quote proof","html":"<p>Quote proof</p>"}; internal={"from":"offerte@aiow.ai","to":"offerte@aiow.ai","subject":"Lead","text":"Lead proof","html":"<p>Lead proof</p>"}; pdf=b"%PDF-proof"; b64=__import__('base64').b64encode(pdf).decode(); digest=hashlib.sha256(pdf).hexdigest()
        def commit(lead,hash_value=digest,base64_value=b64):
            return f"select public.aiow_quote_commit_v1({q(lead.get('request','request-'+lead['key']))},{q(lead['key'])},{q(lead['quoteNumber'])},{q(lead['leadId'])}::uuid,{q(lead['quoteNumber']+'.pdf')},'application/pdf',{q(base64_value)},{q(hash_value)},{q(json.dumps(customer))}::jsonb,{q(json.dumps(internal))}::jsonb,{q(json.dumps(quote))}::jsonb,{q(json.dumps(contact))}::jsonb,{q(json.dumps(source))}::jsonb,'NL')::text;"
        step("commit-replay"); lead={**first,"key":"pg-proof-key-0001","request":"request-retry-0001"}; assert json.loads(sql(env,commit(lead)).stdout)=={"accepted":True}; assert json.loads(sql(env,commit(lead)).stdout)=={"accepted":True}
        counts=sql(env,f"select (select count(*) from quote_documents where lead_id={q(first['leadId'])}::uuid)||','||(select count(*) from mail_outbox where lead_id={q(first['leadId'])}::uuid)||','||(select state from quote_leads where id={q(first['leadId'])}::uuid);").stdout.strip(); assert counts=="1,2,committed"
        bad={**second,"key":"pg-proof-key-0002"}; failed=sql(env,commit(bad,"0"*64),False); assert failed.returncode!=0 and "AIOW_QUOTE_INVALID_PDF" in failed.stderr
        partial=sql(env,f"select (select count(*) from quote_documents where lead_id={q(second['leadId'])}::uuid)||','||(select count(*) from mail_outbox where lead_id={q(second['leadId'])}::uuid)||','||(select state from quote_leads where id={q(second['leadId'])}::uuid);").stdout.strip(); assert partial=="0,0,prepared"
        step("claim-finalize")
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: claimed_batches=list(pool.map(lambda _:sql(env,"select row_to_json(x) from public.aiow_quote_claim_outbox_v1(1,30) x;").stdout.splitlines(),range(2)))
        claimed=[line for batch in claimed_batches for line in batch]; assert len(claimed)==2; jobs=[json.loads(line) for line in claimed]; assert len({job["id"] for job in jobs})==2
        customer_job=next(j for j in jobs if j["kind"]=="customer_quote"); internal_job=next(j for j in jobs if j["kind"]=="internal_lead"); assert customer_job["attachmentBase64"] and internal_job["attachmentBase64"] is None
        assert json.loads(sql(env,f"select public.aiow_quote_outbox_retry_v1({customer_job['id']},{q(customer_job['leaseToken'])}::uuid,'HTTP_503')::text;").stdout)["state"]=="retry"
        assert json.loads(sql(env,f"select public.aiow_quote_outbox_sent_v1({internal_job['id']},{q(internal_job['leaseToken'])}::uuid,'gmail_msg_1')::text;").stdout)=={"accepted":True}
        sql(env,f"update mail_outbox set available_at=clock_timestamp() where id={customer_job['id']};")
        reclaimed=json.loads(sql(env,"select row_to_json(x) from public.aiow_quote_claim_outbox_v1(1,30) x;").stdout); assert reclaimed["id"]==customer_job["id"] and reclaimed["attempts"]==2
        sql(env,f"update mail_outbox set lease_expires_at=clock_timestamp()-interval '1 second' where id={customer_job['id']};")
        assert sql(env,"select row_to_json(x) from public.aiow_quote_claim_outbox_v1(1,30) x;").stdout.strip()==""
        assert sql(env,f"select state||','||(select count(*) from provider_delivery_attempts where outbox_id={customer_job['id']} and outcome='review' and error_code='LEASE_EXPIRED') from mail_outbox where id={customer_job['id']};").stdout.strip()=="review,1"
        pdf2=b"%PDF-proof-2"; b642=__import__('base64').b64encode(pdf2).decode(); digest2=hashlib.sha256(pdf2).hexdigest(); assert json.loads(sql(env,commit({**second,"key":"pg-proof-key-0002"},digest2,b642)).stdout)=={"accepted":True}
        dead_job=json.loads(sql(env,"select row_to_json(x) from public.aiow_quote_claim_outbox_v1(1,30) x;").stdout); assert json.loads(sql(env,f"select public.aiow_quote_outbox_dead_v1({dead_job['id']},{q(dead_job['leaseToken'])}::uuid,'SCHEMA_INVALID')::text;").stdout)=={"accepted":True}
        review_job=json.loads(sql(env,"select row_to_json(x) from public.aiow_quote_claim_outbox_v1(1,30) x;").stdout); assert json.loads(sql(env,f"select public.aiow_quote_outbox_review_v1({review_job['id']},{q(review_job['leaseToken'])}::uuid,'PROVIDER_ACCEPTED_DB_FINALIZE','gmail_review_1')::text;").stdout)=={"accepted":True,"state":"review"}
        step("concurrency"); keys=[f"pg-concurrent-{i:04d}" for i in range(8)]
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(lambda key: json.loads(sql(env,prepare_sql(key,received,quote,contact,consent,source)).stdout),keys))
        numbers=sorted(int(item["quoteNumber"].split("-")[-1]) for item in results); assert len(set(numbers))==8 and numbers==list(range(3,11))
        sql(env,f"insert into quote_sequences(year,next_value) values({year-1},9999) on conflict(year) do update set next_value=excluded.next_value; update quote_sequences set next_value=9998 where year={year};")
        last=json.loads(sql(env,prepare_sql("pg-proof-last-9999",received,quote,contact,consent,source)).stdout); assert last["quoteNumber"]==f"AIOW-{year}-9999"
        exhausted=sql(env,prepare_sql("pg-proof-exhausted",received,quote,contact,consent,source),False); assert exhausted.returncode!=0 and "AIOW_QUOTE_SEQUENCE_EXHAUSTED" in exhausted.stderr
        sentinel=sql(env,"select count(*)||','||(select count(*) from provider_delivery_attempts)||','||(select count(*) from mail_outbox where state='sent')||','||(select count(*) from mail_outbox where state='dead')||','||(select count(*) from mail_outbox where state='review') from quote_leads;").stdout.strip(); assert sentinel=="11,5,1,1,2",sentinel
        print("POSTGRES_QUOTE_ADAPTER_PROOF_PASS roles=least-privilege pgcrypto=extensions sequence=9999 exhausted=rejected prior-year=isolated replay=same conflict=rejected commit=atomic outbox=2 claimers=2-skip-locked retry=backoff sent=1 expired-lease=review-audited dead=1 explicit-review=1 concurrent-prepare=8", flush=True)
    finally:
        step("cleanup")
        if started: run(["pg_ctl","-D",str(data),"-m","fast","-w","stop"],env,False)
        shutil.rmtree(tmp,ignore_errors=True)
if __name__=="__main__": main()
