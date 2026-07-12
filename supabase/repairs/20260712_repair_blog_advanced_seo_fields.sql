-- SUPPRIVA BLOG ADVANCED SEO FIELD REPAIR
-- Safe to run multiple times.
-- Repairs production environments where Blog CMS Advanced SEO columns
-- have not been applied yet or PostgREST schema cache is stale.

alter table if exists public.blogs
  add column if not exists seo_focus_keyword text,
  add column if not exists seo_canonical_url text,
  add column if not exists seo_noindex boolean not null default false,
  add column if not exists seo_nofollow boolean not null default false;

notify pgrst, 'reload schema';

-- Verification:
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'blogs'
--   and column_name in (
--     'seo_focus_keyword',
--     'seo_canonical_url',
--     'seo_noindex',
--     'seo_nofollow'
--   )
-- order by column_name;
