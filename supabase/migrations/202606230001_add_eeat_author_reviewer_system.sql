create extension if not exists "pgcrypto";

alter table if exists public.authors
  add column if not exists photo_url text,
  add column if not exists designation text,
  add column if not exists qualification text,
  add column if not exists experience_years integer,
  add column if not exists linkedin_url text,
  add column if not exists website_url text,
  add column if not exists email text,
  add column if not exists is_active boolean not null default true;

update public.authors
set
  photo_url = coalesce(photo_url, avatar),
  linkedin_url = coalesce(linkedin_url, social_links ->> 'linkedin'),
  website_url = coalesce(website_url, social_links ->> 'website'),
  is_active = coalesce(is_active, true)
where deleted_at is null;

create table if not exists public.reviewers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  photo_url text,
  designation text,
  qualification text,
  experience_years integer,
  bio text,
  linkedin_url text,
  website_url text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviewers_slug_unique unique (slug)
);

alter table if exists public.products
  add column if not exists author_id uuid references public.authors(id) on delete set null,
  add column if not exists reviewer_id uuid references public.reviewers(id) on delete set null;

alter table if exists public.blogs
  add column if not exists reviewer_id uuid references public.reviewers(id) on delete set null;

alter table if exists public.ingredients
  add column if not exists author_id uuid references public.authors(id) on delete set null,
  add column if not exists reviewer_id uuid references public.reviewers(id) on delete set null;

create index if not exists authors_is_active_idx on public.authors (is_active);
create index if not exists authors_email_idx on public.authors (email);
create index if not exists reviewers_slug_idx on public.reviewers (slug);
create index if not exists reviewers_is_active_idx on public.reviewers (is_active);
create index if not exists reviewers_email_idx on public.reviewers (email);
create index if not exists products_author_id_idx on public.products (author_id);
create index if not exists products_reviewer_id_idx on public.products (reviewer_id);
create index if not exists blogs_reviewer_id_idx on public.blogs (reviewer_id);
create index if not exists ingredients_author_id_idx on public.ingredients (author_id);
create index if not exists ingredients_reviewer_id_idx on public.ingredients (reviewer_id);

alter table public.reviewers enable row level security;

drop trigger if exists set_reviewers_updated_at on public.reviewers;
create trigger set_reviewers_updated_at
before update on public.reviewers
for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select on public.authors to anon, authenticated;
grant select on public.reviewers to anon, authenticated;
grant insert, update, delete on public.authors to authenticated;
grant insert, update, delete on public.reviewers to authenticated;

drop policy if exists "Public can read authors" on public.authors;
drop policy if exists "Admins can manage authors" on public.authors;
drop policy if exists "Public can read reviewers" on public.reviewers;
drop policy if exists "Admins can manage reviewers" on public.reviewers;

create policy "Public can read authors"
on public.authors
for select
to anon, authenticated
using (deleted_at is null and is_active = true);

create policy "Admins can manage authors"
on public.authors
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

create policy "Public can read reviewers"
on public.reviewers
for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage reviewers"
on public.reviewers
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

insert into public.authors (
  name,
  slug,
  designation,
  qualification,
  experience_years,
  bio,
  website_url,
  is_active
)
select
  'Suppriva Editorial Team',
  'suppriva-editorial-team',
  'Editorial Team',
  'Supplement Research and Wellness Content',
  10,
  'Suppriva editorial contributors research supplements, ingredients, and wellness topics to help readers make clearer health decisions.',
  null,
  true
where not exists (
  select 1
  from public.authors
  where slug = 'suppriva-editorial-team'
    and deleted_at is null
);

insert into public.reviewers (
  name,
  slug,
  designation,
  qualification,
  experience_years,
  bio,
  website_url,
  is_active
)
select
  'Suppriva Wellness Review Board',
  'suppriva-wellness-review-board',
  'Wellness Review Board',
  'Supplement Evaluation and Wellness Review',
  12,
  'Suppriva reviewers help evaluate supplement content, ingredient safety context, and practical wellness guidance before publication.',
  null,
  true
where not exists (
  select 1
  from public.reviewers
  where slug = 'suppriva-wellness-review-board'
);

do $$
declare
  v_default_author_id uuid;
  v_default_reviewer_id uuid;
begin
  select id
  into v_default_author_id
  from public.authors
  where slug = 'suppriva-editorial-team'
    and deleted_at is null
  limit 1;

  select id
  into v_default_reviewer_id
  from public.reviewers
  where slug = 'suppriva-wellness-review-board'
  limit 1;

  update public.products
  set author_id = v_default_author_id
  where author_id is null;

  update public.products
  set reviewer_id = v_default_reviewer_id
  where reviewer_id is null;

  update public.blogs
  set author_id = coalesce(author_id, v_default_author_id),
      reviewer_id = coalesce(reviewer_id, v_default_reviewer_id)
  where author_id is null
     or reviewer_id is null;

  update public.ingredients
  set author_id = coalesce(author_id, v_default_author_id),
      reviewer_id = coalesce(reviewer_id, v_default_reviewer_id)
  where author_id is null
     or reviewer_id is null;
end $$;

comment on table public.reviewers is 'Medical reviewers and expert reviewer profiles for EEAT attribution.';

notify pgrst, 'reload schema';

