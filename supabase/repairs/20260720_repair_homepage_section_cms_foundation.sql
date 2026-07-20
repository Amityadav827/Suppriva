-- SUPPRIVA HOMEPAGE SECTION CMS FOUNDATION REPAIR
-- Safe to run multiple times in Supabase SQL Editor.
-- Repairs production environments where the Homepage CMS foundation migration
-- was not applied and public.homepage_sections does not exist.

create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  section_name text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  title text,
  subtitle text,
  cta_label text,
  cta_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_sections_section_key_check check (
    section_key in (
      'hero',
      'health_needs',
      'popular_picks',
      'ingredients_discovery',
      'wellness_expert',
      'blogs',
      'discover_wellness_solutions',
      'why_choose_suppriva',
      'trust_badges',
      'newsletter'
    )
  ),
  constraint homepage_sections_sort_order_check check (sort_order >= 0),
  constraint homepage_sections_cta_url_check check (
    cta_url is null
    or cta_url = ''
    or cta_url like '/%'
    or cta_url like 'http://%'
    or cta_url like 'https://%'
  )
);

alter table if exists public.homepage_sections
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists section_key text,
  add column if not exists section_name text,
  add column if not exists is_visible boolean default true,
  add column if not exists sort_order integer default 0,
  add column if not exists title text,
  add column if not exists subtitle text,
  add column if not exists cta_label text,
  add column if not exists cta_url text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists homepage_sections_section_key_uidx
  on public.homepage_sections (section_key);

create index if not exists homepage_sections_visible_order_idx
  on public.homepage_sections (is_visible, sort_order);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_sections_section_key_check'
      and conrelid = 'public.homepage_sections'::regclass
  ) then
    alter table public.homepage_sections
      add constraint homepage_sections_section_key_check check (
        section_key in (
          'hero',
          'health_needs',
          'popular_picks',
          'ingredients_discovery',
          'wellness_expert',
          'blogs',
          'discover_wellness_solutions',
          'why_choose_suppriva',
          'trust_badges',
          'newsletter'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_sections_sort_order_check'
      and conrelid = 'public.homepage_sections'::regclass
  ) then
    alter table public.homepage_sections
      add constraint homepage_sections_sort_order_check check (sort_order >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_sections_cta_url_check'
      and conrelid = 'public.homepage_sections'::regclass
  ) then
    alter table public.homepage_sections
      add constraint homepage_sections_cta_url_check check (
        cta_url is null
        or cta_url = ''
        or cta_url like '/%'
        or cta_url like 'http://%'
        or cta_url like 'https://%'
      );
  end if;
end $$;

alter table public.homepage_sections enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_sections'
      and policyname = 'Public can read homepage sections'
  ) then
    create policy "Public can read homepage sections"
      on public.homepage_sections
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_sections'
      and policyname = 'Admins can manage homepage sections'
  ) then
    create policy "Admins can manage homepage sections"
      on public.homepage_sections
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

insert into public.homepage_sections (
  section_key,
  section_name,
  is_visible,
  sort_order,
  title,
  subtitle,
  cta_label,
  cta_url
)
values
  (
    'hero',
    'Hero',
    true,
    0,
    'Discover Wellness Solutions That Fit Your Goals',
    'Explore supplements, ingredient insights, and wellness collections designed to help you make informed health decisions with confidence.',
    'Explore Wellness Categories',
    '/category'
  ),
  (
    'health_needs',
    'Health Needs',
    true,
    1,
    'Explore By Health Needs',
    'Browse focused wellness categories curated for everyday health goals.',
    null,
    null
  ),
  (
    'popular_picks',
    'Popular Picks',
    true,
    2,
    'Popular Picks & Best Supplements',
    'A polished starting point for high-intent supplement shoppers.',
    null,
    null
  ),
  (
    'ingredients_discovery',
    'Ingredients Discovery',
    true,
    3,
    'Explore By Ingredients',
    'Discover vitamins, herbs, minerals, probiotics, adaptogens, and functional ingredients.',
    'View All Ingredients',
    '/ingredients'
  ),
  (
    'wellness_expert',
    'Wellness Expert',
    true,
    4,
    'Meet Our Wellness Expert',
    'Our educational wellness content and ingredient resources are supported by expert guidance to help readers make more informed wellness decisions.',
    'Explore Our Experts',
    '/experts'
  ),
  (
    'blogs',
    'Blogs',
    true,
    5,
    'Supplements Blog & Guides',
    'Expert wellness insights, supplement reviews & health guides.',
    'View All Blogs',
    '/blogs'
  ),
  (
    'discover_wellness_solutions',
    'Discover Wellness Solutions',
    true,
    6,
    'Discover Wellness Solutions',
    'Explore trusted supplements, ingredient-focused products, and wellness collections designed for informed choices.',
    'Explore Wellness Categories',
    '/category'
  ),
  (
    'why_choose_suppriva',
    'Why Choose Suppriva',
    true,
    7,
    'Your Wellness Journey Starts Here',
    'Explore trusted supplements, ingredient insights, wellness solutions, and expert guidance-all in one place.',
    null,
    null
  ),
  (
    'trust_badges',
    'Trust Badges',
    true,
    8,
    'Why Thousands Start Their Wellness Journey with Suppriva',
    'Discover supplements, ingredients, wellness solutions, and expert insights designed to help you make informed health decisions.',
    null,
    null
  ),
  (
    'newsletter',
    'Newsletter',
    true,
    9,
    'Stay Updated With Health & Wellness Tips',
    'Subscribe to get exclusive offers, wellness tips, and the latest supplement insights.',
    null,
    null
  )
on conflict (section_key) do update
set
  section_name = excluded.section_name,
  is_visible = coalesce(public.homepage_sections.is_visible, excluded.is_visible),
  sort_order = coalesce(public.homepage_sections.sort_order, excluded.sort_order),
  title = coalesce(nullif(public.homepage_sections.title, ''), excluded.title),
  subtitle = coalesce(nullif(public.homepage_sections.subtitle, ''), excluded.subtitle),
  cta_label = coalesce(nullif(public.homepage_sections.cta_label, ''), excluded.cta_label),
  cta_url = coalesce(nullif(public.homepage_sections.cta_url, ''), excluded.cta_url),
  updated_at = now();

notify pgrst, 'reload schema';

-- Verification:
-- select section_key, section_name, is_visible, sort_order, title, subtitle, cta_label, cta_url
-- from public.homepage_sections
-- order by sort_order;
