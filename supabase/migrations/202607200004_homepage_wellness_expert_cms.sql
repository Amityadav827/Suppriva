-- SUPPRIVA HOMEPAGE WELLNESS EXPERT CMS
-- Phase 4 editable fallback and badge settings for "Meet Our Wellness Expert".
-- Safe to run multiple times.

create table if not exists public.homepage_wellness_expert_settings (
  id text primary key default 'home',
  badge_text text not null default 'Medical & Editorial Advisory',
  badge_icon text not null default 'shield-check',
  fallback_name text not null default 'Dr. Arindham Chatterjee',
  fallback_designation text not null default 'Medical & Wellness Advisor',
  fallback_bio text not null default 'Dr. Arindham Chatterjee contributes expert guidance to Suppriva''s educational wellness content and ingredient resources, helping readers better understand ingredients, wellness goals, and healthy lifestyle practices.',
  fallback_secondary_bio text not null default 'His focus includes wellness education, preventive lifestyle strategies, ingredient awareness, and supporting readers with evidence-informed wellness knowledge.',
  fallback_image text not null default 'https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg',
  trust_line text not null default 'Wellness Education - Ingredient Research - Preventive Health',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_wellness_expert_settings_singleton_check check (id = 'home'),
  constraint homepage_wellness_expert_fallback_image_check check (
    fallback_image like '/%'
    or fallback_image like 'http://%'
    or fallback_image like 'https://%'
  )
);

alter table public.homepage_wellness_expert_settings enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_wellness_expert_settings'
      and policyname = 'Public can read homepage wellness expert settings'
  ) then
    create policy "Public can read homepage wellness expert settings"
      on public.homepage_wellness_expert_settings
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'homepage_wellness_expert_settings'
      and policyname = 'Admins can manage homepage wellness expert settings'
  ) then
    create policy "Admins can manage homepage wellness expert settings"
      on public.homepage_wellness_expert_settings
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.users
          where public.users.id = auth.uid()
            and public.users.role::text = 'admin'
            and public.users.status::text = 'active'
            and public.users.deleted_at is null
        )
      )
      with check (
        exists (
          select 1
          from public.users
          where public.users.id = auth.uid()
            and public.users.role::text = 'admin'
            and public.users.status::text = 'active'
            and public.users.deleted_at is null
        )
      );
  end if;
end $$;

insert into public.homepage_wellness_expert_settings (
  id,
  badge_text,
  badge_icon,
  fallback_name,
  fallback_designation,
  fallback_bio,
  fallback_secondary_bio,
  fallback_image,
  trust_line
)
values (
  'home',
  'Medical & Editorial Advisory',
  'shield-check',
  'Dr. Arindham Chatterjee',
  'Medical & Wellness Advisor',
  'Dr. Arindham Chatterjee contributes expert guidance to Suppriva''s educational wellness content and ingredient resources, helping readers better understand ingredients, wellness goals, and healthy lifestyle practices.',
  'His focus includes wellness education, preventive lifestyle strategies, ingredient awareness, and supporting readers with evidence-informed wellness knowledge.',
  'https://auzapxutkteykldxhyyq.supabase.co/storage/v1/object/public/media-library/1773219025832.jpg',
  'Wellness Education - Ingredient Research - Preventive Health'
)
on conflict (id) do update
set
  badge_text = coalesce(nullif(public.homepage_wellness_expert_settings.badge_text, ''), excluded.badge_text),
  badge_icon = coalesce(nullif(public.homepage_wellness_expert_settings.badge_icon, ''), excluded.badge_icon),
  fallback_name = coalesce(nullif(public.homepage_wellness_expert_settings.fallback_name, ''), excluded.fallback_name),
  fallback_designation = coalesce(nullif(public.homepage_wellness_expert_settings.fallback_designation, ''), excluded.fallback_designation),
  fallback_bio = coalesce(nullif(public.homepage_wellness_expert_settings.fallback_bio, ''), excluded.fallback_bio),
  fallback_secondary_bio = coalesce(nullif(public.homepage_wellness_expert_settings.fallback_secondary_bio, ''), excluded.fallback_secondary_bio),
  fallback_image = coalesce(nullif(public.homepage_wellness_expert_settings.fallback_image, ''), excluded.fallback_image),
  trust_line = coalesce(nullif(public.homepage_wellness_expert_settings.trust_line, ''), excluded.trust_line),
  updated_at = now();

notify pgrst, 'reload schema';
