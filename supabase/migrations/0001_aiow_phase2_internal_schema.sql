-- AIOW Phase 2 internal prep schema
-- Not applied to production. Review before use.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null default 'manual',
  company_name text not null,
  contact_name text,
  phone text,
  email text,
  intake_summary text,
  status text not null default 'new'
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  created_at timestamptz not null default now(),
  company_name text not null,
  primary_contact text,
  status text not null default 'draft'
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  created_at timestamptz not null default now(),
  title text not null,
  scope_md text not null,
  price_cents integer,
  status text not null default 'draft',
  legal_review_required boolean not null default true
);

create table if not exists planning_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  quote_id uuid references quotes(id),
  created_at timestamptz not null default now(),
  title text not null,
  starts_at timestamptz,
  status text not null default 'proposed'
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  notes text
);
