begin;

-- Durable outcomes describe the original write. Mark only the returned copy
-- so every subsequent invocation accurately reports that it was replayed.
create or replace function public.aiow_idempotency_replay_v1(p_endpoint text,p_key text,p_digest text) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v public.commercial_idempotency%rowtype; begin
 select * into v from public.commercial_idempotency where endpoint=p_endpoint and idempotency_key=p_key for update;
 if not found then return null; end if;
 if v.payload_digest<>p_digest then raise exception using errcode='23505',message='AIOW_IDEMPOTENCY_CONFLICT'; end if;
 return case when v.outcome ? 'replayed' then jsonb_set(v.outcome,'{replayed}','true'::jsonb,false) else v.outcome end;
end $$;

-- Cross-runtime canonical digest remediation. Every HTTP endpoint hashes the
-- complete, schema-validated request object; PostgreSQL hashes the same jsonb.
create or replace function public.aiow_quote_prepare_v1(
 p_request_id uuid,p_idempotency_key text,p_received_at timestamptz,p_country text,
 p_quote jsonb,p_contact jsonb,p_consent jsonb,p_source jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_now timestamptz:=transaction_timestamp(); v_year integer; v_hash text; v_q public.quote_leads%rowtype;
 v_seq integer; v_qid uuid:=extensions.gen_random_uuid(); v_cid uuid:=extensions.gen_random_uuid(); v_ack jsonb; v_replay jsonb;
begin
 if p_request_id is null or p_received_at is null or abs(extract(epoch from(v_now-p_received_at)))>300
  or not public.aiow_quote_valid_v1(p_quote,p_contact,p_consent,p_source,p_country)
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_PREPARE'; end if;
 v_hash:=public.aiow_sha256_json_v1(p_quote);
 perform public.aiow_idempotency_lock_v1('quote_prepare',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('quote_prepare',p_idempotency_key,v_hash);
 if v_replay is not null then return v_replay; end if;
 select * into v_q from public.quote_leads where idempotency_key=p_idempotency_key for update;
 if found then
  if v_q.request_payload_hash<>v_hash then raise exception using errcode='23505',message='AIOW_QUOTE_IDEMPOTENCY_CONFLICT'; end if;
  v_ack:=jsonb_build_object('schemaKind','quote_prepare_ack','accepted',true,'requestId',lower(v_q.request_id),'leadId',lower(v_q.id::text),
   'commercialLeadId',lower(v_q.commercial_lead_id::text),'quoteNumber',v_q.quote_number,'state',v_q.state,'expiresAt',public.aiow_iso_v1(v_q.expires_at),'replayed',true);
  perform public.aiow_idempotency_store_v1('quote_prepare',p_idempotency_key,v_hash,v_ack); return v_ack;
 end if;
 v_year:=extract(year from v_now at time zone 'Europe/Amsterdam');
 insert into public.quote_sequences(year,next_value,updated_at) values(v_year,1,v_now)
 on conflict(year) do update set next_value=public.quote_sequences.next_value+1,updated_at=excluded.updated_at where public.quote_sequences.next_value<9999
 returning next_value into v_seq;
 if v_seq is null then raise exception using errcode='P0001',message='AIOW_QUOTE_SEQUENCE_EXHAUSTED'; end if;
 insert into public.commercial_leads(id,source,source_id,unread,route,locale,display_name,email,phone,organisation,sla_due_at,created_at,updated_at)
 values(v_cid,'quote',v_qid,false,p_source->>'route',p_source->>'locale',left(btrim(p_contact->>'name'),100),lower(p_contact->>'email'),
  nullif(left(btrim(p_contact->>'phone'),40),''),nullif(left(btrim(p_contact->>'company'),120),''),v_now,v_now,v_now);
 insert into public.quote_leads(id,idempotency_key,request_id,quote_number,quote_year,quote_sequence,state,request_payload_hash,normalized_quote,contact,consent,source,country,received_at,prepared_at,commercial_lead_id,expires_at)
 values(v_qid,p_idempotency_key,lower(p_request_id::text),'AIOW-'||v_year||'-'||lpad(v_seq::text,4,'0'),v_year,v_seq,'prepared',v_hash,p_quote,p_contact,p_consent,p_source,p_country,p_received_at,v_now,v_cid,v_now+interval '24 hours') returning * into v_q;
 v_ack:=jsonb_build_object('schemaKind','quote_prepare_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_q.id::text),
  'commercialLeadId',lower(v_cid::text),'quoteNumber',v_q.quote_number,'state','prepared','expiresAt',public.aiow_iso_v1(v_q.expires_at),'replayed',false);
 perform public.aiow_idempotency_store_v1('quote_prepare',p_idempotency_key,v_hash,v_ack); return v_ack;
end $$;

create or replace function public.aiow_booking_commit_v1(p_request_id uuid,p_idempotency_key text,p_payload_digest text,p_booking jsonb,p_source jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_bid uuid:=extensions.gen_random_uuid(); v_cid uuid:=extensions.gen_random_uuid(); v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_customer jsonb; v_internal jsonb; v_digest text;
begin
 if p_request_id is null or not public.aiow_booking_valid_v1(p_booking)
  or not public.aiow_jsonb_exact_keys_v1(p_source,array['route','locale'])
  or p_source<>jsonb_build_object('route',case p_booking->>'locale' when 'nl' then '/' else '/en' end,'locale',p_booking->>'locale')
 then raise exception using errcode='22023',message='AIOW_BOOKING_INVALID'; end if;
 v_digest:=public.aiow_sha256_json_v1(p_booking);
 if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('booking',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('booking',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 insert into public.commercial_leads(id,source,source_id,route,locale,display_name,email,organisation,sla_due_at,created_at,updated_at)
 values(v_cid,'booking',v_bid,p_source->>'route',p_source->>'locale',left(btrim(p_booking->>'name'),100),lower(p_booking->>'email'),nullif(left(btrim(p_booking->>'company'),120),''),public.aiow_next_business_day_v1(v_now),v_now,v_now);
 insert into public.booking_leads(id,commercial_lead_id,request_id,payload_digest,payload,created_at) values(v_bid,v_cid,p_request_id,v_digest,p_booking,v_now);
 v_customer:=jsonb_build_object('schemaKind','mail_job','jobId',lower(extensions.gen_random_uuid()::text),'commercialLeadId',lower(v_cid::text),'kind','customer_booking','from','booking@aiow.ai','to',jsonb_build_array(lower(p_booking->>'email')),'subject','Booking ontvangen','text','Booking received','html','<p>Booking received</p>','attachments','[]'::jsonb,'payloadSha256',repeat('0',64),'attempt',1,'leaseOwner','pending','leaseToken',lower(extensions.gen_random_uuid()::text),'leaseExpiresAt',public.aiow_iso_v1(v_now));
 v_customer:=jsonb_set(v_customer,'{payloadSha256}',to_jsonb(public.aiow_sha256_json_v1(v_customer-'payloadSha256')));
 v_internal:=jsonb_build_object('schemaKind','mail_job','jobId',lower(extensions.gen_random_uuid()::text),'commercialLeadId',lower(v_cid::text),'kind','internal_booking','from','booking@aiow.ai','to',jsonb_build_array('booking@aiow.ai'),'subject','Nieuwe booking','text','New booking','html','<p>New booking</p>','attachments','[]'::jsonb,'payloadSha256',repeat('0',64),'attempt',1,'leaseOwner','pending','leaseToken',lower(extensions.gen_random_uuid()::text),'leaseExpiresAt',public.aiow_iso_v1(v_now));
 v_internal:=jsonb_set(v_internal,'{payloadSha256}',to_jsonb(public.aiow_sha256_json_v1(v_internal-'payloadSha256')));
 if not public.aiow_mail_job_valid_v1(v_customer,'customer_booking',v_cid) or not public.aiow_mail_job_valid_v1(v_internal,'internal_booking',v_cid) then raise exception using errcode='22023',message='AIOW_MAIL_INVALID'; end if;
 insert into public.commercial_mail_outbox(commercial_lead_id,kind,payload,payload_sha256,next_attempt_at)
 values(v_cid,'customer_booking',v_customer,public.aiow_sha256_json_v1(v_customer),v_now),(v_cid,'internal_booking',v_internal,public.aiow_sha256_json_v1(v_internal),v_now);
 v_ack:=jsonb_build_object('schemaKind','booking_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_cid::text),'revision',1,
  'preference',jsonb_build_object('date',p_booking->>'date','slot',p_booking->>'slot','subject',p_booking->>'subject'),'durableAt',public.aiow_iso_v1(v_now),'replayed',false);
 perform public.aiow_idempotency_store_v1('booking',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

create or replace function public.aiow_commercial_event_v1(p_idempotency_key text,p_payload_digest text,p_event jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v_replay jsonb; v_id uuid; v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_name text; v_route text; v_locale text; v_eid text; v_variant text; v_digest text; v_existing public.commercial_events%rowtype; begin
 if not public.aiow_event_valid_v1(p_event,v_now) then raise exception using errcode='22023',message='AIOW_EVENT_INVALID'; end if;
 v_digest:=public.aiow_sha256_json_v1(p_event);
 if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('event_ingest',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('event_ingest',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 v_id:=(p_event->>'eventId')::uuid; select * into v_existing from public.commercial_events where event_id=v_id for update;
 if found then
  if v_existing.payload_digest<>v_digest then raise exception using errcode='23505',message='AIOW_EVENT_CONFLICT'; end if;
  select outcome into v_ack from public.commercial_idempotency where endpoint='event_ingest' and outcome->>'eventId'=lower(v_id::text) order by created_at limit 1;
  if v_ack is null then v_ack:=jsonb_build_object('schemaKind','analytics_ack','accepted',true,'eventId',lower(v_id::text),'deduplicated',false,'storedAt',public.aiow_iso_v1(v_existing.occurred_at)); end if;
  perform public.aiow_idempotency_store_v1('event_ingest',p_idempotency_key,v_digest,v_ack); return v_ack;
 end if;
 v_name:=p_event->>'event'; v_route:=p_event->>'route'; v_locale:=p_event->>'locale'; v_eid:=coalesce(p_event#>>'{experiment,experimentId}','__none__'); v_variant:=coalesce(p_event#>>'{experiment,variant}','__none__');
 insert into public.commercial_events(event_id,payload_digest,event,occurred_at,expires_at) values(v_id,v_digest,p_event,(p_event->>'occurredAt')::timestamptz,(p_event->>'occurredAt')::timestamptz+interval '30 days');
 insert into public.commercial_event_daily(day,event_name,route,locale,experiment_id,variant,count) values(((p_event->>'occurredAt')::timestamptz at time zone 'UTC')::date,v_name,v_route,v_locale,v_eid,v_variant,1)
 on conflict(day,event_name,route,locale,experiment_id,variant) do update set count=public.commercial_event_daily.count+1;
 v_ack:=jsonb_build_object('schemaKind','analytics_ack','accepted',true,'eventId',lower(v_id::text),'deduplicated',false,'storedAt',public.aiow_iso_v1(v_now));
 perform public.aiow_idempotency_store_v1('event_ingest',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

create or replace function public.aiow_commercial_mutate_v1(p_idempotency_key text,p_payload_digest text,p_mutation jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_lead public.commercial_leads%rowtype; v_before bigint; v_now timestamptz:=transaction_timestamp(); v_op text; v_audit uuid; v_effect jsonb; v_ack jsonb; v_to text; v_allowed boolean; v_digest text;
begin
 if jsonb_typeof(p_mutation)<>'object' or p_mutation->>'idempotencyKey'<>p_idempotency_key then raise exception using errcode='22023',message='AIOW_MUTATION_INVALID'; end if;
 v_digest:=public.aiow_sha256_json_v1(p_mutation);
 if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('ops_mutation',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('ops_mutation',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 select * into v_lead from public.commercial_leads where id=(p_mutation->>'leadId')::uuid for update;
 if not found then raise exception using errcode='P0001',message='AIOW_LEAD_NOT_FOUND'; end if;
 v_replay:=public.aiow_idempotency_replay_v1('ops_mutation',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 if v_lead.revision<>(p_mutation->>'expectedRevision')::bigint then
  raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT',detail=jsonb_build_object('schemaKind','revision_conflict','code','revision_conflict','expectedRevision',(p_mutation->>'expectedRevision')::bigint,'currentRevision',v_lead.revision,'current',public.aiow_lead_projection_v1(v_lead))::text;
 end if;
 v_before:=v_lead.revision; v_op:=p_mutation->>'operation';
 if v_op='mark_read' then
  if p_mutation->>'unread'<>'false' or not v_lead.unread then raise exception using errcode='22023',message='AIOW_MUTATION_NOOP'; end if;
  update public.commercial_leads set unread=false,revision=revision+1,updated_at=v_now where id=v_lead.id; v_effect:=jsonb_build_object('unread',false);
 elsif v_op='set_priority' then
  if p_mutation->>'priority' not in ('normal','high','urgent') or p_mutation->>'priority'=v_lead.priority then raise exception using errcode='22023',message='AIOW_MUTATION_NOOP'; end if;
  update public.commercial_leads set priority=p_mutation->>'priority',revision=revision+1,updated_at=v_now where id=v_lead.id; v_effect:=jsonb_build_object('priority',p_mutation->>'priority');
 elsif v_op='set_next_action' then
  if v_lead.status in ('won','lost') then raise exception using errcode='22023',message='AIOW_MUTATION_TERMINAL'; end if;
  if p_mutation->>'nextActionAt' is not null and (p_mutation->>'nextActionAt')::timestamptz<=v_now then raise exception using errcode='22023',message='AIOW_MUTATION_PAST_ACTION'; end if;
  update public.commercial_leads set next_action_at=(p_mutation->>'nextActionAt')::timestamptz,revision=revision+1,updated_at=v_now where id=v_lead.id; v_effect:=jsonb_build_object('nextActionAt',p_mutation->'nextActionAt');
 elsif v_op='set_legal_hold' then
  if (p_mutation->>'enabled')::boolean=v_lead.legal_hold or nullif(btrim(p_mutation->>'reason'),'') is null then raise exception using errcode='22023',message='AIOW_MUTATION_NOOP'; end if;
  update public.commercial_leads set legal_hold=(p_mutation->>'enabled')::boolean,revision=revision+1,updated_at=v_now where id=v_lead.id; v_effect:=jsonb_build_object('legalHold',(p_mutation->>'enabled')::boolean);
 elsif v_op='transition_status' then
  v_to:=p_mutation->>'status';
  v_allowed:=case v_lead.status when 'new' then v_to in ('qualified','awaiting_info','scan_planned','lost') when 'qualified' then v_to in ('awaiting_info','scan_planned','proposal','lost') when 'awaiting_info' then v_to in ('qualified','scan_planned','lost') when 'scan_planned' then v_to in ('proposal','won','lost') when 'proposal' then v_to in ('won','lost') when 'lost' then v_to='qualified' else false end;
  if not v_allowed or (v_lead.status='lost' and nullif(btrim(p_mutation->>'reopenReason'),'') is null) then raise exception using errcode='22023',message='AIOW_TRANSITION_DENIED'; end if;
  update public.commercial_leads set status=v_to,next_action_at=case when v_to in ('won','lost') then null else next_action_at end,
   terminal_at=case when v_lead.status='lost' and v_to='qualified' then null when v_to in ('won','lost') then v_now else terminal_at end,
   abandoned_at=case when v_lead.status='lost' and v_to='qualified' then null else abandoned_at end,revision=revision+1,updated_at=v_now where id=v_lead.id; v_effect:=jsonb_build_object('status',v_to);
 elsif v_op='resolve_outbox' then raise exception using errcode='22023',message='AIOW_USE_OUTBOX_RESOLVE_RPC';
 else raise exception using errcode='22023',message='AIOW_MUTATION_INVALID_OPERATION'; end if;
 select * into v_lead from public.commercial_leads where id=v_lead.id;
 v_audit:=public.aiow_audit_v1(v_lead.id,v_op,jsonb_build_object('beforeRevision',v_before,'afterRevision',v_lead.revision,'idempotencyKeyHash',encode(extensions.digest(convert_to(p_idempotency_key,'UTF8'),'sha256'),'hex')));
 v_ack:=jsonb_build_object('schemaKind','ops_mutation_ack','accepted',true,'projection',public.aiow_lead_projection_v1(v_lead),'previousRevision',v_before,'revision',v_lead.revision,'actorId','richard','serverTime',public.aiow_iso_v1(v_now),'auditId',lower(v_audit::text),'replayed',false,'operation',v_op,'effect',v_effect);
 perform public.aiow_idempotency_store_v1('ops_mutation',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

-- Narrow identity-bound loaders replace direct service-role table reads.
create function public.aiow_quote_prepared_load_v1(p_request_id uuid,p_idempotency_key text,p_lead_id uuid,p_commercial_lead_id uuid,p_quote_number text) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare q public.quote_leads%rowtype; begin
 select * into q from public.quote_leads where id=p_lead_id and commercial_lead_id=p_commercial_lead_id and idempotency_key=p_idempotency_key
  and request_id=lower(p_request_id::text) and quote_number=p_quote_number;
 if not found or q.state not in ('prepared','committed') then raise exception using errcode='P0001',message='AIOW_QUOTE_PREPARE_NOT_FOUND'; end if;
 return jsonb_build_object('schemaKind','prepared_quote_authority','requestId',lower(p_request_id::text),'idempotencyKey',q.idempotency_key,
  'leadId',lower(q.id::text),'commercialLeadId',lower(q.commercial_lead_id::text),'quoteNumber',q.quote_number,'state',q.state,
  'requestPayloadDigest',q.request_payload_hash,'quote',q.normalized_quote,'receivedAt',public.aiow_iso_v1(q.received_at),'expiresAt',public.aiow_iso_v1(q.expires_at));
end $$;

create function public.aiow_quote_committed_pdf_load_v1(p_request_id uuid,p_idempotency_key text,p_lead_id uuid,p_commercial_lead_id uuid,p_quote_number text,p_request_payload_digest text) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog as $$
declare q public.quote_leads%rowtype; d public.quote_documents%rowtype; begin
 select * into q from public.quote_leads where id=p_lead_id and commercial_lead_id=p_commercial_lead_id and idempotency_key=p_idempotency_key
  and request_id=lower(p_request_id::text) and quote_number=p_quote_number and request_payload_hash=p_request_payload_digest and state='committed';
 if not found then raise exception using errcode='P0001',message='AIOW_QUOTE_COMMITTED_NOT_FOUND'; end if;
 select * into d from public.quote_documents where quote_lead_id=q.id;
 if not found or d.sha256<>encode(extensions.digest(d.document_bytes,'sha256'),'hex') then raise exception using errcode='P0001',message='AIOW_QUOTE_DOCUMENT_INVALID'; end if;
 return jsonb_build_object('schemaKind','committed_quote_pdf','requestId',lower(p_request_id::text),'leadId',lower(q.id::text),
  'commercialLeadId',lower(q.commercial_lead_id::text),'quoteNumber',q.quote_number,'filename',d.filename,'mimeType',d.mime_type,
  'base64',encode(d.document_bytes,'base64'),'sha256',d.sha256);
end $$;

-- Ops resolve uses the contract enum and atomically CASes both lead and job.
create function public.aiow_mail_outbox_resolve_v2(p_idempotency_key text,p_payload_digest text,p_mutation jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; l public.commercial_leads%rowtype; o public.commercial_mail_outbox%rowtype; v_now timestamptz:=transaction_timestamp(); v_state text; v_audit uuid; v_ack jsonb; v_digest text; begin
 if jsonb_typeof(p_mutation)<>'object' or p_mutation->>'schemaKind'<>'ops_resolve_outbox' or p_mutation->>'operation'<>'resolve_outbox'
  or p_mutation->>'idempotencyKey'<>p_idempotency_key or p_mutation->>'resolution' not in ('mark_sent','approve_resend','dead')
  or nullif(btrim(p_mutation->>'reason'),'') is null or (p_mutation->>'resolution'='mark_sent' and nullif(btrim(p_mutation->>'evidence'),'') is null)
 then raise exception using errcode='22023',message='AIOW_OUTBOX_RESOLVE_INVALID'; end if;
 v_digest:=public.aiow_sha256_json_v1(p_mutation); if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('ops_mutation',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('ops_mutation',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 select * into l from public.commercial_leads where id=(p_mutation->>'leadId')::uuid for update;
 if not found then raise exception using errcode='P0001',message='AIOW_LEAD_NOT_FOUND'; end if;
 select * into o from public.commercial_mail_outbox where id=(p_mutation->>'jobId')::uuid and commercial_lead_id=l.id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 v_replay:=public.aiow_idempotency_replay_v1('ops_mutation',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 if l.revision<>(p_mutation->>'expectedRevision')::bigint or o.revision<>(p_mutation->>'jobExpectedRevision')::bigint or o.state<>'review' then
  raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT',detail=jsonb_build_object('schemaKind','revision_conflict','code','revision_conflict','expectedRevision',(p_mutation->>'expectedRevision')::bigint,'currentRevision',l.revision,'current',public.aiow_lead_projection_v1(l))::text;
 end if;
 v_state:=case p_mutation->>'resolution' when 'mark_sent' then 'sent' when 'approve_resend' then 'retry' else 'dead' end;
 update public.commercial_mail_outbox set state=v_state,revision=revision+1,next_attempt_at=case when v_state='retry' then v_now else null end,
  provider_result=case when v_state='sent' then jsonb_build_object('schemaKind','provider_accepted','category','accepted','code',null,'receipt',jsonb_build_object('provider','microsoft_graph','httpStatus',202,'graphRequestId',null,'providerMessageId',null,'acceptanceKind','graph_http_202','attemptReceipt',p_mutation->>'evidence','observedAt',public.aiow_iso_v1(v_now))) else provider_result end,updated_at=v_now where id=o.id;
 update public.commercial_leads set revision=revision+1,updated_at=v_now where id=l.id returning * into l;
 v_audit:=public.aiow_audit_v1(l.id,'resolve_outbox',jsonb_build_object('jobId',lower(o.id::text),'beforeRevision',l.revision-1,'afterRevision',l.revision,'jobBeforeRevision',o.revision,'jobAfterRevision',o.revision+1,'resolution',p_mutation->>'resolution','reasonCode',encode(extensions.digest(convert_to(p_mutation->>'reason','UTF8'),'sha256'),'hex')));
 v_ack:=jsonb_build_object('schemaKind','ops_mutation_ack','accepted',true,'projection',public.aiow_lead_projection_v1(l),'previousRevision',l.revision-1,'revision',l.revision,'actorId','richard','serverTime',public.aiow_iso_v1(v_now),'auditId',lower(v_audit::text),'replayed',false,'operation','resolve_outbox','effect',jsonb_build_object('outboxResolution',v_state));
 perform public.aiow_idempotency_store_v1('ops_mutation',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

-- Add the missing lock/recheck discipline to service-role idempotent writers.
create or replace function public.aiow_mail_outbox_cancel_v2(p_commercial_lead_id uuid,p_job_id uuid,p_expected_revision bigint,p_idempotency_key text,p_payload_digest text,p_cancellation_kind text,p_reason text) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v_replay jsonb; v public.commercial_mail_outbox%rowtype; v_out jsonb; begin
 perform public.aiow_idempotency_lock_v1('outbox_cancel',p_idempotency_key); v_replay:=public.aiow_idempotency_replay_v1('outbox_cancel',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if p_payload_digest!~'^[0-9a-f]{64}$' or p_cancellation_kind not in ('retention','legal','admin') or nullif(btrim(p_reason),'') is null then raise exception using errcode='22023',message='AIOW_CANCEL_INVALID'; end if;
 select * into v from public.commercial_mail_outbox where id=p_job_id and commercial_lead_id=p_commercial_lead_id for update; if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 v_replay:=public.aiow_idempotency_replay_v1('outbox_cancel',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if v.state not in ('pending','retry','review') or v.revision<>p_expected_revision then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 update public.commercial_mail_outbox set state='cancelled',revision=revision+1,next_attempt_at=null,cancellation_reason=left(p_cancellation_kind||':'||p_reason,500),provider_result=null,updated_at=transaction_timestamp() where id=v.id returning * into v;
 perform public.aiow_audit_v1(v.commercial_lead_id,'cancel_outbox',jsonb_build_object('jobId',lower(v.id::text),'kind',p_cancellation_kind)); v_out:=public.aiow_outbox_projection_v2(v); perform public.aiow_idempotency_store_v1('outbox_cancel',p_idempotency_key,p_payload_digest,v_out); return v_out;
end $$;

create or replace function public.aiow_provider_gate_write_v1(p_idempotency_key text,p_payload_digest text,p_gate jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_old public.commercial_provider_gates%rowtype; v_audit uuid; begin
 perform public.aiow_idempotency_lock_v1('provider_gate',p_idempotency_key); v_replay:=public.aiow_idempotency_replay_v1('provider_gate',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if p_payload_digest<>public.aiow_sha256_json_v1(p_gate) then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 if p_gate->>'schemaKind'<>'provider_gate_record' or p_gate->>'gateId'<>'mail_provider_production_v1' or p_gate->>'environment'<>'production' or p_gate->>'provider'<>'microsoft_graph' or p_gate->>'exchangeApplicationRole'<>'Application Mail.Send' or p_gate->>'runtimeCapability'<>'mail_send' or p_gate->'fallbackProvider'<>'null'::jsonb or p_gate->>'evidenceSha256'!~'^[0-9a-f]{64}$' then raise exception using errcode='22023',message='AIOW_GATE_TARGET_INVALID'; end if;
 if p_gate->>'state' in ('approved','activated') and (p_gate->>'secretPresent'<>'true' or p_gate->>'oauthClientCredentialsPresent'<>'true' or p_gate->>'exchangeRbacSenderInScope'<>'true' or p_gate->>'exchangeRbacControlMailboxInScope'<>'false' or p_gate->>'entraUnscopedMailSendAssigned'<>'false' or p_gate->>'ownerApprovedBy'<>'richard' or (p_gate->>'approvedAt')::timestamptz>transaction_timestamp() or (p_gate->>'expiresAt')::timestamptz<=transaction_timestamp() or p_gate->>'approvalBindingSha256'<>public.aiow_provider_gate_binding_v1(p_gate)) then raise exception using errcode='42501',message='AIOW_GATE_BINDING_INVALID'; end if;
 select * into v_old from public.commercial_provider_gates where gate_id=p_gate->>'gateId' for update;
 v_replay:=public.aiow_idempotency_replay_v1('provider_gate',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if found and (p_gate->>'revision')::bigint<>v_old.revision+1 or not found and (p_gate->>'revision')::bigint<>1 then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 v_audit:=public.aiow_audit_v1(null,'provider_gate_write',jsonb_build_object('gateId',p_gate->>'gateId','revision',(p_gate->>'revision')::bigint,'state',p_gate->>'state'));
 insert into public.commercial_provider_gates(gate_id,state,target,evidence_sha256,expires_at,revision,approved_at,owner_approved_by,approval_binding_sha256,audit_id)
 values(p_gate->>'gateId',p_gate->>'state',p_gate,p_gate->>'evidenceSha256',(p_gate->>'expiresAt')::timestamptz,(p_gate->>'revision')::bigint,(p_gate->>'approvedAt')::timestamptz,p_gate->>'ownerApprovedBy',p_gate->>'approvalBindingSha256',v_audit)
 on conflict(gate_id) do update set state=excluded.state,target=excluded.target,evidence_sha256=excluded.evidence_sha256,expires_at=excluded.expires_at,revision=excluded.revision,approved_at=excluded.approved_at,owner_approved_by=excluded.owner_approved_by,approval_binding_sha256=excluded.approval_binding_sha256,audit_id=excluded.audit_id;
 perform public.aiow_idempotency_store_v1('provider_gate',p_idempotency_key,p_payload_digest,p_gate); return p_gate;
end $$;

create or replace function public.aiow_active_customer_relation_set_v1(p_commercial_lead_id uuid,p_expected_revision bigint,p_idempotency_key text,p_payload_digest text,p_enabled boolean,p_reason text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v public.commercial_leads%rowtype; v_before bigint; v_audit uuid; v_ack jsonb; v_now timestamptz:=transaction_timestamp(); begin
 perform public.aiow_idempotency_lock_v1('active_relation',p_idempotency_key); v_replay:=public.aiow_idempotency_replay_v1('active_relation',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if p_payload_digest!~'^[0-9a-f]{64}$' or nullif(btrim(p_reason),'') is null then raise exception using errcode='22023',message='AIOW_RELATION_INVALID'; end if;
 select * into v from public.commercial_leads where id=p_commercial_lead_id for update; if not found then raise exception using errcode='P0001',message='AIOW_LEAD_NOT_FOUND'; end if;
 v_replay:=public.aiow_idempotency_replay_v1('active_relation',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if v.revision<>p_expected_revision then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if; if v.active_customer_relation=p_enabled then raise exception using errcode='22023',message='AIOW_RELATION_NOOP'; end if;
 v_before:=v.revision; update public.commercial_leads set active_customer_relation=p_enabled,active_customer_relation_at=case when p_enabled then v_now else null end,revision=revision+1,updated_at=v_now where id=v.id returning * into v;
 v_audit:=public.aiow_audit_v1(v.id,'set_active_customer_relation',jsonb_build_object('beforeRevision',v_before,'afterRevision',v.revision,'enabled',p_enabled));
 v_ack:=jsonb_build_object('schemaKind','ops_mutation_ack','accepted',true,'projection',public.aiow_lead_projection_v1(v),'previousRevision',v_before,'revision',v.revision,'actorId','richard','serverTime',public.aiow_iso_v1(v_now),'auditId',lower(v_audit::text),'replayed',false,'operation','set_active_customer_relation','effect',jsonb_build_object('activeCustomerRelation',p_enabled));
 perform public.aiow_idempotency_store_v1('active_relation',p_idempotency_key,p_payload_digest,v_ack); return v_ack;
end $$;

-- Revoke public defaults and expose only the three narrow additions.
revoke all on function public.aiow_quote_prepared_load_v1(uuid,text,uuid,uuid,text),public.aiow_quote_committed_pdf_load_v1(uuid,text,uuid,uuid,text,text),public.aiow_mail_outbox_resolve_v2(text,text,jsonb) from public;
do $acl$ begin
 if exists(select 1 from pg_roles where rolname='anon') then
  revoke all on function public.aiow_quote_prepared_load_v1(uuid,text,uuid,uuid,text),public.aiow_quote_committed_pdf_load_v1(uuid,text,uuid,uuid,text,text),public.aiow_mail_outbox_resolve_v2(text,text,jsonb) from anon;
 end if;
 if exists(select 1 from pg_roles where rolname='authenticated') then
  revoke all on function public.aiow_quote_prepared_load_v1(uuid,text,uuid,uuid,text),public.aiow_quote_committed_pdf_load_v1(uuid,text,uuid,uuid,text,text),public.aiow_mail_outbox_resolve_v2(text,text,jsonb) from authenticated;
 end if;
 if exists(select 1 from pg_roles where rolname='service_role') then
  grant execute on function public.aiow_quote_prepared_load_v1(uuid,text,uuid,uuid,text),public.aiow_quote_committed_pdf_load_v1(uuid,text,uuid,uuid,text,text),public.aiow_mail_outbox_resolve_v2(text,text,jsonb) to service_role;
 end if;
end $acl$;

commit;
