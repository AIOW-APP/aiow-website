-- AIOW proof events v2 migration
-- Fixes older production tables where aiow_proof_events.type only allowed the first MVP event types.
-- Run in Supabase SQL editor or via a service-role SQL migration before relying on durable proof logs.

alter table public.aiow_proof_events
  drop constraint if exists aiow_proof_events_type_check;

alter table public.aiow_proof_events
  add constraint aiow_proof_events_type_check check (type in (
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
  ));

create index if not exists aiow_proof_events_account_created_idx
  on public.aiow_proof_events (account_id, created_at desc);

create index if not exists aiow_proof_events_type_created_idx
  on public.aiow_proof_events (type, created_at desc);
