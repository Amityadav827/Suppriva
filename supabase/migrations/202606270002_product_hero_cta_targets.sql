-- Product hero CTA target controls for dashboard-managed product pages.

alter table if exists public.products
  add column if not exists hero_cta_target text
    check (hero_cta_target is null or hero_cta_target in ('_self', '_blank')),
  add column if not exists hero_secondary_cta_target text
    check (hero_secondary_cta_target is null or hero_secondary_cta_target in ('_self', '_blank'));

notify pgrst, 'reload schema';
