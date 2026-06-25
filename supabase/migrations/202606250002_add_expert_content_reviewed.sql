alter table if exists public.experts
  add column if not exists content_reviewed jsonb not null default '[]'::jsonb;

update public.experts
set content_reviewed = '[
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
]'::jsonb
where slug = 'dr-arindham-chatterjee'
  and (
    content_reviewed is null
    or content_reviewed = '[]'::jsonb
  );

notify pgrst, 'reload schema';
