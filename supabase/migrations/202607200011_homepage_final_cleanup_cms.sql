-- SUPPRIVA HOMEPAGE CMS FINAL CLEANUP
-- Safe to run multiple times.
-- Adds the remaining editable homepage copy fields identified in the final CMS audit.

alter table if exists public.homepage_newsletter_settings
  add column if not exists form_badge_text text not null default 'Join the list',
  add column if not exists form_heading text not null default 'Get smarter supplement picks in your inbox.',
  add column if not exists form_description text not null default 'Curated guides, premium offers, and wellness insights. Built for clarity, not inbox clutter.',
  add column if not exists email_label text not null default 'Email address',
  add column if not exists loading_text text not null default 'Subscribing...',
  add column if not exists privacy_text text not null default 'Privacy protected',
  add column if not exists no_spam_text text not null default 'No spam, unsubscribe anytime';

update public.homepage_newsletter_settings
set
  form_badge_text = coalesce(nullif(form_badge_text, ''), 'Join the list'),
  form_heading = coalesce(nullif(form_heading, ''), 'Get smarter supplement picks in your inbox.'),
  form_description = coalesce(nullif(form_description, ''), 'Curated guides, premium offers, and wellness insights. Built for clarity, not inbox clutter.'),
  email_label = coalesce(nullif(email_label, ''), 'Email address'),
  loading_text = coalesce(nullif(loading_text, ''), 'Subscribing...'),
  privacy_text = coalesce(nullif(privacy_text, ''), 'Privacy protected'),
  no_spam_text = coalesce(nullif(no_spam_text, ''), 'No spam, unsubscribe anytime'),
  updated_at = now()
where id = 'home';

alter table if exists public.homepage_wellness_solutions_settings
  add column if not exists bottom_description text not null default 'Explore wellness products organized by health goals, ingredients, and lifestyle needs.';

update public.homepage_wellness_solutions_settings
set
  bottom_description = coalesce(nullif(bottom_description, ''), 'Explore wellness products organized by health goals, ingredients, and lifestyle needs.'),
  updated_at = now()
where id = 'home';

notify pgrst, 'reload schema';
