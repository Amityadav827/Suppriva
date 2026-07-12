-- SUPPRIVA INGREDIENT ADVANCED SEO FOCUS KEYWORD REPAIR
-- Safe to run multiple times.
-- Run this in Supabase SQL Editor if production reports:
-- "column ingredients.seo_focus_keyword does not exist"

alter table if exists public.ingredients
  add column if not exists seo_focus_keyword text;

notify pgrst, 'reload schema';

-- Verification:
-- select column_name, data_type
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'ingredients'
--   and column_name = 'seo_focus_keyword';

