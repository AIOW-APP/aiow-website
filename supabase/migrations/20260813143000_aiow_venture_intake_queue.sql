-- Durable, idempotent and rate-limited public venture intake queue.
-- Apply only to a dedicated staging database first. Production migration requires explicit approval.

create table if not exists public.aiow_venture_intakes (
  dossier_id text primary key,
  request_key_hash text not null unique,
  rate_key_hash text not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  review_status text not null default 'pending_human_review'
    check (review_status in ('pending_human_review', 'in_review', 'accepted', 'declined', 'deleted')),
  dossier jsonb not null,
  constraint aiow_venture_intakes_dossier_shape check (
    dossier ? 'dossierId'
    and dossier ? 'createdAt'
    and dossier ? 'expiresAt'
    and dossier ? 'contact'
    and dossier ? 'input'
    and dossier ? 'analysis'
    and dossier ? 'review'
  )
);

create index if not exists aiow_venture_intakes_review_created_idx
  on public.aiow_venture_intakes (review_status, created_at desc);
create index if not exists aiow_venture_intakes_expires_idx
  on public.aiow_venture_intakes (expires_at);

create table if not exists public.aiow_venture_intake_rate_limits (
  rate_key_hash text primary key,
  attempt_count integer not null check (attempt_count >= 1),
  window_started_at timestamptz not null,
  reset_at timestamptz not null
);

alter table public.aiow_venture_intakes enable row level security;
alter table public.aiow_venture_intake_rate_limits enable row level security;
revoke all on public.aiow_venture_intakes from public, anon, authenticated;
revoke all on public.aiow_venture_intake_rate_limits from public, anon, authenticated;

create or replace function public.aiow_accept_venture_intake(
  p_request_key_hash text,
  p_rate_key_hash text,
  p_max_attempts integer,
  p_window_seconds integer,
  p_dossier jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing public.aiow_venture_intakes%rowtype;
  v_rate public.aiow_venture_intake_rate_limits%rowtype;
  v_now timestamptz := clock_timestamp();
  v_dossier_id text := p_dossier ->> 'dossierId';
  v_created_at timestamptz;
  v_expires_at timestamptz;
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    raise exception 'service_role required' using errcode = '42501';
  end if;
  if p_request_key_hash !~ '^[0-9a-f]{64}$' or p_rate_key_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid hash';
  end if;
  if p_max_attempts < 1 or p_max_attempts > 100 or p_window_seconds < 60 or p_window_seconds > 86400 then
    raise exception 'invalid rate limit';
  end if;
  if v_dossier_id is null or v_dossier_id !~ '^aiow_avs_[0-9a-f-]{36}$' then
    raise exception 'invalid dossier id';
  end if;
  v_created_at := (p_dossier ->> 'createdAt')::timestamptz;
  v_expires_at := (p_dossier ->> 'expiresAt')::timestamptz;
  if v_created_at > v_now + interval '5 minutes'
     or v_created_at < v_now - interval '15 minutes'
     or v_expires_at <= v_created_at
     or v_expires_at > v_created_at + interval '31 days'
     or coalesce((p_dossier #>> '{contact,consentAccepted}')::boolean, false) is not true then
    raise exception 'invalid dossier timing or consent';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_request_key_hash, 0));
  select * into v_existing
  from public.aiow_venture_intakes
  where request_key_hash = p_request_key_hash;
  if found then
    return jsonb_build_object(
      'accepted', true,
      'replayed', true,
      'rateLimited', false,
      'dossierId', v_existing.dossier_id,
      'createdAt', v_existing.created_at
    );
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_rate_key_hash, 1));
  select * into v_rate
  from public.aiow_venture_intake_rate_limits
  where rate_key_hash = p_rate_key_hash
  for update;

  if not found or v_rate.reset_at <= v_now then
    insert into public.aiow_venture_intake_rate_limits(rate_key_hash, attempt_count, window_started_at, reset_at)
    values (p_rate_key_hash, 1, v_now, v_now + make_interval(secs => p_window_seconds))
    on conflict (rate_key_hash) do update
      set attempt_count = 1,
          window_started_at = excluded.window_started_at,
          reset_at = excluded.reset_at;
  elsif v_rate.attempt_count >= p_max_attempts then
    return jsonb_build_object(
      'accepted', false,
      'replayed', false,
      'rateLimited', true,
      'retryAfterSeconds', greatest(1, ceil(extract(epoch from (v_rate.reset_at - v_now)))::integer)
    );
  else
    update public.aiow_venture_intake_rate_limits
    set attempt_count = attempt_count + 1
    where rate_key_hash = p_rate_key_hash;
  end if;

  insert into public.aiow_venture_intakes(
    dossier_id, request_key_hash, rate_key_hash, created_at, expires_at, dossier
  ) values (
    v_dossier_id, p_request_key_hash, p_rate_key_hash, v_created_at, v_expires_at, p_dossier
  );

  return jsonb_build_object(
    'accepted', true,
    'replayed', false,
    'rateLimited', false,
    'dossierId', v_dossier_id,
    'createdAt', v_created_at
  );
end;
$$;

revoke all on function public.aiow_accept_venture_intake(text, text, integer, integer, jsonb) from public, anon, authenticated;
grant execute on function public.aiow_accept_venture_intake(text, text, integer, integer, jsonb) to service_role;

create or replace function public.aiow_purge_expired_venture_intakes()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted integer;
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    raise exception 'service_role required' using errcode = '42501';
  end if;
  delete from public.aiow_venture_intakes where expires_at <= clock_timestamp();
  get diagnostics v_deleted = row_count;
  delete from public.aiow_venture_intake_rate_limits where reset_at < clock_timestamp() - interval '24 hours';
  return v_deleted;
end;
$$;

revoke all on function public.aiow_purge_expired_venture_intakes() from public, anon, authenticated;
grant execute on function public.aiow_purge_expired_venture_intakes() to service_role;

comment on table public.aiow_venture_intakes is
  'Private AIOW venture intake review queue. Purge rows at expires_at unless a documented collaboration/retention basis replaces the temporary intake purpose.';
comment on function public.aiow_accept_venture_intake(text, text, integer, integer, jsonb) is
  'Service-role-only atomic idempotency, durable rate limiting and venture intake insert.';
comment on function public.aiow_purge_expired_venture_intakes() is
  'Service-role-only purge for expired temporary venture intake records; schedule daily after staging verification.';
