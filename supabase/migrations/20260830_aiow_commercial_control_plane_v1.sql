begin;

-- AIOW commercial control-plane v1. Forward-only successor to
-- 20260828_aiow_quote_adapter_v1.sql.
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
alter extension pgcrypto set schema extensions;

create table public.commercial_leads (
  id uuid primary key default extensions.gen_random_uuid(),
  source text not null,
  source_id uuid not null,
  status text not null default 'new',
  priority text not null default 'normal',
  unread boolean not null default true,
  revision bigint not null default 1,
  route text not null,
  locale text not null,
  display_name text not null,
  email text not null,
  phone text,
  organisation text,
  next_action_at timestamptz,
  sla_due_at timestamptz not null,
  terminal_at timestamptz,
  abandoned_at timestamptz,
  active_customer_relation boolean not null default false,
  active_customer_relation_at timestamptz,
  legal_hold boolean not null default false,
  created_at timestamptz not null default transaction_timestamp(),
  updated_at timestamptz not null default transaction_timestamp(),
  constraint commercial_leads_source_ck check (source in ('booking','quote')),
  constraint commercial_leads_status_ck check (status in ('new','qualified','awaiting_info','scan_planned','proposal','won','lost')),
  constraint commercial_leads_priority_ck check (priority in ('normal','high','urgent')),
  constraint commercial_leads_revision_ck check (revision > 0),
  constraint commercial_leads_terminal_next_action_ck check (status not in ('won','lost') or next_action_at is null),
  constraint commercial_leads_route_locale_ck check ((locale='nl' and route in ('/','/booking','/quote','/knowledge','/context')) or (locale='en' and route in ('/en','/en/booking','/en/quote','/en/knowledge'))),
  constraint commercial_leads_abandoned_terminal_ck check (abandoned_at is null or terminal_at is not null),
  constraint commercial_leads_active_relation_time_ck check (active_customer_relation = (active_customer_relation_at is not null)),
  constraint commercial_leads_sla_ck check (sla_due_at >= created_at),
  constraint commercial_leads_source_source_id_uq unique(source,source_id)
);

create table public.booking_leads (
  id uuid primary key default extensions.gen_random_uuid(),
  commercial_lead_id uuid not null,
  request_id uuid not null,
  payload_digest text not null,
  payload jsonb not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint booking_leads_payload_digest_ck check (payload_digest ~ '^[0-9a-f]{64}$'),
  constraint booking_leads_commercial_lead_fk foreign key(commercial_lead_id) references public.commercial_leads(id) on delete cascade
);

create table public.commercial_mail_outbox (
  id uuid primary key default extensions.gen_random_uuid(),
  commercial_lead_id uuid not null,
  kind text not null,
  state text not null default 'pending',
  revision bigint not null default 1,
  payload jsonb not null,
  payload_sha256 text not null,
  lease_owner text,
  lease_token uuid,
  lease_expires_at timestamptz,
  attempts integer not null default 0,
  next_attempt_at timestamptz,
  provider_result jsonb,
  cancellation_reason text,
  created_at timestamptz not null default transaction_timestamp(),
  updated_at timestamptz not null default transaction_timestamp(),
  constraint commercial_mail_outbox_kind_ck check (kind in ('customer_booking','internal_booking','customer_quote','internal_lead')),
  constraint commercial_mail_outbox_state_ck check (state in ('pending','leased','retry','sent','dead','review','cancelled')),
  constraint commercial_mail_outbox_attempts_ck check (attempts between 0 and 5),
  constraint commercial_mail_outbox_payload_digest_ck check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  constraint commercial_mail_outbox_revision_ck check (revision > 0),
  constraint commercial_mail_outbox_lease_shape_ck check ((state='leased') = (lease_owner is not null and lease_token is not null and lease_expires_at is not null)),
  constraint commercial_mail_outbox_cancel_reason_ck check ((state='cancelled') = (cancellation_reason is not null)),
  constraint commercial_mail_outbox_lead_kind_uq unique(commercial_lead_id,kind),
  constraint commercial_mail_outbox_commercial_lead_fk foreign key(commercial_lead_id) references public.commercial_leads(id) on delete cascade
);
create index commercial_mail_outbox_claim_idx on public.commercial_mail_outbox(next_attempt_at,created_at,id) where state in ('pending','retry');
create index commercial_mail_outbox_stale_idx on public.commercial_mail_outbox(lease_expires_at,id) where state='leased';

create table public.commercial_events (
  event_id uuid primary key,
  payload_digest text not null,
  event jsonb not null,
  occurred_at timestamptz not null,
  expires_at timestamptz not null,
  constraint commercial_events_payload_digest_ck check(payload_digest ~ '^[0-9a-f]{64}$')
);

create table public.commercial_event_daily (
  day date not null,
  event_name text not null,
  route text not null,
  locale text not null,
  experiment_id text not null default '__none__',
  variant text not null default '__none__',
  count bigint not null,
  primary key(day,event_name,route,locale,experiment_id,variant),
  constraint commercial_event_daily_count_ck check(count >= 0),
  constraint commercial_event_daily_route_locale_ck check ((locale='nl' and route in ('/','/booking','/quote','/knowledge','/context')) or (locale='en' and route in ('/en','/en/booking','/en/quote','/en/knowledge'))),
  constraint commercial_event_daily_experiment_pair_ck check ((experiment_id='__none__' and variant='__none__') or (experiment_id='scan_cta_copy_v1' and variant in ('control','outcome_summary'))),
  constraint commercial_event_daily_experiment_event_ck check (experiment_id='__none__' or event_name in ('experiment_exposed','quote_succeeded','booking_succeeded','scan_cta_clicked'))
);

create table public.commercial_audit (
  id uuid primary key,
  commercial_lead_id uuid,
  actor_id text not null,
  actor_role text not null,
  action text not null,
  facts jsonb not null,
  occurred_at timestamptz not null,
  redact_after timestamptz not null,
  constraint commercial_audit_actor_role_ck check(actor_role='ops_admin'),
  constraint commercial_audit_facts_non_pii_ck check(facts ? 'nonPiiFactsOnly' and facts->>'nonPiiFactsOnly'='true'),
  constraint commercial_audit_commercial_lead_fk foreign key(commercial_lead_id) references public.commercial_leads(id) on delete set null
);

create table public.commercial_provider_gates (
  gate_id text primary key,
  state text not null,
  target jsonb not null,
  evidence_sha256 text not null,
  expires_at timestamptz,
  revision bigint not null,
  approved_at timestamptz,
  owner_approved_by text,
  approval_binding_sha256 text,
  audit_id uuid not null,
  constraint commercial_provider_gates_state_ck check(state in ('pending','approved','activated','expired','revoked')),
  constraint commercial_provider_gates_digest_ck check(evidence_sha256 ~ '^[0-9a-f]{64}$'),
  constraint commercial_provider_gates_owner_ck check(owner_approved_by is null or owner_approved_by='richard'),
  constraint commercial_provider_gates_binding_digest_ck check(approval_binding_sha256 is null or approval_binding_sha256 ~ '^[0-9a-f]{64}$')
);

create table public.commercial_idempotency (
  endpoint text not null,
  idempotency_key text not null,
  payload_digest text not null,
  http_status integer not null,
  outcome jsonb not null,
  created_at timestamptz not null,
  primary key(endpoint,idempotency_key),
  constraint commercial_idempotency_digest_ck check(payload_digest ~ '^[0-9a-f]{64}$'),
  constraint commercial_idempotency_http_status_ck check(http_status between 100 and 599)
);

-- Forward quote mapping, expiry and abandoned state.
alter table public.quote_leads add column commercial_lead_id uuid;
alter table public.quote_leads add column expires_at timestamptz;
alter table public.quote_leads drop constraint quote_leads_state_check;
alter table public.quote_leads add constraint quote_leads_state_check check(state in ('prepared','committed','abandoned'));
alter table public.quote_leads drop constraint quote_leads_check1;
alter table public.quote_leads add constraint quote_leads_check1 check(
  (state='prepared' and committed_at is null) or
  (state='committed' and committed_at is not null) or
  (state='abandoned' and committed_at is null)
);

-- Keep predecessor lead_id for released workers while adding the exact
-- normative document identity append-only.
alter table public.quote_documents add column quote_lead_id uuid;
update public.quote_documents set quote_lead_id=lead_id;
alter table public.quote_documents alter column quote_lead_id set not null;
alter table public.quote_documents add constraint quote_documents_quote_lead_fk
 foreign key(quote_lead_id) references public.quote_leads(id) on delete restrict;

create function public.aiow_next_business_day_v1(p_value timestamptz) returns timestamptz
language plpgsql immutable strict set search_path=pg_catalog as $$
declare v_local timestamp:=p_value at time zone 'Europe/Amsterdam'; v_date date; begin
 v_date:=v_local::date+1;
 while extract(isodow from v_date) in (6,7) loop v_date:=v_date+1; end loop;
 return (v_date+v_local::time) at time zone 'Europe/Amsterdam';
end $$;

create function public.aiow_json_canonical_v1(p_value jsonb) returns text
language plpgsql immutable strict set search_path=pg_catalog as $$
declare v_type text:=jsonb_typeof(p_value); v_result text; v_key text; v_item jsonb; begin
 if v_type in ('null','boolean','number') then return p_value::text;
 elsif v_type='string' then return to_jsonb(p_value#>>'{}')::text;
 elsif v_type='array' then
  v_result:='[';
  for v_item in select value from jsonb_array_elements(p_value) loop
   if v_result<>'[' then v_result:=v_result||','; end if;
   v_result:=v_result||public.aiow_json_canonical_v1(v_item);
  end loop;
  return v_result||']';
 elsif v_type='object' then
  v_result:='{';
  for v_key,v_item in select key,value from jsonb_each(p_value) order by key loop
   if v_result<>'{' then v_result:=v_result||','; end if;
   v_result:=v_result||to_jsonb(v_key)::text||':'||public.aiow_json_canonical_v1(v_item);
  end loop;
  return v_result||'}';
 end if;
 raise exception using errcode='22023',message='AIOW_JSON_INVALID';
end $$;

create function public.aiow_sha256_json_v1(p_value jsonb) returns text
language sql immutable strict set search_path=pg_catalog,extensions as $$
 select encode(extensions.digest(convert_to(public.aiow_json_canonical_v1(p_value),'UTF8'),'sha256'),'hex')
$$;

create function public.aiow_digest_matches_v1(p_value jsonb,p_digest text) returns boolean
language sql immutable strict set search_path=pg_catalog as $$
 select p_digest~'^[0-9a-f]{64}$' and public.aiow_sha256_json_v1(p_value)=p_digest
$$;

create function public.aiow_idempotency_lock_v1(p_endpoint text,p_key text) returns void
language plpgsql volatile security definer set search_path=pg_catalog as $$ begin
 if p_key is null or length(p_key) not between 16 and 128 or p_key!~'^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$'
 then raise exception using errcode='22023',message='AIOW_IDEMPOTENCY_KEY_INVALID'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_endpoint||E'\n'||p_key,0));
end $$;

create function public.aiow_email_valid_v1(p_value text) returns boolean
language sql immutable set search_path=pg_catalog as $$
 select p_value is not null and length(p_value) between 3 and 254 and p_value!~E'[\r\n]'
  and p_value~'^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
$$;

-- Backfill every predecessor quote one-to-one. Prepared rows exist but queue reads
-- suppress them until commit.
insert into public.commercial_leads(id,source,source_id,status,priority,unread,revision,route,locale,display_name,email,phone,organisation,sla_due_at,created_at,updated_at)
select extensions.gen_random_uuid(),'quote',q.id,'new','normal',(q.state='committed'),1,
  case when q.source->>'locale'='en' then coalesce(nullif(q.source->>'route',''),'/en') else coalesce(nullif(q.source->>'route',''),'/') end,
  case when q.source->>'locale'='en' then 'en' else 'nl' end,
  left(coalesce(nullif(btrim(q.contact->>'name'),''),'Quote lead'),100),
  lower(coalesce(nullif(q.contact->>'email',''),'unknown@invalid.local')),
  nullif(left(btrim(q.contact->>'phone'),40),''), nullif(left(btrim(q.contact->>'company'),120),''),
  case when q.state='committed' then public.aiow_next_business_day_v1(q.committed_at) else q.prepared_at end,coalesce(q.committed_at,q.prepared_at),coalesce(q.committed_at,q.prepared_at)
from public.quote_leads q;
update public.quote_leads q set commercial_lead_id=c.id, expires_at=q.prepared_at+interval '24 hours'
from public.commercial_leads c where c.source='quote' and c.source_id=q.id;
alter table public.quote_leads alter column commercial_lead_id set not null;
alter table public.quote_leads alter column expires_at set not null;
alter table public.quote_leads add constraint quote_leads_commercial_lead_fk foreign key(commercial_lead_id) references public.commercial_leads(id) on delete restrict;
alter table public.quote_leads add constraint quote_leads_commercial_lead_uq unique(commercial_lead_id);

-- Closed helpers are never granted to API roles.
create function public.aiow_iso_v1(p_value timestamptz) returns text
language sql immutable strict set search_path=pg_catalog as $$
  select to_char(p_value at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
$$;


create function public.aiow_outbox_projection_v2(p_row public.commercial_mail_outbox) returns jsonb
language sql stable strict set search_path=pg_catalog as $$
 select jsonb_build_object(
  'schemaKind','outbox_projection','id',lower(p_row.id::text),'commercialLeadId',lower(p_row.commercial_lead_id::text),
  'kind',p_row.kind,'revision',p_row.revision,'payloadSha256',p_row.payload_sha256,'attempts',p_row.attempts,'state',p_row.state,
  'leaseOwner',p_row.lease_owner,'leaseToken',case when p_row.lease_token is null then null else lower(p_row.lease_token::text) end,
  'leaseExpiresAt',case when p_row.lease_expires_at is null then null else public.aiow_iso_v1(p_row.lease_expires_at) end,
  'nextAttemptAt',case when p_row.next_attempt_at is null then null else public.aiow_iso_v1(p_row.next_attempt_at) end,
  'lastResult',p_row.provider_result,'cancellationReason',p_row.cancellation_reason)
$$;

create function public.aiow_lead_projection_v1(p_row public.commercial_leads) returns jsonb
language sql stable strict security definer set search_path=pg_catalog as $$
 select jsonb_build_object(
  'schemaKind','lead_projection','id',lower(p_row.id::text),'source',p_row.source,'sourceId',lower(p_row.source_id::text),
  'createdAt',public.aiow_iso_v1(p_row.created_at),'updatedAt',public.aiow_iso_v1(p_row.updated_at),'revision',p_row.revision,
  'unread',p_row.unread,'status',p_row.status,'priority',p_row.priority,'displayName',p_row.display_name,'email',p_row.email,
  'phone',p_row.phone,'organisation',p_row.organisation,'route',p_row.route,'locale',p_row.locale,
  'nextActionAt',case when p_row.next_action_at is null then null else public.aiow_iso_v1(p_row.next_action_at) end,
  'slaDueAt',public.aiow_iso_v1(p_row.sla_due_at),'overdue',transaction_timestamp()>p_row.sla_due_at and p_row.status not in ('won','lost'),
  'exception',case when exists(select 1 from public.commercial_mail_outbox o where o.commercial_lead_id=p_row.id and o.state='review') then 'delivery_review'
                   when exists(select 1 from public.commercial_mail_outbox o where o.commercial_lead_id=p_row.id and o.state='dead') then 'delivery_dead'
                   when p_row.next_action_at is not null and transaction_timestamp()>p_row.next_action_at then 'next_action_overdue' else null end,
  'deliverySummary',jsonb_build_object('schemaKind','delivery_summary',
    'customer',coalesce((select case state when 'leased' then 'processing' when 'retry' then 'retry' when 'cancelled' then 'dead' else state end from public.commercial_mail_outbox where commercial_lead_id=p_row.id and kind in ('customer_booking','customer_quote')),'pending'),
    'internal',coalesce((select case state when 'leased' then 'processing' when 'retry' then 'retry' when 'cancelled' then 'dead' else state end from public.commercial_mail_outbox where commercial_lead_id=p_row.id and kind in ('internal_booking','internal_lead')),'pending'),
    'hasAmbiguity',exists(select 1 from public.commercial_mail_outbox where commercial_lead_id=p_row.id and state='review'),
    'lastAttemptAt',(select case when max(updated_at) is null then null else public.aiow_iso_v1(max(updated_at)) end from public.commercial_mail_outbox where commercial_lead_id=p_row.id and attempts>0)),
  'activeCustomerRelation',p_row.active_customer_relation,'legalHold',p_row.legal_hold)
$$;

create function public.aiow_audit_v1(p_lead uuid,p_action text,p_facts jsonb) returns uuid
language plpgsql volatile security definer set search_path=pg_catalog,extensions as $$
declare v_id uuid:=extensions.gen_random_uuid(); begin
 insert into public.commercial_audit(id,commercial_lead_id,actor_id,actor_role,action,facts,occurred_at,redact_after)
 values(v_id,p_lead,'richard','ops_admin',p_action,p_facts||'{"nonPiiFactsOnly":true}'::jsonb,transaction_timestamp(),'infinity'::timestamptz);
 return v_id;
end $$;

create function public.aiow_idempotency_replay_v1(p_endpoint text,p_key text,p_digest text) returns jsonb
language plpgsql volatile security definer set search_path=pg_catalog as $$
declare v public.commercial_idempotency%rowtype; begin
 select * into v from public.commercial_idempotency where endpoint=p_endpoint and idempotency_key=p_key for update;
 if not found then return null; end if;
 if v.payload_digest<>p_digest then raise exception using errcode='23505',message='AIOW_IDEMPOTENCY_CONFLICT'; end if;
 return v.outcome;
end $$;

create function public.aiow_idempotency_store_v1(p_endpoint text,p_key text,p_digest text,p_outcome jsonb) returns void
language sql volatile security definer set search_path=pg_catalog as $$
 insert into public.commercial_idempotency(endpoint,idempotency_key,payload_digest,http_status,outcome,created_at)
 values(p_endpoint,p_key,p_digest,200,p_outcome,transaction_timestamp())
$$;

create function public.aiow_booking_valid_v1(p_booking jsonb) returns boolean
language plpgsql immutable set search_path=pg_catalog as $$ begin
 return public.aiow_jsonb_exact_keys_v1(p_booking,array['schemaKind','subject','details','date','slot','name','email','company','locale','consentAccepted','consentVersion'])
  and p_booking->>'schemaKind'='booking_request' and p_booking->>'subject' in ('bedrijf','woning','gebouw','anders')
  and length(btrim(p_booking->>'details')) between 1 and 1200
  and (p_booking->>'date')~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$' and ((p_booking->>'date')::date)::text=p_booking->>'date'
  and (p_booking->>'slot')~'^[0-2][0-9]:[0-5][0-9]$'
  and length(btrim(p_booking->>'name')) between 1 and 100 and public.aiow_email_valid_v1(p_booking->>'email')
  and length(p_booking->>'company')<=120 and p_booking->>'locale' in ('nl','en')
  and p_booking->'consentAccepted'='true'::jsonb and p_booking->>'consentVersion'='aiow-booking-v1';
exception when others then return false; end $$;

create function public.aiow_quote_valid_v1(p_quote jsonb,p_contact jsonb,p_consent jsonb,p_source jsonb,p_country text) returns boolean
language plpgsql immutable set search_path=pg_catalog as $$
declare c jsonb:=p_quote->'configuration'; begin
 if not public.aiow_jsonb_exact_keys_v1(p_quote,array['schemaKind','configuration','contact','consent','source','country'])
  or p_quote->>'schemaKind'<>'quote_request' or p_quote->'contact'<>p_contact or p_quote->'consent'<>p_consent or p_quote->'source'<>p_source or p_quote->>'country'<>p_country
  or not public.aiow_jsonb_exact_keys_v1(c,array['segment','serviceRoute','contextSlug','people','squareMetres','homeSubtype','smartDesignModules'])
  or c->>'segment' not in ('business','building','home') or c->>'serviceRoute' not in ('standard','comfort')
  or not (c->'contextSlug'='null'::jsonb or c->>'contextSlug' in ('accountants','business-services','care','education','hospitality','retail','logistics','manufacturing','real-estate','government','woning','bedrijfshal-industrie'))
  or not (c->'people'='null'::jsonb or (jsonb_typeof(c->'people')='number' and (c->>'people')::integer between 1 and 10000 and to_jsonb((c->>'people')::integer)=c->'people'))
  or not (c->'squareMetres'='null'::jsonb or (jsonb_typeof(c->'squareMetres')='number' and (c->>'squareMetres')::integer between 1 and 1000000 and to_jsonb((c->>'squareMetres')::integer)=c->'squareMetres'))
  or not (c->'homeSubtype'='null'::jsonb or c->>'homeSubtype' in ('home','signature'))
  or jsonb_typeof(c->'smartDesignModules')<>'array' or jsonb_array_length(c->'smartDesignModules')>3
  or exists(select 1 from jsonb_array_elements_text(c->'smartDesignModules') x where x not in ('scan','blueprint','supervision'))
  or (select count(*) from jsonb_array_elements_text(c->'smartDesignModules'))<>(select count(distinct x) from jsonb_array_elements_text(c->'smartDesignModules') x)
  or not public.aiow_jsonb_exact_keys_v1(p_contact,array['name','email','phone','company','postcode','kvk','startDate','note'])
  or length(btrim(p_contact->>'name')) not between 1 and 100 or not public.aiow_email_valid_v1(p_contact->>'email') or length(p_contact->>'phone') not between 6 and 40
  or not (p_contact->'company'='null'::jsonb or length(p_contact->>'company')<=120)
  or not (p_contact->'postcode'='null'::jsonb or p_contact->>'postcode'~'^[1-9][0-9]{3} ?[A-Z]{2}$')
  or not (p_contact->'kvk'='null'::jsonb or p_contact->>'kvk'~'^[0-9]{8}$')
  or not (p_contact->'startDate'='null'::jsonb or ((p_contact->>'startDate')~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$' and ((p_contact->>'startDate')::date)::text=p_contact->>'startDate'))
  or not (p_contact->'note'='null'::jsonb or length(p_contact->>'note')<=2000)
  or p_consent<>'{"accepted":true,"version":"aiow-quote-v1"}'::jsonb
  or not public.aiow_jsonb_exact_keys_v1(p_source,array['route','locale']) or p_source->>'locale' not in ('nl','en')
  or not ((p_source->>'locale'='nl' and p_source->>'route' in ('/','/booking','/quote','/knowledge','/context')) or (p_source->>'locale'='en' and p_source->>'route' in ('/en','/en/booking','/en/quote','/en/knowledge')))
  or p_country!~'^[A-Z]{2}$' then return false; end if;
 return true;
exception when others then return false; end $$;

create function public.aiow_mail_job_valid_v1(p_job jsonb,p_kind text,p_lead uuid) returns boolean
language plpgsql immutable set search_path=pg_catalog,extensions as $$
declare a jsonb; v bytea; begin
 if not public.aiow_jsonb_exact_keys_v1(p_job,array['schemaKind','jobId','commercialLeadId','kind','from','to','subject','text','html','attachments','payloadSha256','attempt','leaseOwner','leaseToken','leaseExpiresAt'])
  or p_job->>'schemaKind'<>'mail_job' or (p_job->>'jobId')::uuid is null or (p_job->>'commercialLeadId')::uuid<>p_lead or p_job->>'kind'<>p_kind
  or not public.aiow_email_valid_v1(p_job->>'from') or jsonb_typeof(p_job->'to')<>'array' or jsonb_array_length(p_job->'to') not between 1 and 5
  or exists(select 1 from jsonb_array_elements_text(p_job->'to') x where not public.aiow_email_valid_v1(x))
  or (select count(*) from jsonb_array_elements_text(p_job->'to'))<>(select count(distinct x) from jsonb_array_elements_text(p_job->'to') x)
  or length(p_job->>'subject') not between 1 and 200 or length(p_job->>'text') not between 1 and 20000 or length(p_job->>'html') not between 1 and 50000
  or jsonb_typeof(p_job->'attachments')<>'array' or jsonb_array_length(p_job->'attachments')>2 or p_job->>'payloadSha256'!~'^[0-9a-f]{64}$'
  or (p_job->>'attempt')::integer not between 1 and 5 or length(p_job->>'leaseOwner') not between 1 and 100
  or (p_job->>'leaseToken')::uuid is null or (p_job->>'leaseExpiresAt')::timestamptz is null then return false; end if;
 for a in select value from jsonb_array_elements(p_job->'attachments') loop
  if not public.aiow_jsonb_exact_keys_v1(a,array['filename','mimeType','base64','sha256']) or length(a->>'filename') not between 1 and 128
   or a->>'mimeType' not in ('application/pdf','text/calendar') or length(a->>'base64')>2000000 or a->>'sha256'!~'^[0-9a-f]{64}$' then return false; end if;
  begin v:=decode(a->>'base64','base64'); exception when others then return false; end;
  if encode(extensions.digest(v,'sha256'),'hex')<>a->>'sha256' then return false; end if;
 end loop;
 return true;
exception when others then return false; end $$;

create function public.aiow_event_valid_v1(p_event jsonb,p_now timestamptz) returns boolean
language plpgsql stable set search_path=pg_catalog as $$
declare n text:=p_event->>'event'; e jsonb:=p_event->'experiment'; keys text[]; begin
 if jsonb_typeof(p_event)<>'object' or (p_event->>'eventId')::uuid is null or abs(extract(epoch from(p_now-(p_event->>'occurredAt')::timestamptz)))>600
  or not ((p_event->>'locale'='nl' and p_event->>'route' in ('/','/booking','/quote','/knowledge','/context')) or (p_event->>'locale'='en' and p_event->>'route' in ('/en','/en/booking','/en/quote','/en/knowledge'))) then return false; end if;
 keys:=case n when 'page_view' then array['schemaKind','eventId','event','occurredAt','route','locale','viewport']
  when 'calculator_changed' then array['schemaKind','eventId','event','occurredAt','route','locale','segment','serviceRoute']
  when 'context_opened' then array['schemaKind','eventId','event','occurredAt','route','locale','contextSlug']
  when 'quote_opened' then array['schemaKind','eventId','event','occurredAt','route','locale']
  when 'quote_succeeded' then array['schemaKind','eventId','event','occurredAt','route','locale','experiment']
  when 'quote_failed' then array['schemaKind','eventId','event','occurredAt','route','locale','failureClass']
  when 'booking_opened' then array['schemaKind','eventId','event','occurredAt','route','locale']
  when 'booking_succeeded' then array['schemaKind','eventId','event','occurredAt','route','locale','experiment']
  when 'booking_failed' then array['schemaKind','eventId','event','occurredAt','route','locale','failureClass']
  when 'scan_cta_clicked' then array['schemaKind','eventId','event','occurredAt','route','locale','experiment']
  when 'knowledge_cta_clicked' then array['schemaKind','eventId','event','occurredAt','route','locale']
  when 'experiment_exposed' then array['schemaKind','eventId','event','occurredAt','route','locale','experiment'] else null end;
 if keys is null or not public.aiow_jsonb_exact_keys_v1(p_event,keys) or p_event->>'schemaKind'<>'analytics_'||n then return false; end if;
 if n='page_view' and p_event->>'viewport' not in ('mobile','tablet','desktop') then return false;
 elsif n='calculator_changed' and (p_event->>'segment' not in ('business','building','home') or p_event->>'serviceRoute' not in ('standard','comfort')) then return false;
 elsif n='context_opened' and p_event->>'contextSlug' not in ('accountants','care','education','hospitality','retail','logistics','manufacturing','woning','bedrijfshal-industrie') then return false;
 elsif n in ('quote_failed','booking_failed') and p_event->>'failureClass' not in ('validation','rate_limit','unavailable','conflict') then return false; end if;
 if n in ('quote_succeeded','booking_succeeded','scan_cta_clicked') then
  if not (e='null'::jsonb or (public.aiow_jsonb_exact_keys_v1(e,array['experimentId','variant']) and e->>'experimentId'='scan_cta_copy_v1' and e->>'variant' in ('control','outcome_summary'))) then return false; end if;
 elsif n='experiment_exposed' then
  if not (public.aiow_jsonb_exact_keys_v1(e,array['experimentId','variant']) and e->>'experimentId'='scan_cta_copy_v1' and e->>'variant' in ('control','outcome_summary')) then return false; end if;
 elsif p_event ? 'experiment' then return false; end if;
 return true;
exception when others then return false; end $$;

create function public.aiow_provider_result_valid_v1(p_result jsonb,p_category text) returns boolean
language plpgsql stable set search_path=pg_catalog as $$
declare r jsonb:=p_result->'receipt'; c text:=p_result->>'code'; begin
 if not public.aiow_jsonb_exact_keys_v1(p_result,array['schemaKind','category','code','receipt']) or p_result->>'category'<>p_category
  or not public.aiow_jsonb_exact_keys_v1(r,array['provider','httpStatus','graphRequestId','providerMessageId','acceptanceKind','attemptReceipt','observedAt'])
  or r->>'provider'<>'microsoft_graph' or (r->>'httpStatus')::integer not between 100 and 599
  or not (r->'graphRequestId'='null'::jsonb or length(r->>'graphRequestId') between 1 and 200)
  or not (r->'providerMessageId'='null'::jsonb or length(r->>'providerMessageId') between 1 and 512)
  or length(r->>'attemptReceipt') not between 1 and 2000 or (r->>'observedAt')::timestamptz is null then return false; end if;
 if p_category='accepted' then return p_result->>'schemaKind'='provider_accepted' and p_result->'code'='null'::jsonb and r->>'httpStatus'='202' and r->>'acceptanceKind'='graph_http_202';
 elsif p_category='transient_pre_acceptance' then return p_result->>'schemaKind'='provider_transient_pre_acceptance' and c in ('timeout_before_response','network_before_response','throttled_429','graph_5xx') and r->'acceptanceKind'='null'::jsonb;
 elsif p_category='permanent_pre_acceptance' then return p_result->>'schemaKind'='provider_permanent_pre_acceptance' and c in ('oauth_authentication_failed','exchange_rbac_denied','invalid_recipient','invalid_payload','retry_exhausted') and r->'acceptanceKind'='null'::jsonb;
 elsif p_category='ambiguous' then return p_result->>'schemaKind'='provider_ambiguous' and c in ('timeout_after_request_body','connection_lost_after_dispatch','unknown_acceptance') and r->'acceptanceKind'='null'::jsonb; end if;
 return false;
exception when others then return false; end $$;

-- Replace v1 quote wire routines forward-only: UUID request IDs, common lead mapping,
-- v2 outbox. Historical v1 outbox rows remain drainable by the predecessor worker.
drop function public.aiow_quote_prepare_v1(text,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb);
drop function public.aiow_quote_commit_v1(text,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text);

create function public.aiow_quote_prepare_v1(
 p_request_id uuid,p_idempotency_key text,p_received_at timestamptz,p_country text,
 p_quote jsonb,p_contact jsonb,p_consent jsonb,p_source jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_now timestamptz:=transaction_timestamp(); v_year integer; v_hash text; v_q public.quote_leads%rowtype;
 v_seq integer; v_qid uuid:=extensions.gen_random_uuid(); v_cid uuid:=extensions.gen_random_uuid(); v_ack jsonb; v_replay jsonb;
begin
 if p_request_id is null or p_received_at is null or abs(extract(epoch from(v_now-p_received_at)))>300
  or not public.aiow_quote_valid_v1(p_quote,p_contact,p_consent,p_source,p_country)
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_PREPARE'; end if;
 v_hash:=public.aiow_sha256_json_v1(p_quote-'schemaKind');
 perform public.aiow_idempotency_lock_v1('quote_prepare',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('quote_prepare',p_idempotency_key,v_hash);
 if v_replay is not null then return v_replay; end if;
 select * into v_q from public.quote_leads where idempotency_key=p_idempotency_key for update;
 if found then
  if v_q.request_payload_hash<>v_hash then raise exception using errcode='23505',message='AIOW_QUOTE_IDEMPOTENCY_CONFLICT'; end if;
  v_ack:=jsonb_build_object('schemaKind','quote_prepare_ack','accepted',true,'requestId',lower(v_q.request_id),'leadId',lower(v_q.id::text),
   'commercialLeadId',lower(v_q.commercial_lead_id::text),'quoteNumber',v_q.quote_number,'state','prepared','expiresAt',public.aiow_iso_v1(v_q.expires_at),'replayed',false);
  perform public.aiow_idempotency_store_v1('quote_prepare',p_idempotency_key,v_hash,v_ack);
  return v_ack;
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
 perform public.aiow_idempotency_store_v1('quote_prepare',p_idempotency_key,v_hash,v_ack);
 return v_ack;
end $$;

create function public.aiow_quote_commit_v1(
 p_request_id uuid,p_idempotency_key text,p_quote_number text,p_lead_id uuid,p_pdf_filename text,p_pdf_mime_type text,
 p_pdf_base64 text,p_pdf_sha256 text,p_customer_mail jsonb,p_internal_mail jsonb,p_quote jsonb,p_contact jsonb,p_source jsonb,p_country text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_q public.quote_leads%rowtype; v_bytes bytea; v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_doc public.quote_documents%rowtype;
 v_hash text; v_replay jsonb;
begin
 if p_request_id is null or not public.aiow_quote_valid_v1(p_quote,p_contact,p_quote->'consent',p_source,p_country)
  or p_pdf_filename<>p_quote_number||'.pdf' or p_pdf_mime_type<>'application/pdf' or p_pdf_sha256!~'^[0-9a-f]{64}$'
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_COMMIT'; end if;
 begin v_bytes:=decode(p_pdf_base64,'base64'); exception when others then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_PDF'; end;
 if octet_length(v_bytes) not between 5 and 1500000 or substring(v_bytes from 1 for 5)<>convert_to('%PDF-','UTF8') or encode(extensions.digest(v_bytes,'sha256'),'hex')<>p_pdf_sha256
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_PDF'; end if;
 v_hash:=public.aiow_sha256_json_v1(jsonb_build_object('leadId',lower(p_lead_id::text),'commercialLeadId',p_customer_mail->>'commercialLeadId','quoteNumber',p_quote_number,
  'pdf',jsonb_build_object('filename',p_pdf_filename,'mimeType',p_pdf_mime_type,'sha256',p_pdf_sha256)));
 perform public.aiow_idempotency_lock_v1('quote_commit',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('quote_commit',p_idempotency_key,v_hash);
 if v_replay is not null then return v_replay; end if;
 select * into v_q from public.quote_leads where id=p_lead_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_QUOTE_PREPARE_NOT_FOUND'; end if;
 v_replay:=public.aiow_idempotency_replay_v1('quote_commit',p_idempotency_key,v_hash);
 if v_replay is not null then return v_replay; end if;
 if v_q.idempotency_key<>p_idempotency_key or v_q.quote_number<>p_quote_number or v_q.normalized_quote<>p_quote or v_q.contact<>p_contact
  or v_q.source<>p_source or v_q.country<>p_country
  or not public.aiow_mail_job_valid_v1(p_customer_mail,'customer_quote',v_q.commercial_lead_id)
  or not public.aiow_mail_job_valid_v1(p_internal_mail,'internal_lead',v_q.commercial_lead_id)
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_COMMIT'; end if;
 if v_q.state='abandoned' then raise exception using errcode='P0001',message='AIOW_QUOTE_ABANDONED'; end if;
 if v_q.state='committed' then
  select * into v_doc from public.quote_documents where quote_lead_id=v_q.id;
  if v_doc.sha256<>p_pdf_sha256 or v_doc.document_bytes<>v_bytes
   or not exists(select 1 from public.commercial_mail_outbox where commercial_lead_id=v_q.commercial_lead_id and kind='customer_quote' and payload=p_customer_mail)
   or not exists(select 1 from public.commercial_mail_outbox where commercial_lead_id=v_q.commercial_lead_id and kind='internal_lead' and payload=p_internal_mail)
  then raise exception using errcode='23505',message='AIOW_QUOTE_COMMIT_CONFLICT'; end if;
  v_ack:=jsonb_build_object('schemaKind','quote_commit_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_q.id::text),'commercialLeadId',lower(v_q.commercial_lead_id::text),'quoteNumber',v_q.quote_number,'state','committed','pdfSha256',p_pdf_sha256,'committedAt',public.aiow_iso_v1(v_q.committed_at),'replayed',false,'pdfDeliveryPermitted',true);
  perform public.aiow_idempotency_store_v1('quote_commit',p_idempotency_key,v_hash,v_ack);
  return v_ack;
 end if;
 insert into public.quote_documents(lead_id,quote_lead_id,filename,mime_type,document_bytes,sha256) values(v_q.id,v_q.id,p_pdf_filename,p_pdf_mime_type,v_bytes,p_pdf_sha256);
 insert into public.commercial_mail_outbox(commercial_lead_id,kind,payload,payload_sha256,next_attempt_at)
 values(v_q.commercial_lead_id,'customer_quote',p_customer_mail,public.aiow_sha256_json_v1(p_customer_mail),v_now),
       (v_q.commercial_lead_id,'internal_lead',p_internal_mail,public.aiow_sha256_json_v1(p_internal_mail),v_now);
 update public.quote_leads set state='committed',committed_at=v_now where id=v_q.id;
 update public.commercial_leads set unread=true,created_at=v_now,updated_at=v_now,sla_due_at=public.aiow_next_business_day_v1(v_now) where id=v_q.commercial_lead_id;
 v_ack:=jsonb_build_object('schemaKind','quote_commit_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_q.id::text),'commercialLeadId',lower(v_q.commercial_lead_id::text),'quoteNumber',v_q.quote_number,'state','committed','pdfSha256',p_pdf_sha256,'committedAt',public.aiow_iso_v1(v_now),'replayed',false,'pdfDeliveryPermitted',true);
 perform public.aiow_idempotency_store_v1('quote_commit',p_idempotency_key,v_hash,v_ack);
 return v_ack;
end $$;

create function public.aiow_booking_commit_v1(p_request_id uuid,p_idempotency_key text,p_payload_digest text,p_booking jsonb,p_source jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_bid uuid:=extensions.gen_random_uuid(); v_cid uuid:=extensions.gen_random_uuid(); v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_customer jsonb; v_internal jsonb; v_canonical jsonb; v_digest text;
begin
 if p_request_id is null or not public.aiow_booking_valid_v1(p_booking)
  or not public.aiow_jsonb_exact_keys_v1(p_source,array['route','locale'])
  or p_source<>jsonb_build_object('route',case p_booking->>'locale' when 'nl' then '/' else '/en' end,'locale',p_booking->>'locale')
 then raise exception using errcode='22023',message='AIOW_BOOKING_INVALID'; end if;
 v_canonical:=jsonb_build_object('subject',p_booking->'subject','details',btrim(p_booking->>'details'),'date',p_booking->'date','slot',p_booking->'slot',
  'name',btrim(p_booking->>'name'),'email',lower(p_booking->>'email'),'company',btrim(p_booking->>'company'),'locale',p_booking->'locale',
  'consentAccepted',p_booking->'consentAccepted','consentVersion',p_booking->'consentVersion');
 v_digest:=public.aiow_sha256_json_v1(v_canonical);
 if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('booking',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('booking',p_idempotency_key,v_digest);
 if v_replay is not null then return v_replay; end if;
 insert into public.commercial_leads(id,source,source_id,route,locale,display_name,email,organisation,sla_due_at,created_at,updated_at)
 values(v_cid,'booking',v_bid,p_source->>'route',p_source->>'locale',left(btrim(p_booking->>'name'),100),lower(p_booking->>'email'),nullif(left(btrim(p_booking->>'company'),120),''),public.aiow_next_business_day_v1(v_now),v_now,v_now);
 insert into public.booking_leads(id,commercial_lead_id,request_id,payload_digest,payload,created_at) values(v_bid,v_cid,p_request_id,v_digest,p_booking,v_now);
 v_customer:=jsonb_build_object('schemaKind','mail_job','jobId',lower(extensions.gen_random_uuid()::text),'commercialLeadId',lower(v_cid::text),'kind','customer_booking','from','booking@aiow.ai','to',jsonb_build_array(lower(p_booking->>'email')),'subject','Booking ontvangen','text','Booking received','html','<p>Booking received</p>','attachments','[]'::jsonb,'payloadSha256',repeat('0',64),'attempt',1,'leaseOwner','pending','leaseToken',lower(extensions.gen_random_uuid()::text),'leaseExpiresAt',public.aiow_iso_v1(v_now));
 v_customer:=jsonb_set(v_customer,'{payloadSha256}',to_jsonb(public.aiow_sha256_json_v1(v_customer-'payloadSha256')));
 v_internal:=jsonb_build_object('schemaKind','mail_job','jobId',lower(extensions.gen_random_uuid()::text),'commercialLeadId',lower(v_cid::text),'kind','internal_booking','from','booking@aiow.ai','to',jsonb_build_array('booking@aiow.ai'),'subject','Nieuwe booking','text','New booking','html','<p>New booking</p>','attachments','[]'::jsonb,'payloadSha256',repeat('0',64),'attempt',1,'leaseOwner','pending','leaseToken',lower(extensions.gen_random_uuid()::text),'leaseExpiresAt',public.aiow_iso_v1(v_now));
 v_internal:=jsonb_set(v_internal,'{payloadSha256}',to_jsonb(public.aiow_sha256_json_v1(v_internal-'payloadSha256')));
 if not public.aiow_mail_job_valid_v1(v_customer,'customer_booking',v_cid) or not public.aiow_mail_job_valid_v1(v_internal,'internal_booking',v_cid)
 then raise exception using errcode='22023',message='AIOW_MAIL_INVALID'; end if;
 insert into public.commercial_mail_outbox(commercial_lead_id,kind,payload,payload_sha256,next_attempt_at)
 values(v_cid,'customer_booking',v_customer,public.aiow_sha256_json_v1(v_customer),v_now),(v_cid,'internal_booking',v_internal,public.aiow_sha256_json_v1(v_internal),v_now);
 v_ack:=jsonb_build_object('schemaKind','booking_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_cid::text),'revision',1,
  'preference',jsonb_build_object('date',p_booking->>'date','slot',p_booking->>'slot','subject',p_booking->>'subject'),'durableAt',public.aiow_iso_v1(v_now),'replayed',false);
 perform public.aiow_idempotency_store_v1('booking',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

create function public.aiow_commercial_queue_v1(p_cursor_created_at timestamptz,p_cursor_id uuid,p_limit integer) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v_items jsonb; v_counts jsonb; v_next jsonb; begin
 if p_limit not between 1 and 100 or ((p_cursor_created_at is null)<>(p_cursor_id is null)) then raise exception using errcode='22023',message='AIOW_QUEUE_INVALID'; end if;
 with eligible as (
  select c.* from public.commercial_leads c left join public.quote_leads q on c.source='quote' and q.id=c.source_id
  where (c.source='booking' or q.state='committed') and (p_cursor_created_at is null or (c.created_at,c.id)<(p_cursor_created_at,p_cursor_id))
  order by c.created_at desc,c.id desc limit p_limit
 ) select coalesce(jsonb_agg(public.aiow_lead_projection_v1(e) order by e.created_at desc,e.id desc),'[]'::jsonb) into v_items from eligible e;
 select jsonb_build_object('schemaKind','queue_counts','total',count(*),'unread',count(*) filter(where c.unread),
  'actionable',count(*) filter(where c.status not in ('won','lost')),'overdue',count(*) filter(where transaction_timestamp()>c.sla_due_at and c.status not in ('won','lost')),
  'exceptions',count(*) filter(where exists(select 1 from public.commercial_mail_outbox o where o.commercial_lead_id=c.id and o.state in ('review','dead')))) into v_counts
 from public.commercial_leads c left join public.quote_leads q on c.source='quote' and q.id=c.source_id where c.source='booking' or q.state='committed';
 if jsonb_array_length(v_items)=p_limit then select jsonb_build_object('schemaKind','queue_cursor','createdAt',x->>'createdAt','id',x->>'id') into v_next from (select v_items->(jsonb_array_length(v_items)-1) x) s; else v_next:=null; end if;
 return jsonb_build_object('schemaKind','queue_projection','items',v_items,'counts',v_counts,'nextCursor',v_next);
end $$;

create function public.aiow_commercial_mutate_v1(p_idempotency_key text,p_payload_digest text,p_mutation jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_lead public.commercial_leads%rowtype; v_before bigint; v_now timestamptz:=transaction_timestamp(); v_op text; v_audit uuid; v_effect jsonb; v_ack jsonb; v_to text; v_allowed boolean; v_digest text;
begin
 if jsonb_typeof(p_mutation)<>'object' or p_mutation->>'idempotencyKey'<>p_idempotency_key then raise exception using errcode='22023',message='AIOW_MUTATION_INVALID'; end if;
 v_digest:=public.aiow_sha256_json_v1(p_mutation-'schemaKind'-'idempotencyKey');
 if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('ops_mutation',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('ops_mutation',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 select * into v_lead from public.commercial_leads where id=(p_mutation->>'leadId')::uuid for update;
 if not found then raise exception using errcode='P0001',message='AIOW_LEAD_NOT_FOUND'; end if;
 v_replay:=public.aiow_idempotency_replay_v1('ops_mutation',p_idempotency_key,v_digest); if v_replay is not null then return v_replay; end if;
 if v_lead.revision<>(p_mutation->>'expectedRevision')::bigint then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
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
   abandoned_at=case when v_lead.status='lost' and v_to='qualified' then null else abandoned_at end,revision=revision+1,updated_at=v_now where id=v_lead.id;
  v_effect:=jsonb_build_object('status',v_to);
 elsif v_op='resolve_outbox' then
  raise exception using errcode='22023',message='AIOW_USE_OUTBOX_RESOLVE_RPC';
 else raise exception using errcode='22023',message='AIOW_MUTATION_INVALID_OPERATION'; end if;
 select * into v_lead from public.commercial_leads where id=v_lead.id;
 v_audit:=public.aiow_audit_v1(v_lead.id,v_op,jsonb_build_object('beforeRevision',v_before,'afterRevision',v_lead.revision,'idempotencyKeyHash',encode(extensions.digest(convert_to(p_idempotency_key,'UTF8'),'sha256'),'hex')));
 v_ack:=jsonb_build_object('schemaKind','ops_mutation_ack','accepted',true,'projection',public.aiow_lead_projection_v1(v_lead),'previousRevision',v_before,'revision',v_lead.revision,'actorId','richard','serverTime',public.aiow_iso_v1(v_now),'auditId',lower(v_audit::text),'replayed',false,'operation',v_op,'effect',v_effect);
 perform public.aiow_idempotency_store_v1('ops_mutation',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

create function public.aiow_commercial_report_v1(p_from date,p_through date) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v jsonb; begin if p_from>p_through or p_through-p_from>366 then raise exception using errcode='22023',message='AIOW_REPORT_INVALID'; end if;
 select coalesce(jsonb_agg(jsonb_build_object('date',day::text,'event',event_name,'route',route,'locale',locale,'experimentId',nullif(experiment_id,'__none__'),'variant',nullif(variant,'__none__'),'count',count) order by day,event_name,route,locale,experiment_id,variant),'[]'::jsonb) into v from public.commercial_event_daily where day between p_from and p_through;
 return jsonb_build_object('schemaKind','analytics_aggregate_report','from',p_from::text,'through',p_through::text,'generatedAt',public.aiow_iso_v1(transaction_timestamp()),'buckets',v); end $$;

create function public.aiow_commercial_event_v1(p_idempotency_key text,p_payload_digest text,p_event jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v_replay jsonb; v_id uuid; v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_name text; v_route text; v_locale text; v_eid text; v_variant text; v_digest text; v_existing public.commercial_events%rowtype; begin
 if not public.aiow_event_valid_v1(p_event,v_now) then raise exception using errcode='22023',message='AIOW_EVENT_INVALID'; end if;
 v_digest:=public.aiow_sha256_json_v1(p_event-'schemaKind');
 if p_payload_digest<>v_digest then raise exception using errcode='22023',message='AIOW_PAYLOAD_DIGEST_INVALID'; end if;
 perform public.aiow_idempotency_lock_v1('event_ingest',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('event_ingest',p_idempotency_key,v_digest); if v_replay is not null then return jsonb_set(v_replay,'{deduplicated}','true'::jsonb); end if;
 v_id:=(p_event->>'eventId')::uuid;
 select * into v_existing from public.commercial_events where event_id=v_id for update;
 if found then
  if v_existing.payload_digest<>v_digest then raise exception using errcode='23505',message='AIOW_EVENT_CONFLICT'; end if;
  select outcome into v_ack from public.commercial_idempotency where endpoint='event_ingest' and outcome->>'eventId'=lower(v_id::text) order by created_at limit 1;
  if v_ack is null then v_ack:=jsonb_build_object('schemaKind','analytics_ack','accepted',true,'eventId',lower(v_id::text),'deduplicated',false,'storedAt',public.aiow_iso_v1(v_existing.occurred_at)); end if;
  perform public.aiow_idempotency_store_v1('event_ingest',p_idempotency_key,v_digest,v_ack);
  return jsonb_set(v_ack,'{deduplicated}','true'::jsonb);
 end if;
 v_name:=p_event->>'event'; v_route:=p_event->>'route'; v_locale:=p_event->>'locale';
 v_eid:=coalesce(p_event#>>'{experiment,experimentId}','__none__'); v_variant:=coalesce(p_event#>>'{experiment,variant}','__none__');
 insert into public.commercial_events(event_id,payload_digest,event,occurred_at,expires_at) values(v_id,v_digest,p_event,(p_event->>'occurredAt')::timestamptz,(p_event->>'occurredAt')::timestamptz+interval '30 days');
 insert into public.commercial_event_daily(day,event_name,route,locale,experiment_id,variant,count) values(((p_event->>'occurredAt')::timestamptz at time zone 'UTC')::date,v_name,v_route,v_locale,v_eid,v_variant,1)
 on conflict(day,event_name,route,locale,experiment_id,variant) do update set count=public.commercial_event_daily.count+1;
 v_ack:=jsonb_build_object('schemaKind','analytics_ack','accepted',true,'eventId',lower(v_id::text),'deduplicated',false,'storedAt',public.aiow_iso_v1(v_now));
 perform public.aiow_idempotency_store_v1('event_ingest',p_idempotency_key,v_digest,v_ack); return v_ack;
end $$;

create function public.aiow_mail_outbox_claim_v2(p_worker_id text,p_limit integer,p_now timestamptz) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_items jsonb; begin
 if p_worker_id is null or length(p_worker_id) not between 1 and 100 or p_limit not between 1 and 50 or abs(extract(epoch from(transaction_timestamp()-p_now)))>5 then raise exception using errcode='22023',message='AIOW_OUTBOX_INVALID_CLAIM'; end if;
 with candidates as (
  select id from public.commercial_mail_outbox where state in ('pending','retry') and coalesce(next_attempt_at,created_at)<=p_now and attempts<5
  order by coalesce(next_attempt_at,created_at),created_at,id limit p_limit for update skip locked
 ), claimed as (
  update public.commercial_mail_outbox o set state='leased',revision=o.revision+1,attempts=o.attempts+1,lease_owner=p_worker_id,lease_token=extensions.gen_random_uuid(),lease_expires_at=p_now+interval '5 minutes',next_attempt_at=null,updated_at=p_now
  from candidates c where o.id=c.id returning o.*
 ) select coalesce(jsonb_agg(jsonb_build_object('id',lower(id::text),'commercialLeadId',lower(commercial_lead_id::text),'kind',kind,'revision',revision,'payloadSha256',payload_sha256,'attempts',attempts,'leaseOwner',lease_owner,'leaseToken',lower(lease_token::text),'leaseExpiresAt',public.aiow_iso_v1(lease_expires_at),'nextAttemptAt',public.aiow_iso_v1(p_now),'createdAt',public.aiow_iso_v1(created_at)) order by created_at,id),'[]'::jsonb) into v_items from claimed;
 return jsonb_build_object('schemaKind','outbox_batch_ack','operation','claim','requestedLimit',p_limit,'itemCount',jsonb_array_length(v_items),'items',v_items);
end $$;

create function public.aiow_outbox_finalize_v2(p_job_id uuid,p_owner text,p_token uuid,p_digest text,p_revision bigint,p_result jsonb,p_category text,p_state text,p_next timestamptz default null) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v public.commercial_mail_outbox%rowtype; v_effective_state text; begin
 if not public.aiow_provider_result_valid_v1(p_result,p_category) then raise exception using errcode='22023',message='AIOW_OUTBOX_RESULT_INVALID'; end if;
 if not ((p_category='accepted' and p_state='sent') or (p_category='transient_pre_acceptance' and p_state='retry') or (p_category='permanent_pre_acceptance' and p_state='dead') or (p_category='ambiguous' and p_state='review'))
 then raise exception using errcode='22023',message='AIOW_OUTBOX_RESULT_INVALID'; end if;
 select * into v from public.commercial_mail_outbox where id=p_job_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 if v.state<>'leased' or v.lease_owner<>p_owner or v.lease_token<>p_token or v.lease_expires_at<transaction_timestamp()
  or v.payload_sha256<>p_digest or public.aiow_sha256_json_v1(v.payload)<>p_digest or v.revision<>p_revision
 then raise exception using errcode='40001',message='AIOW_OUTBOX_LEASE_CONFLICT'; end if;
 v_effective_state:=case when p_category='transient_pre_acceptance' and v.attempts>=5 then 'dead' else p_state end;
 if p_category='transient_pre_acceptance' and v.attempts<5 and p_next<>v.updated_at+make_interval(secs=>case v.attempts when 1 then 60 when 2 then 300 when 3 then 1800 when 4 then 7200 end)
  or p_category='transient_pre_acceptance' and v.attempts>=5 and p_next is not null
 then raise exception using errcode='22023',message='AIOW_OUTBOX_BACKOFF_INVALID'; end if;
 update public.commercial_mail_outbox set state=v_effective_state,revision=revision+1,lease_owner=null,lease_token=null,lease_expires_at=null,
  next_attempt_at=case when v_effective_state='retry' then p_next else null end,provider_result=p_result,updated_at=transaction_timestamp()
 where id=p_job_id returning * into v;
 return public.aiow_outbox_projection_v2(v);
end $$;

create function public.aiow_mail_outbox_sent_v2(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_payload_digest text,p_expected_revision bigint,p_result jsonb) returns jsonb
language sql security definer set search_path=pg_catalog as $$ select public.aiow_outbox_finalize_v2(p_job_id,p_lease_owner,p_lease_token,p_payload_digest,p_expected_revision,p_result,'accepted','sent',null) $$;
create function public.aiow_mail_outbox_retry_v2(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_payload_digest text,p_expected_revision bigint,p_result jsonb,p_next_attempt_at timestamptz) returns jsonb
language sql security definer set search_path=pg_catalog as $$ select public.aiow_outbox_finalize_v2(p_job_id,p_lease_owner,p_lease_token,p_payload_digest,p_expected_revision,p_result,'transient_pre_acceptance','retry',p_next_attempt_at) $$;
create function public.aiow_mail_outbox_dead_v2(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_payload_digest text,p_expected_revision bigint,p_result jsonb) returns jsonb
language sql security definer set search_path=pg_catalog as $$ select public.aiow_outbox_finalize_v2(p_job_id,p_lease_owner,p_lease_token,p_payload_digest,p_expected_revision,p_result,'permanent_pre_acceptance','dead',null) $$;
create function public.aiow_mail_outbox_review_v2(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_payload_digest text,p_expected_revision bigint,p_result jsonb) returns jsonb
language sql security definer set search_path=pg_catalog as $$ select public.aiow_outbox_finalize_v2(p_job_id,p_lease_owner,p_lease_token,p_payload_digest,p_expected_revision,p_result,'ambiguous','review',null) $$;

create function public.aiow_mail_outbox_resolve_v2(p_idempotency_key text,p_payload_digest text,p_job_id uuid,p_expected_revision bigint,p_resolution text,p_reason text,p_evidence text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v public.commercial_mail_outbox%rowtype; v_state text; v_out jsonb; begin
 v_replay:=public.aiow_idempotency_replay_v1('outbox_resolve',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if p_payload_digest!~'^[0-9a-f]{64}$' or p_resolution not in ('sent','resend','dead') or nullif(btrim(p_reason),'') is null or (p_resolution='sent' and nullif(btrim(p_evidence),'') is null) then raise exception using errcode='22023',message='AIOW_OUTBOX_RESOLVE_INVALID'; end if;
 select * into v from public.commercial_mail_outbox where id=p_job_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 if v.state<>'review' or v.revision<>p_expected_revision then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 v_state:=case p_resolution when 'sent' then 'sent' when 'resend' then 'retry' else 'dead' end;
 update public.commercial_mail_outbox set state=v_state,revision=revision+1,next_attempt_at=case when v_state='retry' then transaction_timestamp() else null end,provider_result=case when v_state='sent' then jsonb_build_object('schemaKind','provider_accepted','category','accepted','code',null,'receipt',jsonb_build_object('provider','microsoft_graph','httpStatus',202,'graphRequestId',null,'providerMessageId',null,'acceptanceKind','graph_http_202','attemptReceipt',p_evidence,'observedAt',public.aiow_iso_v1(transaction_timestamp()))) else provider_result end,updated_at=transaction_timestamp() where id=v.id returning * into v;
 perform public.aiow_audit_v1(v.commercial_lead_id,'resolve_outbox',jsonb_build_object('jobId',lower(v.id::text),'resolution',p_resolution,'reasonCode',encode(extensions.digest(convert_to(p_reason,'UTF8'),'sha256'),'hex'))); v_out:=public.aiow_outbox_projection_v2(v); perform public.aiow_idempotency_store_v1('outbox_resolve',p_idempotency_key,p_payload_digest,v_out); return v_out;
end $$;

create function public.aiow_mail_outbox_recover_stale_v2(p_worker_id text,p_now timestamptz,p_limit integer) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v_items jsonb; begin
 if p_limit not between 1 and 50 or length(p_worker_id) not between 1 and 100 or abs(extract(epoch from(transaction_timestamp()-p_now)))>5 then raise exception using errcode='22023',message='AIOW_STALE_INVALID'; end if;
 with candidates as (select id from public.commercial_mail_outbox where state='leased' and lease_expires_at<p_now order by lease_expires_at,id limit p_limit for update skip locked),
 recovered as (update public.commercial_mail_outbox o set state=case when attempts>=5 then 'dead' else 'retry' end,revision=revision+1,next_attempt_at=case when attempts>=5 then null else p_now end,
  provider_result=case when attempts>=5 then jsonb_build_object('schemaKind','provider_permanent_pre_acceptance','category','permanent_pre_acceptance','code','retry_exhausted','receipt',jsonb_build_object('provider','microsoft_graph','httpStatus',504,'graphRequestId',null,'providerMessageId',null,'acceptanceKind',null,'attemptReceipt','lease_expired','observedAt',public.aiow_iso_v1(p_now)))
   else jsonb_build_object('schemaKind','provider_transient_pre_acceptance','category','transient_pre_acceptance','code','timeout_before_response','receipt',jsonb_build_object('provider','microsoft_graph','httpStatus',504,'graphRequestId',null,'providerMessageId',null,'acceptanceKind',null,'attemptReceipt','lease_expired','observedAt',public.aiow_iso_v1(p_now))) end,
  lease_owner=null,lease_token=null,lease_expires_at=null,updated_at=p_now from candidates c where o.id=c.id returning o.*)
 select coalesce(jsonb_agg(jsonb_build_object('id',lower(id::text),'commercialLeadId',lower(commercial_lead_id::text),'kind',kind,'revision',revision,'payloadSha256',payload_sha256,'attempts',attempts,'leaseOwner',p_worker_id,'leaseToken',lower(extensions.gen_random_uuid()::text),'leaseExpiresAt',public.aiow_iso_v1(p_now),'nextAttemptAt',public.aiow_iso_v1(coalesce(next_attempt_at,p_now)),'createdAt',public.aiow_iso_v1(created_at)) order by created_at,id),'[]'::jsonb) into v_items from recovered;
 return jsonb_build_object('schemaKind','outbox_batch_ack','operation','stale_recovery','requestedLimit',p_limit,'itemCount',jsonb_array_length(v_items),'items',v_items); end $$;

create function public.aiow_mail_outbox_cancel_v2(p_commercial_lead_id uuid,p_job_id uuid,p_expected_revision bigint,p_idempotency_key text,p_payload_digest text,p_cancellation_kind text,p_reason text) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v_replay jsonb; v public.commercial_mail_outbox%rowtype; v_out jsonb; begin
 v_replay:=public.aiow_idempotency_replay_v1('outbox_cancel',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if p_cancellation_kind not in ('retention','legal','admin') or nullif(btrim(p_reason),'') is null then raise exception using errcode='22023',message='AIOW_CANCEL_INVALID'; end if;
 select * into v from public.commercial_mail_outbox where id=p_job_id and commercial_lead_id=p_commercial_lead_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 if v.state not in ('pending','retry','review') or v.revision<>p_expected_revision then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 update public.commercial_mail_outbox set state='cancelled',revision=revision+1,next_attempt_at=null,cancellation_reason=left(p_cancellation_kind||':'||p_reason,500),provider_result=null,updated_at=transaction_timestamp() where id=v.id returning * into v;
 perform public.aiow_audit_v1(v.commercial_lead_id,'cancel_outbox',jsonb_build_object('jobId',lower(v.id::text),'kind',p_cancellation_kind)); v_out:=public.aiow_outbox_projection_v2(v); perform public.aiow_idempotency_store_v1('outbox_cancel',p_idempotency_key,p_payload_digest,v_out); return v_out;
end $$;

create function public.aiow_provider_gate_binding_v1(p_gate jsonb) returns text
language sql immutable strict set search_path=pg_catalog,extensions as $$
 select encode(extensions.digest(convert_to(jsonb_build_object(
  'gateId',p_gate->'gateId','environment',p_gate->'environment','provider',p_gate->'provider','tenantId',p_gate->'tenantId','applicationId',p_gate->'applicationId',
  'mailbox',p_gate->'mailbox','sender',p_gate->'sender','controlMailbox',p_gate->'controlMailbox','secretPresent',p_gate->'secretPresent','oauthClientCredentialsPresent',p_gate->'oauthClientCredentialsPresent',
  'exchangeApplicationRole',p_gate->'exchangeApplicationRole','exchangeRbacSenderInScope',p_gate->'exchangeRbacSenderInScope','exchangeRbacControlMailboxInScope',p_gate->'exchangeRbacControlMailboxInScope',
  'entraUnscopedMailSendAssigned',p_gate->'entraUnscopedMailSendAssigned','evidenceSha256',p_gate->'evidenceSha256','revision',p_gate->'revision','ownerApprovedBy',p_gate->'ownerApprovedBy',
  'approvedAt',p_gate->'approvedAt','expiresAt',p_gate->'expiresAt','runtimeCapability',p_gate->'runtimeCapability','fallbackProvider',p_gate->'fallbackProvider')::text,'UTF8'),'sha256'),'hex')
$$;

create function public.aiow_provider_gate_write_v1(p_idempotency_key text,p_payload_digest text,p_gate jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_old public.commercial_provider_gates%rowtype; v_audit uuid; begin
 v_replay:=public.aiow_idempotency_replay_v1('provider_gate',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if p_gate->>'schemaKind'<>'provider_gate_record' or p_gate->>'gateId'<>'mail_provider_production_v1' or p_gate->>'environment'<>'production' or p_gate->>'provider'<>'microsoft_graph'
  or p_gate->>'exchangeApplicationRole'<>'Application Mail.Send' or p_gate->>'runtimeCapability'<>'mail_send' or p_gate->'fallbackProvider'<>'null'::jsonb
  or p_gate->>'evidenceSha256'!~'^[0-9a-f]{64}$' then raise exception using errcode='22023',message='AIOW_GATE_TARGET_INVALID'; end if;
 if p_gate->>'state' in ('approved','activated') and (p_gate->>'secretPresent'<>'true' or p_gate->>'oauthClientCredentialsPresent'<>'true' or p_gate->>'exchangeRbacSenderInScope'<>'true' or p_gate->>'exchangeRbacControlMailboxInScope'<>'false' or p_gate->>'entraUnscopedMailSendAssigned'<>'false' or p_gate->>'ownerApprovedBy'<>'richard' or (p_gate->>'approvedAt')::timestamptz>transaction_timestamp() or (p_gate->>'expiresAt')::timestamptz<=transaction_timestamp() or p_gate->>'approvalBindingSha256'<>public.aiow_provider_gate_binding_v1(p_gate))
 then raise exception using errcode='42501',message='AIOW_GATE_BINDING_INVALID'; end if;
 select * into v_old from public.commercial_provider_gates where gate_id=p_gate->>'gateId' for update;
 if found and (p_gate->>'revision')::bigint<>v_old.revision+1 then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 if not found and (p_gate->>'revision')::bigint<>1 then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if;
 v_audit:=public.aiow_audit_v1(null,'provider_gate_write',jsonb_build_object('gateId',p_gate->>'gateId','revision',(p_gate->>'revision')::bigint,'state',p_gate->>'state'));
 insert into public.commercial_provider_gates(gate_id,state,target,evidence_sha256,expires_at,revision,approved_at,owner_approved_by,approval_binding_sha256,audit_id)
 values(p_gate->>'gateId',p_gate->>'state',p_gate,p_gate->>'evidenceSha256',(p_gate->>'expiresAt')::timestamptz,(p_gate->>'revision')::bigint,(p_gate->>'approvedAt')::timestamptz,p_gate->>'ownerApprovedBy',p_gate->>'approvalBindingSha256',v_audit)
 on conflict(gate_id) do update set state=excluded.state,target=excluded.target,evidence_sha256=excluded.evidence_sha256,expires_at=excluded.expires_at,revision=excluded.revision,approved_at=excluded.approved_at,owner_approved_by=excluded.owner_approved_by,approval_binding_sha256=excluded.approval_binding_sha256,audit_id=excluded.audit_id;
 perform public.aiow_idempotency_store_v1('provider_gate',p_idempotency_key,p_payload_digest,p_gate); return p_gate;
end $$;

create function public.aiow_active_customer_relation_set_v1(p_commercial_lead_id uuid,p_expected_revision bigint,p_idempotency_key text,p_payload_digest text,p_enabled boolean,p_reason text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v public.commercial_leads%rowtype; v_before bigint; v_audit uuid; v_ack jsonb; v_now timestamptz:=transaction_timestamp(); begin
 v_replay:=public.aiow_idempotency_replay_v1('active_relation',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if nullif(btrim(p_reason),'') is null then raise exception using errcode='22023',message='AIOW_RELATION_INVALID'; end if;
 select * into v from public.commercial_leads where id=p_commercial_lead_id for update; if not found then raise exception using errcode='P0001',message='AIOW_LEAD_NOT_FOUND'; end if;
 if v.revision<>p_expected_revision then raise exception using errcode='40001',message='AIOW_REVISION_CONFLICT'; end if; if v.active_customer_relation=p_enabled then raise exception using errcode='22023',message='AIOW_RELATION_NOOP'; end if;
 v_before:=v.revision; update public.commercial_leads set active_customer_relation=p_enabled,active_customer_relation_at=case when p_enabled then v_now else null end,revision=revision+1,updated_at=v_now where id=v.id returning * into v;
 v_audit:=public.aiow_audit_v1(v.id,'set_active_customer_relation',jsonb_build_object('beforeRevision',v_before,'afterRevision',v.revision,'enabled',p_enabled));
 v_ack:=jsonb_build_object('schemaKind','ops_mutation_ack','accepted',true,'projection',public.aiow_lead_projection_v1(v),'previousRevision',v_before,'revision',v.revision,'actorId','richard','serverTime',public.aiow_iso_v1(v_now),'auditId',lower(v_audit::text),'replayed',false,'operation','set_active_customer_relation','effect',jsonb_build_object('activeCustomerRelation',p_enabled));
 perform public.aiow_idempotency_store_v1('active_relation',p_idempotency_key,p_payload_digest,v_ack); return v_ack;
end $$;

create function public.aiow_commercial_retention_dry_run_v1(p_now timestamptz) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_actions jsonb; v_ids text; v_counts jsonb; v_hold bigint; v_relation bigint; begin
 if abs(extract(epoch from(transaction_timestamp()-p_now)))>5 then raise exception using errcode='22023',message='AIOW_RETENTION_TIME_INVALID'; end if;
 with lead_candidates as (
  select c.*,case when c.abandoned_at is not null then 'abandoned_at' else 'terminal_at' end anchor
  from public.commercial_leads c where c.status in ('won','lost') and coalesce(c.abandoned_at,c.terminal_at)<p_now-interval '90 days'
 ), all_actions as (
  select 'booking_quote_lead_pii' class,lower(c.id::text) target_id,'irreversible_redaction' action,c.anchor,
   case when c.legal_hold then 'excluded_legal_hold' when c.active_customer_relation then 'excluded_active_customer_relation' else 'age_threshold_met' end reason,
   not c.legal_hold and not c.active_customer_relation eligible,'lead' target_kind from lead_candidates c
  union all
  select 'pdfs_and_outbox_payloads',lower(d.quote_lead_id::text),'delete_bytes',c.anchor,
   case when c.legal_hold then 'excluded_legal_hold' when c.active_customer_relation then 'excluded_active_customer_relation' else 'age_threshold_met' end,
   not c.legal_hold and not c.active_customer_relation,'pdf' from public.quote_documents d join public.quote_leads q on q.id=d.quote_lead_id join lead_candidates c on c.id=q.commercial_lead_id
  union all
  select 'pdfs_and_outbox_payloads',lower(o.id::text),'redact_payload',c.anchor,
   case when c.legal_hold then 'excluded_legal_hold' when c.active_customer_relation then 'excluded_active_customer_relation' else 'age_threshold_met' end,
   not c.legal_hold and not c.active_customer_relation,'outbox' from public.commercial_mail_outbox o join lead_candidates c on c.id=o.commercial_lead_id
  union all
  select 'raw_analytics',lower(e.event_id::text),'delete','occurred_at','age_threshold_met',true,'analytics_event' from public.commercial_events e where e.occurred_at<p_now-interval '30 days'
  union all
  select 'analytics_aggregates',day::text||':'||event_name||':'||route||':'||locale||':'||experiment_id||':'||variant,'delete','bucket_month_end','age_threshold_met',true,'analytics_aggregate'
   from public.commercial_event_daily where (date_trunc('month',day::timestamp)+interval '1 month - 1 day'+interval '13 months')<p_now
  union all
  select 'provider_receipts',lower(o.id::text),'irreversible_redaction','observed_at',
   case when c.legal_hold then 'excluded_legal_hold' when c.active_customer_relation then 'excluded_active_customer_relation' else 'age_threshold_met' end,
   not c.legal_hold and not c.active_customer_relation,'provider_receipt'
   from public.commercial_mail_outbox o join public.commercial_leads c on c.id=o.commercial_lead_id
   where o.provider_result#>>'{receipt,observedAt}' is not null and (o.provider_result#>>'{receipt,observedAt}')::timestamptz<p_now-interval '90 days'
  union all
  select 'non_pii_audit_facts',lower(a.id::text),'delete','irreversible_pii_redaction','age_threshold_met',true,'audit' from public.commercial_audit a where a.redact_after<p_now
 ), encoded as (
  select *,jsonb_build_object('class',class,'targetId',target_id,'action',action,'anchor',anchor,'reason',reason,'eligible',eligible) j from all_actions
 )
 select coalesce(jsonb_agg(j order by class,target_kind,target_id),'[]'::jsonb),
  coalesce(string_agg(class||':'||target_id,',' order by class,target_kind,target_id) filter(where eligible),''),
  jsonb_build_object('leadPii',count(*) filter(where target_kind='lead' and eligible),'pdfs',count(*) filter(where target_kind='pdf' and eligible),
   'outboxPayloads',count(*) filter(where target_kind='outbox' and eligible),'analyticsEvents',count(*) filter(where target_kind in ('analytics_event','analytics_aggregate') and eligible),
   'providerReceipts',count(*) filter(where target_kind='provider_receipt' and eligible),'auditFacts',count(*) filter(where target_kind='audit' and eligible)),
  count(*) filter(where target_kind='lead' and reason='excluded_legal_hold'),count(*) filter(where target_kind='lead' and reason='excluded_active_customer_relation')
 into v_actions,v_ids,v_counts,v_hold,v_relation from encoded;
 return jsonb_build_object('schemaKind','retention_redaction_result','dryRun',true,'runId',lower(extensions.gen_random_uuid()::text),'generatedAt',public.aiow_iso_v1(p_now),'policyVersion',1,
  'eligible',v_counts,'excludedLegalHold',v_hold,'excludedActiveCustomerRelation',v_relation,'wouldRedactIdsSha256',encode(extensions.digest(convert_to(v_ids,'UTF8'),'sha256'),'hex'),'actions',v_actions);
end $$;

create function public.aiow_quote_abandon_expired_v1(p_expired_before timestamptz,p_limit integer) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_items jsonb; v_now timestamptz:=transaction_timestamp(); begin
 if p_limit not between 1 and 100 or p_expired_before>v_now then raise exception using errcode='22023',message='AIOW_ABANDON_INVALID'; end if;
 with candidates as (
  select q.id qid,q.commercial_lead_id cid,c.revision prev from public.quote_leads q join public.commercial_leads c on c.id=q.commercial_lead_id
  where q.state='prepared' and q.expires_at<v_now and q.expires_at<=p_expired_before and c.status not in ('won','lost') and not c.legal_hold and not c.active_customer_relation
  order by q.expires_at,q.id limit p_limit for update of q,c skip locked
 ), lead_up as (update public.commercial_leads c set status='lost',revision=c.revision+1,next_action_at=null,terminal_at=v_now,abandoned_at=v_now,
   display_name='[redacted]',email='redacted@invalid.local',phone=null,organisation=null,updated_at=v_now from candidates x where c.id=x.cid returning c.id,c.revision),
 quote_up as (update public.quote_leads q set state='abandoned',normalized_quote='{}'::jsonb,contact='{}'::jsonb,consent='{}'::jsonb,source='{}'::jsonb,country=''
   from candidates x where q.id=x.qid returning q.id,q.commercial_lead_id), audited as (
  insert into public.commercial_audit(id,commercial_lead_id,actor_id,actor_role,action,facts,occurred_at,redact_after)
  select extensions.gen_random_uuid(),x.cid,'richard','ops_admin','quote_abandoned',jsonb_build_object('nonPiiFactsOnly',true,'quoteId',lower(x.qid::text),'beforeRevision',x.prev,'afterRevision',x.prev+1),v_now,v_now+interval '365 days' from candidates x returning id,commercial_lead_id)
 select coalesce(jsonb_agg(jsonb_build_object('quoteId',lower(x.qid::text),'commercialLeadId',lower(x.cid::text),'previousRevision',x.prev,'revision',x.prev+1,'status','lost','quoteState','abandoned','terminalAt',public.aiow_iso_v1(v_now),'abandonedAt',public.aiow_iso_v1(v_now),'auditId',lower(a.id::text)) order by x.qid),'[]'::jsonb) into v_items from candidates x join audited a on a.commercial_lead_id=x.cid;
 return jsonb_build_object('schemaKind','quote_abandon_batch_ack','operation','quote_abandon_expired','requestedLimit',p_limit,'itemCount',jsonb_array_length(v_items),'items',v_items); end $$;

-- RLS and explicit private authority. No table policy is created; even service_role
-- cannot directly read or mutate commercial state.
alter table public.commercial_leads enable row level security;
alter table public.booking_leads enable row level security;
alter table public.commercial_mail_outbox enable row level security;
alter table public.commercial_events enable row level security;
alter table public.commercial_event_daily enable row level security;
alter table public.commercial_audit enable row level security;
alter table public.commercial_provider_gates enable row level security;
alter table public.commercial_idempotency enable row level security;
revoke all on table public.commercial_leads,public.booking_leads,public.commercial_mail_outbox,public.commercial_events,public.commercial_event_daily,public.commercial_audit,public.commercial_provider_gates,public.commercial_idempotency from public;

-- Public helper EXECUTE defaults are removed. Only the exact 19 contract RPCs are
-- granted to service_role; anon/authenticated receive none.
do $acl$
declare r record; v_roles text:=''; v_sig text; begin
 for r in select p.oid,pg_get_function_identity_arguments(p.oid) args,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'aiow_%' loop
  execute format('revoke all on function public.%I(%s) from public',r.proname,r.args);
  if exists(select 1 from pg_roles where rolname='anon') then execute format('revoke all on function public.%I(%s) from anon',r.proname,r.args); end if;
  if exists(select 1 from pg_roles where rolname='authenticated') then execute format('revoke all on function public.%I(%s) from authenticated',r.proname,r.args); end if;
  if exists(select 1 from pg_roles where rolname='service_role') then execute format('revoke all on function public.%I(%s) from service_role',r.proname,r.args); end if;
 end loop;
 if exists(select 1 from pg_roles where rolname='anon') then execute 'revoke all on table public.commercial_leads,public.booking_leads,public.commercial_mail_outbox,public.commercial_events,public.commercial_event_daily,public.commercial_audit,public.commercial_provider_gates,public.commercial_idempotency from anon'; end if;
 if exists(select 1 from pg_roles where rolname='authenticated') then execute 'revoke all on table public.commercial_leads,public.booking_leads,public.commercial_mail_outbox,public.commercial_events,public.commercial_event_daily,public.commercial_audit,public.commercial_provider_gates,public.commercial_idempotency from authenticated'; end if;
 if exists(select 1 from pg_roles where rolname='service_role') then
  execute 'revoke all on table public.commercial_leads,public.booking_leads,public.commercial_mail_outbox,public.commercial_events,public.commercial_event_daily,public.commercial_audit,public.commercial_provider_gates,public.commercial_idempotency from service_role';
  execute 'grant execute on function public.aiow_quote_prepare_v1(uuid,text,timestamptz,text,jsonb,jsonb,jsonb,jsonb),public.aiow_quote_commit_v1(uuid,text,text,uuid,text,text,text,text,jsonb,jsonb,jsonb,jsonb,jsonb,text),public.aiow_booking_commit_v1(uuid,text,text,jsonb,jsonb),public.aiow_commercial_queue_v1(timestamptz,uuid,integer),public.aiow_commercial_mutate_v1(text,text,jsonb),public.aiow_commercial_report_v1(date,date),public.aiow_commercial_event_v1(text,text,jsonb),public.aiow_mail_outbox_claim_v2(text,integer,timestamptz),public.aiow_mail_outbox_sent_v2(uuid,text,uuid,text,bigint,jsonb),public.aiow_mail_outbox_retry_v2(uuid,text,uuid,text,bigint,jsonb,timestamptz),public.aiow_mail_outbox_dead_v2(uuid,text,uuid,text,bigint,jsonb),public.aiow_mail_outbox_review_v2(uuid,text,uuid,text,bigint,jsonb),public.aiow_mail_outbox_resolve_v2(text,text,uuid,bigint,text,text,text),public.aiow_commercial_retention_dry_run_v1(timestamptz),public.aiow_mail_outbox_recover_stale_v2(text,timestamptz,integer),public.aiow_mail_outbox_cancel_v2(uuid,uuid,bigint,text,text,text,text),public.aiow_provider_gate_write_v1(text,text,jsonb),public.aiow_active_customer_relation_set_v1(uuid,bigint,text,text,boolean,text),public.aiow_quote_abandon_expired_v1(timestamptz,integer) to service_role';
 end if;
end $acl$;

commit;
