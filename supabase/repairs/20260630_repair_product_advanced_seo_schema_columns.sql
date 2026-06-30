-- SUPPRIVA PRODUCT ADVANCED SEO SCHEMA COLUMN REPAIR
-- Safe to run multiple times.
-- Repairs production environments where the advanced SEO/product schema
-- migration has not been applied or PostgREST schema cache is stale.

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
  add column if not exists schema_enable_organization boolean not null default true;

create index if not exists products_seo_focus_keyword_idx
  on public.products (seo_focus_keyword)
  where deleted_at is null;

create index if not exists products_schema_sku_idx
  on public.products (schema_sku)
  where schema_sku is not null and deleted_at is null;

create index if not exists products_schema_gtin_idx
  on public.products (schema_gtin)
  where schema_gtin is not null and deleted_at is null;

notify pgrst, 'reload schema';

-- Verification:
-- select column_name, data_type, column_default
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'products'
--   and column_name in (
--     'seo_focus_keyword',
--     'seo_nofollow',
--     'seo_twitter_title',
--     'seo_twitter_description',
--     'seo_twitter_image',
--     'schema_brand',
--     'schema_sku',
--     'schema_mpn',
--     'schema_gtin',
--     'schema_price',
--     'schema_currency',
--     'schema_availability',
--     'schema_aggregate_rating',
--     'schema_review_count',
--     'schema_offer_url',
--     'schema_enable_product',
--     'schema_enable_faq',
--     'schema_enable_breadcrumb',
--     'schema_enable_review',
--     'schema_enable_organization'
--   )
-- order by column_name;
