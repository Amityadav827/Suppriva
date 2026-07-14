-- SUPPRIVA PRODUCT HERO RATING VISIBILITY FLAGS
-- Safe to run multiple times.
-- Adds independent dashboard controls for rating label and review count text.

alter table if exists public.products
  add column if not exists hero_show_rating_label boolean not null default true,
  add column if not exists hero_show_review_count boolean not null default true;

notify pgrst, 'reload schema';

