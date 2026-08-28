-- Keep a single permissive SELECT policy so Postgres evaluates one predicate.

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_staff on public.profiles;

create policy profiles_select_self_or_staff
  on public.profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.current_app_role()) in ('admin', 'manager')
  );
