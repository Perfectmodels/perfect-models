DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'seo_config','articles','course_data','gallery','gallery_albums','fashion_day_applications','contact_messages','booking_requests','recovery_requests',
    'article_comments','forum_replies','absences','monthly_payments','photoshoot_briefs','forum_threads','beauty_contests','admin_permissions',
    'classroom_requests','classroom_messages','user_profiles','auth_profiles'
  ]
  LOOP
    EXECUTE format('create table if not exists public.%I (id text primary key, data jsonb not null default ''{}''::jsonb, position bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now())', t);
    EXECUTE format('alter table public.%I enable row level security', t);
    EXECUTE format('revoke all on public.%I from anon, authenticated', t);
    EXECUTE format('grant all on public.%I to service_role', t);
    EXECUTE format('create index if not exists %I on public.%I using gin (data)', t || '_data_gin', t);
    EXECUTE format('create index if not exists %I on public.%I(position)', t || '_position_idx', t);
  END LOOP;
END $$;
