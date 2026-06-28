-- SUPPRIVA PRODUCT SIDEBAR + TABLE OF CONTENTS CMS
-- Phase 6 dashboard-driven product sidebar and navigation support.
-- Safe to run multiple times.

alter table if exists public.products
  add column if not exists sidebar_heading text,
  add column if not exists sidebar_description text,
  add column if not exists sidebar_cta_url text,
  add column if not exists sidebar_cta_type text not null default 'affiliate',
  add column if not exists sidebar_sticky_enabled boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_sidebar_cta_type_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_sidebar_cta_type_check
      check (sidebar_cta_type in ('affiliate', 'internal', 'external', 'ask_expert'));
  end if;
end $$;

create table if not exists public.product_sidebar_trust_badges (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_toc_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  anchor_id text not null,
  icon text,
  display_order integer not null default 0,
  is_visible boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_toc_items_unique_anchor unique (product_id, anchor_id)
);

create index if not exists product_sidebar_trust_badges_product_id_idx
  on public.product_sidebar_trust_badges (product_id);

create index if not exists product_sidebar_trust_badges_active_order_idx
  on public.product_sidebar_trust_badges (product_id, is_active, display_order);

create index if not exists product_toc_items_product_id_idx
  on public.product_toc_items (product_id);

create index if not exists product_toc_items_active_order_idx
  on public.product_toc_items (product_id, is_active, is_visible, display_order);

do $$
declare
  cms_table text;
begin
  foreach cms_table in array array[
    'product_sidebar_trust_badges',
    'product_toc_items'
  ]
  loop
    execute format(
      'drop trigger if exists %I on public.%I',
      'set_' || cms_table || '_updated_at',
      cms_table
    );
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      'set_' || cms_table || '_updated_at',
      cms_table
    );
    execute format('alter table public.%I enable row level security', cms_table);
    execute format('grant select on public.%I to anon, authenticated', cms_table);
    execute format('grant insert, update, delete on public.%I to authenticated', cms_table);
  end loop;
end $$;

do $$
declare
  cms_table text;
begin
  foreach cms_table in array array[
    'product_sidebar_trust_badges',
    'product_toc_items'
  ]
  loop
    execute format('drop policy if exists "Public can read %s" on public.%I', cms_table, cms_table);
    execute format('drop policy if exists "Admins can manage %s" on public.%I', cms_table, cms_table);

    execute format(
      'create policy "Public can read %s" on public.%I for select to anon, authenticated using (
        exists (
          select 1 from public.products
          where public.products.id = %I.product_id
            and public.products.status = ''published''::public.content_status
            and public.products.deleted_at is null
        )
      )',
      cms_table,
      cms_table,
      cms_table
    );

    execute format(
      'create policy "Admins can manage %s" on public.%I for all to authenticated using (
        exists (
          select 1 from public.users
          where (
              public.users.id = auth.uid()
              or lower(public.users.email) = lower(coalesce(auth.jwt() ->> ''email'', ''''))
            )
            and public.users.role::text = ''admin''
            and public.users.status::text = ''active''
        )
      ) with check (
        exists (
          select 1 from public.users
          where (
              public.users.id = auth.uid()
              or lower(public.users.email) = lower(coalesce(auth.jwt() ->> ''email'', ''''))
            )
            and public.users.role::text = ''admin''
            and public.users.status::text = ''active''
        )
      )',
      cms_table,
      cms_table
    );
  end loop;
end $$;

comment on table public.product_sidebar_trust_badges is 'Editable product dashboard trust badges for the product detail sidebar.';
comment on table public.product_toc_items is 'Editable product dashboard table-of-contents items for product detail navigation.';

notify pgrst, 'reload schema';
