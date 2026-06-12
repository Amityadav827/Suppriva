-- SUPPRIVA INGREDIENT DETAIL FOUNDATION EXPANSION
-- Adds future-ready content, evidence, and metadata fields to the ingredients table.
-- Safe to rerun.

alter table if exists public.ingredients
  add column if not exists scientific_name text,
  add column if not exists ingredient_category text,
  add column if not exists image_url text,
  add column if not exists rating numeric,
  add column if not exists evidence_level text,
  add column if not exists origin_country text,
  add column if not exists part_used text,
  add column if not exists ingredient_form text,
  add column if not exists taste_profile text,
  add column if not exists typical_dose text,
  add column if not exists best_for text,
  add column if not exists safety_level text,
  add column if not exists overview_content text,
  add column if not exists how_it_works_content text,
  add column if not exists interesting_fact text,
  add column if not exists benefits_json jsonb not null default '[]'::jsonb,
  add column if not exists side_effects_json jsonb not null default '[]'::jsonb,
  add column if not exists drug_interactions_json jsonb not null default '[]'::jsonb,
  add column if not exists who_should_avoid_json jsonb not null default '[]'::jsonb,
  add column if not exists faq_json jsonb not null default '[]'::jsonb,
  add column if not exists related_ingredients_json jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

create index if not exists ingredients_scientific_name_idx
  on public.ingredients (scientific_name);

create index if not exists ingredients_ingredient_category_idx
  on public.ingredients (ingredient_category);

create index if not exists ingredients_evidence_level_idx
  on public.ingredients (evidence_level);

create index if not exists ingredients_safety_level_idx
  on public.ingredients (safety_level);

notify pgrst, 'reload schema';
