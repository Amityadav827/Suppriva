-- SUPPRIVA INGREDIENT DETAIL CMS EXTENSIONS
-- Dashboard-driven ingredient detail page fields.
-- Safe to run multiple times.

alter table if exists public.ingredients
  add column if not exists hero_badge text,
  add column if not exists overview_title text,
  add column if not exists overview_subtitle text,
  add column if not exists how_it_works_title text,
  add column if not exists how_it_works_subtitle text,
  add column if not exists benefits_title text,
  add column if not exists benefits_subtitle text,
  add column if not exists uses_title text,
  add column if not exists uses_subtitle text,
  add column if not exists uses_content text,
  add column if not exists uses_json jsonb not null default '[]'::jsonb,
  add column if not exists food_sources_title text,
  add column if not exists food_sources_subtitle text,
  add column if not exists food_sources_content text,
  add column if not exists food_sources_json jsonb not null default '[]'::jsonb,
  add column if not exists dosage_title text,
  add column if not exists dosage_subtitle text,
  add column if not exists dosage_content text,
  add column if not exists safety_title text,
  add column if not exists safety_subtitle text,
  add column if not exists research_title text,
  add column if not exists research_subtitle text,
  add column if not exists research_content text,
  add column if not exists research_json jsonb not null default '[]'::jsonb,
  add column if not exists references_title text,
  add column if not exists references_subtitle text,
  add column if not exists references_json jsonb not null default '[]'::jsonb,
  add column if not exists faq_title text,
  add column if not exists faq_subtitle text,
  add column if not exists ingredient_layout_sections jsonb not null default '[]'::jsonb,
  add column if not exists seo_canonical_url text,
  add column if not exists seo_og_title text,
  add column if not exists seo_og_description text,
  add column if not exists seo_og_image text,
  add column if not exists seo_twitter_title text,
  add column if not exists seo_twitter_description text,
  add column if not exists seo_twitter_image text,
  add column if not exists meta_image text,
  add column if not exists seo_noindex boolean not null default false,
  add column if not exists seo_nofollow boolean not null default false,
  add column if not exists schema_json jsonb not null default '{}'::jsonb;

create index if not exists ingredients_category_status_idx
  on public.ingredients (ingredient_category, status)
  where deleted_at is null;

comment on column public.ingredients.ingredient_layout_sections is
  'Ingredient detail page layout configuration stored from the dashboard: visibility, order, title/subtitle overrides, and animation toggle.';

comment on column public.ingredients.schema_json is
  'Dashboard-maintained ingredient structured data extension JSON.';

notify pgrst, 'reload schema';
