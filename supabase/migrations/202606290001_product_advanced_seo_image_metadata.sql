-- SUPPRIVA PRODUCT ADVANCED SEO + IMAGE METADATA CMS
-- Safe to run multiple times.

alter table if exists public.products
  add column if not exists seo_focus_keyword text,
  add column if not exists seo_nofollow boolean not null default false,
  add column if not exists seo_twitter_title text,
  add column if not exists seo_twitter_description text,
  add column if not exists seo_twitter_image text,
  add column if not exists schema_brand text,
  add column if not exists schema_sku text,
  add column if not exists schema_mpn text,
  add column if not exists schema_gtin text,
  add column if not exists schema_price numeric check (schema_price is null or schema_price >= 0),
  add column if not exists schema_currency text,
  add column if not exists schema_availability text,
  add column if not exists schema_aggregate_rating numeric check (
    schema_aggregate_rating is null
    or (schema_aggregate_rating >= 0 and schema_aggregate_rating <= 5)
  ),
  add column if not exists schema_review_count integer check (
    schema_review_count is null
    or schema_review_count >= 0
  ),
  add column if not exists schema_offer_url text,
  add column if not exists schema_enable_product boolean not null default true,
  add column if not exists schema_enable_faq boolean not null default true,
  add column if not exists schema_enable_breadcrumb boolean not null default true,
  add column if not exists schema_enable_review boolean not null default true,
  add column if not exists schema_enable_organization boolean not null default true,
  add column if not exists product_image_metadata jsonb not null default '{}'::jsonb,
  add column if not exists gallery_image_metadata jsonb not null default '[]'::jsonb;

create index if not exists products_seo_focus_keyword_idx
  on public.products (seo_focus_keyword)
  where deleted_at is null;

create index if not exists products_schema_sku_idx
  on public.products (schema_sku)
  where schema_sku is not null and deleted_at is null;

create index if not exists products_schema_gtin_idx
  on public.products (schema_gtin)
  where schema_gtin is not null and deleted_at is null;

comment on column public.products.product_image_metadata is
  'Primary product image SEO metadata: title, alt, caption, description, credit, license, photographer, keywords, focus keyword, source URL, indexing, filename generation.';

comment on column public.products.gallery_image_metadata is
  'Gallery image SEO metadata array keyed by image URL.';

notify pgrst, 'reload schema';
