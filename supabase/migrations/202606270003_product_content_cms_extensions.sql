-- Product content CMS extension fields for ingredient display controls and verdict copy.

alter table if exists public.products
  add column if not exists verdict_conclusion text;

alter table if exists public.product_ingredient_overrides
  add column if not exists custom_note text,
  add column if not exists is_highlighted boolean not null default false;

notify pgrst, 'reload schema';
