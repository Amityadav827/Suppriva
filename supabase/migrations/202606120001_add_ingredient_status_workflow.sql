-- Adds publish workflow support to the ingredients library without breaking
-- existing ingredient records. Legacy rows are backfilled to published only
-- the first time this migration runs so the current public library stays live.

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ingredients'
      and column_name = 'status'
  ) then
    alter table public.ingredients
      add column status public.content_status not null default 'draft';

    update public.ingredients
    set status = 'published'::public.content_status
    where deleted_at is null;
  end if;
end $$;

create index if not exists ingredients_status_idx
  on public.ingredients (status);
