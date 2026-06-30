-- SUPPRIVA PRODUCT IMAGE METADATA COLUMN REPAIR
-- Safe to run multiple times.
-- Repairs production environments where the advanced SEO/image metadata
-- migration has not been applied or PostgREST schema cache is stale.

alter table if exists public.products
  add column if not exists product_image_metadata jsonb not null default '{}'::jsonb,
  add column if not exists gallery_image_metadata jsonb not null default '[]'::jsonb;

comment on column public.products.product_image_metadata is
  'Primary product image SEO metadata: title, alt, caption, description, credit, license, photographer, keywords, focus keyword, source URL, indexing, filename generation.';

comment on column public.products.gallery_image_metadata is
  'Gallery image SEO metadata array keyed by image URL.';

notify pgrst, 'reload schema';

-- Verification:
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'products'
--   and column_name in ('product_image_metadata', 'gallery_image_metadata')
-- order by column_name;
