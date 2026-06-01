-- SUPPRIVA AFFILIATE CLICK TRACKING RLS FIX
-- Run this in Supabase SQL Editor.
-- Safe to rerun.
--
-- Intent:
-- 1. Public website visitors can create affiliate click rows.
-- 2. Public visitors cannot read, update, or delete affiliate click rows.
-- 3. Active admin users can read affiliate click rows for dashboard analytics.
-- 4. Admin auth model: public.users.role = 'admin', public.users.status = 'active'.

alter table public.affiliate_clicks enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.affiliate_clicks to anon, authenticated;
grant select on public.affiliate_clicks to authenticated;

revoke update, delete on public.affiliate_clicks from anon, authenticated;

drop policy if exists "Public can create affiliate clicks" on public.affiliate_clicks;
drop policy if exists "Admins can read affiliate clicks" on public.affiliate_clicks;
drop policy if exists "Admins can manage affiliate clicks" on public.affiliate_clicks;

create policy "Public can create affiliate clicks"
on public.affiliate_clicks
for insert
to anon, authenticated
with check (
  product_id is not null
  and deleted_at is null
);

create policy "Admins can read affiliate clicks"
on public.affiliate_clicks
for select
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.role::text = 'admin'
      and public.users.status::text = 'active'
  )
);

notify pgrst, 'reload schema';

-- Verification: policy names and grants.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'affiliate_clicks'
order by policyname;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'affiliate_clicks'
  and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;
