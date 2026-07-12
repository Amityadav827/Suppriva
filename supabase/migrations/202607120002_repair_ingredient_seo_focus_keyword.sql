-- SUPPRIVA INGREDIENT ADVANCED SEO FOCUS KEYWORD REPAIR
-- Safe to run multiple times.
-- Adds only the missing Ingredient Advanced SEO focus keyword column.

alter table if exists public.ingredients
  add column if not exists seo_focus_keyword text;

notify pgrst, 'reload schema';

