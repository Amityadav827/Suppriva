-- SUPPRIVA HOMEPAGE DISCOVER WELLNESS SOLUTIONS CMS REPAIR
-- Safe to run multiple times.
-- Creates and hydrates Phase 7 tables when production has not applied
-- the migration yet.

create table if not exists public.homepage_wellness_solutions_settings (
  id text primary key default 'home',
  left_badge text not null default 'Curated Wellness Collection',
  left_heading text not null default 'Discover Supplements That Match Your Wellness Goals',
  left_description text not null default 'Explore curated wellness solutions, ingredient-focused products, and popular health categories-all designed to help users make informed choices.',
  left_cta_label text not null default 'Explore Wellness Categories',
  left_cta_url text not null default '/category',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_wellness_solution_feature_cards (
  id uuid primary key default gen_random_uuid(),
  icon text not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_wellness_solution_showcase_products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_wellness_solution_feature_cards_visible_order_idx
  on public.homepage_wellness_solution_feature_cards (is_visible, sort_order);

create index if not exists homepage_wellness_solution_showcase_products_visible_order_idx
  on public.homepage_wellness_solution_showcase_products (is_visible, sort_order);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_wellness_solutions_settings_singleton_check'
      and conrelid = 'public.homepage_wellness_solutions_settings'::regclass
  ) then
    alter table public.homepage_wellness_solutions_settings
      add constraint homepage_wellness_solutions_settings_singleton_check
      check (id = 'home');
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_wellness_solutions_left_cta_url_check'
      and conrelid = 'public.homepage_wellness_solutions_settings'::regclass
  ) then
    alter table public.homepage_wellness_solutions_settings
      add constraint homepage_wellness_solutions_left_cta_url_check check (
        left_cta_url like '/%'
        or left_cta_url like 'http://%'
        or left_cta_url like 'https://%'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_wellness_solution_feature_cards_sort_order_check'
      and conrelid = 'public.homepage_wellness_solution_feature_cards'::regclass
  ) then
    alter table public.homepage_wellness_solution_feature_cards
      add constraint homepage_wellness_solution_feature_cards_sort_order_check
      check (sort_order >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_wellness_solution_showcase_products_sort_order_check'
      and conrelid = 'public.homepage_wellness_solution_showcase_products'::regclass
  ) then
    alter table public.homepage_wellness_solution_showcase_products
      add constraint homepage_wellness_solution_showcase_products_sort_order_check
      check (sort_order >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'homepage_wellness_solution_showcase_products_url_check'
      and conrelid = 'public.homepage_wellness_solution_showcase_products'::regclass
  ) then
    alter table public.homepage_wellness_solution_showcase_products
      add constraint homepage_wellness_solution_showcase_products_url_check check (
        url like '/%'
        or url like 'http://%'
        or url like 'https://%'
      );
  end if;
end $$;

alter table public.homepage_wellness_solutions_settings enable row level security;
alter table public.homepage_wellness_solution_feature_cards enable row level security;
alter table public.homepage_wellness_solution_showcase_products enable row level security;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'homepage_wellness_solutions_settings',
    'homepage_wellness_solution_feature_cards',
    'homepage_wellness_solution_showcase_products'
  ]
  loop
    policy_name := 'Public can read ' || replace(table_name, '_', ' ');
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for select to anon, authenticated using (true)',
        policy_name,
        table_name
      );
    end if;

    policy_name := 'Admins can manage ' || replace(table_name, '_', ' ');
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (
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
        policy_name,
        table_name
      );
    end if;
  end loop;
end $$;

insert into public.homepage_wellness_solutions_settings (
  id,
  left_badge,
  left_heading,
  left_description,
  left_cta_label,
  left_cta_url
)
values (
  'home',
  'Curated Wellness Collection',
  'Discover Supplements That Match Your Wellness Goals',
  'Explore curated wellness solutions, ingredient-focused products, and popular health categories-all designed to help users make informed choices.',
  'Explore Wellness Categories',
  '/category'
)
on conflict (id) do update
set
  left_badge = coalesce(nullif(public.homepage_wellness_solutions_settings.left_badge, ''), excluded.left_badge),
  left_heading = coalesce(nullif(public.homepage_wellness_solutions_settings.left_heading, ''), excluded.left_heading),
  left_description = coalesce(nullif(public.homepage_wellness_solutions_settings.left_description, ''), excluded.left_description),
  left_cta_label = coalesce(nullif(public.homepage_wellness_solutions_settings.left_cta_label, ''), excluded.left_cta_label),
  left_cta_url = coalesce(nullif(public.homepage_wellness_solutions_settings.left_cta_url, ''), excluded.left_cta_url),
  updated_at = now();

do $$
begin
  if to_regclass('public.homepage_sections') is not null then
    update public.homepage_sections
    set
      cta_label = case
        when cta_label is null or cta_label = '' or cta_label = 'Explore Wellness Categories'
          then 'View All'
        else cta_label
      end,
      cta_url = case
        when cta_url is null or cta_url = '' or cta_url = '/category'
          then '/supplements'
        else cta_url
      end,
      updated_at = now()
    where section_key = 'discover_wellness_solutions';
  end if;
end $$;

insert into public.homepage_wellness_solution_feature_cards (
  icon,
  title,
  description,
  sort_order,
  is_visible
)
select *
from (
  values
    ('compass', 'Organized by Health Goals', 'Browse supplements grouped around real wellness objectives.', 0, true),
    ('leaf', 'Ingredient-Focused Discovery', 'Find products through vitamins, herbs, minerals, probiotics, and functional ingredients.', 1, true),
    ('scale', 'Easy Product Comparisons', 'Understand formulas, ingredients, and benefits side by side.', 2, true),
    ('sparkles', 'Updated Wellness Collections', 'Discover featured products and trending wellness categories regularly.', 3, true)
) as seeded(icon, title, description, sort_order, is_visible)
where not exists (
  select 1 from public.homepage_wellness_solution_feature_cards
);

insert into public.homepage_wellness_solution_showcase_products (
  product_name,
  label,
  url,
  sort_order,
  is_visible
)
select *
from (
  values
    ('Liv Pure', 'FEATURED', '/weight-loss/liv-pure', 0, true),
    ('LeanBiome', 'POPULAR', '/weight-loss/leanbiome', 1, true),
    ('Mitolyn', 'TRENDING', '/weight-loss/mitolyn', 2, true),
    ('Java Burn', 'POPULAR', '/immunity/java-burn', 3, true),
    ('Nagano Tonic', 'FEATURED', '/weight-loss/nagano-tonic', 4, true),
    ('Gluco6', 'UPDATED', '/general-wellness/gluco6-the-best-sugar-supplement', 5, true)
) as seeded(product_name, label, url, sort_order, is_visible)
where not exists (
  select 1 from public.homepage_wellness_solution_showcase_products
);

notify pgrst, 'reload schema';

-- Verification:
-- select * from public.homepage_wellness_solutions_settings;
-- select * from public.homepage_wellness_solution_feature_cards order by sort_order;
-- select * from public.homepage_wellness_solution_showcase_products order by sort_order;
