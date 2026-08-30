-- Scheduler-ready, service-only retention authority. Scheduling is deliberately external.
create function public.aiow_analytics_retention_purge_v1(
  p_dry_run boolean default true,
  p_as_of timestamptz default transaction_timestamp()
) returns jsonb
language plpgsql
volatile
security definer
set search_path=pg_catalog
as $$
declare
  v_raw_candidates bigint;
  v_idempotency_candidates bigint;
  v_raw_deleted bigint := 0;
  v_idempotency_deleted bigint := 0;
begin
  if p_dry_run is null or p_as_of is null or p_as_of > transaction_timestamp() + interval '5 minutes' then
    raise exception using errcode='22023', message='AIOW_ANALYTICS_RETENTION_INVALID';
  end if;

  select count(*) into v_raw_candidates
  from public.commercial_events
  where expires_at <= p_as_of;

  select count(*) into v_idempotency_candidates
  from public.commercial_idempotency i
  where endpoint = 'event_ingest'
    and exists (
      select 1 from public.commercial_events e
      where expires_at <= p_as_of
        and i.outcome->>'eventId' = lower(e.event_id::text)
    );

  if not p_dry_run then
    delete from public.commercial_idempotency i
    where endpoint = 'event_ingest'
      and exists (
        select 1 from public.commercial_events e
        where expires_at <= p_as_of
          and i.outcome->>'eventId' = lower(e.event_id::text)
      );
    get diagnostics v_idempotency_deleted = row_count;

    delete from public.commercial_events
    where expires_at <= p_as_of;
    get diagnostics v_raw_deleted = row_count;
  end if;

  return jsonb_build_object(
    'schemaKind', 'analytics_retention_purge_result',
    'dryRun', p_dry_run,
    'asOf', p_as_of,
    'rawEventCandidates', v_raw_candidates,
    'idempotencyCandidates', v_idempotency_candidates,
    'rawEventsDeleted', v_raw_deleted,
    'idempotencyRowsDeleted', v_idempotency_deleted,
    'aggregatesPreserved', true
  );
end
$$;

revoke all on function public.aiow_analytics_retention_purge_v1(boolean,timestamptz) from public;
do $authority$
begin
  if exists (select 1 from pg_roles where rolname='anon') then
    execute 'revoke all on function public.aiow_analytics_retention_purge_v1(boolean,timestamptz) from anon';
  end if;
  if exists (select 1 from pg_roles where rolname='authenticated') then
    execute 'revoke all on function public.aiow_analytics_retention_purge_v1(boolean,timestamptz) from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname='service_role') then
    execute 'grant execute on function public.aiow_analytics_retention_purge_v1(boolean,timestamptz) to service_role';
  end if;
end
$authority$;