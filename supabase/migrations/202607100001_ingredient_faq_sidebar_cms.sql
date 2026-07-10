-- SUPPRIVA INGREDIENT DETAIL CMS PHASE 4
-- FAQ + Sidebar CMS support.
-- Safe to run multiple times.

alter table if exists public.ingredients
  add column if not exists sidebar_profile_title text,
  add column if not exists sidebar_profile_content text,
  add column if not exists sidebar_quick_facts_json jsonb not null default '[]'::jsonb,
  add column if not exists sidebar_at_a_glance_content text;

notify pgrst, 'reload schema';

