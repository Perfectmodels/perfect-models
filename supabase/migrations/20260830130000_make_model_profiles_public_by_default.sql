alter table public.models
  alter column is_public set default true;

update public.models
set is_public = true,
    updated_at = now()
where is_public is distinct from true;
