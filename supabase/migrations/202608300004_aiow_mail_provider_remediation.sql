begin;

-- Forward-only remediation for the V2 Microsoft Graph mail path.
alter table public.commercial_mail_outbox
  add column if not exists dispatch_started_at timestamptz;

create or replace function public.aiow_mail_payload_digest_v2(p_job jsonb) returns text
language sql immutable strict set search_path=pg_catalog,extensions as $$
 select public.aiow_sha256_json_v1(jsonb_build_object(
  'schemaKind',p_job->'schemaKind','jobId',p_job->'jobId','commercialLeadId',p_job->'commercialLeadId','kind',p_job->'kind',
  'from',p_job->'from','to',p_job->'to','subject',p_job->'subject','text',p_job->'text','html',p_job->'html','attachments',p_job->'attachments'))
$$;

create or replace function public.aiow_mail_job_build_v2(
 p_job_id uuid,p_commercial_lead_id uuid,p_kind text,p_to jsonb,p_subject text,p_text text,p_html text,p_attachments jsonb,p_now timestamptz
) returns jsonb
language plpgsql immutable strict set search_path=pg_catalog as $$
declare v_job jsonb; begin
 v_job:=jsonb_build_object(
  'schemaKind','mail_job','jobId',lower(p_job_id::text),'commercialLeadId',lower(p_commercial_lead_id::text),'kind',p_kind,
  'from','info@aiow.io','to',p_to,'subject',p_subject,'text',p_text,'html',p_html,'attachments',p_attachments,
  'payloadSha256',repeat('0',64),'attempt',1,'leaseOwner','pending','leaseToken',lower(p_job_id::text),'leaseExpiresAt',public.aiow_iso_v1(p_now));
 return jsonb_set(v_job,'{payloadSha256}',to_jsonb(public.aiow_mail_payload_digest_v2(v_job)));
end $$;

create or replace function public.aiow_mail_job_valid_v1(p_job jsonb,p_kind text,p_lead uuid) returns boolean
language plpgsql immutable set search_path=pg_catalog,extensions as $$
declare a jsonb; v bytea; begin
 if not public.aiow_jsonb_exact_keys_v1(p_job,array['schemaKind','jobId','commercialLeadId','kind','from','to','subject','text','html','attachments','payloadSha256','attempt','leaseOwner','leaseToken','leaseExpiresAt'])
  or p_job->>'schemaKind'<>'mail_job' or (p_job->>'jobId')::uuid is null or (p_job->>'commercialLeadId')::uuid<>p_lead or p_job->>'kind'<>p_kind
  or p_job->>'from'<>'info@aiow.io' or jsonb_typeof(p_job->'to')<>'array' or jsonb_array_length(p_job->'to') not between 1 and 5
  or exists(select 1 from jsonb_array_elements_text(p_job->'to') x where not public.aiow_email_valid_v1(x) or x~E'[\r\n\\x00]')
  or (select count(*) from jsonb_array_elements_text(p_job->'to'))<>(select count(distinct x) from jsonb_array_elements_text(p_job->'to') x)
  or length(p_job->>'subject') not between 1 and 200 or p_job->>'subject'~E'[\r\n\\x00]'
  or length(p_job->>'text') not between 1 and 20000 or p_job->>'text'~E'[\\x00]'
  or length(p_job->>'html') not between 1 and 50000 or p_job->>'html'~E'[\\x00]'
  or jsonb_typeof(p_job->'attachments')<>'array' or jsonb_array_length(p_job->'attachments')>2
  or p_job->>'payloadSha256'!~'^[0-9a-f]{64}$' or p_job->>'payloadSha256'<>public.aiow_mail_payload_digest_v2(p_job)
  or (p_job->>'attempt')::integer not between 1 and 5 or length(p_job->>'leaseOwner') not between 1 and 100
  or (p_job->>'leaseToken')::uuid is null or (p_job->>'leaseExpiresAt')::timestamptz is null then return false; end if;
 for a in select value from jsonb_array_elements(p_job->'attachments') loop
  if not public.aiow_jsonb_exact_keys_v1(a,array['filename','mimeType','base64','sha256']) or length(a->>'filename') not between 1 and 128 or a->>'filename'~E'[\r\n\\x00]'
   or a->>'mimeType' not in ('application/pdf','text/calendar') or length(a->>'base64')>2000000 or a->>'sha256'!~'^[0-9a-f]{64}$' then return false; end if;
  begin v:=decode(a->>'base64','base64'); exception when others then return false; end;
  if encode(extensions.digest(v,'sha256'),'hex')<>a->>'sha256' then return false; end if;
  if a->>'mimeType'='application/pdf' and substring(v from 1 for 5)<>convert_to('%PDF-','UTF8') then return false; end if;
 end loop;
 if p_kind in ('internal_booking','internal_lead') then
  if p_job->'to'<>jsonb_build_array('info@aiow.io') or jsonb_array_length(p_job->'attachments')<>0 then return false; end if;
 elsif p_job->'to'=jsonb_build_array('info@aiow.io') then return false;
 end if;
 if p_kind='customer_quote' then
  if jsonb_array_length(p_job->'attachments')<>1 or p_job#>>'{attachments,0,mimeType}'<>'application/pdf' then return false; end if;
 elsif exists(select 1 from jsonb_array_elements(p_job->'attachments') x where x->>'mimeType'='application/pdf') then return false;
 end if;
 if p_kind='customer_booking' then
  if jsonb_array_length(p_job->'attachments')<>0 or not (
   (p_job->>'subject'='Uw afspraakvoorkeur is ontvangen' and p_job->>'text' like '%We hebben uw voorkeursdatum en -tijd ontvangen.%' and p_job->>'text' like '%Een medewerker bevestigt de afspraak afzonderlijk.%' and p_job->>'html' like '%We hebben uw voorkeursdatum en -tijd ontvangen.%' and p_job->>'html' like '%Een medewerker bevestigt de afspraak afzonderlijk.%')
   or (p_job->>'subject'='Your appointment preference has been received' and p_job->>'text' like '%We have received your preferred date and time.%' and p_job->>'text' like '%A member of our team will confirm the appointment separately.%' and p_job->>'html' like '%We have received your preferred date and time.%' and p_job->>'html' like '%A member of our team will confirm the appointment separately.%')) then return false; end if;
 end if;
 return true;
exception when others then return false; end $$;

create or replace function public.aiow_html_escape_v2(p_value text) returns text
language sql immutable strict set search_path=pg_catalog as $$
 select replace(replace(replace(replace(replace(p_value,'&','&amp;'),'<','&lt;'),'>','&gt;'),'"','&quot;'),'''','&#39;')
$$;

create or replace function public.aiow_booking_commit_v1(p_request_id uuid,p_idempotency_key text,p_payload_digest text,p_booking jsonb,p_source jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_bid uuid:=extensions.gen_random_uuid(); v_cid uuid:=extensions.gen_random_uuid(); v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_customer jsonb; v_internal jsonb; v_canonical jsonb; v_digest text; v_customer_id uuid:=extensions.gen_random_uuid(); v_internal_id uuid:=extensions.gen_random_uuid(); v_preference text; v_subject text; v_text text; v_html text;
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

create or replace function public.aiow_quote_commit_v1(
 p_request_id uuid,p_idempotency_key text,p_quote_number text,p_lead_id uuid,p_pdf_filename text,p_pdf_mime_type text,
 p_pdf_base64 text,p_pdf_sha256 text,p_customer_mail jsonb,p_internal_mail jsonb,p_quote jsonb,p_contact jsonb,p_source jsonb,p_country text) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_q public.quote_leads%rowtype; v_bytes bytea; v_now timestamptz:=transaction_timestamp(); v_ack jsonb; v_doc public.quote_documents%rowtype; v_hash text; v_replay jsonb; v_customer jsonb; v_internal jsonb; v_customer_id uuid:=extensions.gen_random_uuid(); v_internal_id uuid:=extensions.gen_random_uuid(); v_attachment jsonb;
begin
 if p_request_id is null or p_pdf_filename<>p_quote_number||'.pdf' or p_pdf_mime_type<>'application/pdf' or p_pdf_sha256!~'^[0-9a-f]{64}$'
  or jsonb_typeof(p_customer_mail)<>'object' or jsonb_typeof(p_internal_mail)<>'object'
  or length(p_customer_mail->>'subject') not between 1 and 200 or length(p_customer_mail->>'text') not between 1 and 20000 or length(p_customer_mail->>'html') not between 1 and 50000
  or length(p_internal_mail->>'subject') not between 1 and 200 or length(p_internal_mail->>'text') not between 1 and 20000 or length(p_internal_mail->>'html') not between 1 and 50000
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_COMMIT'; end if;
 begin v_bytes:=decode(p_pdf_base64,'base64'); exception when others then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_PDF'; end;
 if octet_length(v_bytes) not between 5 and 1500000 or substring(v_bytes from 1 for 5)<>convert_to('%PDF-','UTF8') or encode(extensions.digest(v_bytes,'sha256'),'hex')<>p_pdf_sha256
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_PDF'; end if;
 v_hash:=public.aiow_sha256_json_v1(jsonb_build_object('leadId',lower(p_lead_id::text),'quoteNumber',p_quote_number,'pdf',jsonb_build_object('filename',p_pdf_filename,'mimeType',p_pdf_mime_type,'sha256',p_pdf_sha256)));
 perform public.aiow_idempotency_lock_v1('quote_commit',p_idempotency_key);
 v_replay:=public.aiow_idempotency_replay_v1('quote_commit',p_idempotency_key,v_hash); if v_replay is not null then return v_replay; end if;
 select * into v_q from public.quote_leads where id=p_lead_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_QUOTE_PREPARE_NOT_FOUND'; end if;
 if v_q.idempotency_key<>p_idempotency_key or v_q.quote_number<>p_quote_number or v_q.contact<>p_contact or v_q.source<>p_source or v_q.country<>p_country
 then raise exception using errcode='22023',message='AIOW_QUOTE_INVALID_COMMIT'; end if;
 if v_q.state='abandoned' then raise exception using errcode='P0001',message='AIOW_QUOTE_ABANDONED'; end if;
 if v_q.state='committed' then
  select * into v_doc from public.quote_documents where quote_lead_id=v_q.id;
  if v_doc.filename<>p_pdf_filename or v_doc.mime_type<>p_pdf_mime_type or v_doc.sha256<>p_pdf_sha256 or v_doc.document_bytes<>v_bytes
   or not exists(select 1 from public.commercial_mail_outbox o where o.commercial_lead_id=v_q.commercial_lead_id and o.kind='customer_quote' and o.payload#>>'{attachments,0,filename}'=v_doc.filename and o.payload#>>'{attachments,0,mimeType}'=v_doc.mime_type and o.payload#>>'{attachments,0,sha256}'=v_doc.sha256 and decode(o.payload#>>'{attachments,0,base64}','base64')=v_doc.document_bytes)
  then raise exception using errcode='23505',message='AIOW_QUOTE_COMMIT_CONFLICT'; end if;
  v_ack:=jsonb_build_object('schemaKind','quote_commit_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_q.id::text),'commercialLeadId',lower(v_q.commercial_lead_id::text),'quoteNumber',v_q.quote_number,'state','committed','pdfSha256',p_pdf_sha256,'committedAt',public.aiow_iso_v1(v_q.committed_at),'replayed',false,'pdfDeliveryPermitted',true);
  perform public.aiow_idempotency_store_v1('quote_commit',p_idempotency_key,v_hash,v_ack); return v_ack;
 end if;
 insert into public.quote_documents(lead_id,quote_lead_id,filename,mime_type,document_bytes,sha256) values(v_q.id,v_q.id,p_pdf_filename,p_pdf_mime_type,v_bytes,p_pdf_sha256) returning * into v_doc;
 v_attachment:=jsonb_build_array(jsonb_build_object('filename',v_doc.filename,'mimeType',v_doc.mime_type,'base64',p_pdf_base64,'sha256',v_doc.sha256));
 v_customer:=public.aiow_mail_job_build_v2(v_customer_id,v_q.commercial_lead_id,'customer_quote',jsonb_build_array(lower(v_q.contact->>'email')),p_customer_mail->>'subject',p_customer_mail->>'text',p_customer_mail->>'html',v_attachment,v_now);
 v_internal:=public.aiow_mail_job_build_v2(v_internal_id,v_q.commercial_lead_id,'internal_lead',jsonb_build_array('info@aiow.io'),p_internal_mail->>'subject',p_internal_mail->>'text',p_internal_mail->>'html','[]'::jsonb,v_now);
 if not public.aiow_mail_job_valid_v1(v_customer,'customer_quote',v_q.commercial_lead_id) or not public.aiow_mail_job_valid_v1(v_internal,'internal_lead',v_q.commercial_lead_id)
 then raise exception using errcode='22023',message='AIOW_MAIL_INVALID'; end if;
 insert into public.commercial_mail_outbox(id,commercial_lead_id,kind,payload,payload_sha256,next_attempt_at)
 values(v_customer_id,v_q.commercial_lead_id,'customer_quote',v_customer,v_customer->>'payloadSha256',v_now),(v_internal_id,v_q.commercial_lead_id,'internal_lead',v_internal,v_internal->>'payloadSha256',v_now);
 update public.quote_leads set state='committed',committed_at=v_now where id=v_q.id;
 update public.commercial_leads set unread=true,created_at=v_now,updated_at=v_now,sla_due_at=public.aiow_next_business_day_v1(v_now) where id=v_q.commercial_lead_id;
 v_ack:=jsonb_build_object('schemaKind','quote_commit_ack','accepted',true,'requestId',lower(p_request_id::text),'leadId',lower(v_q.id::text),'commercialLeadId',lower(v_q.commercial_lead_id::text),'quoteNumber',v_q.quote_number,'state','committed','pdfSha256',p_pdf_sha256,'committedAt',public.aiow_iso_v1(v_now),'replayed',false,'pdfDeliveryPermitted',true);
 perform public.aiow_idempotency_store_v1('quote_commit',p_idempotency_key,v_hash,v_ack); return v_ack;
end $$;

create or replace function public.aiow_mail_outbox_claim_v2(p_worker_id text,p_limit integer,p_now timestamptz) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_items jsonb; begin
 if p_worker_id is null or length(p_worker_id) not between 1 and 100 or p_limit not between 1 and 50 or abs(extract(epoch from(transaction_timestamp()-p_now)))>5 then raise exception using errcode='22023',message='AIOW_OUTBOX_INVALID_CLAIM'; end if;
 with candidates as (
  select id from public.commercial_mail_outbox where state in ('pending','retry') and coalesce(next_attempt_at,created_at)<=p_now and attempts<5
  order by coalesce(next_attempt_at,created_at),created_at,id limit p_limit for update skip locked
 ), claimed as (
  update public.commercial_mail_outbox o set state='leased',revision=o.revision+1,attempts=o.attempts+1,lease_owner=p_worker_id,lease_token=extensions.gen_random_uuid(),lease_expires_at=p_now+interval '5 minutes',next_attempt_at=null,dispatch_started_at=null,updated_at=p_now
  from candidates c where o.id=c.id returning o.*
 ) select coalesce(jsonb_agg(jsonb_build_object('id',lower(id::text),'commercialLeadId',lower(commercial_lead_id::text),'kind',kind,'revision',revision,'payloadSha256',payload_sha256,'attempts',attempts,'leaseOwner',lease_owner,'leaseToken',lower(lease_token::text),'leaseExpiresAt',public.aiow_iso_v1(lease_expires_at),'nextAttemptAt',public.aiow_iso_v1(p_now),'createdAt',public.aiow_iso_v1(created_at)) order by created_at,id),'[]'::jsonb) into v_items from claimed;
 return jsonb_build_object('schemaKind','outbox_batch_ack','operation','claim','requestedLimit',p_limit,'itemCount',jsonb_array_length(v_items),'items',v_items);
end $$;

create or replace function public.aiow_mail_outbox_dispatch_v2(p_job_id uuid,p_lease_owner text,p_lease_token uuid,p_payload_digest text,p_expected_revision bigint) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v public.commercial_mail_outbox%rowtype; v_now timestamptz:=transaction_timestamp(); begin
 select * into v from public.commercial_mail_outbox where id=p_job_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 if v.state<>'leased' or v.lease_owner<>p_lease_owner or v.lease_token<>p_lease_token or v.lease_expires_at<v_now or v.payload_sha256<>p_payload_digest or public.aiow_mail_payload_digest_v2(v.payload)<>p_payload_digest or v.revision<>p_expected_revision
 then raise exception using errcode='40001',message='AIOW_OUTBOX_LEASE_CONFLICT'; end if;
 if v.dispatch_started_at is null then update public.commercial_mail_outbox set dispatch_started_at=v_now where id=v.id; v.dispatch_started_at:=v_now; end if;
 return jsonb_build_object('schemaKind','outbox_dispatch_ack','jobId',lower(v.id::text),'leaseToken',lower(v.lease_token::text),'dispatchStartedAt',public.aiow_iso_v1(v.dispatch_started_at));
end $$;

create or replace function public.aiow_outbox_finalize_v2(p_job_id uuid,p_owner text,p_token uuid,p_digest text,p_revision bigint,p_result jsonb,p_category text,p_state text,p_next timestamptz default null) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v public.commercial_mail_outbox%rowtype; v_effective_state text; begin
 if not public.aiow_provider_result_valid_v1(p_result,p_category) then raise exception using errcode='22023',message='AIOW_OUTBOX_RESULT_INVALID'; end if;
 if not ((p_category='accepted' and p_state='sent') or (p_category='transient_pre_acceptance' and p_state='retry') or (p_category='permanent_pre_acceptance' and p_state='dead') or (p_category='ambiguous' and p_state='review'))
 then raise exception using errcode='22023',message='AIOW_OUTBOX_RESULT_INVALID'; end if;
 select * into v from public.commercial_mail_outbox where id=p_job_id for update;
 if not found then raise exception using errcode='P0001',message='AIOW_OUTBOX_NOT_FOUND'; end if;
 if v.state<>'leased' or v.lease_owner<>p_owner or v.lease_token<>p_token or v.lease_expires_at<transaction_timestamp() or v.dispatch_started_at is null
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

create or replace function public.aiow_mail_outbox_recover_stale_v2(p_worker_id text,p_now timestamptz,p_limit integer) returns jsonb
language plpgsql security definer set search_path=pg_catalog as $$
declare v_items jsonb; begin
 if p_limit not between 1 and 50 or length(p_worker_id) not between 1 and 100 or abs(extract(epoch from(transaction_timestamp()-p_now)))>5 then raise exception using errcode='22023',message='AIOW_STALE_INVALID'; end if;
 with candidates as (select id from public.commercial_mail_outbox where state='leased' and lease_expires_at<p_now order by lease_expires_at,id limit p_limit for update skip locked),
 recovered as (update public.commercial_mail_outbox o set
  state=case when o.dispatch_started_at is not null then 'review' when o.attempts>=5 then 'dead' else 'retry' end,
  revision=o.revision+1,next_attempt_at=case when o.dispatch_started_at is null and o.attempts<5 then p_now else null end,
  provider_result=case when o.dispatch_started_at is not null then jsonb_build_object('schemaKind','provider_ambiguous','category','ambiguous','code','unknown_acceptance','receipt',jsonb_build_object('provider','microsoft_graph','httpStatus',599,'graphRequestId',null,'providerMessageId',null,'acceptanceKind',null,'attemptReceipt','stale_after_dispatch','observedAt',public.aiow_iso_v1(p_now)))
   when o.attempts>=5 then jsonb_build_object('schemaKind','provider_permanent_pre_acceptance','category','permanent_pre_acceptance','code','retry_exhausted','receipt',jsonb_build_object('provider','microsoft_graph','httpStatus',504,'graphRequestId',null,'providerMessageId',null,'acceptanceKind',null,'attemptReceipt','stale_before_dispatch','observedAt',public.aiow_iso_v1(p_now)))
   else jsonb_build_object('schemaKind','provider_transient_pre_acceptance','category','transient_pre_acceptance','code','timeout_before_response','receipt',jsonb_build_object('provider','microsoft_graph','httpStatus',504,'graphRequestId',null,'providerMessageId',null,'acceptanceKind',null,'attemptReceipt','stale_before_dispatch','observedAt',public.aiow_iso_v1(p_now))) end,
  lease_owner=null,lease_token=null,lease_expires_at=null,dispatch_started_at=case when o.dispatch_started_at is null then null else o.dispatch_started_at end,updated_at=p_now from candidates c where o.id=c.id returning o.*)
 select coalesce(jsonb_agg(jsonb_build_object('id',lower(id::text),'commercialLeadId',lower(commercial_lead_id::text),'kind',kind,'revision',revision,'payloadSha256',payload_sha256,'attempts',attempts,'leaseOwner',p_worker_id,'leaseToken',lower(extensions.gen_random_uuid()::text),'leaseExpiresAt',public.aiow_iso_v1(p_now),'nextAttemptAt',public.aiow_iso_v1(coalesce(next_attempt_at,p_now)),'createdAt',public.aiow_iso_v1(created_at)) order by created_at,id),'[]'::jsonb) into v_items from recovered;
 return jsonb_build_object('schemaKind','outbox_batch_ack','operation','stale_recovery','requestedLimit',p_limit,'itemCount',jsonb_array_length(v_items),'items',v_items); end $$;

create or replace function public.aiow_provider_gate_binding_bytes_v2(p_gate jsonb) returns text
language sql immutable strict set search_path=pg_catalog as $$
 with fields(name,ord) as (values
  ('gateId',1),('environment',2),('provider',3),('tenantId',4),('applicationId',5),('mailbox',6),('sender',7),('controlMailbox',8),
  ('secretPresent',9),('oauthClientCredentialsPresent',10),('exchangeApplicationRole',11),('exchangeRbacSenderInScope',12),('exchangeRbacControlMailboxInScope',13),
  ('entraUnscopedMailSendAssigned',14),('evidenceSha256',15),('revision',16),('ownerApprovedBy',17),('approvedAt',18),('expiresAt',19),('runtimeCapability',20),('fallbackProvider',21)
 ), scalars as (
  select name,ord,case jsonb_typeof(p_gate->name) when 'string' then p_gate->>name when 'boolean' then p_gate->>name when 'number' then p_gate->>name when 'null' then 'null' else null end value from fields
 ) select case when count(*)=21 and count(value)=21 then string_agg(name||':'||octet_length(convert_to(value,'UTF8'))::text||':'||value||E'\n','' order by ord) else null end from scalars
$$;

create or replace function public.aiow_provider_gate_binding_v1(p_gate jsonb) returns text
language sql immutable strict set search_path=pg_catalog,extensions as $$
 select encode(extensions.digest(convert_to(public.aiow_provider_gate_binding_bytes_v2(p_gate),'UTF8'),'sha256'),'hex')
$$;

create or replace function public.aiow_provider_gate_write_v1(p_idempotency_key text,p_payload_digest text,p_gate jsonb) returns jsonb
language plpgsql security definer set search_path=pg_catalog,extensions as $$
declare v_replay jsonb; v_old public.commercial_provider_gates%rowtype; v_audit uuid; begin
 v_replay:=public.aiow_idempotency_replay_v1('provider_gate',p_idempotency_key,p_payload_digest); if v_replay is not null then return v_replay; end if;
 if not public.aiow_jsonb_exact_keys_v1(p_gate,array['schemaKind','state','gateId','environment','provider','tenantId','applicationId','mailbox','sender','controlMailbox','secretPresent','oauthClientCredentialsPresent','exchangeApplicationRole','exchangeRbacSenderInScope','exchangeRbacControlMailboxInScope','entraUnscopedMailSendAssigned','evidenceSha256','revision','ownerApprovedBy','approvedAt','expiresAt','runtimeCapability','fallbackProvider','approvalBindingSha256'])
  or p_gate->>'schemaKind'<>'provider_gate_record' or p_gate->>'gateId'<>'mail_provider_production_v1' or p_gate->>'environment'<>'production' or p_gate->>'provider'<>'microsoft_graph'
  or (p_gate->>'tenantId')::uuid is null or (p_gate->>'applicationId')::uuid is null or p_gate->>'mailbox'<>'info@aiow.io' or p_gate->>'sender'<>'info@aiow.io' or not public.aiow_email_valid_v1(p_gate->>'controlMailbox')
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

revoke all on function public.aiow_mail_outbox_dispatch_v2(uuid,text,uuid,text,bigint) from public;
do $acl$ begin
 if exists(select 1 from pg_roles where rolname='anon') then revoke all on function public.aiow_mail_outbox_dispatch_v2(uuid,text,uuid,text,bigint) from anon; end if;
 if exists(select 1 from pg_roles where rolname='authenticated') then revoke all on function public.aiow_mail_outbox_dispatch_v2(uuid,text,uuid,text,bigint) from authenticated; end if;
 if exists(select 1 from pg_roles where rolname='service_role') then grant execute on function public.aiow_mail_outbox_dispatch_v2(uuid,text,uuid,text,bigint) to service_role; end if;
end $acl$;

commit;
