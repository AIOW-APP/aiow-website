-- AIOW Lead Intelligence schema
-- Run in Supabase SQL editor before enabling AIOW_SUPABASE_URL + AIOW_SUPABASE_SERVICE_ROLE_KEY for lead intelligence.

create table if not exists aiow_customer_accounts (
  account_id text primary key,
  account_code_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'INTAKE_ACCOUNT_CREATED',
  company_name text not null,
  legal_name text,
  contact_name text not null,
  contact_email text not null,
  project_name text not null,
  project_type text not null,
  analysis_readiness_score int not null default 0,
  payment_state text not null default 'PAUSED_TERMS_REQUIRED',
  payload jsonb not null default '{}'::jsonb
);

create index if not exists aiow_customer_accounts_email_idx on aiow_customer_accounts(contact_email);
create index if not exists aiow_customer_accounts_created_at_idx on aiow_customer_accounts(created_at desc);
create index if not exists aiow_customer_accounts_status_idx on aiow_customer_accounts(status);

create table if not exists aiow_venture_memory_events (
  id text primary key,
  session_id text not null,
  role text not null,
  event_type text not null,
  content text not null,
  person_email text,
  person_name text,
  company text,
  consent_accepted boolean,
  canvas jsonb,
  metadata jsonb,
  retention text not null default 'temporary_pre_account',
  privacy_note text not null,
  created_at timestamptz not null default now()
);

create index if not exists aiow_venture_memory_events_session_idx on aiow_venture_memory_events(session_id, created_at desc);
create index if not exists aiow_venture_memory_events_created_idx on aiow_venture_memory_events(created_at desc);
create index if not exists aiow_venture_memory_events_email_idx on aiow_venture_memory_events(person_email) where person_email is not null;
create index if not exists aiow_venture_memory_events_type_idx on aiow_venture_memory_events(event_type);

create table if not exists aiow_venture_sessions (
  session_id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'temporary_pre_account',
  relationship_stage text not null default 'anonymous',
  person_email text,
  person_name text,
  company text,
  last_summary text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists aiow_venture_sessions_updated_idx on aiow_venture_sessions(updated_at desc);
create index if not exists aiow_venture_sessions_status_idx on aiow_venture_sessions(status);

create table if not exists aiow_deal_cards (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  lead_id text,
  title text not null,
  founder text,
  company text,
  problem text,
  opportunity text,
  likely_route text,
  missing text[] default '{}',
  next_step text,
  confidence int,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aiow_deal_cards_session_idx on aiow_deal_cards(session_id, created_at desc);
create index if not exists aiow_deal_cards_lead_idx on aiow_deal_cards(lead_id) where lead_id is not null;

create table if not exists aiow_admin_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  subject_type text not null,
  subject_id text,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists aiow_admin_events_type_idx on aiow_admin_events(event_type, created_at desc);

create table if not exists aiow_leads (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null,
  email_hash text not null,
  name text,
  company text,
  phone text,
  source text not null,
  source_route text,
  source_component text,
  locale text default 'nl',
  intent_type text default 'unknown',
  intent_text text,
  project_type text,
  module_interests text[] default '{}',
  add_ons text[] default '{}',
  customer_account_id text,
  onboarding_id text,
  status text not null default 'captured',
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists aiow_leads_email_hash_idx on aiow_leads(email_hash);
create index if not exists aiow_leads_created_at_idx on aiow_leads(created_at desc);
create index if not exists aiow_leads_status_idx on aiow_leads(status);

create table if not exists aiow_lead_consents (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null references aiow_leads(id) on delete cascade,
  email text not null,
  consent_type text not null default 'follow_up_email',
  granted boolean not null default true,
  consent_text text not null,
  consent_version text not null,
  legal_basis text not null default 'consent',
  source text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create index if not exists aiow_lead_consents_lead_id_idx on aiow_lead_consents(lead_id);
create index if not exists aiow_lead_consents_email_idx on aiow_lead_consents(email);

create table if not exists aiow_lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id text references aiow_leads(id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists aiow_lead_events_lead_id_idx on aiow_lead_events(lead_id);
create index if not exists aiow_lead_events_type_idx on aiow_lead_events(event_type);

create table if not exists aiow_email_jobs (
  id uuid primary key default gen_random_uuid(),
  lead_id text not null references aiow_leads(id) on delete cascade,
  job_type text not null default 'next_day_followup',
  scheduled_for timestamptz not null,
  status text not null default 'pending',
  idempotency_key text not null unique,
  attempts int not null default 0,
  last_error text,
  template_version text not null default 'aiow-next-day-followup-v1',
  personalization_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists aiow_email_jobs_due_idx on aiow_email_jobs(status, scheduled_for);
create index if not exists aiow_email_jobs_lead_id_idx on aiow_email_jobs(lead_id);

create table if not exists aiow_email_sends (
  id uuid primary key default gen_random_uuid(),
  lead_id text references aiow_leads(id) on delete set null,
  email_job_id uuid references aiow_email_jobs(id) on delete set null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null,
  subject text,
  sent_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists aiow_email_sends_lead_id_idx on aiow_email_sends(lead_id);
