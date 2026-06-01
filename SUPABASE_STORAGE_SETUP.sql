-- SUPPRIVA STORAGE BUCKETS + RLS POLICIES
-- Run this in Supabase SQL Editor.
-- Scope: image upload buckets for admin dashboard media.
-- Safe to rerun.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'category-images',
    'category-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'product-images',
    'product-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'blog-images',
    'blog-images',
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

-- Public read access for images displayed across the storefront.
drop policy if exists "Public can read category images" on storage.objects;
drop policy if exists "Public can read product images" on storage.objects;
drop policy if exists "Public can read blog images" on storage.objects;

create policy "Public can read category images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'category-images');

create policy "Public can read product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Public can read blog images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-images');

-- Admin-only write access. public.is_suppriva_admin() already checks
-- auth.uid() against public.users role=admin, status=active, deleted_at is null.
drop policy if exists "Admins can upload category images" on storage.objects;
drop policy if exists "Admins can update category images" on storage.objects;
drop policy if exists "Admins can delete category images" on storage.objects;
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;
drop policy if exists "Admins can upload blog images" on storage.objects;
drop policy if exists "Admins can update blog images" on storage.objects;
drop policy if exists "Admins can delete blog images" on storage.objects;

create policy "Admins can upload category images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'category-images'
  and public.is_suppriva_admin()
);

create policy "Admins can update category images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'category-images'
  and public.is_suppriva_admin()
)
with check (
  bucket_id = 'category-images'
  and public.is_suppriva_admin()
);

create policy "Admins can delete category images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'category-images'
  and public.is_suppriva_admin()
);

create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_suppriva_admin()
);

create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_suppriva_admin()
)
with check (
  bucket_id = 'product-images'
  and public.is_suppriva_admin()
);

create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_suppriva_admin()
);

create policy "Admins can upload blog images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-images'
  and public.is_suppriva_admin()
);

create policy "Admins can update blog images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-images'
  and public.is_suppriva_admin()
)
with check (
  bucket_id = 'blog-images'
  and public.is_suppriva_admin()
);

create policy "Admins can delete blog images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-images'
  and public.is_suppriva_admin()
);

-- Verification.
select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id in ('category-images', 'product-images', 'blog-images')
order by id;

select
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'Public can read category images',
    'Public can read product images',
    'Public can read blog images',
    'Admins can upload category images',
    'Admins can update category images',
    'Admins can delete category images',
    'Admins can upload product images',
    'Admins can update product images',
    'Admins can delete product images',
    'Admins can upload blog images',
    'Admins can update blog images',
    'Admins can delete blog images'
  )
order by policyname;
