begin;

select set_config('aiow.receipt_acl_original_role',current_user,false);

create temporary table aiow_receipt_acl_temporary_memberships(
 role_name name primary key
) on commit drop;

do $receipt_acl_capability$
begin
 if not pg_has_role(current_user,'aiow_mail_run_receipt_owner','SET') then
  insert into aiow_receipt_acl_temporary_memberships(role_name) values('aiow_mail_run_receipt_owner');
  execute format('grant %I to %I with admin false, inherit false, set true','aiow_mail_run_receipt_owner',current_user);
 end if;
end $receipt_acl_capability$;

set role aiow_mail_run_receipt_owner;

revoke all on table public.commercial_mail_run_receipts from public;
do $receipt_table_acl$
begin
 if exists(select 1 from pg_roles where rolname='anon') then
  revoke all on table public.commercial_mail_run_receipts from anon;
 end if;
 if exists(select 1 from pg_roles where rolname='authenticated') then
  revoke all on table public.commercial_mail_run_receipts from authenticated;
 end if;
 if exists(select 1 from pg_roles where rolname='service_role') then
  revoke all on table public.commercial_mail_run_receipts from service_role;
  grant select on table public.commercial_mail_run_receipts to service_role;
 end if;
end $receipt_table_acl$;

revoke all on function
 public.aiow_mail_run_begin_v1(uuid,text,text,text),
 public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb),
 public.aiow_mail_run_receipts_delete_expired_v1(integer)
from public;

do $receipt_function_acl$
begin
 if exists(select 1 from pg_roles where rolname='anon') then
  revoke all on function
   public.aiow_mail_run_begin_v1(uuid,text,text,text),
   public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb),
   public.aiow_mail_run_receipts_delete_expired_v1(integer)
  from anon;
 end if;
 if exists(select 1 from pg_roles where rolname='authenticated') then
  revoke all on function
   public.aiow_mail_run_begin_v1(uuid,text,text,text),
   public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb),
   public.aiow_mail_run_receipts_delete_expired_v1(integer)
  from authenticated;
 end if;
 if exists(select 1 from pg_roles where rolname='service_role') then
  revoke all on function
   public.aiow_mail_run_begin_v1(uuid,text,text,text),
   public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb),
   public.aiow_mail_run_receipts_delete_expired_v1(integer)
  from service_role;
  grant execute on function
   public.aiow_mail_run_begin_v1(uuid,text,text,text),
   public.aiow_mail_run_complete_v1(uuid,text,text,uuid,integer,jsonb,jsonb)
  to service_role;
 end if;
 if exists(select 1 from pg_roles where rolname='aiow_mail_run_retention_worker') then
  revoke all on function public.aiow_mail_run_receipts_delete_expired_v1(integer) from aiow_mail_run_retention_worker;
  grant execute on function public.aiow_mail_run_receipts_delete_expired_v1(integer) to aiow_mail_run_retention_worker;
 end if;
end $receipt_function_acl$;

select set_config('role',current_setting('aiow.receipt_acl_original_role'),false);

do $receipt_acl_restore$
declare
 v_role name;
begin
 for v_role in select role_name from aiow_receipt_acl_temporary_memberships
 loop
  execute format('revoke %I from %I',v_role,current_user);
 end loop;
end $receipt_acl_restore$;

commit;

-- Supabase writes migration history in the same session after this file.
select set_config('role',current_setting('aiow.receipt_acl_original_role'),false);
select set_config('aiow.receipt_acl_original_role','',false);
