-- Perfect Models Management — canonical Supabase Auth profile lifecycle.
-- Authorization claims are sourced exclusively from auth.users.raw_app_meta_data.

create schema if not exists private;

create or replace function private.handle_new_pmm_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_role text;
  resolved_identifier text;
  resolved_name text;
  resolved_permissions jsonb;
begin
  resolved_role := case
    when new.raw_app_meta_data ->> 'role' in ('admin', 'manager', 'student', 'jury', 'registration', 'jury-contest')
      then new.raw_app_meta_data ->> 'role'
    when lower(coalesce(new.email, '')) in (
      'admin@perfectmodels.online',
      'contact@perfectmodels.online',
      'contact@perfectmodels.ga',
      'perfectmodels.ga@gmail.com'
    ) then 'admin'
    else 'student'
  end;

  resolved_identifier := lower(coalesce(
    nullif(trim(new.raw_app_meta_data ->> 'identifier'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    new.id::text
  ));

  if exists (
    select 1
    from public.profiles p
    where lower(p.identifier) = resolved_identifier
      and p.user_id <> new.id
  ) then
    resolved_identifier := resolved_identifier || '-' || left(new.id::text, 8);
  end if;

  resolved_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Membre PMM'
  );

  resolved_permissions := case
    when resolved_role = 'admin' then jsonb_build_object('all', true, 'isAdmin', true)
    else jsonb_build_object('isActive', true)
  end;

  insert into public.profiles (
    user_id,
    role,
    identifier,
    display_name,
    email,
    model_id,
    must_change_password,
    is_active,
    metadata,
    updated_at
  ) values (
    new.id,
    resolved_role,
    resolved_identifier,
    resolved_name,
    lower(new.email),
    case
      when resolved_role = 'student'
        and exists (
          select 1
          from public.models m
          where m.id = coalesce(new.raw_app_meta_data ->> 'model_id', new.raw_app_meta_data ->> 'profile_id')
        )
      then coalesce(new.raw_app_meta_data ->> 'model_id', new.raw_app_meta_data ->> 'profile_id')
      else null
    end,
    coalesce((new.raw_app_meta_data ->> 'must_change_password')::boolean, false),
    true,
    jsonb_build_object('permissions', resolved_permissions),
    now()
  )
  on conflict (user_id) do update set
    role = excluded.role,
    email = excluded.email,
    model_id = excluded.model_id,
    must_change_password = excluded.must_change_password,
    display_name = coalesce(nullif(public.profiles.display_name, ''), excluded.display_name),
    identifier = coalesce(nullif(public.profiles.identifier, ''), excluded.identifier),
    updated_at = now();

  return new;
end;
$$;

revoke all on function private.handle_new_pmm_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_pmm_profile on auth.users;
drop trigger if exists on_auth_user_changed_pmm_profile on auth.users;
create trigger on_auth_user_changed_pmm_profile
  after insert or update of raw_app_meta_data, raw_user_meta_data, email on auth.users
  for each row execute function private.handle_new_pmm_user();

insert into public.profiles (
  user_id,
  role,
  identifier,
  display_name,
  email,
  model_id,
  must_change_password,
  is_active,
  metadata,
  updated_at
)
select
  u.id,
  case
    when u.raw_app_meta_data ->> 'role' in ('admin', 'manager', 'student', 'jury', 'registration', 'jury-contest')
      then u.raw_app_meta_data ->> 'role'
    when lower(coalesce(u.email, '')) in (
      'admin@perfectmodels.online',
      'contact@perfectmodels.online',
      'contact@perfectmodels.ga',
      'perfectmodels.ga@gmail.com'
    ) then 'admin'
    else 'student'
  end,
  lower(coalesce(
    nullif(trim(u.raw_app_meta_data ->> 'identifier'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    u.id::text
  )),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'Membre PMM'
  ),
  lower(u.email),
  case
    when coalesce(u.raw_app_meta_data ->> 'role', 'student') = 'student'
      and exists (
        select 1
        from public.models m
        where m.id = coalesce(u.raw_app_meta_data ->> 'model_id', u.raw_app_meta_data ->> 'profile_id')
      )
    then coalesce(u.raw_app_meta_data ->> 'model_id', u.raw_app_meta_data ->> 'profile_id')
    else null
  end,
  coalesce((u.raw_app_meta_data ->> 'must_change_password')::boolean, false),
  true,
  jsonb_build_object(
    'permissions',
    case
      when coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
        or lower(coalesce(u.email, '')) in (
          'admin@perfectmodels.online',
          'contact@perfectmodels.online',
          'contact@perfectmodels.ga',
          'perfectmodels.ga@gmail.com'
        )
        then jsonb_build_object('all', true, 'isAdmin', true)
      else jsonb_build_object('isActive', true)
    end
  ),
  now()
from auth.users u
  on conflict (user_id) do update set
  role = excluded.role,
  email = excluded.email,
  model_id = excluded.model_id,
  must_change_password = excluded.must_change_password,
  display_name = coalesce(nullif(public.profiles.display_name, ''), excluded.display_name),
  identifier = coalesce(nullif(public.profiles.identifier, ''), excluded.identifier),
  updated_at = now();

alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "users update own profile" on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_staff on public.profiles;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy profiles_select_staff
  on public.profiles
  for select
  to authenticated
  using ((select public.current_app_role()) in ('admin', 'manager'));

revoke all on table public.profiles from anon;
revoke insert, update, delete, truncate, references, trigger on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;

create index if not exists profiles_email_lower_idx on public.profiles (lower(email));
create index if not exists profiles_identifier_lower_idx on public.profiles (lower(identifier));
