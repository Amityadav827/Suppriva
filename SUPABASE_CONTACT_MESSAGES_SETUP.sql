-- SUPPRIVA CONTACT MESSAGES SETUP
-- Run this in Supabase SQL Editor.
-- Safe to rerun.
--
-- Live auth model confirmed:
-- public.users.id = auth.uid()
-- public.users.role = 'admin'
-- public.users.status = 'active'
--
-- This migration does not assume role UUIDs or role names.
-- Admin/dashboard access is granted to active users whose public.users.role is admin.

create extension if not exists "pgcrypto";

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_email_idx
  on public.contact_messages (email);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;

drop policy if exists "Public can create contact messages" on public.contact_messages;
drop policy if exists "Admins can read contact messages" on public.contact_messages;
drop policy if exists "Admins can delete contact messages" on public.contact_messages;

create policy "Public can create contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (
  length(trim(name)) between 1 and 120
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(trim(subject)) between 1 and 180
  and length(trim(message)) between 1 and 4000
);

create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or public.users.email = coalesce(auth.jwt() ->> 'email', '')
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

create policy "Admins can delete contact messages"
on public.contact_messages
for delete
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or public.users.email = coalesce(auth.jwt() ->> 'email', '')
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

-- Force Supabase PostgREST to refresh its schema cache so the application API
-- can see the newly created contact_messages table immediately.
notify pgrst, 'reload schema';

-- Verification queries.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'contact_messages';

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'contact_messages'
order by ordinal_position;

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'contact_messages'
order by policyname;

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name = 'contact_messages'
  and grantee in ('anon', 'authenticated', 'service_role')
order by grantee, privilege_type;
