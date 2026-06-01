-- Categories CRUD compatibility update for the SUPPRIVA dashboard.
-- Keeps the original name column while adding title/status/seo_keywords
-- fields required by the Categories CRUD architecture.

alter table if exists public.categories
  add column if not exists title text,
  add column if not exists status public.content_status not null default 'draft',
  add column if not exists seo_keywords text[] not null default '{}';

update public.categories
set title = name
where title is null;

alter table if exists public.categories
  alter column title set not null;

create index if not exists categories_status_idx on public.categories (status);
