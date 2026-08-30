begin;

create temporary table aiow_closure_temporary_role_memberships(
 role_name name primary key
) on commit drop;
create temporary table aiow_closure_temporary_schema_create_privileges(
 role_name name primary key
) on commit drop;
do $closure_runtime_reader_capability$
begin
 if not pg_has_role(current_user,'aiow_mail_runtime_reader','SET') then
  insert into aiow_closure_temporary_role_memberships(role_name) values('aiow_mail_runtime_reader');
  execute format('grant %I to %I with admin false, inherit false, set true','aiow_mail_runtime_reader',current_user);
 end if;
 if not has_schema_privilege('aiow_mail_runtime_reader','public','CREATE') then
  insert into aiow_closure_temporary_schema_create_privileges(role_name) values('aiow_mail_runtime_reader');
  grant create on schema public to aiow_mail_runtime_reader;
 end if;
end $closure_runtime_reader_capability$;

-- The browser hashes the complete validated BookingRequest, including its
-- schemaKind discriminator. Keep the effective database writer byte-identical.
create or replace function public.aiow_booking_commit_v1(p_request_id uuid,p_idempotency_key text,p_payload_digest text,p_booking jsonb,p_source jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_bid uuid:=extensions.gen_random_uuid(); v_cid uuid:=extensions.gen_random_uuid(); v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_customer jsonb; v_internal jsonb; v_canonical jsonb; v_digest text; v_customer_id uuid:=extensions.gen_random_uuid(); v_internal_id uuid:=extensions.gen_random_uuid(); v_preference text; v_subject text; v_text text; v_html text;
begin
 if p_request_id is null or not public.aiow_booking_valid_v1(p_booking)
  or not public.aiow_jsonb_exact_keys_v1(p_source,array['route','locale'])
  or p_source<>jsonb_build_object('route',case p_booking->>'locale' when 'nl' then '/' else '/en' end,'locale',p_booking->>'locale')
 then raise exception using errcode='22023',message='AIOW_BOOKING_INVALID'; end if;
 v_canonical:=jsonb_build_object('schemaKind',p_booking->'schemaKind','subject',p_booking->'subject','details',btrim(p_booking->>'details'),'date',p_booking->'date','slot',p_booking->'slot',
  'name',btrim(p_booking->>'name'),'email',lower(p_booking->>'email'),'company',btrim(p_booking->>'company'),'locale',p_booking->'locale',
  'consentAccepted',p_booking->'consentAccepted','consentVersion',p_booking->'consentVersion');
 v_digest:=public.aiow_sha256_json_v1(v_canonical);
 if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('booking',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('booking',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 insert into public.commercial_leads(id,source,source_id,route,locale,display_name,email,organisation,sla_due_at,created_at,updated_at)
 values(v_cid,'booking',v_bid,p_source->>'route',p_source->>'locale',left(btrim(p_booking->>'name'),100),lower(p_booking->>'email'),nullif(left(btrim(p_booking->>'company'),120),''),public.aiow_next_business_day_v1(v_now),v_now,v_now);
 insert into public.booking_leads(id,commercial_lead_id,request_id,payload_digest,payload,created_at) values(v_bid,v_cid,p_request_id,v_digest,p_booking,v_now);
 v_preference:=(p_booking->>'date')||' '||(p_booking->>'slot');
 if p_booking->>'locale'='nl' then
  v_subject:='Uw afspraakvoorkeur is ontvangen';
  v_text:='Beste '||btrim(p_booking->>'name')||E',\n\nWe hebben uw voorkeursdatum en -tijd ontvangen.\nUw voorkeur: '||v_preference||E'\nEen medewerker bevestigt de afspraak afzonderlijk.';
 else
  v_subject:='Your appointment preference has been received';
  v_text:='Dear '||btrim(p_booking->>'name')||E',\n\nWe have received your preferred date and time.\nYour preference: '||v_preference||E'\nA member of our team will confirm the appointment separately.';
 end if;
 v_html:='<p>'||public.aiow_html_escape_v2(split_part(v_text,E'\n',1))||'</p><p>'||public.aiow_html_escape_v2(split_part(v_text,E'\n',3))||'</p><p>'||public.aiow_html_escape_v2(split_part(v_text,E'\n',4))||'</p><p>'||public.aiow_html_escape_v2(split_part(v_text,E'\n',5))||'</p>';
 v_customer:=public.aiow_mail_job_build_v2(v_customer_id,v_cid,'customer_booking',jsonb_build_array(lower(p_booking->>'email')),v_subject,v_text,v_html,'[]'::jsonb,v_now);
 v_internal:=public.aiow_mail_job_build_v2(v_internal_id,v_cid,'internal_booking',jsonb_build_array('info@aiow.io'),'Nieuwe afspraakvoorkeur',
  'Nieuwe afspraakvoorkeur: '||v_preference||E'\nNaam: '||btrim(p_booking->>'name')||E'\nE-mail: '||lower(p_booking->>'email')||E'\nOnderwerp: '||(p_booking->>'subject')||E'\nDetails: '||btrim(p_booking->>'details'),
  '<p>Nieuwe afspraakvoorkeur: '||public.aiow_html_escape_v2(v_preference)||'</p><p>Naam: '||public.aiow_html_escape_v2(btrim(p_booking->>'name'))||'</p><p>E-mail: '||public.aiow_html_escape_v2(lower(p_booking->>'email'))||'</p>','[]'::jsonb,v_now);
 if not public.aiow_mail_job_valid_v1(v_customer,'customer_booking',v_cid) or not public.aiow_mail_job_valid_v1(v_internal,'internal_booking',v_cid)
 then raise exception using errcode='22023',message='AIOW_MAIL_INVALID'; end if;
 insert into public.commercial_mail_outbox(id,commercial_lead_id,kind,payload,payload_sha256,next_attempt_at)
 values(v_customer_id,v_cid,'customer_booking',v_customer,v_customer->>'payloadSha256',v_now),(v_internal_id,v_cid,'internal_booking',v_internal,v_internal->>'payloadSha256',v_now);
 v_ack:=jsonb_build_object('schemaKind','booking_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_cid::text),'revision',1,
  'preference',jsonb_build_object('date',p_booking->>'date','slot',p_booking->>'slot','subject',p_booking->>'subject'),'durableAt',public.aiow_iso_v1(v_now),'replayed',false);
 perform public.aiow_idempotency_store_v1('booking',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

-- Convert every still-actionable pre-V2 row to one bounded V2 identity and
-- digest. Lease metadata remains authoritative in columns and is projected by
-- the loader, so an in-flight row remains claim/finalize compatible.
with normalized as (
 select o.id,
  o.payload || jsonb_build_object(
   'schemaKind','mail_job','jobId',lower(o.id::text),'commercialLeadId',lower(o.commercial_lead_id::text),'kind',o.kind,
   'from','info@aiow.io','to',case when o.kind in ('internal_booking','internal_lead') then jsonb_build_array('info@aiow.io') else o.payload->'to' end
  ) as payload
 from public.commercial_mail_outbox o
 where o.state in ('pending','retry','leased','review')
), digested as (
 select id,jsonb_set(payload,'{payloadSha256}',to_jsonb(public.aiow_mail_payload_digest_v2(payload))) as payload
 from normalized
)
update public.commercial_mail_outbox o
set payload=d.payload,payload_sha256=d.payload->>'payloadSha256'
from digested d where o.id=d.id;

-- Effective lease readers must bind to the V2 digest selected by 1303/0004.
set role aiow_mail_runtime_reader;
create or replace function public.aiow_mail_outbox_load_leased_job_v1(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_expected_revision bigint,p_payload_digest text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v public.commercial_mail_outbox%rowtype;
begin
 select * into v from public.commercial_mail_outbox where id=p_job_id;
 if not found or v.state<>'leased' or v.lease_owner<>p_lease_owner or v.lease_token<>p_lease_token or v.revision<>p_expected_revision
   or v.payload_sha256<>p_payload_digest or public.aiow_mail_payload_digest_v2(v.payload)<>p_payload_digest or v.lease_expires_at<=transaction_timestamp()
 then raise exception using errcode='P0001',message='AIOW_OUTBOX_LEASE_CONFLICT'; end if;
 return v.payload || jsonb_build_object('schemaKind','mail_job','jobId',lower(v.id::text),'commercialLeadId',lower(v.commercial_lead_id::text),'kind',v.kind,'payloadSha256',v.payload_sha256,'attempt',v.attempts,'leaseOwner',v.lease_owner,'leaseToken',lower(v.lease_token::text),'leaseExpiresAt',public.aiow_iso_v1(v.lease_expires_at));
end $$;

create or replace function public.aiow_mail_provider_gate_load_for_lease_v1(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_expected_revision bigint,p_payload_digest text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_job public.commercial_mail_outbox%rowtype; v_gate public.commercial_provider_gates%rowtype; v_target jsonb;
begin
 select * into v_job from public.commercial_mail_outbox where id=p_job_id;
 if not found or v_job.state<>'leased' or v_job.lease_owner<>p_lease_owner or v_job.lease_token<>p_lease_token or v_job.revision<>p_expected_revision
   or v_job.payload_sha256<>p_payload_digest or public.aiow_mail_payload_digest_v2(v_job.payload)<>p_payload_digest or v_job.lease_expires_at<=transaction_timestamp()
 then raise exception using errcode='P0001',message='AIOW_OUTBOX_LEASE_CONFLICT'; end if;
 select * into v_gate from public.commercial_provider_gates where gate_id='mail_provider_production_v1';
 if not found or v_gate.state<>'activated' or v_gate.expires_at<=transaction_timestamp() or v_gate.owner_approved_by<>'richard' then raise exception using errcode='42501',message='AIOW_GATE_UNAVAILABLE'; end if;
 v_target:=v_gate.target;
 if v_target->>'schemaKind'<>'provider_gate_record' or v_target->>'gateId'<>v_gate.gate_id or v_target->>'state'<>v_gate.state
   or (v_target->>'revision')::bigint<>v_gate.revision or v_target->>'evidenceSha256'<>v_gate.evidence_sha256
   or v_target->>'approvalBindingSha256'<>v_gate.approval_binding_sha256 or public.aiow_provider_gate_binding_v1(v_target)<>v_gate.approval_binding_sha256
   or v_target->>'secretPresent'<>'true' or v_target->>'oauthClientCredentialsPresent'<>'true'
   or v_target->>'exchangeApplicationRole'<>'Application Mail.Send' or v_target->>'exchangeRbacSenderInScope'<>'true'
   or v_target->>'exchangeRbacControlMailboxInScope'<>'false' or v_target->>'entraUnscopedMailSendAssigned'<>'false'
   or v_target->>'runtimeCapability'<>'mail_send' or v_target->'fallbackProvider'<>'null'::jsonb
 then raise exception using errcode='42501',message='AIOW_GATE_UNAVAILABLE'; end if;
 return v_target;
end $$;

-- CREATE OR REPLACE retains the runtime-reader owner, so only that owner can
-- close and re-open these entrypoints on managed Supabase.
revoke all on function public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) from public;
do $runtime_reader_loader_acl$
begin
 if exists(select 1 from pg_roles where rolname='anon') then
  revoke all on function public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) from anon;
 end if;
 if exists(select 1 from pg_roles where rolname='authenticated') then
  revoke all on function public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) from authenticated;
 end if;
 if exists(select 1 from pg_roles where rolname='service_role') then
  revoke all on function public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) from service_role;
  grant execute on function public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) to service_role;
 end if;
end $runtime_reader_loader_acl$;
reset role;

-- invalid_payload is produced by the local closed validator before Graph can be
-- called. It may therefore dead-letter without a dispatch marker. Every result
-- that could follow a provider call remains marker-bound.
create or replace function public.aiow_outbox_finalize_v2(p_job_id uuid,p_owner text,p_token uuid,p_digest text,p_revision bigint,p_result jsonb,p_category text,p_state text,p_next timestamptz default null) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v public.commercial_mail_outbox%rowtype; v_effective_state text; begin
 if not public.aiow_provider_result_valid_v1(p_result,p_category) then raise exception using errcode='22023',message='AIOW_OUTBOX_RESULT_INVALID'; end if;
 if not ((p_category='accepted' and p_state='sent') or (p_category='transient_pre_acceptance' and p_state='retry') or (p_category='permanent_pre_acceptance' and p_state='dead') or (p_category='ambiguous' and p_state='review'))
 then raise exception using errcode='22023',message='AIOW_OUTBOX_RESULT_INVALID'; end if;
 select * into v from public.commercial_mail_outbox where id=p_job_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 if v.state<>'leased' or v.lease_owner<>p_owner or v.lease_token<>p_token or v.lease_expires_at<transaction_timestamp()
  or (v.dispatch_started_at is null and not (p_category='permanent_pre_acceptance' and p_state='dead' and p_result->>'code'='invalid_payload'))
  or v.payload_sha256<>p_digest or public.aiow_mail_payload_digest_v2(v.payload)<>p_digest or v.revision<>p_revision
 then raise exception using errcode='40001',message='AIOW_OUTBOX_LEASE_CONFLICT'; end if;
 v_effective_state:=case when p_category='transient_pre_acceptance' and v.attempts>=5 then 'dead' else p_state end;
 if p_category='transient_pre_acceptance' and v.attempts<5 and p_next<>v.updated_at+make_interval(secs=>case v.attempts when 1 then 60 when 2 then 300 when 3 then 1800 when 4 then 7200 end)
  or p_category='transient_pre_acceptance' and v.attempts>=5 and p_next is not null
 then raise exception using errcode='22023',message='AIOW_OUTBOX_BACKOFF_INVALID'; end if;
 update public.commercial_mail_outbox set state=v_effective_state,revision=revision+1,lease_owner=null,lease_token=null,lease_expires_at=null,
  next_attempt_at=case when v_effective_state='retry' then p_next else null end,dispatch_started_at=case when v_effective_state='retry' then null else dispatch_started_at end,provider_result=p_result,updated_at=transaction_timestamp()
 where id=p_job_id returning * into v;
 return public.aiow_outbox_projection_v2(v);
end $$;

-- 0004 accidentally replaced the locked writer with an unlocked definition.
-- Serialize by endpoint/key before replay, then recheck after the gate row lock.
create or replace function public.aiow_provider_gate_write_v1(p_idempotency_key text,p_payload_digest text,p_gate jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_old public.commercial_provider_gates%rowtype; v_audit uuid; begin
 perform public.aiow_idempotency_lock_v1('provider_gate',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('provider_gate',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if p_payload_digest<>public.aiow_sha256_json_v1(p_gate) then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 if not public.aiow_jsonb_exact_keys_v1(p_gate,array['schemaKind','state','gateId','environment','provider','tenantId','applicationId','mailbox','sender','controlMailbox','secretPresent','oauthClientCredentialsPresent','exchangeApplicationRole','exchangeRbacSenderInScope','exchangeRbacControlMailboxInScope','entraUnscopedMailSendAssigned','evidenceSha256','revision','ownerApprovedBy','approvedAt','expiresAt','runtimeCapability','fallbackProvider','approvalBindingSha256'])
  or p_gate->>'schemaKind'<>'provider_gate_record' or p_gate->>'gateId'<>'mail_provider_production_v1' or p_gate->>'environment'<>'production' or p_gate->>'provider'<>'microsoft_graph'
  or (p_gate->>'tenantId')::uuid is null or (p_gate->>'applicationId')::uuid is null or p_gate->>'mailbox'<>'info@aiow.io' or p_gate->>'sender'<>'info@aiow.io' or not public.aiow_email_valid_v1(p_gate->>'controlMailbox')
  or p_gate->>'exchangeApplicationRole'<>'Application Mail.Send' or p_gate->>'runtimeCapability'<>'mail_send' or p_gate->'fallbackProvider'<>'null'::jsonb
  or p_gate->>'evidenceSha256'!~'^[0-9a-f]{64}$' then raise exception using errcode='22023',message='AIOW_GATE_TARGET_INVALID'; end if;
 if p_gate->>'state' in ('approved','activated') and (p_gate->>'secretPresent'<>'true' or p_gate->>'oauthClientCredentialsPresent'<>'true' or p_gate->>'exchangeRbacSenderInScope'<>'true' or p_gate->>'exchangeRbacControlMailboxInScope'<>'false' or p_gate->>'entraUnscopedMailSendAssigned'<>'false' or p_gate->>'ownerApprovedBy'<>'richard' or (p_gate->>'approvedAt')::timestamptz>transaction_timestamp() or (p_gate->>'expiresAt')::timestamptz<=transaction_timestamp() or p_gate->>'approvalBindingSha256'<>public.aiow_provider_gate_binding_v1(p_gate))
 then raise exception using errcode='42501',message='AIOW_GATE_BINDING_INVALID'; end if;
 select * into v_old from public.commercial_provider_gates where gate_id=p_gate->>'gateId' for update;
 v_replay:=public.aiow_idempotency_replay_v1('provider_gate',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if found and (p_gate->>'revision')::bigint<>v_old.revision+1 then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 if not found and (p_gate->>'revision')::bigint<>1 then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 v_audit:=public.aiow_audit_v1(null,'provider_gate_write',jsonb_build_object('gateId',p_gate->>'gateId','revision',(p_gate->>'revision')::bigint,'state',p_gate->>'state'));
 insert into public.commercial_provider_gates(gate_id,state,target,evidence_sha256,expires_at,revision,approved_at,owner_approved_by,approval_binding_sha256,audit_id)
 values(p_gate->>'gateId',p_gate->>'state',p_gate,p_gate->>'evidenceSha256',(p_gate->>'expiresAt')::timestamptz,(p_gate->>'revision')::bigint,(p_gate->>'approvedAt')::timestamptz,p_gate->>'ownerApprovedBy',p_gate->>'approvalBindingSha256',v_audit)
 on conflict(gate_id) do update set state=excluded.state,target=excluded.target,evidence_sha256=excluded.evidence_sha256,expires_at=excluded.expires_at,revision=excluded.revision,approved_at=excluded.approved_at,owner_approved_by=excluded.owner_approved_by,approval_binding_sha256=excluded.approval_binding_sha256,audit_id=excluded.audit_id;
 perform public.aiow_idempotency_store_v1('provider_gate',p_idempotency_key,p_payload_digest,p_gate); return p_gate;
end $$;

-- Remove the obsolete unlocked seven-argument overload before rebuilding the
-- effective allow-list.
revoke all on function public.aiow_mail_outbox_resolve_v2(text,text,uuid,bigint,text,text,text) from public;
do $old_acl$ begin
 if exists(select 1 from pg_roles where rolname='anon') then revoke all on function public.aiow_mail_outbox_resolve_v2(text,text,uuid,bigint,text,text,text) from anon; end if;
 if exists(select 1 from pg_roles where rolname='authenticated') then revoke all on function public.aiow_mail_outbox_resolve_v2(text,text,uuid,bigint,text,text,text) from authenticated; end if;
 if exists(select 1 from pg_roles where rolname='service_role') then revoke all on function public.aiow_mail_outbox_resolve_v2(text,text,uuid,bigint,text,text,text) from service_role; end if;
end $old_acl$;
drop function public.aiow_mail_outbox_resolve_v2(text,text,uuid,bigint,text,text,text);

-- Fail closed over the effective aiow_* catalog, including helpers introduced
-- after the original bulk ACL closure, then grant only documented entrypoints.
do $acl$
declare r record; begin
 for r in select p.oid,p.proname,pg_get_function_identity_arguments(p.oid) args from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'aiow_%' and p.proowner=(select oid from pg_roles where rolname=current_user) loop
  execute format('revoke all on function public.%I(%s) from public',r.proname,r.args);
  if exists(select 1 from pg_roles where rolname='anon') then execute format('revoke all on function public.%I(%s) from anon',r.proname,r.args); end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then execute format('revoke all on function public.%I(%s) from authenticated',r.proname,r.args); end if;
  if exists(select 1 from pg_roles where rolname='service_role') then execute format('revoke all on function public.%I(%s) from service_role',r.proname,r.args); end if;
 end loop;
 if exists(select 1 from pg_roles where rolname='service_role') then
  grant execute on function
   public.aiow_quote_prepare_v1(uuid,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb),
   public.aiow_quote_commit_v1(uuid,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text),
   public.aiow_booking_commit_v1(uuid,text,text,jsonb,jsonb),
   public.aiow_commercial_queue_v1(timestamptz,uuid,integer),
   public.aiow_commercial_mutate_v1(text,text,jsonb),
   public.aiow_commercial_report_v1(date,date),
   public.aiow_commercial_event_v1(text,text,jsonb),
   public.aiow_mail_outbox_claim_v2(text,integer,timestamptz),
   public.aiow_mail_outbox_sent_v2(uuid,text,uuid,text,bigint,jsonb),
   public.aiow_mail_outbox_retry_v2(uuid,text,uuid,text,bigint,jsonb,timestamptz),
   public.aiow_mail_outbox_dead_v2(uuid,text,uuid,text,bigint,jsonb),
   public.aiow_mail_outbox_review_v2(uuid,text,uuid,text,bigint,jsonb),
   public.aiow_mail_outbox_resolve_v2(text,text,jsonb),
   public.aiow_commercial_retention_dry_run_v1(timestamptz),
   public.aiow_mail_outbox_recover_stale_v2(text,timestamptz,integer),
   public.aiow_mail_outbox_cancel_v2(uuid,uuid,bigint,text,text,text,text),
   public.aiow_provider_gate_write_v1(text,text,jsonb),
   public.aiow_active_customer_relation_set_v1(uuid,bigint,text,text,boolean,text),
   public.aiow_quote_abandon_expired_v1(timestamptz,integer),
   public.aiow_quote_prepared_load_v1(uuid,text,uuid,uuid,text),
   public.aiow_quote_committed_pdf_load_v1(uuid,text,uuid,uuid,text,text),
   public.aiow_mail_outbox_dispatch_v2(uuid,text,uuid,text,bigint),
   public.aiow_analytics_retention_purge_v1(boolean,timestamptz)
  to service_role;
 end if;
 if exists(select 1 from pg_roles where rolname='aiow_mail_runtime_reader') then
  grant execute on function public.aiow_mail_payload_digest_v2(jsonb),public.aiow_provider_gate_binding_bytes_v2(jsonb) to aiow_mail_runtime_reader;
 end if;
end $acl$;

do $closure_restore_runtime_reader_capability$
declare
 v_role name;
begin
 for v_role in select role_name from aiow_closure_temporary_schema_create_privileges
 loop
  execute format('revoke create on schema public from %I',v_role);
 end loop;
 for v_role in select role_name from aiow_closure_temporary_role_memberships
 loop
  execute format('revoke %I from %I',v_role,current_user);
 end loop;
end $closure_restore_runtime_reader_capability$;

commit;
