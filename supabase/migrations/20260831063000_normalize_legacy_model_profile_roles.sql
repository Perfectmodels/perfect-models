-- Keep legacy model-role aliases compatible with the current authorization model.
-- Mannequin accounts use the `student` app role throughout PMM.
create or replace function private.normalize_pmm_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role in ('model', 'mannequin', 'talent') then
    new.role := 'student';
  end if;
  return new;
end;
$$;

drop trigger if exists normalize_pmm_profile_role on public.profiles;
create trigger normalize_pmm_profile_role
before insert or update of role on public.profiles
for each row execute function private.normalize_pmm_profile_role();
