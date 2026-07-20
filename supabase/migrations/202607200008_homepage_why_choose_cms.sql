-- SUPPRIVA HOMEPAGE WHY CHOOSE CMS
-- Phase 8 editable cards for the homepage Why Choose Suppriva section.
-- Safe to run multiple times.

create table if not exists public.homepage_why_choose_cards (
  id uuid primary key default gen_random_uuid(),
  icon text not null,
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_why_choose_cards_sort_order_check check (sort_order >= 0)
);

create index if not exists homepage_why_choose_cards_visible_order_idx
  on public.homepage_why_choose_cards (is_visible, sort_order);

alter table public.homepage_why_choose_cards enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_why_choose_cards'
      and policyname = 'Public can read homepage why choose cards'
  ) then
    create policy "Public can read homepage why choose cards"
      on public.homepage_why_choose_cards
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_why_choose_cards'
      and policyname = 'Admins can manage homepage why choose cards'
  ) then
    create policy "Admins can manage homepage why choose cards"
      on public.homepage_why_choose_cards
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

insert into public.homepage_why_choose_cards (
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
    ('compass', 'Wellness Solutions', 'Find supplements organized by your health goals and lifestyle needs.', 1, true),
    ('scale', 'Smart Comparisons', 'Compare formulas, ingredients, and features to make informed decisions.', 2, true),
    ('stethoscope', 'Expert Guidance', 'Need help choosing? Submit your question and get personalized support.', 3, true)
) as seeded(icon, title, description, sort_order, is_visible)
where not exists (
  select 1 from public.homepage_why_choose_cards
);

notify pgrst, 'reload schema';
