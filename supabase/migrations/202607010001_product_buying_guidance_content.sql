-- SUPPRIVA PRODUCT BUYING GUIDANCE CONTENT
-- Converts the Where To Buy CMS from repeatable cards to rich text content.
-- Safe to run multiple times.

alter table if exists public.products
  add column if not exists buying_guidance_content text;

comment on column public.products.buying_guidance_content is
  'Rich text CMS content for the product Where To Buy section.';

do $$
begin
  if to_regclass('public.product_buying_guide_items') is not null then
    update public.products p
    set buying_guidance_content = legacy.content
    from (
      select
        product_id,
        string_agg(
          concat_ws(
            E'\n',
            case
              when nullif(trim(title), '') is not null
                then '**' || trim(title) || '**'
              else null
            end,
            nullif(trim(coalesce(description, '')), '')
          ),
          E'\n\n'
          order by display_order, created_at
        ) as content
      from public.product_buying_guide_items
      where is_active is not false
      group by product_id
    ) legacy
    where p.id = legacy.product_id
      and nullif(trim(coalesce(p.buying_guidance_content, '')), '') is null
      and nullif(trim(coalesce(legacy.content, '')), '') is not null;
  end if;
end $$;

notify pgrst, 'reload schema';
