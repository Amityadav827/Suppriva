alter table if exists public.experts
  add column if not exists editorial_contribution text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists meta_image text;

update public.experts
set editorial_contribution = coalesce(
  editorial_contribution,
  name || ' contributes expert guidance to educational wellness content, ingredient explainers, and wellness resources published on Suppriva.' || E'\n\n' ||
  'The role focuses on improving educational quality and helping readers better understand ingredients and wellness concepts.' || E'\n\n' ||
  'Individual product rankings, affiliate partnerships, and editorial decisions remain independently managed by the Suppriva Editorial Team.'
)
where editorial_contribution is null;

update public.experts
set
  seo_title = coalesce(seo_title, name || ' | Wellness Expert | Suppriva'),
  seo_description = coalesce(
    seo_description,
    coalesce(
      short_bio,
      'Learn about ' || name || ', a wellness expert contributing educational guidance and ingredient resources at Suppriva.'
    )
  ),
  meta_image = coalesce(meta_image, profile_image)
where seo_title is null
   or seo_description is null
   or meta_image is null;

notify pgrst, 'reload schema';
