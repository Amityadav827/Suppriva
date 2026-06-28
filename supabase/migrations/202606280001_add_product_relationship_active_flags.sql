-- SUPPRIVA PRODUCT RELATIONSHIP CMS ACTIVE FLAGS
-- Phase 5 relationship management support.
-- Safe to run multiple times.

alter table if exists public.product_related_products
  add column if not exists is_active boolean not null default true;

alter table if exists public.product_compare_products
  add column if not exists is_active boolean not null default true;

alter table if exists public.product_related_blogs
  add column if not exists is_active boolean not null default true;

alter table if exists public.product_related_ingredients
  add column if not exists is_active boolean not null default true;

create index if not exists product_related_products_active_order_idx
  on public.product_related_products (product_id, is_active, display_order);

create index if not exists product_compare_products_active_order_idx
  on public.product_compare_products (product_id, is_active, display_order);

create index if not exists product_related_blogs_active_order_idx
  on public.product_related_blogs (product_id, is_active, display_order);

create index if not exists product_related_ingredients_active_order_idx
  on public.product_related_ingredients (product_id, is_active, display_order);

notify pgrst, 'reload schema';
