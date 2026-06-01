-- SUPPRIVA RLS POLICY PACKAGE
-- Execute this script in Supabase SQL Editor after SUPABASE_SQL_EDITOR_MIGRATION.sql.
-- Scope: public published reads + authenticated admin dashboard management.
-- Important: dashboard write access requires an authenticated Supabase user whose auth.uid()
-- matches public.users.id with role='admin' and status='active'.

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

-- CATEGORIES
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

-- PRODUCTS
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

-- BLOGS
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

-- AUTHORS
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

-- SEO
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

-- NEWSLETTER SUBSCRIBERS
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

-- AFFILIATE CLICKS
drop policy if exists "Admins can manage affiliate clicks" on public.affiliate_clicks;
drop policy if exists "Public can create affiliate clicks" on public.affiliate_clicks;

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

-- SITE SETTINGS
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

-- USERS
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

-- OPTIONAL ADMIN BOOTSTRAP EXAMPLE
-- After creating a Supabase Auth user, insert/update the matching profile:
-- insert into public.users (id, full_name, email, role, status)
-- values ('AUTH_USER_UUID_HERE', 'Suppriva Admin', 'admin@example.com', 'admin', 'active')
-- on conflict (email) do update
-- set role = 'admin', status = 'active', updated_at = now();

-- VERIFICATION QUERIES
select schemaname, tablename, policyname, roles, cmd
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
