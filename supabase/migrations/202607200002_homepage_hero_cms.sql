-- SUPPRIVA HOMEPAGE HERO CMS
-- Phase 2 detailed Hero CMS fields and repeaters.
-- Safe to run multiple times.

create table if not exists public.homepage_hero_settings (
  id text primary key default 'home',
  badge_text text not null default 'Wellness Discovery Platform',
  badge_icon text not null default 'check-circle-2',
  heading text not null default 'Discover Wellness Solutions',
  highlight_heading text not null default 'That Fit Your Goals',
  description text not null default 'Explore supplements, ingredient insights, and wellness collections designed to help you make informed health decisions with confidence.',
  primary_cta_label text not null default 'Explore Wellness Categories',
  primary_cta_url text not null default '/category',
  secondary_cta_label text not null default 'Explore Ingredients',
  secondary_cta_url text not null default '/ingredients',
  hero_image text not null default '/assets/hero-supplements.webp',
  hero_image_alt text not null default 'Premium supplement bottles with green and gold packaging',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_hero_settings_singleton_check check (id = 'home'),
  constraint homepage_hero_primary_cta_url_check check (
    primary_cta_url like '/%'
    or primary_cta_url like 'http://%'
    or primary_cta_url like 'https://%'
  ),
  constraint homepage_hero_secondary_cta_url_check check (
    secondary_cta_url like '/%'
    or secondary_cta_url like 'http://%'
    or secondary_cta_url like 'https://%'
  )
);

create table if not exists public.homepage_hero_trust_cards (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'leaf',
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_hero_trust_cards_sort_order_check check (sort_order >= 0)
);

create table if not exists public.homepage_hero_floating_pills (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text not null default 'leaf',
  link text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_hero_floating_pills_sort_order_check check (sort_order >= 0),
  constraint homepage_hero_floating_pills_link_check check (
    link like '/%'
    or link like 'http://%'
    or link like 'https://%'
  )
);

create index if not exists homepage_hero_trust_cards_visible_order_idx
  on public.homepage_hero_trust_cards (is_visible, sort_order);

create index if not exists homepage_hero_floating_pills_visible_order_idx
  on public.homepage_hero_floating_pills (is_visible, sort_order);

alter table public.homepage_hero_settings enable row level security;
alter table public.homepage_hero_trust_cards enable row level security;
alter table public.homepage_hero_floating_pills enable row level security;

do $$
declare
  cms_table text;
begin
  foreach cms_table in array array[
    'homepage_hero_settings',
    'homepage_hero_trust_cards',
    'homepage_hero_floating_pills'
  ]
  loop
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = cms_table
        and policyname = format('Public can read %s', cms_table)
    ) then
      execute format(
        'create policy "Public can read %s" on public.%I for select to anon, authenticated using (true)',
        cms_table,
        cms_table
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = cms_table
        and policyname = format('Admins can manage %s', cms_table)
    ) then
      execute format(
        'create policy "Admins can manage %s" on public.%I for all to authenticated using (
          exists (
            select 1
            from public.users
            where public.users.id = auth.uid()
              and public.users.role::text = ''admin''
              and public.users.status::text = ''active''
              and public.users.deleted_at is null
          )
        ) with check (
          exists (
            select 1
            from public.users
            where public.users.id = auth.uid()
              and public.users.role::text = ''admin''
              and public.users.status::text = ''active''
              and public.users.deleted_at is null
          )
        )',
        cms_table,
        cms_table
      );
    end if;
  end loop;
end $$;

insert into public.homepage_hero_settings (
  id,
  badge_text,
  badge_icon,
  heading,
  highlight_heading,
  description,
  primary_cta_label,
  primary_cta_url,
  secondary_cta_label,
  secondary_cta_url,
  hero_image,
  hero_image_alt
)
values (
  'home',
  'Wellness Discovery Platform',
  'check-circle-2',
  'Discover Wellness Solutions',
  'That Fit Your Goals',
  'Explore supplements, ingredient insights, and wellness collections designed to help you make informed health decisions with confidence.',
  'Explore Wellness Categories',
  '/category',
  'Explore Ingredients',
  '/ingredients',
  '/assets/hero-supplements.webp',
  'Premium supplement bottles with green and gold packaging'
)
on conflict (id) do update
set
  badge_text = coalesce(nullif(public.homepage_hero_settings.badge_text, ''), excluded.badge_text),
  badge_icon = coalesce(nullif(public.homepage_hero_settings.badge_icon, ''), excluded.badge_icon),
  heading = coalesce(nullif(public.homepage_hero_settings.heading, ''), excluded.heading),
  highlight_heading = coalesce(nullif(public.homepage_hero_settings.highlight_heading, ''), excluded.highlight_heading),
  description = coalesce(nullif(public.homepage_hero_settings.description, ''), excluded.description),
  primary_cta_label = coalesce(nullif(public.homepage_hero_settings.primary_cta_label, ''), excluded.primary_cta_label),
  primary_cta_url = coalesce(nullif(public.homepage_hero_settings.primary_cta_url, ''), excluded.primary_cta_url),
  secondary_cta_label = coalesce(nullif(public.homepage_hero_settings.secondary_cta_label, ''), excluded.secondary_cta_label),
  secondary_cta_url = coalesce(nullif(public.homepage_hero_settings.secondary_cta_url, ''), excluded.secondary_cta_url),
  hero_image = coalesce(nullif(public.homepage_hero_settings.hero_image, ''), excluded.hero_image),
  hero_image_alt = coalesce(nullif(public.homepage_hero_settings.hero_image_alt, ''), excluded.hero_image_alt),
  updated_at = now();

insert into public.homepage_hero_trust_cards (
  icon,
  title,
  description,
  sort_order,
  is_visible
)
select *
from (
  values
    ('leaf', 'Ingredient Library', 'Explore vitamins, herbs, minerals, probiotics, and functional ingredients.', 0, true),
    ('compass', 'Health Goal Collections', 'Browse wellness solutions organized around real health goals.', 1, true),
    ('scale', 'Smart Comparisons', 'Compare ingredients and wellness products side by side.', 2, true),
    ('stethoscope', 'Expert Guidance', 'Get help choosing products that match your wellness needs.', 3, true)
) as defaults(icon, title, description, sort_order, is_visible)
where not exists (
  select 1
  from public.homepage_hero_trust_cards
);

insert into public.homepage_hero_floating_pills (
  label,
  icon,
  link,
  sort_order,
  is_visible
)
select *
from (
  values
    ('Weight Management', 'activity', '/category/weight-loss', 0, true),
    ('Gut Health', 'leaf', '/category/gut-health', 1, true),
    ('Sleep Support', 'moon', '/category/sleep-relaxation', 2, true),
    ('Blood Sugar', 'candy', '/category/blood-sugar-diabetes', 3, true),
    ('Immunity', 'shield-plus', '/category/immunity', 4, true)
) as defaults(label, icon, link, sort_order, is_visible)
where not exists (
  select 1
  from public.homepage_hero_floating_pills
);

notify pgrst, 'reload schema';
