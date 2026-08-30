begin;

-- Durable, endpoint-scoped mail-run receipts and lease-bound worker reads.
do $roles$
begin
  if not exists (select 1 from pg_roles where rolname = 'aiow_mail_run_receipt_owner') then
    create role aiow_mail_run_receipt_owner nologin bypassrls;
  else
    alter role aiow_mail_run_receipt_owner nologin bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'aiow_mail_run_retention_worker') then
    create role aiow_mail_run_retention_worker nologin nobypassrls;
  else
    alter role aiow_mail_run_retention_worker nologin nobypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'aiow_mail_runtime_reader') then
    create role aiow_mail_runtime_reader nologin bypassrls;
  else
    alter role aiow_mail_runtime_reader nologin bypassrls;
  end if;
end $roles$;

-- Managed Supabase migration sessions may create NOLOGIN roles without being
-- able to SET ROLE to them. PostgreSQL requires temporary membership before
-- transferring object ownership. Record only memberships added by this
-- migration and revoke them again before commit.
create temporary table aiow_temporary_role_memberships(
  role_name name primary key
) on commit drop;
do $temporary_owner_membership$
declare
  v_role name;
begin
  foreach v_role in array array['aiow_mail_run_receipt_owner'::name,'aiow_mail_runtime_reader'::name]
  loop
    if not pg_has_role(current_user,v_role,'MEMBER') then
      insert into aiow_temporary_role_memberships(role_name) values(v_role);
      execute format('grant %I to %I',v_role,current_user);
    end if;
  end loop;
end $temporary_owner_membership$;

grant usage on schema public, extensions to aiow_mail_run_receipt_owner, aiow_mail_runtime_reader;
grant execute on function public.aiow_iso_v1(timestamptz), public.aiow_jsonb_exact_keys_v1(jsonb,text[]) to aiow_mail_run_receipt_owner;
grant select on table public.commercial_mail_outbox, public.commercial_provider_gates to aiow_mail_runtime_reader;
grant execute on function public.aiow_iso_v1(timestamptz), public.aiow_sha256_json_v1(jsonb), public.aiow_json_canonical_v1(jsonb), public.aiow_provider_gate_binding_v1(jsonb) to aiow_mail_runtime_reader;

create table public.commercial_mail_run_receipts (
  request_id uuid not null,
  idempotency_key text primary key,
  body_digest text not null,
  state text not null default 'pending',
  revision bigint not null default 1,
  worker_id text not null,
  lease_token uuid not null default extensions.gen_random_uuid(),
  lease_expires_at timestamptz not null,
  response_status integer,
  response_headers jsonb,
  response_body jsonb,
  created_at timestamptz not null default transaction_timestamp(),
  updated_at timestamptz not null default transaction_timestamp(),
  completed_at timestamptz,
  constraint commercial_mail_run_receipts_idempotency_key_ck check (char_length(idempotency_key) between 16 and 128 and idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$'),
  constraint commercial_mail_run_receipts_body_digest_ck check (body_digest ~ '^[0-9a-f]{64}$'),
  constraint commercial_mail_run_receipts_state_ck check (state in ('pending','completed')),
  constraint commercial_mail_run_receipts_revision_ck check (revision > 0),
  constraint commercial_mail_run_receipts_worker_id_ck check (char_length(worker_id) between 1 and 100 and worker_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'),
  constraint commercial_mail_run_receipts_response_status_ck check (response_status is null or response_status in (200,503)),
  constraint commercial_mail_run_receipts_response_shape_ck check ((state='pending' and response_status is null and response_headers is null and response_body is null) or (state='completed' and response_status is not null and response_headers is not null and response_body is not null)),
  constraint commercial_mail_run_receipts_completed_shape_ck check ((state='completed') = (completed_at is not null) and created_at <= updated_at and (completed_at is null or updated_at=completed_at))
);
alter table public.commercial_mail_run_receipts enable row level security;
alter table public.commercial_mail_run_receipts force row level security;
alter table public.commercial_mail_run_receipts owner to aiow_mail_run_receipt_owner;
revoke all on table public.commercial_mail_run_receipts from public;
do $table_acl$
begin
  if exists(select 1 from pg_roles where rolname='anon') then revoke all on table public.commercial_mail_run_receipts from anon; end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then revoke all on table public.commercial_mail_run_receipts from authenticated; end if;
  if exists(select 1 from pg_roles where rolname='service_role') then
    revoke all on table public.commercial_mail_run_receipts from service_role;
    grant select on table public.commercial_mail_run_receipts to service_role;
  end if;
end $table_acl$;

create function public.aiow_mail_run_begin_v1(p_request_id uuid,p_idempotency_key text,p_body_digest text,p_worker_id text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare
  v public.commercial_mail_run_receipts%rowtype;
  v_now timestamptz := transaction_timestamp();
begin
  if p_request_id is null
    or p_idempotency_key is null or char_length(p_idempotency_key) not between 16 and 128 or p_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$'
    or p_body_digest is null or p_body_digest !~ '^[0-9a-f]{64}$'
    or p_worker_id is null or char_length(p_worker_id) not between 1 and 100 or p_worker_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$'
  then raise exception using errcode='22023',message='AIOW_MAIL_RUN_INVALID'; end if;

  perform pg_advisory_xact_lock(hashtextextended('aiow_mail_run_v1:' || p_idempotency_key, 730201));
  select * into v from public.commercial_mail_run_receipts where idempotency_key=p_idempotency_key for update;
  if not found then
    insert into public.commercial_mail_run_receipts(request_id,idempotency_key,body_digest,worker_id,lease_expires_at,created_at,updated_at)
    values(p_request_id,p_idempotency_key,p_body_digest,p_worker_id,v_now+interval '300 seconds',v_now,v_now)
    returning * into v;
    return jsonb_build_object('schemaKind','mail_run_begin_ack','disposition','execute','requestId',lower(v.request_id::text),'idempotencyKey',v.idempotency_key,'bodyDigest',v.body_digest,'revision',v.revision,'leaseToken',lower(v.lease_token::text),'leaseExpiresAt',public.aiow_iso_v1(v.lease_expires_at));
  end if;
  if v.body_digest<>p_body_digest then raise exception using errcode='23505',message='AIOW_MAIL_RUN_IDEMPOTENCY_CONFLICT'; end if;
  if v.state='completed' then
    return jsonb_build_object('schemaKind','mail_run_begin_ack','disposition','replay','requestId',lower(v.request_id::text),'idempotencyKey',v.idempotency_key,'bodyDigest',v.body_digest,'revision',v.revision,'responseStatus',v.response_status,'responseHeaders',v.response_headers,'responseBody',v.response_body,'completedAt',public.aiow_iso_v1(v.completed_at));
  end if;
  if v.lease_expires_at>v_now then
    return jsonb_build_object('schemaKind','mail_run_begin_ack','disposition','in_progress','requestId',lower(v.request_id::text),'idempotencyKey',v.idempotency_key,'bodyDigest',v.body_digest,'revision',v.revision,'leaseExpiresAt',public.aiow_iso_v1(v.lease_expires_at));
  end if;
  update public.commercial_mail_run_receipts
  set revision=revision+1,worker_id=p_worker_id,lease_token=extensions.gen_random_uuid(),lease_expires_at=v_now+interval '300 seconds',updated_at=v_now
  where idempotency_key=p_idempotency_key and state='pending' and revision=v.revision returning * into v;
  if not found then raise exception using errcode='P0001',message='AIOW_MAIL_RUN_REVISION_CONFLICT'; end if;
  return jsonb_build_object('schemaKind','mail_run_begin_ack','disposition','execute','requestId',lower(v.request_id::text),'idempotencyKey',v.idempotency_key,'bodyDigest',v.body_digest,'revision',v.revision,'leaseToken',lower(v.lease_token::text),'leaseExpiresAt',public.aiow_iso_v1(v.lease_expires_at));
end $$;

create function public.aiow_mail_run_complete_v1(p_request_id uuid,p_idempotency_key text,p_body_digest text,p_lease_token uuid,p_response_status integer,p_response_headers jsonb,p_response_body jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare
  v public.commercial_mail_run_receipts%rowtype;
  v_now timestamptz := transaction_timestamp();
  v_valid boolean := false;
  v_item jsonb;
begin
  if p_request_id is null or p_lease_token is null or p_idempotency_key is null or p_body_digest is null
    or p_response_status not in (200,503) or p_response_headers is null or p_response_body is null
    or pg_column_size(p_response_headers)>2048 or pg_column_size(p_response_body)>262144
    or not public.aiow_jsonb_exact_keys_v1(p_response_headers,array['cacheControl','contentType','xAiowRequestId'])
    or p_response_headers->>'cacheControl'<>'no-store' or p_response_headers->>'contentType'<>'application/json; charset=utf-8'
    or p_response_headers->>'xAiowRequestId'<>lower(p_request_id::text)
  then raise exception using errcode='22023',message='AIOW_MAIL_RUN_RESPONSE_INVALID'; end if;

  if p_response_status=200 then
    v_valid := public.aiow_jsonb_exact_keys_v1(p_response_body,array['schemaKind','operation','requestedLimit','itemCount','items'])
      and p_response_body->>'schemaKind'='outbox_batch_ack' and p_response_body->>'operation'='mail_run'
      and jsonb_typeof(p_response_body->'requestedLimit')='number' and jsonb_typeof(p_response_body->'itemCount')='number' and jsonb_typeof(p_response_body->'items')='array'
      and (p_response_body->>'requestedLimit')::integer between 1 and 50
      and (p_response_body->>'itemCount')::integer=jsonb_array_length(p_response_body->'items')
      and jsonb_array_length(p_response_body->'items')<=(p_response_body->>'requestedLimit')::integer;
    if v_valid then
      for v_item in select value from jsonb_array_elements(p_response_body->'items') loop
        if not public.aiow_jsonb_exact_keys_v1(v_item,array['id','commercialLeadId','kind','revision','payloadSha256','attempts','leaseOwner','leaseToken','leaseExpiresAt','nextAttemptAt','createdAt']) then v_valid:=false; exit; end if;
      end loop;
    end if;
  else
    v_valid := public.aiow_jsonb_exact_keys_v1(p_response_body,array['schemaKind','code','message','requestId','retriable'])
      and p_response_body->>'schemaKind'='error' and p_response_body->>'code' in ('unavailable','provider_failure')
      and p_response_body->>'requestId'=lower(p_request_id::text) and p_response_body->'retriable'='true'::jsonb
      and char_length(p_response_body->>'message') between 1 and 200;
  end if;
  if not v_valid then raise exception using errcode='22023',message='AIOW_MAIL_RUN_RESPONSE_INVALID'; end if;

  perform pg_advisory_xact_lock(hashtextextended('aiow_mail_run_v1:' || p_idempotency_key, 730201));
  select * into v from public.commercial_mail_run_receipts where idempotency_key=p_idempotency_key for update;
  if not found then raise exception using errcode='P0001',message='AIOW_MAIL_RUN_REVISION_CONFLICT'; end if;
  if v.body_digest<>p_body_digest then raise exception using errcode='23505',message='AIOW_MAIL_RUN_IDEMPOTENCY_CONFLICT'; end if;
  if v.state='completed' then
    if v.request_id<>p_request_id or v.lease_token<>p_lease_token or v.response_status<>p_response_status or v.response_headers<>p_response_headers or v.response_body<>p_response_body
    then raise exception using errcode='P0001',message='AIOW_MAIL_RUN_REVISION_CONFLICT'; end if;
    return jsonb_build_object('schemaKind','mail_run_complete_ack','disposition','replay','requestId',lower(v.request_id::text),'idempotencyKey',v.idempotency_key,'bodyDigest',v.body_digest,'revision',v.revision,'responseStatus',v.response_status,'responseHeaders',v.response_headers,'responseBody',v.response_body,'completedAt',public.aiow_iso_v1(v.completed_at));
  end if;
  if v.request_id<>p_request_id or v.lease_token<>p_lease_token or v.lease_expires_at<=v_now then raise exception using errcode='P0001',message='AIOW_MAIL_RUN_REVISION_CONFLICT'; end if;
  update public.commercial_mail_run_receipts set state='completed',response_status=p_response_status,response_headers=p_response_headers,response_body=p_response_body,updated_at=v_now,completed_at=v_now
  where idempotency_key=p_idempotency_key and state='pending' and request_id=p_request_id and body_digest=p_body_digest and lease_token=p_lease_token and revision=v.revision returning * into v;
  if not found then raise exception using errcode='P0001',message='AIOW_MAIL_RUN_REVISION_CONFLICT'; end if;
  return jsonb_build_object('schemaKind','mail_run_complete_ack','disposition','completed','requestId',lower(v.request_id::text),'idempotencyKey',v.idempotency_key,'bodyDigest',v.body_digest,'revision',v.revision,'responseStatus',v.response_status,'responseHeaders',v.response_headers,'responseBody',v.response_body,'completedAt',public.aiow_iso_v1(v.completed_at));
end $$;

create function public.aiow_mail_run_receipts_delete_expired_v1(p_limit integer) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_keys jsonb; v_now timestamptz:=transaction_timestamp();
begin
  if p_limit is null or p_limit not between 1 and 50 then raise exception using errcode='22023',message='AIOW_MAIL_RUN_RETENTION_INVALID'; end if;
  with eligible as (
    select idempotency_key from public.commercial_mail_run_receipts
    where (state='completed' and completed_at<v_now-interval '90 days')
       or (state='pending' and lease_expires_at<=v_now and updated_at<v_now-interval '90 days')
    order by idempotency_key asc limit p_limit for update skip locked
  ), deleted as (
    delete from public.commercial_mail_run_receipts as receipt using eligible
    where receipt.idempotency_key=eligible.idempotency_key returning receipt.idempotency_key
  ) select coalesce(jsonb_agg(idempotency_key order by idempotency_key),'[]'::jsonb) into v_keys from deleted;
  return jsonb_build_object('schemaKind','mail_run_retention_ack','deletedCount',jsonb_array_length(v_keys),'deletedIdempotencyKeys',v_keys,'completedAt',public.aiow_iso_v1(v_now));
end $$;

create function public.aiow_mail_outbox_load_leased_job_v1(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_expected_revision bigint,p_payload_digest text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v public.commercial_mail_outbox%rowtype;
begin
  select * into v from public.commercial_mail_outbox where id=p_job_id;
  if not found or v.state<>'leased' or v.lease_owner<>p_lease_owner or v.lease_token<>p_lease_token or v.revision<>p_expected_revision
    or v.payload_sha256<>p_payload_digest or public.aiow_sha256_json_v1(v.payload)<>p_payload_digest or v.lease_expires_at<=transaction_timestamp()
  then raise exception using errcode='P0001',message='AIOW_OUTBOX_LEASE_CONFLICT'; end if;
  return v.payload || jsonb_build_object('schemaKind','mail_job','jobId',lower(v.id::text),'commercialLeadId',lower(v.commercial_lead_id::text),'kind',v.kind,'payloadSha256',v.payload_sha256,'attempt',v.attempts,'leaseOwner',v.lease_owner,'leaseToken',lower(v.lease_token::text),'leaseExpiresAt',public.aiow_iso_v1(v.lease_expires_at));
end $$;

create function public.aiow_mail_provider_gate_load_for_lease_v1(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_expected_revision bigint,p_payload_digest text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_job public.commercial_mail_outbox%rowtype; v_gate public.commercial_provider_gates%rowtype; v_target jsonb;
begin
  select * into v_job from public.commercial_mail_outbox where id=p_job_id;
  if not found or v_job.state<>'leased' or v_job.lease_owner<>p_lease_owner or v_job.lease_token<>p_lease_token or v_job.revision<>p_expected_revision
    or v_job.payload_sha256<>p_payload_digest or public.aiow_sha256_json_v1(v_job.payload)<>p_payload_digest or v_job.lease_expires_at<=transaction_timestamp()
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

alter function public.aiow_mail_run_begin_v1(uuid,text,text,text) owner to aiow_mail_run_receipt_owner;
alter function public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb) owner to aiow_mail_run_receipt_owner;
alter function public.aiow_mail_run_receipts_delete_expired_v1(integer) owner to aiow_mail_run_receipt_owner;
alter function public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text) owner to aiow_mail_runtime_reader;
alter function public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) owner to aiow_mail_runtime_reader;

revoke all on function public.aiow_mail_run_begin_v1(uuid,text,text,text) from public;
revoke all on function public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb) from public;
revoke all on function public.aiow_mail_run_receipts_delete_expired_v1(integer) from public;
revoke all on function public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text) from public;
revoke all on function public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) from public;
do $function_acl$
begin
  if exists(select 1 from pg_roles where rolname='anon') then
    revoke all on function public.aiow_mail_run_begin_v1(uuid,text,text,text),public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb),public.aiow_mail_run_receipts_delete_expired_v1(integer),public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) from anon;
  end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then
    revoke all on function public.aiow_mail_run_begin_v1(uuid,text,text,text),public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb),public.aiow_mail_run_receipts_delete_expired_v1(integer),public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) from authenticated;
  end if;
  if exists(select 1 from pg_roles where rolname='service_role') then
    revoke all on function public.aiow_mail_run_receipts_delete_expired_v1(integer) from service_role;
    grant execute on function public.aiow_mail_run_begin_v1(uuid,text,text,text),public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb),public.aiow_mail_outbox_load_leased_job_v1(uuid,text,uuid,bigint,text),public.aiow_mail_provider_gate_load_for_lease_v1(uuid,text,uuid,bigint,text) to service_role;
  end if;
end $function_acl$;
grant execute on function public.aiow_mail_run_receipts_delete_expired_v1(integer) to aiow_mail_run_retention_worker;

do $restore_owner_membership$
declare
  v_role name;
begin
  for v_role in select role_name from aiow_temporary_role_memberships
  loop
    execute format('revoke %I from %I',v_role,current_user);
  end loop;
end $restore_owner_membership$;

commit;
