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

notify pgrst, 'reload schema';
