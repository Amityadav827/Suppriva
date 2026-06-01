-- SUPPRIVA FINAL DATABASE FIX AND VERIFICATION PACKAGE V3
-- Run this entire file in Supabase SQL Editor before continuing to Media Library.
-- Purpose:
-- 1. Repair schema drift from local migrations.
-- 2. Ensure required columns, indexes, triggers, RLS, and policies exist.
-- 3. Verify admin auth/profile alignment for dashboard CRUD.
-- 4. V3 safety: never update generated columns or Supabase-managed auth fields.
-- 5. V3 idempotency: every constraint is guarded by pg_constraint checks.

create extension if not exists "pgcrypto";

-- ======================================================
-- ENUMS
-- ======================================================

do $$ begin
  create type public.user_role as enum ('admin', 'editor', 'user');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.user_status as enum ('active', 'suspended', 'pending');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.subscriber_status as enum ('active', 'unsubscribed', 'pending');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.page_type as enum ('home', 'product', 'category', 'blog', 'search', 'static');
exception
  when duplicate_object then null;
end $$;

-- ======================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ======================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ======================================================
-- CORE TABLES
-- ======================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  image text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  bio text,
  avatar text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.users (
  id uuid primary key,
  full_name text,
  email text not null,
  role public.user_role not null default 'user',
  avatar text,
  status public.user_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  title text not null,
  name text generated always as (title) stored,
  slug text not null,
  short_description text,
  full_description text,
  image text,
  gallery text[] not null default '{}',
  rating numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  affiliate_url text,
  ingredients jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  pros text[] not null default '{}',
  cons text[] not null default '{}',
  faq jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid references public.authors(id) on delete set null,
  title text not null,
  slug text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  featured_image text,
  reading_time text,
  tags text[] not null default '{}',
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.seo (
  id uuid primary key default gen_random_uuid(),
  page_type public.page_type not null,
  page_id uuid,
  page_slug text,
  meta_title text not null,
  meta_description text not null,
  canonical_url text,
  schema_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status public.subscriber_status not null default 'pending',
  source_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  source_page text,
  country text,
  device text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  logo text,
  favicon text,
  social_links jsonb not null default '{}'::jsonb,
  footer_content jsonb not null default '{}'::jsonb,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ======================================================
-- SCHEMA DRIFT REPAIRS
-- ======================================================

alter table if exists public.categories
  add column if not exists name text,
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists image text,
  add column if not exists status public.content_status not null default 'draft',
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text[] not null default '{}',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

update public.categories
set title = coalesce(title, name, slug, 'Untitled Category')
where title is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categories'
      and column_name = 'name'
      and is_generated = 'NEVER'
  ) then
    update public.categories
    set name = coalesce(name, title, slug, 'Untitled Category')
    where name is null;
  else
    raise notice 'Skipped public.categories.name backfill because it is generated or not directly writable.';
  end if;
end $$;

update public.categories
set slug = trim(both '-' from lower(regexp_replace(coalesce(slug, title, name, id::text), '[^a-zA-Z0-9]+', '-', 'g')))
where slug is null or slug = '';

alter table if exists public.categories
  alter column title set not null,
  alter column name set not null,
  alter column slug set not null;

alter table if exists public.products
  add column if not exists category_id uuid,
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists full_description text,
  add column if not exists image text,
  add column if not exists gallery text[] not null default '{}',
  add column if not exists rating numeric(2, 1),
  add column if not exists affiliate_url text,
  add column if not exists ingredients jsonb not null default '[]'::jsonb,
  add column if not exists benefits jsonb not null default '[]'::jsonb,
  add column if not exists pros text[] not null default '{}',
  add column if not exists cons text[] not null default '{}',
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists status public.content_status not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table if exists public.blogs
  add column if not exists category_id uuid,
  add column if not exists author_id uuid,
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists featured_image text,
  add column if not exists reading_time text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists status public.content_status not null default 'draft',
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text[] not null default '{}',
  add column if not exists published_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table if exists public.seo
  add column if not exists page_type public.page_type,
  add column if not exists page_id uuid,
  add column if not exists page_slug text,
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists canonical_url text,
  add column if not exists schema_json jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table if exists public.newsletter_subscribers
  add column if not exists email text,
  add column if not exists status public.subscriber_status not null default 'pending',
  add column if not exists source_page text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table if exists public.affiliate_clicks
  add column if not exists product_id uuid,
  add column if not exists clicked_at timestamptz not null default now(),
  add column if not exists source_page text,
  add column if not exists country text,
  add column if not exists device text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

-- Add a readable name column for older frontend/admin code if it does not exist.
-- It is generated from title when created by SUPPRIVA schema. Generated columns
-- can only be updated to DEFAULT, so this package never writes to products.name.
alter table if exists public.products
  add column if not exists name text generated always as (title) stored;

-- ======================================================
-- CONSTRAINTS
-- ======================================================

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_unique'
      and conrelid = 'public.categories'::regclass
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'categories_slug_unique'
  ) then
    alter table public.categories add constraint categories_slug_unique unique (slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'authors_slug_unique'
      and conrelid = 'public.authors'::regclass
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'authors_slug_unique'
  ) then
    alter table public.authors add constraint authors_slug_unique unique (slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_email_unique'
      and conrelid = 'public.users'::regclass
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'users_email_unique'
  ) then
    alter table public.users add constraint users_email_unique unique (email);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_slug_unique'
      and conrelid = 'public.products'::regclass
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'products_slug_unique'
  ) then
    alter table public.products add constraint products_slug_unique unique (slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_rating_range_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products add constraint products_rating_range_check check (rating is null or (rating >= 0 and rating <= 5));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blogs_slug_unique'
      and conrelid = 'public.blogs'::regclass
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'blogs_slug_unique'
  ) then
    alter table public.blogs add constraint blogs_slug_unique unique (slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'newsletter_subscribers_email_unique'
      and conrelid = 'public.newsletter_subscribers'::regclass
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'newsletter_subscribers_email_unique'
  ) then
    alter table public.newsletter_subscribers add constraint newsletter_subscribers_email_unique unique (email);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'seo_page_identifier_check'
      and conrelid = 'public.seo'::regclass
  ) then
    alter table public.seo add constraint seo_page_identifier_check check (page_id is not null or page_slug is not null);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'seo_page_identity_unique'
      and conrelid = 'public.seo'::regclass
  ) and not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'seo_page_identity_unique'
  ) then
    alter table public.seo add constraint seo_page_identity_unique unique (page_type, page_id, page_slug);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_category_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_category_id_fkey
      foreign key (category_id) references public.categories(id) on delete restrict;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blogs_category_id_fkey'
      and conrelid = 'public.blogs'::regclass
  ) then
    alter table public.blogs
      add constraint blogs_category_id_fkey
      foreign key (category_id) references public.categories(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'blogs_author_id_fkey'
      and conrelid = 'public.blogs'::regclass
  ) then
    alter table public.blogs
      add constraint blogs_author_id_fkey
      foreign key (author_id) references public.authors(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'affiliate_clicks_product_id_fkey'
      and conrelid = 'public.affiliate_clicks'::regclass
  ) then
    alter table public.affiliate_clicks
      add constraint affiliate_clicks_product_id_fkey
      foreign key (product_id) references public.products(id) on delete cascade;
  end if;
end $$;

-- Optional but recommended for auth integrity. If this fails, run the admin
-- mismatch verification query below and repair public.users first.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_id_auth_users_id_fkey'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users
      add constraint users_id_auth_users_id_fkey
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
exception
  when foreign_key_violation then
    raise notice 'Skipped users -> auth.users foreign key because orphan public.users rows exist. See admin verification query.';
end $$;

-- ======================================================
-- INDEXES
-- ======================================================

create index if not exists categories_slug_idx on public.categories (slug);
create index if not exists categories_status_idx on public.categories (status);
create index if not exists categories_deleted_at_idx on public.categories (deleted_at);

create index if not exists authors_slug_idx on public.authors (slug);
create index if not exists authors_deleted_at_idx on public.authors (deleted_at);

create index if not exists users_email_idx on public.users (email);
create index if not exists users_role_idx on public.users (role);
create index if not exists users_status_idx on public.users (status);
create index if not exists users_deleted_at_idx on public.users (deleted_at);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_published_at_idx on public.products (published_at);
create index if not exists products_deleted_at_idx on public.products (deleted_at);

create index if not exists blogs_slug_idx on public.blogs (slug);
create index if not exists blogs_category_id_idx on public.blogs (category_id);
create index if not exists blogs_author_id_idx on public.blogs (author_id);
create index if not exists blogs_status_idx on public.blogs (status);
create index if not exists blogs_published_at_idx on public.blogs (published_at);
create index if not exists blogs_tags_idx on public.blogs using gin (tags);
create index if not exists blogs_seo_keywords_idx on public.blogs using gin (seo_keywords);
create index if not exists blogs_deleted_at_idx on public.blogs (deleted_at);

create index if not exists seo_page_type_idx on public.seo (page_type);
create index if not exists seo_page_id_idx on public.seo (page_id);
create index if not exists seo_page_slug_idx on public.seo (page_slug);
create index if not exists seo_deleted_at_idx on public.seo (deleted_at);

create index if not exists newsletter_subscribers_email_idx on public.newsletter_subscribers (email);
create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers (status);
create index if not exists newsletter_subscribers_source_page_idx on public.newsletter_subscribers (source_page);
create index if not exists newsletter_subscribers_deleted_at_idx on public.newsletter_subscribers (deleted_at);

create index if not exists affiliate_clicks_product_id_idx on public.affiliate_clicks (product_id);
create index if not exists affiliate_clicks_clicked_at_idx on public.affiliate_clicks (clicked_at);
create index if not exists affiliate_clicks_source_page_idx on public.affiliate_clicks (source_page);
create index if not exists affiliate_clicks_deleted_at_idx on public.affiliate_clicks (deleted_at);

create index if not exists site_settings_deleted_at_idx on public.site_settings (deleted_at);

-- ======================================================
-- TRIGGERS
-- ======================================================

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_categories_updated_at'
      and tgrelid = 'public.categories'::regclass
      and not tgisinternal
  ) then
    create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_authors_updated_at'
      and tgrelid = 'public.authors'::regclass
      and not tgisinternal
  ) then
    create trigger set_authors_updated_at before update on public.authors for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_users_updated_at'
      and tgrelid = 'public.users'::regclass
      and not tgisinternal
  ) then
    create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_products_updated_at'
      and tgrelid = 'public.products'::regclass
      and not tgisinternal
  ) then
    create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_blogs_updated_at'
      and tgrelid = 'public.blogs'::regclass
      and not tgisinternal
  ) then
    create trigger set_blogs_updated_at before update on public.blogs for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_seo_updated_at'
      and tgrelid = 'public.seo'::regclass
      and not tgisinternal
  ) then
    create trigger set_seo_updated_at before update on public.seo for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_newsletter_subscribers_updated_at'
      and tgrelid = 'public.newsletter_subscribers'::regclass
      and not tgisinternal
  ) then
    create trigger set_newsletter_subscribers_updated_at before update on public.newsletter_subscribers for each row execute function public.set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_site_settings_updated_at'
      and tgrelid = 'public.site_settings'::regclass
      and not tgisinternal
  ) then
    create trigger set_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
  end if;
end $$;

-- ======================================================
-- RLS ENABLEMENT
-- ======================================================

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.blogs enable row level security;
alter table public.authors enable row level security;
alter table public.users enable row level security;
alter table public.seo enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.site_settings enable row level security;

-- ======================================================
-- ADMIN AUTHORIZATION HELPER
-- ======================================================

create or replace function public.is_suppriva_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.users
    where users.id = auth.uid()
      and users.role = 'admin'::public.user_role
      and users.status = 'active'::public.user_status
      and users.deleted_at is null
  );
$$;

revoke all on function public.is_suppriva_admin() from public;
grant execute on function public.is_suppriva_admin() to authenticated;

-- ======================================================
-- RLS POLICIES
-- ======================================================

drop policy if exists "Public can read published categories" on public.categories;
drop policy if exists "Admins can manage categories" on public.categories;

create policy "Public can read published categories"
on public.categories
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and deleted_at is null
);

create policy "Admins can manage categories"
on public.categories
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Public can read published products" on public.products;
drop policy if exists "Admins can manage products" on public.products;

create policy "Public can read published products"
on public.products
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and deleted_at is null
);

create policy "Admins can manage products"
on public.products
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Public can read published blogs" on public.blogs;
drop policy if exists "Admins can manage blogs" on public.blogs;

create policy "Public can read published blogs"
on public.blogs
for select
to anon, authenticated
using (
  status = 'published'::public.content_status
  and deleted_at is null
);

create policy "Admins can manage blogs"
on public.blogs
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Public can read active authors" on public.authors;
drop policy if exists "Admins can manage authors" on public.authors;

create policy "Public can read active authors"
on public.authors
for select
to anon, authenticated
using (deleted_at is null);

create policy "Admins can manage authors"
on public.authors
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Public can read SEO metadata" on public.seo;
drop policy if exists "Admins can manage SEO metadata" on public.seo;

create policy "Public can read SEO metadata"
on public.seo
for select
to anon, authenticated
using (deleted_at is null);

create policy "Admins can manage SEO metadata"
on public.seo
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Public can create newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Public can unsubscribe newsletter subscribers" on public.newsletter_subscribers;
drop policy if exists "Admins can manage newsletter subscribers" on public.newsletter_subscribers;

create policy "Public can create newsletter subscribers"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (
  status in ('active'::public.subscriber_status, 'pending'::public.subscriber_status)
  and deleted_at is null
);

create policy "Public can unsubscribe newsletter subscribers"
on public.newsletter_subscribers
for update
to anon, authenticated
using (deleted_at is null)
with check (
  status = 'unsubscribed'::public.subscriber_status
  and deleted_at is null
);

create policy "Admins can manage newsletter subscribers"
on public.newsletter_subscribers
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Public can create affiliate clicks" on public.affiliate_clicks;
drop policy if exists "Admins can manage affiliate clicks" on public.affiliate_clicks;

create policy "Public can create affiliate clicks"
on public.affiliate_clicks
for insert
to anon, authenticated
with check (deleted_at is null);

create policy "Admins can manage affiliate clicks"
on public.affiliate_clicks
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Public can read site settings" on public.site_settings;
drop policy if exists "Admins can manage site settings" on public.site_settings;

create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (deleted_at is null);

create policy "Admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

drop policy if exists "Users can read their own profile" on public.users;
drop policy if exists "Admins can manage users" on public.users;

create policy "Users can read their own profile"
on public.users
for select
to authenticated
using (
  id = auth.uid()
  and deleted_at is null
);

create policy "Admins can manage users"
on public.users
for all
to authenticated
using (public.is_suppriva_admin())
with check (public.is_suppriva_admin());

-- ======================================================
-- ADMIN BOOTSTRAP TEMPLATE
-- ======================================================
-- Run this only after creating/logging in a Supabase Auth user.
-- Replace values before executing.
--
-- insert into public.users (id, full_name, email, role, status)
-- values ('AUTH_USER_UUID_HERE', 'Suppriva Admin', 'admin@example.com', 'admin', 'active')
-- on conflict (email) do update
-- set id = excluded.id,
--     full_name = excluded.full_name,
--     role = 'admin',
--     status = 'active',
--     updated_at = now();

-- ======================================================
-- VERIFICATION QUERIES
-- ======================================================

-- A. Expected tables.
select
  table_name,
  case when table_name is not null then 'PASS' else 'FAIL' end as status
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'categories',
    'products',
    'blogs',
    'authors',
    'users',
    'seo',
    'newsletter_subscribers',
    'affiliate_clicks',
    'site_settings'
  )
order by table_name;

-- B. Required column verification for current blockers.
select
  table_name,
  column_name,
  data_type,
  udt_name,
  is_generated,
  generation_expression,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'newsletter_subscribers' and column_name in ('id', 'email', 'status', 'source_page', 'created_at', 'updated_at', 'deleted_at'))
    or (table_name = 'blogs' and column_name in ('id', 'title', 'slug', 'seo_keywords', 'category_id', 'author_id', 'status', 'deleted_at'))
    or (table_name = 'affiliate_clicks' and column_name in ('id', 'product_id', 'clicked_at', 'source_page', 'country', 'device', 'created_at', 'deleted_at'))
    or (table_name = 'categories' and column_name in ('id', 'title', 'name', 'slug', 'status', 'seo_keywords', 'deleted_at'))
    or (table_name = 'seo' and column_name in ('id', 'page_type', 'page_id', 'page_slug', 'meta_title', 'meta_description', 'canonical_url', 'schema_json', 'updated_at', 'deleted_at'))
  )
order by table_name, column_name;

-- B2. Generated column audit. V2 intentionally does not update any generated column.
select
  table_name,
  column_name,
  is_generated,
  generation_expression
from information_schema.columns
where table_schema = 'public'
  and is_generated <> 'NEVER'
order by table_name, column_name;

-- C. Missing required columns should return zero rows.
with required_columns(table_name, column_name) as (
  values
    ('newsletter_subscribers', 'source_page'),
    ('blogs', 'seo_keywords'),
    ('affiliate_clicks', 'product_id'),
    ('affiliate_clicks', 'clicked_at'),
    ('affiliate_clicks', 'source_page'),
    ('affiliate_clicks', 'country'),
    ('affiliate_clicks', 'device'),
    ('categories', 'title'),
    ('categories', 'status'),
    ('categories', 'seo_keywords'),
    ('seo', 'page_type'),
    ('seo', 'page_slug'),
    ('seo', 'meta_title'),
    ('seo', 'meta_description')
)
select rc.table_name, rc.column_name, 'MISSING' as status
from required_columns rc
left join information_schema.columns c
  on c.table_schema = 'public'
 and c.table_name = rc.table_name
 and c.column_name = rc.column_name
where c.column_name is null
order by rc.table_name, rc.column_name;

-- D. RLS status. Every row should show rls_enabled = true.
select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in (
    'categories',
    'products',
    'blogs',
    'authors',
    'users',
    'seo',
    'newsletter_subscribers',
    'affiliate_clicks',
    'site_settings'
  )
order by relname;

-- E. Policy names. Compare this output with the expected policy list in this file.
select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in (
    'categories',
    'products',
    'blogs',
    'authors',
    'users',
    'seo',
    'newsletter_subscribers',
    'affiliate_clicks',
    'site_settings'
  )
order by tablename, policyname;

-- F. Missing policy check should return zero rows.
with required_policies(table_name, policy_name) as (
  values
    ('categories', 'Public can read published categories'),
    ('categories', 'Admins can manage categories'),
    ('products', 'Public can read published products'),
    ('products', 'Admins can manage products'),
    ('blogs', 'Public can read published blogs'),
    ('blogs', 'Admins can manage blogs'),
    ('authors', 'Public can read active authors'),
    ('authors', 'Admins can manage authors'),
    ('seo', 'Public can read SEO metadata'),
    ('seo', 'Admins can manage SEO metadata'),
    ('newsletter_subscribers', 'Public can create newsletter subscribers'),
    ('newsletter_subscribers', 'Public can unsubscribe newsletter subscribers'),
    ('newsletter_subscribers', 'Admins can manage newsletter subscribers'),
    ('affiliate_clicks', 'Public can create affiliate clicks'),
    ('affiliate_clicks', 'Admins can manage affiliate clicks'),
    ('site_settings', 'Public can read site settings'),
    ('site_settings', 'Admins can manage site settings'),
    ('users', 'Users can read their own profile'),
    ('users', 'Admins can manage users')
)
select rp.table_name, rp.policy_name, 'MISSING' as status
from required_policies rp
left join pg_policies p
  on p.schemaname = 'public'
 and p.tablename = rp.table_name
 and p.policyname = rp.policy_name
where p.policyname is null
order by rp.table_name, rp.policy_name;

-- G. Index verification.
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'categories',
    'products',
    'blogs',
    'authors',
    'users',
    'seo',
    'newsletter_subscribers',
    'affiliate_clicks',
    'site_settings'
  )
order by tablename, indexname;

-- H. Trigger verification.
select
  event_object_table as table_name,
  trigger_name,
  action_timing,
  event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
  and event_object_table in (
    'categories',
    'products',
    'blogs',
    'authors',
    'users',
    'seo',
    'newsletter_subscribers',
    'site_settings'
  )
order by event_object_table, trigger_name;

-- I. Foreign key verification.
select
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_schema as foreign_table_schema,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.table_schema = kcu.table_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.table_schema = tc.table_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
order by tc.table_name, tc.constraint_name;

-- J. Auth/profile alignment. public.users.id must match auth.users.id.
select
  au.id as auth_user_id,
  au.email as auth_email,
  pu.id as public_user_id,
  pu.email as public_email,
  pu.role,
  pu.status,
  case
    when pu.id is null then 'FAIL: missing public.users profile'
    when pu.id <> au.id then 'FAIL: id mismatch'
    when pu.role <> 'admin'::public.user_role then 'WARN: not admin'
    when pu.status <> 'active'::public.user_status then 'WARN: not active'
    when pu.deleted_at is not null then 'FAIL: profile soft deleted'
    else 'PASS'
  end as admin_readiness
from auth.users au
left join public.users pu on pu.id = au.id
order by au.created_at desc;

-- K. Admin exists check. This must be true before Dashboard CRUD can work.
select exists (
  select 1
  from auth.users au
  join public.users pu on pu.id = au.id
  where pu.role = 'admin'::public.user_role
    and pu.status = 'active'::public.user_status
    and pu.deleted_at is null
) as has_active_admin_profile;

-- L. Basic public write policy smoke tests.
-- These insert test rows. Delete them after verification if desired.
insert into public.newsletter_subscribers (email, status, source_page)
values ('suppriva-sql-smoke-test@example.com', 'active', 'sql-policy-smoke-test')
on conflict (email) do update
set status = 'active',
    source_page = 'sql-policy-smoke-test',
    updated_at = now()
returning id, email, status, source_page, created_at, updated_at;

-- Affiliate click smoke test requires a real product row because product_id is a foreign key.
-- Use this after creating at least one product:
-- insert into public.affiliate_clicks (product_id, source_page, country, device)
-- select id, 'sql-policy-smoke-test', 'IN', 'sql-editor'
-- from public.products
-- where deleted_at is null
-- order by created_at desc
-- limit 1
-- returning id, product_id, clicked_at, source_page, country, device;
