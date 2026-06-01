-- SUPPRIVA production-ready Supabase database schema.
-- This file mirrors supabase/migrations/202605290001_create_core_schema.sql.
-- No CRUD APIs or frontend integrations are included here.

create extension if not exists "pgcrypto";

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  slug text not null,
  description text,
  image text,
  status public.content_status not null default 'draft',
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint categories_slug_unique unique (slug)
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
  deleted_at timestamptz,
  constraint authors_slug_unique unique (slug)
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text not null,
  role public.user_role not null default 'user',
  avatar text,
  status public.user_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint users_email_unique unique (email)
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
  deleted_at timestamptz,
  constraint products_slug_unique unique (slug)
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
  seo_keywords text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint blogs_slug_unique unique (slug)
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
  deleted_at timestamptz,
  constraint seo_page_identity_unique unique (page_type, page_id, page_slug),
  constraint seo_page_identifier_check check (page_id is not null or page_slug is not null)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status public.subscriber_status not null default 'pending',
  source_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint newsletter_subscribers_email_unique unique (email)
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

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists set_authors_updated_at on public.authors;
create trigger set_authors_updated_at before update on public.authors for each row execute function public.set_updated_at();
drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists set_blogs_updated_at on public.blogs;
create trigger set_blogs_updated_at before update on public.blogs for each row execute function public.set_updated_at();
drop trigger if exists set_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger set_newsletter_subscribers_updated_at before update on public.newsletter_subscribers for each row execute function public.set_updated_at();
drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.blogs enable row level security;
alter table public.authors enable row level security;
alter table public.users enable row level security;
alter table public.seo enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.site_settings enable row level security;

comment on table public.categories is 'Supplement categories and SEO category landing pages. RLS enabled; final policies pending.';
comment on table public.products is 'Affiliate supplement products. RLS enabled; final policies pending.';
comment on table public.blogs is 'SEO blog articles and guides. RLS enabled; final policies pending.';
comment on table public.authors is 'Editorial author profiles. RLS enabled; final policies pending.';
comment on table public.users is 'Application user profile records. RLS enabled; final policies pending.';
comment on table public.seo is 'Central SEO metadata and schema markup. RLS enabled; final policies pending.';
comment on table public.newsletter_subscribers is 'Newsletter subscription records. RLS enabled; final policies pending.';
comment on table public.affiliate_clicks is 'Affiliate click tracking events. RLS enabled; final policies pending.';
comment on table public.site_settings is 'Global site settings and branding. RLS enabled; final policies pending.';
