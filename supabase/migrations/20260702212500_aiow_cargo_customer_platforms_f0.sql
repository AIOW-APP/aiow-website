-- F0 schema-migratie — AIOW + Cargo customer platforms
-- Doel-project: aiow-venture-memory (eu-west-1). Draaien als één migration; idempotent opgezet.
-- Na draaien: per tabel 1 insert + select terug (readback-proof) en resultaat op het board.

create schema if not exists shared;
create schema if not exists aiow;
create schema if not exists cargo;
-- ========== SHARED ==========
create table if not exists shared.customer_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id),
  brand text not null check (brand in ('aiow','cargo')),
  email text not null,
  display_name text,
  locale text not null default 'nl' check (locale in ('nl','en')),
  created_at timestamptz not null default now(),
  unique (brand, email)
);
create table if not exists shared.files (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references shared.customer_accounts(id),
  bucket text not null,
  path text not null,
  kind text,
  uploaded_by text not null default 'customer' check (uploaded_by in ('customer','admin','system')),
  created_at timestamptz not null default now()
);
create table if not exists shared.proof_events (
  id bigint generated always as identity primary key,
  brand text not null check (brand in ('aiow','cargo')),
  actor text not null,               -- 'richard' | 'admin:<naam>' | 'system' | 'customer:<id>'
  action text not null,              -- bv 'decision.go', 'status.in_build', 'contract.draft'
  subject_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists shared.notifications (
  id bigint generated always as identity primary key,
  account_id uuid references shared.customer_accounts(id),
  channel text not null default 'inapp' check (channel in ('inapp','email','telegram','push')),
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists shared.admin_notes (
  id bigint generated always as identity primary key,
  brand text not null check (brand in ('aiow','cargo')),
  subject_id uuid not null,
  author text not null,
  note text not null,
  created_at timestamptz not null default now()
);
-- ========== AIOW ==========
create table if not exists aiow.ventures (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references shared.customer_accounts(id),
  title text not null,
  state text not null default 'intake_incomplete' check (state in
    ('lead','intake_incomplete','intake_complete','dossier_building','needs_more_info',
     'internal_review','rejected','paid_scan_offered','proposal_ready','contract_sent',
     'contract_signed','workspace_active','build_active','launch')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists aiow.venture_facts (
  id bigint generated always as identity primary key,
  venture_id uuid not null references aiow.ventures(id) on delete cascade,
  fact_type text not null check (fact_type in
    ('founder','market','traction','financial','technical','legal','contact','risk','asset','unknown')),
  confidence numeric not null check (confidence between 0 and 1),
  evidence text not null,
  missing_follow_up text,
  sensitivity text not null default 'low' check (sensitivity in ('low','medium','high')),
  source text not null default 'intake',
  created_at timestamptz not null default now()
);
create table if not exists aiow.scores (
  id bigint generated always as identity primary key,
  venture_id uuid not null references aiow.ventures(id) on delete cascade,
  dimension text not null check (dimension in
    ('founder','market','problem_solution','ai_leverage','traction','buildability','deal_quality','total')),
  score numeric not null check (score between 0 and 100),
  confidence text not null default 'mid' check (confidence in ('low','mid','high')),
  evidence text,
  scored_at timestamptz not null default now()
);
create table if not exists aiow.missing_info_tasks (
  id bigint generated always as identity primary key,
  venture_id uuid not null references aiow.ventures(id) on delete cascade,
  question text not null,
  fact_type text,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists aiow.decisions (
  id bigint generated always as identity primary key,
  venture_id uuid not null references aiow.ventures(id) on delete cascade,
  outcome text not null check (outcome in ('reject','paid_scan','conditional_go','go')),
  rationale text not null,
  decided_by text not null,          -- moet 'richard' zijn voor go/conditional_go (gate in app-laag)
  created_at timestamptz not null default now()
);
create table if not exists aiow.contract_drafts (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references aiow.ventures(id) on delete cascade,
  revenue_share_pct numeric check (revenue_share_pct between 0 and 50),
  exit_share_pct numeric check (exit_share_pct between 0 and 50),
  body_md text,
  status text not null default 'concept' check (status in ('concept','richard_approved','sent','signed','void')),
  created_at timestamptz not null default now()
);
create table if not exists aiow.spunky_handoffs (
  id bigint generated always as identity primary key,
  venture_id uuid not null references aiow.ventures(id) on delete cascade,
  telegram_handle text,
  group_name text,
  state text not null default 'pending' check (state in ('pending','group_created','active','closed')),
  created_at timestamptz not null default now()
);
-- ========== CARGO ==========
create table if not exists cargo.crates (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references shared.customer_accounts(id),
  ref text unique,                   -- werkbon/kistnummer, leesbaar
  state text not null default 'quote_requested' check (state in
    ('quote_requested','invited','accepted','measurements_confirmed','in_design','awaiting_approval',
     'materials_planned','in_build','quality_check','ready','in_storage','delivered','archived')),
  length_cm int, width_cm int, height_cm int,
  weight_class text check (weight_class in ('licht','middel','zwaar','xzwaar')),
  destination text,
  ispm boolean not null default false,
  urgency text not null default 'normaal' check (urgency in ('normaal','spoed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists cargo.crate_photos (
  id bigint generated always as identity primary key,
  crate_id uuid not null references cargo.crates(id) on delete cascade,
  file_id uuid references shared.files(id),
  phase text not null default 'intake' check (phase in ('intake','design','build','quality','ready','delivery')),
  caption text,
  customer_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists cargo.status_events (
  id bigint generated always as identity primary key,
  crate_id uuid not null references cargo.crates(id) on delete cascade,
  from_state text, to_state text not null,
  note text,
  by_admin text,
  customer_visible boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists cargo.quote_ranges (
  id bigint generated always as identity primary key,
  crate_id uuid not null references cargo.crates(id) on delete cascade,
  low_eur numeric not null, high_eur numeric not null,
  config_version text not null,      -- verwijst naar PRIJS-config versie (zelfde bron als site)
  final_eur numeric,                 -- pas na Richard-offerte
  created_at timestamptz not null default now()
);
create table if not exists cargo.storage_records (
  id bigint generated always as identity primary key,
  crate_id uuid not null references cargo.crates(id) on delete cascade,
  m2 numeric, week_start date, week_end date, rate_eur_m2_week numeric,
  created_at timestamptz not null default now()
);
create table if not exists cargo.transport_records (
  id bigint generated always as identity primary key,
  crate_id uuid not null references cargo.crates(id) on delete cascade,
  kind text not null check (kind in ('ophalen','bezorgen','schiphol','haven','scheepslevering','spoed')),
  planned_at timestamptz, done_at timestamptz, note text,
  created_at timestamptz not null default now()
);
create table if not exists cargo.quality_checks (
  id bigint generated always as identity primary key,
  crate_id uuid not null references cargo.crates(id) on delete cascade,
  kind text not null default 'ispm' check (kind in ('ispm','maatvoering','binnenwerk','eind')),
  passed boolean not null,
  checked_by text not null,
  note text,
  created_at timestamptz not null default now()
);
create table if not exists cargo.reorder_templates (
  id bigint generated always as identity primary key,
  account_id uuid references shared.customer_accounts(id),
  source_crate_id uuid references cargo.crates(id),
  label text,
  created_at timestamptz not null default now()
);
-- ========== RLS (basis; app-rollen verfijnen in F2) ==========
alter table shared.customer_accounts enable row level security;
alter table shared.files enable row level security;
alter table shared.notifications enable row level security;
alter table aiow.ventures enable row level security;
alter table aiow.venture_facts enable row level security;
alter table aiow.missing_info_tasks enable row level security;
alter table cargo.crates enable row level security;
alter table cargo.crate_photos enable row level security;
alter table cargo.status_events enable row level security;
alter table cargo.quote_ranges enable row level security;
-- klant ziet alleen eigen account-data (service role omzeilt dit server-side)
drop policy if exists own_account on shared.customer_accounts;
create policy own_account on shared.customer_accounts
  for select using (auth_user_id = auth.uid());
drop policy if exists own_ventures on aiow.ventures;
create policy own_ventures on aiow.ventures
  for select using (account_id in (select id from shared.customer_accounts where auth_user_id = auth.uid()));
drop policy if exists own_crates on cargo.crates;
create policy own_crates on cargo.crates
  for select using (account_id in (select id from shared.customer_accounts where auth_user_id = auth.uid()));
drop policy if exists own_crate_events on cargo.status_events;
create policy own_crate_events on cargo.status_events
  for select using (customer_visible and crate_id in
    (select id from cargo.crates where account_id in
      (select id from shared.customer_accounts where auth_user_id = auth.uid())));
drop policy if exists own_crate_photos on cargo.crate_photos;
create policy own_crate_photos on cargo.crate_photos
  for select using (customer_visible and crate_id in
    (select id from cargo.crates where account_id in
      (select id from shared.customer_accounts where auth_user_id = auth.uid())));
-- Storage buckets (via dashboard of storage API aanmaken): 'aiow-dossier' privaat, 'cargo-photos' privaat.
-- Admin-writes gaan in F1/F2 uitsluitend via server-side service role; aparte admin-policies volgen in F2.;
