begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
alter extension pgcrypto set schema extensions;

create table if not exists public.quote_sequences (
  year integer primary key check (year between 2020 and 9999),
  next_value integer not null check (next_value between 1 and 9999),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_leads (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (length(idempotency_key) between 16 and 128 and idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]+$'),
  request_id text not null check (length(request_id) between 1 and 128 and request_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]*$'),
  quote_number text not null unique check (quote_number ~ '^AIOW-[0-9]{4}-[0-9]{4}$'),
  quote_year integer not null check (quote_year between 2020 and 9999),
  quote_sequence integer not null check (quote_sequence between 1 and 9999),
  state text not null check (state in ('prepared','committed')),
  request_payload_hash text not null check (request_payload_hash ~ '^[0-9a-f]{64}$'),
  normalized_quote jsonb not null check (jsonb_typeof(normalized_quote) = 'object'),
  contact jsonb not null check (jsonb_typeof(contact) = 'object'),
  consent jsonb not null check (jsonb_typeof(consent) = 'object'),
  source jsonb not null check (jsonb_typeof(source) = 'object'),
  country text not null check (country = '' or country ~ '^[A-Z]{2}$'),
  received_at timestamptz not null,
  prepared_at timestamptz not null default now(),
  committed_at timestamptz,
  unique (quote_year, quote_sequence),
  check (quote_number = 'AIOW-' || quote_year::text || '-' || lpad(quote_sequence::text, 4, '0')),
  check ((state = 'prepared' and committed_at is null) or (state = 'committed' and committed_at is not null))
);

create table if not exists public.quote_documents (
  lead_id uuid primary key references public.quote_leads(id) on delete restrict,
  filename text not null check (filename ~ '^AIOW-[0-9]{4}-[0-9]{4}\.pdf$'),
  mime_type text not null check (mime_type = 'application/pdf'),
  document_bytes bytea not null check (octet_length(document_bytes) between 5 and 1500000),
  sha256 text not null unique check (sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.mail_outbox (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.quote_leads(id) on delete restrict,
  kind text not null check (kind in ('customer_quote','internal_lead')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  state text not null default 'pending' check (state in ('pending','claimed','sent','retry','dead','review')),
  attempts integer not null default 0 check (attempts between 0 and 5),
  available_at timestamptz not null default now(),
  lease_token uuid,
  lease_expires_at timestamptz,
  provider_message_id text,
  last_error_code text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lead_id, kind),
  check ((state = 'claimed') = (lease_token is not null and lease_expires_at is not null)),
  check ((state = 'sent') = (sent_at is not null)),
  check (state <> 'sent' or provider_message_id is not null),
  check (provider_message_id is null or state in ('sent','review')),
  check (provider_message_id is null or length(provider_message_id) between 1 and 256),
  check (last_error_code is null or (length(last_error_code) between 1 and 64 and last_error_code ~ '^[A-Z0-9_:-]+$'))
);
create index if not exists mail_outbox_claim_idx on public.mail_outbox (available_at, id) where state in ('pending','retry');
create index if not exists mail_outbox_lease_idx on public.mail_outbox (lease_expires_at) where state = 'claimed';

create table if not exists public.provider_delivery_attempts (
  id bigint generated always as identity primary key,
  outbox_id bigint not null references public.mail_outbox(id) on delete restrict,
  attempt_number integer not null check (attempt_number between 1 and 5),
  outcome text not null check (outcome in ('sent','retry','dead','review')),
  provider_message_id text,
  error_code text,
  created_at timestamptz not null default now(),
  unique (outbox_id, attempt_number),
  check ((outcome = 'sent' and provider_message_id is not null and error_code is null)
    or (outcome in ('retry','dead') and provider_message_id is null and error_code is not null)
    or (outcome = 'review' and error_code is not null))
);

alter table public.quote_sequences enable row level security;
alter table public.quote_leads enable row level security;
alter table public.quote_documents enable row level security;
alter table public.mail_outbox enable row level security;
alter table public.provider_delivery_attempts enable row level security;
revoke all on table public.quote_sequences, public.quote_leads, public.quote_documents, public.mail_outbox, public.provider_delivery_attempts from public;
revoke all on sequence public.mail_outbox_id_seq, public.provider_delivery_attempts_id_seq from public;

create or replace function public.aiow_jsonb_exact_keys_v1(p_value jsonb, p_keys text[])
returns boolean language sql immutable strict set search_path = pg_catalog as $$
  select jsonb_typeof(p_value) = 'object'
    and (select array_agg(k order by k) from jsonb_object_keys(p_value) k) = (select array_agg(k order by k) from unnest(p_keys) k)
$$;

create or replace function public.aiow_quote_prepare_v1(
  p_request_id text,
  p_idempotency_key text,
  p_received_at timestamptz,
  p_country text,
  p_quote jsonb,
  p_contact jsonb,
  p_consent jsonb,
  p_source jsonb
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, extensions as $$
declare
  v_now timestamptz := clock_timestamp();
  v_year integer := extract(year from clock_timestamp() at time zone 'Europe/Amsterdam')::integer;
  v_hash text;
  v_lead public.quote_leads%rowtype;
  v_sequence integer;
begin
  if p_request_id is null or length(p_request_id) not between 1 and 128 or p_request_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]*$'
    or p_idempotency_key is null or length(p_idempotency_key) not between 16 and 128 or p_idempotency_key !~ '^[A-Za-z0-9][A-Za-z0-9._:-]+$'
    or p_received_at is null or abs(extract(epoch from (v_now - p_received_at))) > 300
    or p_country is null or not (p_country = '' or p_country ~ '^[A-Z]{2}$')
    or jsonb_typeof(p_quote) <> 'object' or jsonb_typeof(p_contact) <> 'object' or jsonb_typeof(p_consent) <> 'object' or jsonb_typeof(p_source) <> 'object'
    or p_consent <> '{"accepted":true,"version":"aiow-quote-v1"}'::jsonb
    or coalesce((p_quote->>'issueDate')::date <> (v_now at time zone 'Europe/Amsterdam')::date, true)
  then raise exception using errcode = '22023', message = 'AIOW_QUOTE_INVALID_PREPARE'; end if;
  -- Idempotency binds the immutable commercial request, not transport metadata.
  -- A replay may legitimately arrive with a new request ID and timestamp.
  v_hash := encode(extensions.digest(convert_to(jsonb_build_object('country',p_country,'quote',p_quote,'contact',p_contact,'consent',p_consent,'source',p_source)::text, 'UTF8'), 'sha256'), 'hex');
  select * into v_lead from public.quote_leads where idempotency_key = p_idempotency_key for update;
  if found then
    if v_lead.request_payload_hash <> v_hash then raise exception using errcode = 'P0001', message = 'AIOW_QUOTE_IDEMPOTENCY_CONFLICT'; end if;
    return jsonb_build_object('accepted',true,'quoteNumber',v_lead.quote_number,'leadId',v_lead.id::text,'receivedAt',to_char(v_lead.received_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
  end if;
  insert into public.quote_sequences(year,next_value,updated_at) values(v_year,1,v_now)
    on conflict(year) do update set next_value = public.quote_sequences.next_value + 1, updated_at = excluded.updated_at
    where public.quote_sequences.next_value < 9999
    returning next_value into v_sequence;
  if v_sequence is null then raise exception using errcode = 'P0001', message = 'AIOW_QUOTE_SEQUENCE_EXHAUSTED'; end if;
  insert into public.quote_leads(idempotency_key,request_id,quote_number,quote_year,quote_sequence,state,request_payload_hash,normalized_quote,contact,consent,source,country,received_at,prepared_at)
    values(p_idempotency_key,p_request_id,'AIOW-'||v_year::text||'-'||lpad(v_sequence::text,4,'0'),v_year,v_sequence,'prepared',v_hash,p_quote,p_contact,p_consent,p_source,p_country,p_received_at,v_now)
    returning * into v_lead;
  return jsonb_build_object('accepted',true,'quoteNumber',v_lead.quote_number,'leadId',v_lead.id::text,'receivedAt',to_char(v_lead.received_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
exception when unique_violation then
  select * into v_lead from public.quote_leads where idempotency_key = p_idempotency_key for update;
  if found and v_lead.request_payload_hash = v_hash then return jsonb_build_object('accepted',true,'quoteNumber',v_lead.quote_number,'leadId',v_lead.id::text,'receivedAt',to_char(v_lead.received_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')); end if;
  raise exception using errcode = 'P0001', message = 'AIOW_QUOTE_IDEMPOTENCY_CONFLICT';
end $$;

create or replace function public.aiow_quote_commit_v1(
  p_request_id text,
  p_idempotency_key text,
  p_quote_number text,
  p_lead_id uuid,
  p_pdf_filename text,
  p_pdf_mime_type text,
  p_pdf_base64 text,
  p_pdf_sha256 text,
  p_customer_mail jsonb,
  p_internal_mail jsonb,
  p_quote jsonb,
  p_contact jsonb,
  p_source jsonb,
  p_country text
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, extensions as $$
declare
  v_lead public.quote_leads%rowtype;
  v_bytes bytea;
  v_doc public.quote_documents%rowtype;
  v_customer public.mail_outbox%rowtype;
  v_internal public.mail_outbox%rowtype;
begin
  if p_pdf_base64 is null or length(p_pdf_base64) > 2000000 then raise exception using errcode='22023', message='AIOW_QUOTE_INVALID_COMMIT'; end if;
  select * into v_lead from public.quote_leads where id = p_lead_id for update;
  if not found then raise exception using errcode='P0001', message='AIOW_QUOTE_PREPARE_NOT_FOUND'; end if;
  if p_request_id is null or length(p_request_id) not between 1 and 128 or p_request_id !~ '^[A-Za-z0-9][A-Za-z0-9._:-]*$'
    or v_lead.idempotency_key <> p_idempotency_key or v_lead.quote_number <> p_quote_number
    or v_lead.normalized_quote <> p_quote or v_lead.contact <> p_contact or v_lead.source <> p_source or v_lead.country <> p_country
    or p_pdf_filename <> p_quote_number||'.pdf' or p_pdf_mime_type <> 'application/pdf' or p_pdf_sha256 !~ '^[0-9a-f]{64}$'
    or not public.aiow_jsonb_exact_keys_v1(p_customer_mail, array['from','to','subject','text','html'])
    or not public.aiow_jsonb_exact_keys_v1(p_internal_mail, array['from','to','subject','text','html'])
    or p_customer_mail->>'from' <> 'offerte@aiow.ai' or p_customer_mail->>'to' <> p_contact->>'email'
    or p_internal_mail->>'from' <> 'offerte@aiow.ai' or p_internal_mail->>'to' <> 'offerte@aiow.ai'
    or length(p_customer_mail::text) > 500000 or length(p_internal_mail::text) > 500000
    or exists (select 1 from jsonb_each_text(p_customer_mail) e where e.value = '' or e.value ~ E'[\r\n]' and e.key in ('from','to','subject'))
    or exists (select 1 from jsonb_each_text(p_internal_mail) e where e.value = '' or e.value ~ E'[\r\n]' and e.key in ('from','to','subject'))
  then raise exception using errcode='22023', message='AIOW_QUOTE_INVALID_COMMIT'; end if;
  begin v_bytes := decode(p_pdf_base64,'base64'); exception when others then raise exception using errcode='22023', message='AIOW_QUOTE_INVALID_PDF'; end;
  if octet_length(v_bytes) not between 5 and 1500000 or substring(v_bytes from 1 for 5) <> convert_to('%PDF-','UTF8') or encode(extensions.digest(v_bytes,'sha256'),'hex') <> p_pdf_sha256
  then raise exception using errcode='22023', message='AIOW_QUOTE_INVALID_PDF'; end if;
  if v_lead.state = 'committed' then
    select * into v_doc from public.quote_documents where lead_id=v_lead.id;
    select * into v_customer from public.mail_outbox where lead_id=v_lead.id and kind='customer_quote';
    select * into v_internal from public.mail_outbox where lead_id=v_lead.id and kind='internal_lead';
    if v_doc.sha256=p_pdf_sha256 and v_doc.filename=p_pdf_filename and v_doc.mime_type=p_pdf_mime_type and v_doc.document_bytes=v_bytes and v_customer.payload=p_customer_mail and v_internal.payload=p_internal_mail
    then return '{"accepted":true}'::jsonb; end if;
    raise exception using errcode='P0001', message='AIOW_QUOTE_COMMIT_CONFLICT';
  end if;
  insert into public.quote_documents(lead_id,filename,mime_type,document_bytes,sha256) values(v_lead.id,p_pdf_filename,p_pdf_mime_type,v_bytes,p_pdf_sha256);
  insert into public.mail_outbox(lead_id,kind,payload) values(v_lead.id,'customer_quote',p_customer_mail),(v_lead.id,'internal_lead',p_internal_mail);
  update public.quote_leads set state='committed', committed_at=clock_timestamp() where id=v_lead.id;
  return '{"accepted":true}'::jsonb;
end $$;

create or replace function public.aiow_quote_claim_outbox_v1(p_limit integer default 5, p_lease_seconds integer default 120)
returns table("id" text,"kind" text,"payload" jsonb,"attempts" integer,"leaseToken" text,"attachmentFilename" text,"attachmentMimeType" text,"attachmentBase64" text,"attachmentSha256" text)
language plpgsql security definer set search_path = pg_catalog, extensions as $$
begin
  if p_limit not between 1 and 10 or p_lease_seconds not between 30 and 300 then raise exception using errcode='22023', message='AIOW_QUOTE_INVALID_CLAIM'; end if;
  with expired as (
    select o.id from public.mail_outbox o where o.state='claimed' and o.lease_expires_at < clock_timestamp()
    order by o.lease_expires_at,o.id limit p_limit for update of o skip locked
  ), recovered as (
    update public.mail_outbox o set state='review',available_at=clock_timestamp(),lease_token=null,lease_expires_at=null,last_error_code='LEASE_EXPIRED',updated_at=clock_timestamp()
    from expired e where o.id=e.id returning o.id,o.attempts
  )
  insert into public.provider_delivery_attempts(outbox_id,attempt_number,outcome,error_code)
    select r.id,r.attempts,'review','LEASE_EXPIRED' from recovered r;
  return query
  with candidates as (
    select o.id from public.mail_outbox o where o.state in ('pending','retry') and o.available_at <= clock_timestamp() and o.attempts < 5 order by o.available_at,o.id limit p_limit for update of o skip locked
  ), claimed as (
    update public.mail_outbox o set state='claimed',attempts=o.attempts+1,lease_token=gen_random_uuid(),lease_expires_at=clock_timestamp()+make_interval(secs=>p_lease_seconds),updated_at=clock_timestamp()
    from candidates c where o.id=c.id returning o.*
  )
  select c.id::text,c.kind,c.payload,c.attempts,c.lease_token::text,
    case when c.kind='customer_quote' then d.filename end,
    case when c.kind='customer_quote' then d.mime_type end,
    case when c.kind='customer_quote' then encode(d.document_bytes,'base64') end,
    case when c.kind='customer_quote' then d.sha256 end
  from claimed c left join public.quote_documents d on d.lead_id=c.lead_id order by c.id;
end $$;

create or replace function public.aiow_quote_outbox_sent_v1(p_outbox_id bigint,p_lease_token uuid,p_provider_message_id text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_attempt integer;
begin
  if p_provider_message_id is null or length(p_provider_message_id) not between 1 and 256 or p_provider_message_id !~ '^[A-Za-z0-9_-]+$' then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_PROVIDER_ID'; end if;
  update public.mail_outbox o set state='sent',provider_message_id=p_provider_message_id,sent_at=clock_timestamp(),lease_token=null,lease_expires_at=null,last_error_code=null,updated_at=clock_timestamp()
    where o.id=p_outbox_id and o.state='claimed' and o.lease_token=p_lease_token and o.lease_expires_at>=clock_timestamp() returning o.attempts into v_attempt;
  if not found then raise exception using errcode='P0001',message='AIOW_QUOTE_LEASE_CONFLICT'; end if;
  insert into public.provider_delivery_attempts(outbox_id,attempt_number,outcome,provider_message_id) values(p_outbox_id,v_attempt,'sent',p_provider_message_id);
  return '{"accepted":true}'::jsonb;
end $$;

create or replace function public.aiow_quote_outbox_retry_v1(p_outbox_id bigint,p_lease_token uuid,p_error_code text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_attempt integer; v_state text;
begin
  if p_error_code is null or length(p_error_code) not between 1 and 64 or p_error_code !~ '^[A-Z0-9_:-]+$' then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_ERROR'; end if;
  update public.mail_outbox o set state=case when o.attempts>=5 then 'dead' else 'retry' end,available_at=clock_timestamp()+make_interval(secs=>least(3600,30*(2^greatest(o.attempts-1,0))::integer)),lease_token=null,lease_expires_at=null,last_error_code=p_error_code,updated_at=clock_timestamp()
    where o.id=p_outbox_id and o.state='claimed' and o.lease_token=p_lease_token and o.lease_expires_at>=clock_timestamp() returning o.attempts,o.state into v_attempt,v_state;
  if not found then raise exception using errcode='P0001',message='AIOW_QUOTE_LEASE_CONFLICT'; end if;
  insert into public.provider_delivery_attempts(outbox_id,attempt_number,outcome,error_code) values(p_outbox_id,v_attempt,v_state,p_error_code);
  return jsonb_build_object('accepted',true,'state',v_state);
end $$;

create or replace function public.aiow_quote_outbox_dead_v1(p_outbox_id bigint,p_lease_token uuid,p_error_code text)
returns jsonb language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_attempt integer;
begin
  if p_error_code is null or length(p_error_code) not between 1 and 64 or p_error_code !~ '^[A-Z0-9_:-]+$' then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_ERROR'; end if;
  update public.mail_outbox o set state='dead',lease_token=null,lease_expires_at=null,last_error_code=p_error_code,updated_at=clock_timestamp()
    where o.id=p_outbox_id and o.state='claimed' and o.lease_token=p_lease_token and o.lease_expires_at>=clock_timestamp() returning o.attempts into v_attempt;
  if not found then raise exception using errcode='P0001',message='AIOW_QUOTE_LEASE_CONFLICT'; end if;
  insert into public.provider_delivery_attempts(outbox_id,attempt_number,outcome,error_code) values(p_outbox_id,v_attempt,'dead',p_error_code);
  return '{"accepted":true}'::jsonb;
end $$;

create or replace function public.aiow_quote_outbox_review_v1(p_outbox_id bigint,p_lease_token uuid,p_error_code text,p_provider_message_id text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_attempt integer;
begin
  if p_error_code is null or length(p_error_code) not between 1 and 64 or p_error_code !~ '^[A-Z0-9_:-]+$'
    or (p_provider_message_id is not null and (length(p_provider_message_id) not between 1 and 256 or p_provider_message_id !~ '^[A-Za-z0-9_-]+$'))
  then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_REVIEW'; end if;
  update public.mail_outbox o set state='review',provider_message_id=p_provider_message_id,lease_token=null,lease_expires_at=null,last_error_code=p_error_code,updated_at=clock_timestamp()
    where o.id=p_outbox_id and o.state='claimed' and o.lease_token=p_lease_token and o.lease_expires_at>=clock_timestamp() returning o.attempts into v_attempt;
  if not found then raise exception using errcode='P0001',message='AIOW_QUOTE_LEASE_CONFLICT'; end if;
  insert into public.provider_delivery_attempts(outbox_id,attempt_number,outcome,provider_message_id,error_code) values(p_outbox_id,v_attempt,'review',p_provider_message_id,p_error_code);
  return '{"accepted":true,"state":"review"}'::jsonb;
end $$;

revoke all on function public.aiow_jsonb_exact_keys_v1(jsonb,text[]) from public;
revoke all on function public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb) from public;
revoke all on function public.aiow_quote_commit_v1(text,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text) from public;
revoke all on function public.aiow_quote_claim_outbox_v1(integer,integer) from public;
revoke all on function public.aiow_quote_outbox_sent_v1(bigint,uuid,text) from public;
revoke all on function public.aiow_quote_outbox_retry_v1(bigint,uuid,text) from public;
revoke all on function public.aiow_quote_outbox_dead_v1(bigint,uuid,text) from public;
revoke all on function public.aiow_quote_outbox_review_v1(bigint,uuid,text,text) from public;
do $$ begin
  if exists(select 1 from pg_roles where rolname='anon') then
    execute 'revoke all on table public.quote_sequences, public.quote_leads, public.quote_documents, public.mail_outbox, public.provider_delivery_attempts from anon';
    execute 'revoke all on sequence public.mail_outbox_id_seq, public.provider_delivery_attempts_id_seq from anon';
    execute 'revoke all on function public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb), public.aiow_quote_commit_v1(text,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text), public.aiow_quote_claim_outbox_v1(integer,integer), public.aiow_quote_outbox_sent_v1(bigint,uuid,text), public.aiow_quote_outbox_retry_v1(bigint,uuid,text), public.aiow_quote_outbox_dead_v1(bigint,uuid,text), public.aiow_quote_outbox_review_v1(bigint,uuid,text,text) from anon';
    execute 'revoke all on function public.aiow_jsonb_exact_keys_v1(jsonb,text[]) from anon';
  end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then
    execute 'revoke all on table public.quote_sequences, public.quote_leads, public.quote_documents, public.mail_outbox, public.provider_delivery_attempts from authenticated';
    execute 'revoke all on sequence public.mail_outbox_id_seq, public.provider_delivery_attempts_id_seq from authenticated';
    execute 'revoke all on function public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb), public.aiow_quote_commit_v1(text,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text), public.aiow_quote_claim_outbox_v1(integer,integer), public.aiow_quote_outbox_sent_v1(bigint,uuid,text), public.aiow_quote_outbox_retry_v1(bigint,uuid,text), public.aiow_quote_outbox_dead_v1(bigint,uuid,text), public.aiow_quote_outbox_review_v1(bigint,uuid,text,text) from authenticated';
    execute 'revoke all on function public.aiow_jsonb_exact_keys_v1(jsonb,text[]) from authenticated';
  end if;
  if exists(select 1 from pg_roles where rolname='service_role') then
    execute 'revoke all on table public.quote_sequences, public.quote_leads, public.quote_documents, public.mail_outbox, public.provider_delivery_attempts from service_role';
    execute 'revoke all on sequence public.mail_outbox_id_seq, public.provider_delivery_attempts_id_seq from service_role';
    execute 'revoke all on function public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb), public.aiow_quote_commit_v1(text,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text), public.aiow_quote_claim_outbox_v1(integer,integer), public.aiow_quote_outbox_sent_v1(bigint,uuid,text), public.aiow_quote_outbox_retry_v1(bigint,uuid,text), public.aiow_quote_outbox_dead_v1(bigint,uuid,text), public.aiow_quote_outbox_review_v1(bigint,uuid,text,text) from service_role';
    execute 'revoke all on function public.aiow_jsonb_exact_keys_v1(jsonb,text[]) from service_role';
    execute 'grant execute on function public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb) to service_role';
    execute 'grant execute on function public.aiow_quote_commit_v1(text,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text) to service_role';
    execute 'grant execute on function public.aiow_quote_claim_outbox_v1(integer,integer) to service_role';
    execute 'grant execute on function public.aiow_quote_outbox_sent_v1(bigint,uuid,text) to service_role';
    execute 'grant execute on function public.aiow_quote_outbox_retry_v1(bigint,uuid,text) to service_role';
    execute 'grant execute on function public.aiow_quote_outbox_dead_v1(bigint,uuid,text) to service_role';
    execute 'grant execute on function public.aiow_quote_outbox_review_v1(bigint,uuid,text,text) to service_role';
  end if;
end $$;
commit;
