-- SUPPRIVA PRODUCT PAGE CMS FOUNDATION
-- Phase 2 backend/dashboard foundation only.
-- Keeps public product rendering unchanged while adding editable product CMS fields
-- and focused repeatable relationship tables for the existing Product Dashboard.

create extension if not exists "pgcrypto";

alter table if exists public.products
  add column if not exists hero_badge text,
  add column if not exists hero_title text,
  add column if not exists hero_subtitle text,
  add column if not exists hero_description text,
  add column if not exists hero_image_alt text,
  add column if not exists hero_cta_label text,
  add column if not exists hero_secondary_cta_label text,
  add column if not exists hero_checklist text[] not null default '{}',
  add column if not exists hero_show_rating boolean not null default true,
  add column if not exists hero_show_badge boolean not null default true,
  add column if not exists review_count integer check (review_count is null or review_count >= 0),
  add column if not exists rating_label text,
  add column if not exists overview_title text,
  add column if not exists overview_subtitle text,
  add column if not exists overview_content text,
  add column if not exists how_it_works_title text,
  add column if not exists how_it_works_subtitle text,
  add column if not exists how_it_works_content text,
  add column if not exists benefits_title text,
  add column if not exists benefits_subtitle text,
  add column if not exists ingredients_title text,
  add column if not exists ingredients_subtitle text,
  add column if not exists best_for_title text,
  add column if not exists best_for_subtitle text,
  add column if not exists safety_title text,
  add column if not exists safety_subtitle text,
  add column if not exists pros_cons_title text,
  add column if not exists pros_cons_subtitle text,
  add column if not exists faq_title text,
  add column if not exists faq_subtitle text,
  add column if not exists verdict_title text,
  add column if not exists verdict_subtitle text,
  add column if not exists verdict_summary text,
  add column if not exists verdict_best_for text,
  add column if not exists verdict_not_ideal_for text,
  add column if not exists verdict_recommendation text,
  add column if not exists buying_guide_title text,
  add column if not exists buying_guide_subtitle text,
  add column if not exists buying_cta_label text,
  add column if not exists related_ingredients_title text,
  add column if not exists related_ingredients_subtitle text,
  add column if not exists related_blogs_title text,
  add column if not exists related_blogs_subtitle text,
  add column if not exists compare_title text,
  add column if not exists compare_subtitle text,
  add column if not exists related_products_title text,
  add column if not exists related_products_subtitle text,
  add column if not exists health_needs_title text,
  add column if not exists health_needs_subtitle text,
  add column if not exists sidebar_cta_title text,
  add column if not exists sidebar_cta_description text,
  add column if not exists sidebar_cta_label text,
  add column if not exists seo_canonical_url text,
  add column if not exists seo_og_title text,
  add column if not exists seo_og_description text,
  add column if not exists seo_og_image text,
  add column if not exists seo_noindex boolean not null default false,
  add column if not exists schema_json jsonb not null default '{}'::jsonb;

create table if not exists public.product_standout_points (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_how_it_works_steps (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text,
  description text not null,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_best_for_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_safety_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  item_type text not null check (
    item_type in ('side_effect', 'who_should_avoid', 'interaction', 'precaution')
  ),
  title text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_buying_guide_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_sidebar_facts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  value text not null,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_ingredient_overrides (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  display_order integer not null default 0,
  purpose text,
  dosage text,
  description_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_ingredient_overrides_unique unique (product_id, ingredient_id)
);

create table if not exists public.product_related_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  relationship_type text not null default 'related',
  title_override text,
  description_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_related_products_unique unique (product_id, related_product_id),
  constraint product_related_products_not_self check (product_id <> related_product_id)
);

create table if not exists public.product_compare_products (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  compared_product_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  title_override text,
  description_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_compare_products_unique unique (product_id, compared_product_id),
  constraint product_compare_products_not_self check (product_id <> compared_product_id)
);

create table if not exists public.product_related_blogs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  blog_id uuid not null references public.blogs(id) on delete cascade,
  display_order integer not null default 0,
  title_override text,
  description_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_related_blogs_unique unique (product_id, blog_id)
);

create table if not exists public.product_related_ingredients (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  display_order integer not null default 0,
  title_override text,
  description_override text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_related_ingredients_unique unique (product_id, ingredient_id)
);

create index if not exists product_standout_points_product_id_idx on public.product_standout_points (product_id);
create index if not exists product_how_it_works_steps_product_id_idx on public.product_how_it_works_steps (product_id);
create index if not exists product_best_for_items_product_id_idx on public.product_best_for_items (product_id);
create index if not exists product_safety_items_product_id_idx on public.product_safety_items (product_id);
create index if not exists product_safety_items_type_idx on public.product_safety_items (item_type);
create index if not exists product_buying_guide_items_product_id_idx on public.product_buying_guide_items (product_id);
create index if not exists product_sidebar_facts_product_id_idx on public.product_sidebar_facts (product_id);
create index if not exists product_ingredient_overrides_product_id_idx on public.product_ingredient_overrides (product_id);
create index if not exists product_ingredient_overrides_ingredient_id_idx on public.product_ingredient_overrides (ingredient_id);
create index if not exists product_related_products_product_id_idx on public.product_related_products (product_id);
create index if not exists product_related_products_related_product_id_idx on public.product_related_products (related_product_id);
create index if not exists product_compare_products_product_id_idx on public.product_compare_products (product_id);
create index if not exists product_compare_products_compared_product_id_idx on public.product_compare_products (compared_product_id);
create index if not exists product_related_blogs_product_id_idx on public.product_related_blogs (product_id);
create index if not exists product_related_blogs_blog_id_idx on public.product_related_blogs (blog_id);
create index if not exists product_related_ingredients_product_id_idx on public.product_related_ingredients (product_id);
create index if not exists product_related_ingredients_ingredient_id_idx on public.product_related_ingredients (ingredient_id);

do $$
declare
  cms_table text;
begin
  foreach cms_table in array array[
    'product_standout_points',
    'product_how_it_works_steps',
    'product_best_for_items',
    'product_safety_items',
    'product_buying_guide_items',
    'product_sidebar_facts',
    'product_ingredient_overrides',
    'product_related_products',
    'product_compare_products',
    'product_related_blogs',
    'product_related_ingredients'
  ]
  loop
    execute format(
      'drop trigger if exists %I on public.%I',
      'set_' || cms_table || '_updated_at',
      cms_table
    );
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'set_' || cms_table || '_updated_at',
      cms_table
    );
    execute format('alter table public.%I enable row level security', cms_table);
    execute format('grant select on public.%I to anon, authenticated', cms_table);
    execute format('grant insert, update, delete on public.%I to authenticated', cms_table);
  end loop;
end $$;

do $$
declare
  cms_table text;
begin
  foreach cms_table in array array[
    'product_standout_points',
    'product_how_it_works_steps',
    'product_best_for_items',
    'product_safety_items',
    'product_buying_guide_items',
    'product_sidebar_facts',
    'product_ingredient_overrides',
    'product_related_products',
    'product_compare_products',
    'product_related_blogs',
    'product_related_ingredients'
  ]
  loop
    execute format('drop policy if exists "Public can read %s" on public.%I', cms_table, cms_table);
    execute format('drop policy if exists "Admins can manage %s" on public.%I', cms_table, cms_table);

    execute format(
      'create policy "Public can read %s" on public.%I for select to anon, authenticated using (
        exists (
          select 1 from public.products
          where public.products.id = %I.product_id
            and public.products.status = ''published''::public.content_status
            and public.products.deleted_at is null
        )
      )',
      cms_table,
      cms_table,
      cms_table
    );

    execute format(
      'create policy "Admins can manage %s" on public.%I for all to authenticated using (
        exists (
          select 1 from public.users
          where (
              public.users.id = auth.uid()
              or lower(public.users.email) = lower(coalesce(auth.jwt() ->> ''email'', ''''))
            )
            and public.users.role::text = ''admin''
            and public.users.status::text = ''active''
        )
      ) with check (
        exists (
          select 1 from public.users
          where (
              public.users.id = auth.uid()
              or lower(public.users.email) = lower(coalesce(auth.jwt() ->> ''email'', ''''))
            )
            and public.users.role::text = ''admin''
            and public.users.status::text = ''active''
        )
      )',
      cms_table,
      cms_table
    );
  end loop;
end $$;

comment on table public.product_standout_points is 'Repeatable product dashboard CMS cards for why a product stands out.';
comment on table public.product_how_it_works_steps is 'Repeatable product dashboard CMS steps for how a product works.';
comment on table public.product_best_for_items is 'Repeatable product dashboard CMS cards for best-fit audiences.';
comment on table public.product_safety_items is 'Structured product dashboard CMS safety notes.';
comment on table public.product_buying_guide_items is 'Repeatable product dashboard CMS buying guidance.';
comment on table public.product_sidebar_facts is 'Editable product dashboard sidebar facts.';
comment on table public.product_ingredient_overrides is 'Per-product ingredient display overrides without changing the canonical ingredient record.';
comment on table public.product_related_products is 'Curated related product relationships.';
comment on table public.product_compare_products is 'Curated product comparison relationships.';
comment on table public.product_related_blogs is 'Curated product-to-blog relationships.';
comment on table public.product_related_ingredients is 'Curated product-to-ingredient relationships.';

notify pgrst, 'reload schema';
