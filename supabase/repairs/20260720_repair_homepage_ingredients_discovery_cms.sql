-- SUPPRIVA HOMEPAGE INGREDIENTS DISCOVERY CMS REPAIR
-- Safe to run multiple times in Supabase SQL Editor.
-- Repairs production environments where the Phase 3 ingredient chip table
-- has not been applied yet.

create table if not exists public.homepage_ingredient_chips (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text not null default 'leaf',
  url text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_ingredient_chips_sort_order_check check (sort_order >= 0),
  constraint homepage_ingredient_chips_url_check check (
    url like '/%'
    or url like 'http://%'
    or url like 'https://%'
  )
);

create index if not exists homepage_ingredient_chips_visible_order_idx
  on public.homepage_ingredient_chips (is_visible, sort_order);

alter table public.homepage_ingredient_chips enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_ingredient_chips'
      and policyname = 'Public can read homepage ingredient chips'
  ) then
    create policy "Public can read homepage ingredient chips"
      on public.homepage_ingredient_chips
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_ingredient_chips'
      and policyname = 'Admins can manage homepage ingredient chips'
  ) then
    create policy "Admins can manage homepage ingredient chips"
      on public.homepage_ingredient_chips
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

insert into public.homepage_ingredient_chips (
  label,
  icon,
  url,
  sort_order,
  is_visible
)
select *
from (
  values
    ('Ashwagandha', 'leaf', '/ingredient/ashwagandha', 0, true),
    ('Berberine', 'activity', '/ingredient/berberine', 1, true),
    ('Magnesium', 'zap', '/ingredient/magnesium', 2, true),
    ('Collagen', 'sparkles', '/ingredient/collagen-peptides', 3, true),
    ('Curcumin', 'sun', '/ingredient/turmeric-curcumin', 4, true),
    ('Probiotics', 'shield-check', '/ingredient/lactobacillus-acidophilus', 5, true),
    ('Omega 3', 'fish', '/ingredient/omega-3', 6, true),
    ('Vitamin D3', 'sun-medium', '/ingredient/vitamin-d3', 7, true),
    ('Zinc', 'shield-plus', '/ingredient/zinc', 8, true),
    ('Green Tea', 'leafy-green', '/ingredient/green-tea-extract', 9, true),
    ('Lion''s Mane', 'brain', '/ingredient/lions-mane', 10, true),
    ('CoQ10', 'battery', '/ingredient/coq10', 11, true),
    ('Apple Cider Vinegar', 'flask-conical', '/ingredient/apple-cider-vinegar', 12, true),
    ('Moringa', 'sprout', '/ingredients', 13, true),
    ('Milk Thistle', 'flower-2', '/ingredient/milk-thistle', 14, true),
    ('Biotin', 'scissors', '/ingredient/biotin', 15, true)
) as defaults(label, icon, url, sort_order, is_visible)
where not exists (
  select 1
  from public.homepage_ingredient_chips
);

notify pgrst, 'reload schema';

-- Verification:
-- select label, icon, url, sort_order, is_visible
-- from public.homepage_ingredient_chips
-- order by sort_order;
