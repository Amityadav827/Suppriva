-- SUPPRIVA PRODUCT IMAGE METADATA COLUMN REPAIR MIGRATION
-- Ensures production schemas have the product image metadata columns expected
-- by the Product Dashboard and Product Page CMS.

alter table if exists public.products
  add column if not exists product_image_metadata jsonb not null default '{}'::jsonb,
  add column if not exists gallery_image_metadata jsonb not null default '[]'::jsonb;

comment on column public.products.product_image_metadata is
  'Primary product image SEO metadata: title, alt, caption, description, credit, license, photographer, keywords, focus keyword, source URL, indexing, filename generation.';

comment on column public.products.gallery_image_metadata is
  'Gallery image SEO metadata array keyed by image URL.';

notify pgrst, 'reload schema';
