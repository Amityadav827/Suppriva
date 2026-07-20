-- SUPPRIVA HOMEPAGE TRUST BADGES CMS
-- Phase 9 editable badges for the homepage Trust Badges section.
-- Safe to run multiple times.

create table if not exists public.homepage_trust_badges (
  id uuid primary key default gen_random_uuid(),
  icon text not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_trust_badges_sort_order_check check (sort_order >= 0)
);

create index if not exists homepage_trust_badges_visible_order_idx
  on public.homepage_trust_badges (is_visible, sort_order);

alter table public.homepage_trust_badges enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_trust_badges'
      and policyname = 'Public can read homepage trust badges'
  ) then
    create policy "Public can read homepage trust badges"
      on public.homepage_trust_badges
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_trust_badges'
      and policyname = 'Admins can manage homepage trust badges'
  ) then
    create policy "Admins can manage homepage trust badges"
      on public.homepage_trust_badges
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

insert into public.homepage_trust_badges (
  icon,
  title,
  description,
  sort_order,
  is_visible
)
select *
from (
  values
    ('leaf', 'Ingredient First', 'Explore supplements through ingredients, wellness goals, and functional benefits.', 0, true),
    ('book-open', 'Educational Content', 'Access easy-to-understand wellness information designed to support informed decisions.', 1, true),
    ('scale', 'Smart Comparisons', 'Compare ingredients, formulations, and wellness solutions to find the right fit.', 2, true),
    ('stethoscope', 'Expert Guidance', 'Have questions before choosing a supplement? Submit your query and receive personalized guidance.', 3, true)
) as seeded(icon, title, description, sort_order, is_visible)
where not exists (
  select 1 from public.homepage_trust_badges
);

notify pgrst, 'reload schema';
