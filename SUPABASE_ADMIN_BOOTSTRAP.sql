-- SUPPRIVA ADMIN BOOTSTRAP + VERIFICATION
-- Run this in Supabase SQL Editor.
-- Purpose:
-- 1. Detect current Supabase Auth users.
-- 2. Verify auth.users -> public.users mapping.
-- 3. Promote one selected Auth user to admin in public.users.
-- 4. Keep dashboard RLS compatible with public.is_suppriva_admin().
--
-- IMPORTANT:
-- Replace CHANGE_ME_ADMIN_EMAIL with the email of an existing Supabase Auth user.
-- The user must already exist in Authentication > Users.

-- ======================================================
-- A. CURRENT AUTH USERS + PROFILE MAPPING
-- ======================================================

select
  au.id as auth_user_id,
  au.email as auth_email,
  au.email_confirmed_at,
  au.created_at as auth_created_at,
  pu.id as public_user_id,
  pu.email as public_email,
  pu.full_name,
  pu.role,
  pu.status,
  pu.deleted_at,
  case
    when pu.id is null then 'MISSING_PUBLIC_PROFILE'
    when pu.id <> au.id then 'ID_MISMATCH'
    when pu.role = 'admin'::public.user_role
      and pu.status = 'active'::public.user_status
      and pu.deleted_at is null then 'ADMIN_READY'
    else 'PROFILE_EXISTS_NOT_ADMIN'
  end as readiness
from auth.users au
left join public.users pu on pu.id = au.id
order by au.created_at desc;

-- ======================================================
-- B. ADMIN BOOTSTRAP
-- ======================================================

do $$
declare
  admin_email text := 'CHANGE_ME_ADMIN_EMAIL';
  target_auth_user auth.users%rowtype;
begin
  if admin_email = 'CHANGE_ME_ADMIN_EMAIL' or length(trim(admin_email)) = 0 then
    raise exception 'Replace CHANGE_ME_ADMIN_EMAIL with an existing auth.users.email before running the bootstrap block.';
  end if;

  select *
  into target_auth_user
  from auth.users
  where lower(email) = lower(trim(admin_email))
  limit 1;

  if not found then
    raise exception 'No Supabase Auth user found for email: %', admin_email;
  end if;

  insert into public.users (
    id,
    full_name,
    email,
    role,
    status,
    deleted_at,
    created_at,
    updated_at
  )
  values (
    target_auth_user.id,
    coalesce(target_auth_user.raw_user_meta_data->>'full_name', split_part(target_auth_user.email, '@', 1), 'Suppriva Admin'),
    target_auth_user.email,
    'admin'::public.user_role,
    'active'::public.user_status,
    null,
    now(),
    now()
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.users.full_name),
    email = excluded.email,
    role = 'admin'::public.user_role,
    status = 'active'::public.user_status,
    deleted_at = null,
    updated_at = now();

  update public.users
  set
    id = target_auth_user.id,
    role = 'admin'::public.user_role,
    status = 'active'::public.user_status,
    deleted_at = null,
    updated_at = now()
  where lower(email) = lower(target_auth_user.email)
    and id <> target_auth_user.id;
end $$;

-- ======================================================
-- C. ADMIN HELPER
-- ======================================================

create or replace function public.is_suppriva_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role = 'admin'::public.user_role
      and users.status = 'active'::public.user_status
      and users.deleted_at is null
  );
$$;

revoke all on function public.is_suppriva_admin() from public;
grant execute on function public.is_suppriva_admin() to authenticated;

-- ======================================================
-- D. FINAL ADMIN VERIFICATION
-- ======================================================

select
  au.id as auth_user_id,
  au.email as auth_email,
  au.email_confirmed_at,
  pu.id as public_user_id,
  pu.email as public_email,
  pu.role,
  pu.status,
  pu.deleted_at,
  case
    when pu.id = au.id
      and pu.role = 'admin'::public.user_role
      and pu.status = 'active'::public.user_status
      and pu.deleted_at is null then 'PASS'
    else 'FAIL'
  end as admin_bootstrap_status
from auth.users au
left join public.users pu on pu.id = au.id
where lower(au.email) = lower('CHANGE_ME_ADMIN_EMAIL');

select exists (
  select 1
  from auth.users au
  join public.users pu on pu.id = au.id
  where pu.role = 'admin'::public.user_role
    and pu.status = 'active'::public.user_status
    and pu.deleted_at is null
) as has_active_admin_profile;
