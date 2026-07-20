-- SUPPRIVA HOMEPAGE NEWSLETTER CMS REPAIR
-- Safe to run multiple times.
-- Creates and hydrates Homepage Newsletter CMS tables when production has not
-- applied the Phase 10 migration yet.

create table if not exists public.homepage_newsletter_settings (
  id text primary key default 'home',
  badge_text text not null default 'Premium Wellness Insider',
  email_placeholder text not null default 'Enter your email',
  button_label text not null default 'Subscribe',
  success_message text not null default 'You are subscribed. Welcome to Suppriva wellness insights.',
  error_message text not null default 'Unable to subscribe right now.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_newsletter_trust_chips (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_newsletter_settings_singleton_check'
      and conrelid = 'public.homepage_newsletter_settings'::regclass
  ) then
    alter table public.homepage_newsletter_settings
      add constraint homepage_newsletter_settings_singleton_check check (id = 'home');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_newsletter_trust_chips_sort_order_check'
      and conrelid = 'public.homepage_newsletter_trust_chips'::regclass
  ) then
    alter table public.homepage_newsletter_trust_chips
      add constraint homepage_newsletter_trust_chips_sort_order_check check (sort_order >= 0);
  end if;
end $$;

create index if not exists homepage_newsletter_trust_chips_visible_order_idx
  on public.homepage_newsletter_trust_chips (is_visible, sort_order);

alter table public.homepage_newsletter_settings enable row level security;
alter table public.homepage_newsletter_trust_chips enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_newsletter_settings'
      and policyname = 'Public can read homepage newsletter settings'
  ) then
    create policy "Public can read homepage newsletter settings"
      on public.homepage_newsletter_settings
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_newsletter_settings'
      and policyname = 'Admins can manage homepage newsletter settings'
  ) then
    create policy "Admins can manage homepage newsletter settings"
      on public.homepage_newsletter_settings
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.users
          where public.users.id = auth.uid()
            and public.users.role::text = 'admin'
            and public.users.status::text = 'active'
            and public.users.deleted_at is null
        )
      )
      with check (
        exists (
          select 1
          from public.users
          where public.users.id = auth.uid()
            and public.users.role::text = 'admin'
            and public.users.status::text = 'active'
            and public.users.deleted_at is null
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_newsletter_trust_chips'
      and policyname = 'Public can read homepage newsletter trust chips'
  ) then
    create policy "Public can read homepage newsletter trust chips"
      on public.homepage_newsletter_trust_chips
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_newsletter_trust_chips'
      and policyname = 'Admins can manage homepage newsletter trust chips'
  ) then
    create policy "Admins can manage homepage newsletter trust chips"
      on public.homepage_newsletter_trust_chips
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.users
          where public.users.id = auth.uid()
            and public.users.role::text = 'admin'
            and public.users.status::text = 'active'
            and public.users.deleted_at is null
        )
      )
      with check (
        exists (
          select 1
          from public.users
          where public.users.id = auth.uid()
            and public.users.role::text = 'admin'
            and public.users.status::text = 'active'
            and public.users.deleted_at is null
        )
      );
  end if;
end $$;

insert into public.homepage_newsletter_settings (
  id,
  badge_text,
  email_placeholder,
  button_label,
  success_message,
  error_message
)
values (
  'home',
  'Premium Wellness Insider',
  'Enter your email',
  'Subscribe',
  'You are subscribed. Welcome to Suppriva wellness insights.',
  'Unable to subscribe right now.'
)
on conflict (id) do update
set
  badge_text = coalesce(nullif(public.homepage_newsletter_settings.badge_text, ''), excluded.badge_text),
  email_placeholder = coalesce(nullif(public.homepage_newsletter_settings.email_placeholder, ''), excluded.email_placeholder),
  button_label = coalesce(nullif(public.homepage_newsletter_settings.button_label, ''), excluded.button_label),
  success_message = coalesce(nullif(public.homepage_newsletter_settings.success_message, ''), excluded.success_message),
  error_message = coalesce(nullif(public.homepage_newsletter_settings.error_message, ''), excluded.error_message),
  updated_at = now();

insert into public.homepage_newsletter_trust_chips (
  label,
  sort_order,
  is_visible
)
select *
from (
  values
    ('Trusted by 10,000+ wellness readers', 0, true),
    ('Weekly expert supplement insights', 1, true)
) as seeded(label, sort_order, is_visible)
where not exists (
  select 1 from public.homepage_newsletter_trust_chips
);

notify pgrst, 'reload schema';

-- Verification:
-- select * from public.homepage_newsletter_settings;
-- select * from public.homepage_newsletter_trust_chips order by sort_order;
