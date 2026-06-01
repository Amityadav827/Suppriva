-- SUPPRIVA AUTH INTEGRATION SQL
-- Execute after the core schema and RLS policy package.
-- This keeps public.users synchronized with Supabase Auth signups.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    'user'::public.user_role,
    'active'::public.user_status
  )
  on conflict (email) do update
  set
    full_name = excluded.full_name,
    status = 'active'::public.user_status,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
on public.users
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'user'::public.user_role
  and status = 'active'::public.user_status
);

select trigger_name, event_object_schema, event_object_table
from information_schema.triggers
where trigger_schema = 'auth'
  and trigger_name = 'on_auth_user_created';
