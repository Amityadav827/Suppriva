-- SUPPRIVA HOMEPAGE BLOGS CMS REPAIR
-- Safe to run multiple times.
-- Creates and hydrates the Homepage Blogs CMS settings table when production
-- has not applied the Phase 5 migration yet.

create table if not exists public.homepage_blogs_settings (
  id text primary key default 'home',
  max_blogs integer not null default 4,
  sort_mode text not null default 'latest',
  show_featured_badge boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_blogs_settings_singleton_check'
      and conrelid = 'public.homepage_blogs_settings'::regclass
  ) then
    alter table public.homepage_blogs_settings
      add constraint homepage_blogs_settings_singleton_check check (id = 'home');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_blogs_settings_max_blogs_check'
      and conrelid = 'public.homepage_blogs_settings'::regclass
  ) then
    alter table public.homepage_blogs_settings
      add constraint homepage_blogs_settings_max_blogs_check check (
        max_blogs between 1 and 12
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_blogs_settings_sort_mode_check'
      and conrelid = 'public.homepage_blogs_settings'::regclass
  ) then
    alter table public.homepage_blogs_settings
      add constraint homepage_blogs_settings_sort_mode_check check (
        sort_mode in ('latest', 'featured', 'manual_priority')
      );
  end if;
end $$;

alter table public.homepage_blogs_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_blogs_settings'
      and policyname = 'Public can read homepage blogs settings'
  ) then
    create policy "Public can read homepage blogs settings"
      on public.homepage_blogs_settings
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_blogs_settings'
      and policyname = 'Admins can manage homepage blogs settings'
  ) then
    create policy "Admins can manage homepage blogs settings"
      on public.homepage_blogs_settings
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

insert into public.homepage_blogs_settings (
  id,
  max_blogs,
  sort_mode,
  show_featured_badge
)
values (
  'home',
  4,
  'latest',
  true
)
on conflict (id) do update
set
  max_blogs = coalesce(public.homepage_blogs_settings.max_blogs, excluded.max_blogs),
  sort_mode = coalesce(nullif(public.homepage_blogs_settings.sort_mode, ''), excluded.sort_mode),
  show_featured_badge = coalesce(public.homepage_blogs_settings.show_featured_badge, excluded.show_featured_badge),
  updated_at = now();

notify pgrst, 'reload schema';

-- Verification:
-- select * from public.homepage_blogs_settings;
