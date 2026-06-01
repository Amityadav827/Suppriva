-- SUPPRIVA NEWSLETTER RPC ONLY PACKAGE
-- Run this in Supabase SQL Editor.
-- Scope: create/replace only the public newsletter RPC functions and grants.
-- Safe to rerun.

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

select
  routine_name,
  security_type
from information_schema.routines
where specific_schema = 'public'
  and routine_name in ('subscribe_newsletter', 'unsubscribe_newsletter')
order by routine_name;
