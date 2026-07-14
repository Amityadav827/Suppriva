-- SUPPRIVA PRODUCT HERO RATING VISIBILITY FLAGS REPAIR
-- Safe to run multiple times.
-- Repairs production environments where the hero rating visibility flags
-- have not been applied yet or PostgREST schema cache is stale.

alter table if exists public.products
  add column if not exists hero_show_rating_label boolean not null default true,
  add column if not exists hero_show_review_count boolean not null default true;

notify pgrst, 'reload schema';

-- Verification:
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'products'
--   and column_name in (
--     'hero_show_rating_label',
--     'hero_show_review_count'
--   )
-- order by column_name;

