-- SUPPRIVA MEDIA LIBRARY STORAGE + DATABASE SETUP
-- Run this in Supabase SQL Editor.
-- Safe to rerun.

create extension if not exists "pgcrypto";

create table if not exists public.media_library (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  title text not null,
  alt_text text,
  caption text,
  description text,
  slug text not null,
  tags text[] not null default '{}',
  width integer,
  height integer,
  file_size bigint,
  mime_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_library
  add column if not exists file_name text,
  add column if not exists file_url text,
  add column if not exists title text,
  add column if not exists alt_text text,
  add column if not exists caption text,
  add column if not exists description text,
  add column if not exists slug text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists file_size bigint,
  add column if not exists mime_type text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'media_library_file_name_key'
      and conrelid = 'public.media_library'::regclass
  ) then
    alter table public.media_library
      add constraint media_library_file_name_key unique (file_name);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'media_library_file_url_key'
      and conrelid = 'public.media_library'::regclass
  ) then
    alter table public.media_library
      add constraint media_library_file_url_key unique (file_url);
  end if;
end $$;

create index if not exists media_library_slug_idx on public.media_library (slug);
create index if not exists media_library_title_idx on public.media_library (title);
create index if not exists media_library_created_at_idx on public.media_library (created_at desc);
create index if not exists media_library_tags_idx on public.media_library using gin (tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_media_library_updated_at on public.media_library;
create trigger set_media_library_updated_at
before update on public.media_library
for each row execute function public.set_updated_at();

alter table public.media_library enable row level security;

drop policy if exists "Admins can read media library" on public.media_library;
drop policy if exists "Admins can create media library" on public.media_library;
drop policy if exists "Admins can update media library" on public.media_library;
drop policy if exists "Admins can delete media library" on public.media_library;

create policy "Admins can read media library"
on public.media_library
for select
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

create policy "Admins can create media library"
on public.media_library
for insert
to authenticated
with check (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

create policy "Admins can update media library"
on public.media_library
for update
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
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
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

create policy "Admins can delete media library"
on public.media_library
for delete
to authenticated
using (
  exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'media-library',
  'media-library',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = now();

drop policy if exists "Public can read media library objects" on storage.objects;
drop policy if exists "Admins can upload media library objects" on storage.objects;
drop policy if exists "Admins can update media library objects" on storage.objects;
drop policy if exists "Admins can delete media library objects" on storage.objects;

create policy "Public can read media library objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'media-library');

create policy "Admins can upload media library objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'media-library'
  and exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

create policy "Admins can update media library objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'media-library'
  and exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
)
with check (
  bucket_id = 'media-library'
  and exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

create policy "Admins can delete media library objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'media-library'
  and exists (
    select 1
    from public.users
    where (
        public.users.id = auth.uid()
        or lower(public.users.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
      and public.users.status::text = 'active'
      and public.users.role::text = 'admin'
  )
);

alter table if exists public.affiliate_clicks
  add column if not exists user_agent text,
  add column if not exists ip_hash text,
  add column if not exists referrer text;

create index if not exists affiliate_clicks_referrer_idx on public.affiliate_clicks (referrer);
create index if not exists affiliate_clicks_ip_hash_idx on public.affiliate_clicks (ip_hash);

notify pgrst, 'reload schema';
