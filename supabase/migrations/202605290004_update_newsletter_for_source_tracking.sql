-- Newsletter source tracking update for SUPPRIVA.

alter table if exists public.newsletter_subscribers
  add column if not exists source_page text;

create index if not exists newsletter_subscribers_source_page_idx
on public.newsletter_subscribers (source_page);
