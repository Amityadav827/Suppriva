-- SUPPRIVA EXPERT QUERIES SETUP
-- Run this in Supabase SQL Editor.
-- Safe to rerun.
--
-- Live auth model confirmed:
-- public.users.id = auth.uid()
-- public.users.role = 'admin'
-- public.users.status = 'active'
--
-- This setup creates storage for product-page expert lead submissions.

create extension if not exists "pgcrypto";

create table if not exists public.expert_queries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  product_name text not null,
  product_url text not null,
  question_type text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  constraint expert_queries_status_check
    check (status in ('new', 'contacted', 'resolved'))
);

create index if not exists expert_queries_created_at_idx
  on public.expert_queries (created_at desc);

create index if not exists expert_queries_email_idx
  on public.expert_queries (email);

create index if not exists expert_queries_product_name_idx
  on public.expert_queries (product_name);

create index if not exists expert_queries_status_idx
  on public.expert_queries (status);

create index if not exists expert_queries_question_type_idx
  on public.expert_queries (question_type);

alter table public.expert_queries enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.expert_queries to anon, authenticated;
grant select, update, delete on public.expert_queries to authenticated;
grant all on public.expert_queries to service_role;

drop policy if exists "Public can create expert queries" on public.expert_queries;
drop policy if exists "Admins can read expert queries" on public.expert_queries;
drop policy if exists "Admins can update expert queries" on public.expert_queries;
drop policy if exists "Admins can delete expert queries" on public.expert_queries;

create policy "Public can create expert queries"
on public.expert_queries
for insert
to anon, authenticated
with check (
  length(trim(name)) between 1 and 120
  and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  and length(trim(product_name)) between 1 and 180
  and length(trim(product_url)) between 1 and 500
  and question_type in (
    'Ingredient Guidance',
    'Safety Information',
    'Usage Support',
    'Product Advice'
  )
  and length(trim(message)) between 1 and 4000
  and status = 'new'
);

create policy "Admins can read expert queries"
on public.expert_queries
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

create policy "Admins can update expert queries"
on public.expert_queries
for update
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
)
with check (
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
  and status in ('new', 'contacted', 'resolved')
);

create policy "Admins can delete expert queries"
on public.expert_queries
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

notify pgrst, 'reload schema';

select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'expert_queries';

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'expert_queries'
order by ordinal_position;

select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'expert_queries'
order by policyname;
