-- SUPPRIVA INGREDIENT DETAIL CMS PHASE 2
-- Safe to run multiple times.
-- Adds dashboard-driven fields for Interesting Fact and How It Works highlight content.

alter table if exists public.ingredients
  add column if not exists interesting_fact_label text,
  add column if not exists how_it_works_highlight_title text,
  add column if not exists how_it_works_highlight_description text;

notify pgrst, 'reload schema';
