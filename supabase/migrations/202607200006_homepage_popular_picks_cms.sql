-- SUPPRIVA HOMEPAGE POPULAR PICKS CMS
-- Phase 6 display controls for "Popular Picks & Best Supplements".
-- Safe to run multiple times.

create table if not exists public.homepage_popular_picks_settings (
  id text primary key default 'home',
  max_products integer not null default 8,
  sort_mode text not null default 'latest',
  source_mode text not null default 'automatic',
  show_product_rating boolean not null default true,
  show_product_category boolean not null default true,
  show_product_cta boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_popular_picks_settings_singleton_check check (id = 'home'),
  constraint homepage_popular_picks_settings_max_products_check check (
    max_products between 1 and 20
  ),
  constraint homepage_popular_picks_settings_sort_mode_check check (
    sort_mode in ('latest', 'featured', 'highest_rated', 'manual_priority')
  ),
  constraint homepage_popular_picks_settings_source_mode_check check (
    source_mode in ('automatic', 'featured_only')
  )
);

alter table public.homepage_popular_picks_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_popular_picks_settings'
      and policyname = 'Public can read homepage popular picks settings'
  ) then
    create policy "Public can read homepage popular picks settings"
      on public.homepage_popular_picks_settings
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_popular_picks_settings'
      and policyname = 'Admins can manage homepage popular picks settings'
  ) then
    create policy "Admins can manage homepage popular picks settings"
      on public.homepage_popular_picks_settings
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

insert into public.homepage_popular_picks_settings (
  id,
  max_products,
  sort_mode,
  source_mode,
  show_product_rating,
  show_product_category,
  show_product_cta
)
values (
  'home',
  8,
  'latest',
  'automatic',
  true,
  true,
  true
)
on conflict (id) do update
set
  max_products = coalesce(public.homepage_popular_picks_settings.max_products, excluded.max_products),
  sort_mode = coalesce(nullif(public.homepage_popular_picks_settings.sort_mode, ''), excluded.sort_mode),
  source_mode = coalesce(nullif(public.homepage_popular_picks_settings.source_mode, ''), excluded.source_mode),
  show_product_rating = coalesce(public.homepage_popular_picks_settings.show_product_rating, excluded.show_product_rating),
  show_product_category = coalesce(public.homepage_popular_picks_settings.show_product_category, excluded.show_product_category),
  show_product_cta = coalesce(public.homepage_popular_picks_settings.show_product_cta, excluded.show_product_cta),
  updated_at = now();

notify pgrst, 'reload schema';
