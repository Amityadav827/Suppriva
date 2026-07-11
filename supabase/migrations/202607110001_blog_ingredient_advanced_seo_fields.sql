-- SUPPRIVA BLOG + INGREDIENT ADVANCED SEO FIELDS
-- Safe to run multiple times.
-- Adds only the SEO fields required by Blog CMS and Ingredient CMS.

alter table if exists public.blogs
  add column if not exists seo_focus_keyword text,
  add column if not exists seo_canonical_url text,
  add column if not exists seo_noindex boolean not null default false,
  add column if not exists seo_nofollow boolean not null default false;

alter table if exists public.ingredients
  add column if not exists seo_focus_keyword text;

notify pgrst, 'reload schema';
