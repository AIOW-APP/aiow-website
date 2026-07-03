-- AIOW Venture Studio OS durable proof rail
-- Run in Supabase SQL editor before enabling AIOW_SUPABASE_URL + AIOW_SUPABASE_SERVICE_ROLE_KEY.

create table if not exists public.aiow_proof_events (
  event_id text primary key,
  created_at timestamptz not null default now(),
  account_id text not null,
  type text not null check (type in (
    'ADMIN_DECISION_RECORDED',
    'CONTRACT_DRAFT_CREATED',
    'CONTRACT_SENT',
    'CONTRACT_SIGNED',
    'CUSTOMER_ACCOUNT_CREATED',
    'CUSTOMER_SCOPE_REVIEW_REQUESTED',
    'CUSTOMER_FOLLOWUP_DRAFTED',
    'SPUNKY_HANDOFF_REQUESTED',
    'SPUNKY_PROJECT_GROUP_TASK_CREATED',
    'SPUNKY_PROJECT_GROUP_PREPARED'
  )),
  actor_email text not null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists aiow_proof_events_account_created_idx
  on public.aiow_proof_events (account_id, created_at desc);

create index if not exists aiow_proof_events_type_created_idx
  on public.aiow_proof_events (type, created_at desc);

alter table public.aiow_proof_events enable row level security;

-- Server-side AIOW APIs use the service-role key. Browser clients must not access this table directly.
-- Keep RLS closed; service_role bypasses RLS.
