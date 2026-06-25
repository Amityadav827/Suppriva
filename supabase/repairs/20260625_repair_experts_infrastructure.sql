-- SUPPRIVA EXPERTS INFRASTRUCTURE REPAIR
-- Safe to run multiple times in Supabase SQL Editor.
-- Creates only missing experts infrastructure and seeds the initial public expert.

create extension if not exists "pgcrypto";

create table if not exists public.experts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  profile_image text,
  designation text,
  short_bio text,
  full_bio text,
  editorial_contribution text,
  content_reviewed jsonb not null default '[]'::jsonb,
  experience_years integer,
  linkedin_url text,
  website_url text,
  email text,
  expertise_tags text[] not null default '{}'::text[],
  status text not null default 'active' check (status in ('active', 'inactive')),
  display_order integer not null default 0,
  featured_on_homepage boolean not null default false,
  seo_title text,
  seo_description text,
  meta_image text,
  linked_author_id uuid references public.authors(id) on delete set null,
  linked_reviewer_id uuid references public.reviewers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.experts
  add column if not exists editorial_contribution text,
  add column if not exists content_reviewed jsonb not null default '[]'::jsonb,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists meta_image text;

create index if not exists experts_slug_idx on public.experts (slug);
create index if not exists experts_status_idx on public.experts (status);
create index if not exists experts_display_order_idx on public.experts (display_order);
create index if not exists experts_featured_on_homepage_idx on public.experts (featured_on_homepage);
create index if not exists experts_linked_author_id_idx on public.experts (linked_author_id);
create index if not exists experts_linked_reviewer_id_idx on public.experts (linked_reviewer_id);

alter table public.experts enable row level security;

drop trigger if exists set_experts_updated_at on public.experts;
create trigger set_experts_updated_at
before update on public.experts
for each row execute function public.set_updated_at();

grant usage on schema public to anon, authenticated;
grant select on public.experts to anon, authenticated;
grant insert, update, delete on public.experts to authenticated;

drop policy if exists "Public can read experts" on public.experts;
drop policy if exists "Admins can manage experts" on public.experts;

create policy "Public can read experts"
on public.experts
for select
to anon, authenticated
using (status = 'active');

create policy "Admins can manage experts"
on public.experts
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

create table if not exists public.expert_queries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  category text,
  expert_id uuid references public.experts(id) on delete set null,
  product_name text,
  product_url text,
  question_type text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'resolved')),
  source_page text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table if exists public.expert_queries
  add column if not exists category text,
  add column if not exists expert_id uuid references public.experts(id) on delete set null,
  add column if not exists source_page text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists resolved_at timestamptz;

alter table if exists public.expert_queries
  alter column product_name drop not null,
  alter column product_url drop not null;

create index if not exists expert_queries_status_idx on public.expert_queries (status);
create index if not exists expert_queries_category_idx on public.expert_queries (category);
create index if not exists expert_queries_email_idx on public.expert_queries (email);
create index if not exists expert_queries_expert_id_idx on public.expert_queries (expert_id);
create index if not exists expert_queries_created_at_idx on public.expert_queries (created_at desc);

alter table public.expert_queries enable row level security;

drop trigger if exists set_expert_queries_updated_at on public.expert_queries;
create trigger set_expert_queries_updated_at
before update on public.expert_queries
for each row execute function public.set_updated_at();

grant select, insert on public.expert_queries to anon, authenticated;
grant update, delete on public.expert_queries to authenticated;

drop policy if exists "Public can submit expert queries" on public.expert_queries;
drop policy if exists "Admins can read expert queries" on public.expert_queries;
drop policy if exists "Admins can manage expert queries" on public.expert_queries;

create policy "Public can submit expert queries"
on public.expert_queries
for insert
to anon, authenticated
with check (true);

create policy "Admins can read expert queries"
on public.expert_queries
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
      and public.users.role::text = 'admin'
      and public.users.status::text = 'active'
  )
);

create policy "Admins can manage expert queries"
on public.expert_queries
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

insert into public.experts (
  name,
  slug,
  profile_image,
  designation,
  short_bio,
  full_bio,
  editorial_contribution,
  content_reviewed,
  experience_years,
  linkedin_url,
  expertise_tags,
  status,
  display_order,
  featured_on_homepage,
  seo_title,
  seo_description,
  meta_image
)
values (
  'Dr. Arindham Chatterjee',
  'dr-arindham-chatterjee',
  'https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg',
  'Medical & Wellness Advisor',
  'Dr. Arindham Chatterjee contributes expert guidance to Suppriva''s educational wellness resources, ingredient explainers, and prevention-focused health content.',
  E'Dr. Arindham Chatterjee is a wellness-focused medical professional whose work centers on integrative healthcare, ingredient education, and preventive lifestyle awareness.\n\nHis contribution to Suppriva focuses on educational clarity, practical wellness communication, and helping readers better understand herbs, functional ingredients, and long-term lifestyle habits.\n\nHis areas of interest include herbal wellness, public health awareness, supplement education, and prevention-oriented wellness strategies that support informed decision-making.',
  E'Dr. Arindham Chatterjee contributes expert guidance to educational wellness content, ingredient explainers, and wellness resources published on Suppriva.\n\nThe role focuses on improving educational quality and helping readers better understand ingredients and wellness concepts.\n\nIndividual product rankings, affiliate partnerships, and editorial decisions remain independently managed by the Suppriva Editorial Team.',
  '[
    {
      "label": "Ingredient Guides",
      "value": 0,
      "description": "Published ingredient education and research resources."
    },
    {
      "label": "Product Reviews",
      "value": 0,
      "description": "Supplement product reviews and comparison resources."
    },
    {
      "label": "Wellness Articles",
      "value": 0,
      "description": "Educational wellness articles and practical guides."
    },
    {
      "label": "Health Goal Pages",
      "value": 0,
      "description": "Health goal pages and wellness category resources."
    }
  ]'::jsonb,
  12,
  'https://www.linkedin.com/in/dr-arindham-chatterjee-2b1b6716/',
  array[
    'Integrative Healthcare',
    'Herbal Wellness',
    'Preventive Lifestyle',
    'Supplement Education'
  ],
  'active',
  1,
  true,
  'Dr. Arindham Chatterjee | Wellness Expert | Suppriva',
  'Learn about Dr. Arindham Chatterjee, a wellness expert contributing educational guidance and ingredient resources at Suppriva.',
  'https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg'
)
on conflict (slug) do update
set
  profile_image = excluded.profile_image,
  designation = excluded.designation,
  short_bio = excluded.short_bio,
  full_bio = excluded.full_bio,
  editorial_contribution = excluded.editorial_contribution,
  content_reviewed = excluded.content_reviewed,
  experience_years = excluded.experience_years,
  linkedin_url = excluded.linkedin_url,
  expertise_tags = excluded.expertise_tags,
  status = excluded.status,
  display_order = excluded.display_order,
  featured_on_homepage = excluded.featured_on_homepage,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  meta_image = excluded.meta_image,
  updated_at = now();

comment on table public.experts is 'Public-facing wellness experts used for advisory board pages and dynamic EEAT expert discovery.';
comment on table public.expert_queries is 'Questions submitted through product expert widgets and the public ask-expert form.';

notify pgrst, 'reload schema';

-- Verification:
-- select id, name, slug, status, featured_on_homepage
-- from public.experts
-- order by display_order, name;
