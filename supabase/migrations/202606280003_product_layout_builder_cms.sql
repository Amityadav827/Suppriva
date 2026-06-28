-- SUPPRIVA PRODUCT LAYOUT BUILDER CMS
-- Phase 7 dashboard-driven product page section ordering and visibility.
-- Safe to run multiple times.

create table if not exists public.product_layout_sections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  section_key text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  title_override text,
  subtitle_override text,
  background_style text not null default 'default' check (background_style in ('default')),
  animation_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_layout_sections_unique_section unique (product_id, section_key),
  constraint product_layout_sections_key_check check (
    section_key in (
      'hero',
      'overview',
      'standout',
      'how_it_works',
      'benefits',
      'ingredients',
      'best_for',
      'safety',
      'pros_cons',
      'faq',
      'verdict',
      'buying',
      'related_ingredients',
      'related_blogs',
      'compare',
      'related_products',
      'health_needs'
    )
  )
);

create index if not exists product_layout_sections_product_id_idx
  on public.product_layout_sections (product_id);

create index if not exists product_layout_sections_order_idx
  on public.product_layout_sections (product_id, is_visible, sort_order);

drop trigger if exists set_product_layout_sections_updated_at
  on public.product_layout_sections;

create trigger set_product_layout_sections_updated_at
before update on public.product_layout_sections
for each row execute function public.set_updated_at();

alter table public.product_layout_sections enable row level security;

grant select on public.product_layout_sections to anon, authenticated;
grant insert, update, delete on public.product_layout_sections to authenticated;

drop policy if exists "Public can read product_layout_sections"
  on public.product_layout_sections;

drop policy if exists "Admins can manage product_layout_sections"
  on public.product_layout_sections;

create policy "Public can read product_layout_sections"
on public.product_layout_sections
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where public.products.id = product_layout_sections.product_id
      and public.products.status = 'published'::public.content_status
      and public.products.deleted_at is null
  )
);

create policy "Admins can manage product_layout_sections"
on public.product_layout_sections
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

comment on table public.product_layout_sections is 'Dashboard-controlled product page layout section visibility, order, and title overrides.';

notify pgrst, 'reload schema';
