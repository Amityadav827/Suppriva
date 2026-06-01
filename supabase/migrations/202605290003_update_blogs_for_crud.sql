-- Blogs CRUD compatibility update for the SUPPRIVA dashboard.

alter table if exists public.blogs
  add column if not exists seo_keywords text[] not null default '{}';

create index if not exists blogs_seo_keywords_idx on public.blogs using gin (seo_keywords);
