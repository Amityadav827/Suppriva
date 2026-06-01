-- SUPPRIVA NEWSLETTER PERMANENT RLS FIX
-- Run this in Supabase SQL Editor.
-- Purpose:
-- - Public subscribe works without exposing table SELECT access.
-- - Public unsubscribe works without exposing table SELECT access.
-- - Duplicate email abuse is prevented with normalized email + idempotent logic.
-- - Admins keep dashboard management access through is_suppriva_admin().

alter table public.newsletter_subscribers enable row level security;

alter table if exists public.newsletter_subscribers
  add column if not exists source_page text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create index if not exists newsletter_subscribers_email_idx
on public.newsletter_subscribers (email);

create index if not exists newsletter_subscribers_status_idx
on public.newsletter_subscribers (status);

create index if not exists newsletter_subscribers_source_page_idx
on public.newsletter_subscribers (source_page);

create index if not exists newsletter_subscribers_deleted_at_idx
on public.newsletter_subscribers (deleted_at);

create unique index if not exists newsletter_subscribers_email_lower_unique_idx
on public.newsletter_subscribers (lower(email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_newsletter_subscribers_updated_at'
      and tgrelid = 'public.newsletter_subscribers'::regclass
      and not tgisinternal
  ) then
    create trigger set_newsletter_subscribers_updated_at
    before update on public.newsletter_subscribers
    for each row execute function public.set_updated_at();
  end if;
end $$;

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

create or replace function public.subscribe_newsletter(
  p_email text,
  p_source_page text default null
)
returns public.newsletter_subscribers
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  normalized_source text;
  existing_subscriber public.newsletter_subscribers%rowtype;
  saved_subscriber public.newsletter_subscribers%rowtype;
begin
  normalized_email := lower(trim(coalesce(p_email, '')));
  normalized_source := nullif(left(trim(coalesce(p_source_page, '')), 500), '');

  if normalized_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'A valid email address is required.'
      using errcode = '22023';
  end if;

  select *
  into existing_subscriber
  from public.newsletter_subscribers
  where lower(email) = normalized_email
  order by created_at desc
  limit 1;

  if found then
    if existing_subscriber.status = 'active'::public.subscriber_status
       and existing_subscriber.deleted_at is null then
      return existing_subscriber;
    end if;

    update public.newsletter_subscribers
    set
      email = normalized_email,
      status = 'active'::public.subscriber_status,
      source_page = coalesce(normalized_source, source_page),
      deleted_at = null,
      updated_at = now()
    where id = existing_subscriber.id
    returning * into saved_subscriber;

    return saved_subscriber;
  end if;

  insert into public.newsletter_subscribers (
    email,
    status,
    source_page
  )
  values (
    normalized_email,
    'active'::public.subscriber_status,
    normalized_source
  )
  returning * into saved_subscriber;

  return saved_subscriber;
end;
$$;

create or replace function public.unsubscribe_newsletter(p_email text)
returns public.newsletter_subscribers
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text;
  saved_subscriber public.newsletter_subscribers%rowtype;
begin
  normalized_email := lower(trim(coalesce(p_email, '')));

  if normalized_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' then
    raise exception 'A valid email address is required.'
      using errcode = '22023';
  end if;

  update public.newsletter_subscribers
  set
    status = 'unsubscribed'::public.subscriber_status,
    updated_at = now()
  where lower(email) = normalized_email
    and deleted_at is null
  returning * into saved_subscriber;

  if not found then
    raise exception 'Newsletter subscriber not found.'
      using errcode = 'P0002';
  end if;

  return saved_subscriber;
end;
$$;

revoke all on function public.subscribe_newsletter(text, text) from public;
revoke all on function public.unsubscribe_newsletter(text) from public;

grant execute on function public.subscribe_newsletter(text, text) to anon, authenticated;
grant execute on function public.unsubscribe_newsletter(text) to anon, authenticated;

-- Keep direct public table writes closed. Public writes go through the validated RPCs above.
drop policy if exists "Public can create newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Public can unsubscribe newsletter subscribers" on public.newsletter_subscribers;

drop policy if exists "Admins can manage newsletter subscribers" on public.newsletter_subscribers;
create policy "Admins can manage newsletter subscribers"
on public.newsletter_subscribers
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

-- Verification: expected functions and policies.
select
  routine_name,
  security_type
from information_schema.routines
where specific_schema = 'public'
  and routine_name in ('subscribe_newsletter', 'unsubscribe_newsletter')
order by routine_name;

select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename = 'newsletter_subscribers'
order by policyname;
