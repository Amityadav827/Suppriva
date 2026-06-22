create table if not exists public.product_import_logs (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  total_rows integer not null default 0 check (total_rows >= 0),
  imported_rows integer not null default 0 check (imported_rows >= 0),
  failed_rows integer not null default 0 check (failed_rows >= 0),
  status text not null default 'pending' check (status in ('pending', 'completed', 'completed_with_errors', 'failed')),
  created_at timestamptz not null default now()
);

create index if not exists product_import_logs_created_at_idx
  on public.product_import_logs (created_at desc);

create index if not exists product_import_logs_status_idx
  on public.product_import_logs (status);

alter table public.product_import_logs enable row level security;

create or replace function public.upsert_product_import_row(
  p_title text,
  p_slug text,
  p_category_id uuid,
  p_affiliate_url text,
  p_short_description text,
  p_rating numeric,
  p_image text,
  p_status public.content_status,
  p_pros text[],
  p_cons text[],
  p_faq jsonb,
  p_ingredient_snapshot jsonb,
  p_ingredient_ids uuid[]
)
returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_product_id uuid;
  v_now timestamptz := now();
begin
  insert into public.products (
    category_id,
    title,
    slug,
    affiliate_url,
    short_description,
    rating,
    image,
    ingredients,
    benefits,
    pros,
    cons,
    faq,
    status,
    published_at
  )
  values (
    p_category_id,
    p_title,
    p_slug,
    p_affiliate_url,
    p_short_description,
    p_rating,
    p_image,
    coalesce(p_ingredient_snapshot, '[]'::jsonb),
    '[]'::jsonb,
    coalesce(p_pros, '{}'::text[]),
    coalesce(p_cons, '{}'::text[]),
    coalesce(p_faq, '[]'::jsonb),
    coalesce(p_status, 'draft'::public.content_status),
    case
      when coalesce(p_status, 'draft'::public.content_status) = 'published'::public.content_status
        then v_now
      else null
    end
  )
  on conflict (slug) do update
  set
    category_id = excluded.category_id,
    title = excluded.title,
    affiliate_url = excluded.affiliate_url,
    short_description = excluded.short_description,
    rating = excluded.rating,
    image = excluded.image,
    ingredients = excluded.ingredients,
    pros = excluded.pros,
    cons = excluded.cons,
    faq = excluded.faq,
    status = excluded.status,
    published_at = case
      when excluded.status = 'published'::public.content_status
        then coalesce(public.products.published_at, v_now)
      else null
    end
  returning id into v_product_id;

  if coalesce(array_length(p_ingredient_ids, 1), 0) = 0 then
    delete from public.product_ingredients
    where product_id = v_product_id;
  else
    delete from public.product_ingredients
    where product_id = v_product_id
      and ingredient_id <> all (p_ingredient_ids);

    insert into public.product_ingredients (product_id, ingredient_id)
    select v_product_id, ingredient_id
    from unnest(p_ingredient_ids) as ingredient_id
    on conflict (product_id, ingredient_id) do nothing;
  end if;

  return v_product_id;
end;
$$;
