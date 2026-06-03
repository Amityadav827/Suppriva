-- SUPPRIVA INGREDIENTS LIBRARY SETUP
-- Run this complete file in Supabase SQL Editor.
-- Safe to rerun.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  alter type public.page_type add value if not exists 'ingredient';
exception
  when undefined_object then
    create type public.page_type as enum ('home', 'product', 'category', 'blog', 'ingredient', 'search', 'static');
end $$;

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  short_description text,
  full_description text,
  benefits text[] not null default '{}',
  side_effects text[] not null default '{}',
  dosage text,
  scientific_notes text,
  featured_image text,
  meta_title text,
  meta_description text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.product_ingredients (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ingredients_slug_unique'
      and conrelid = 'public.ingredients'::regclass
  ) then
    alter table public.ingredients
      add constraint ingredients_slug_unique unique (slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'product_ingredients_product_ingredient_unique'
      and conrelid = 'public.product_ingredients'::regclass
  ) then
    alter table public.product_ingredients
      add constraint product_ingredients_product_ingredient_unique unique (product_id, ingredient_id);
  end if;
end $$;

create index if not exists ingredients_slug_idx on public.ingredients (slug);
create index if not exists ingredients_is_featured_idx on public.ingredients (is_featured);
create index if not exists ingredients_deleted_at_idx on public.ingredients (deleted_at);
create index if not exists ingredients_name_search_idx on public.ingredients using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_description, '')));

create index if not exists product_ingredients_product_id_idx on public.product_ingredients (product_id);
create index if not exists product_ingredients_ingredient_id_idx on public.product_ingredients (ingredient_id);

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_ingredients_updated_at'
      and tgrelid = 'public.ingredients'::regclass
      and not tgisinternal
  ) then
    create trigger set_ingredients_updated_at
    before update on public.ingredients
    for each row execute function public.set_updated_at();
  end if;
end $$;

alter table public.ingredients enable row level security;
alter table public.product_ingredients enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.ingredients to anon, authenticated;
grant select on public.product_ingredients to anon, authenticated;
grant insert, update, delete on public.ingredients to authenticated;
grant insert, update, delete on public.product_ingredients to authenticated;

drop policy if exists "Public can read ingredients" on public.ingredients;
drop policy if exists "Admins can manage ingredients" on public.ingredients;
drop policy if exists "Public can read product ingredients" on public.product_ingredients;
drop policy if exists "Admins can manage product ingredients" on public.product_ingredients;

create policy "Public can read ingredients"
on public.ingredients
for select
to anon, authenticated
using (deleted_at is null);

create policy "Admins can manage ingredients"
on public.ingredients
for all
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.role::text = 'admin'
      and public.users.status::text = 'active'
  )
)
with check (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.role::text = 'admin'
      and public.users.status::text = 'active'
  )
);

create policy "Public can read product ingredients"
on public.product_ingredients
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.ingredients
    where public.ingredients.id = product_ingredients.ingredient_id
      and public.ingredients.deleted_at is null
  )
);

create policy "Admins can manage product ingredients"
on public.product_ingredients
for all
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.role::text = 'admin'
      and public.users.status::text = 'active'
  )
)
with check (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.role::text = 'admin'
      and public.users.status::text = 'active'
  )
);

notify pgrst, 'reload schema';

-- Verification queries.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('ingredients', 'product_ingredients')
order by table_name;

select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('ingredients', 'product_ingredients')
order by table_name, ordinal_position;

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('ingredients', 'product_ingredients')
order by tablename, policyname;
