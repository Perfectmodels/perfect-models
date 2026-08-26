create or replace function public.scrub_profile_passwords()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.data := coalesce(new.data, '{}'::jsonb)
    - 'password'
    - 'temporaryPassword'
    - 'temporary_password'
    - 'currentPassword'
    - 'current_password';
  return new;
end;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['models','users','user_profiles','auth_profiles']
  LOOP
    EXECUTE format('update public.%I set data = data - ''password'' - ''temporaryPassword'' - ''temporary_password'' - ''currentPassword'' - ''current_password''', t);
    EXECUTE format('drop trigger if exists scrub_profile_passwords_before_write on public.%I', t);
    EXECUTE format('create trigger scrub_profile_passwords_before_write before insert or update on public.%I for each row execute function public.scrub_profile_passwords()', t);
  END LOOP;
END $$;

revoke execute on function public.scrub_profile_passwords() from public, anon, authenticated;
grant execute on function public.scrub_profile_passwords() to service_role;
