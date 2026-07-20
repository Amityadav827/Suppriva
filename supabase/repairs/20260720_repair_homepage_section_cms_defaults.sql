-- SUPPRIVA HOMEPAGE SECTION CMS DEFAULT REPAIR
-- Safe to run multiple times.
-- Ensures Homepage CMS rows are hydrated from the current frontend copy.

insert into public.homepage_sections (
  section_key,
  section_name,
  is_visible,
  sort_order,
  title,
  subtitle,
  cta_label,
  cta_url
)
values
  (
    'hero',
    'Hero',
    true,
    0,
    'Discover Wellness Solutions That Fit Your Goals',
    'Explore supplements, ingredient insights, and wellness collections designed to help you make informed health decisions with confidence.',
    'Explore Wellness Categories',
    '/category'
  ),
  (
    'health_needs',
    'Health Needs',
    true,
    1,
    'Explore By Health Needs',
    'Browse focused wellness categories curated for everyday health goals.',
    null,
    null
  ),
  (
    'popular_picks',
    'Popular Picks',
    true,
    2,
    'Popular Picks & Best Supplements',
    'A polished starting point for high-intent supplement shoppers.',
    null,
    null
  ),
  (
    'ingredients_discovery',
    'Ingredients Discovery',
    true,
    3,
    'Explore By Ingredients',
    'Discover vitamins, herbs, minerals, probiotics, adaptogens, and functional ingredients.',
    'View All Ingredients',
    '/ingredients'
  ),
  (
    'wellness_expert',
    'Wellness Expert',
    true,
    4,
    'Meet Our Wellness Expert',
    'Our educational wellness content and ingredient resources are supported by expert guidance to help readers make more informed wellness decisions.',
    'Explore Our Experts',
    '/experts'
  ),
  (
    'blogs',
    'Blogs',
    true,
    5,
    'Supplements Blog & Guides',
    'Expert wellness insights, supplement reviews & health guides.',
    'View All Blogs',
    '/blogs'
  ),
  (
    'discover_wellness_solutions',
    'Discover Wellness Solutions',
    true,
    6,
    'Discover Wellness Solutions',
    'Explore trusted supplements, ingredient-focused products, and wellness collections designed for informed choices.',
    'Explore Wellness Categories',
    '/category'
  ),
  (
    'why_choose_suppriva',
    'Why Choose Suppriva',
    true,
    7,
    'Your Wellness Journey Starts Here',
    'Explore trusted supplements, ingredient insights, wellness solutions, and expert guidance-all in one place.',
    null,
    null
  ),
  (
    'trust_badges',
    'Trust Badges',
    true,
    8,
    'Why Thousands Start Their Wellness Journey with Suppriva',
    'Discover supplements, ingredients, wellness solutions, and expert insights designed to help you make informed health decisions.',
    null,
    null
  ),
  (
    'newsletter',
    'Newsletter',
    true,
    9,
    'Stay Updated With Health & Wellness Tips',
    'Subscribe to get exclusive offers, wellness tips, and the latest supplement insights.',
    null,
    null
  )
on conflict (section_key) do update
set
  section_name = excluded.section_name,
  is_visible = coalesce(public.homepage_sections.is_visible, excluded.is_visible),
  sort_order = coalesce(public.homepage_sections.sort_order, excluded.sort_order),
  title = coalesce(nullif(public.homepage_sections.title, ''), excluded.title),
  subtitle = coalesce(nullif(public.homepage_sections.subtitle, ''), excluded.subtitle),
  cta_label = coalesce(nullif(public.homepage_sections.cta_label, ''), excluded.cta_label),
  cta_url = coalesce(nullif(public.homepage_sections.cta_url, ''), excluded.cta_url),
  updated_at = now();

notify pgrst, 'reload schema';
