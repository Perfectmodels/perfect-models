-- Supabase schema for Perfect Models Management
create extension if not exists pgcrypto;

create table if not exists public.migration_meta (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.migration_meta enable row level security;
revoke all on public.migration_meta from anon, authenticated;
grant all on public.migration_meta to service_role;

create table if not exists public.admin_notifications (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists admin_notifications_data_gin on public.admin_notifications using gin (data);
alter table public.admin_notifications enable row level security;
revoke all on public.admin_notifications from anon, authenticated;
grant all on public.admin_notifications to service_role;

create table if not exists public.admin_profile (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.agency_achievements (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.agency_info (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.agency_partners (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.agency_services (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.agency_timeline (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.api_keys (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.applications (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.casting_applications (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.classroom_progress (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.contact_info (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.faq_data (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.fashion_day_events (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.fashion_day_reservations (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.hero_slides (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.jury_members (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.mailing_contacts (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.miss_one_light (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.model_distinctions (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.models (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.nav_links (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.news_items (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.pages_content (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.registration_staff (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.site_config (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.site_images (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.social_links (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.testimonials (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.users (id text primary key, data jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['admin_profile','agency_achievements','agency_info','agency_partners','agency_services','agency_timeline','api_keys','applications','casting_applications','classroom_progress','contact_info','faq_data','fashion_day_events','fashion_day_reservations','hero_slides','jury_members','mailing_contacts','miss_one_light','model_distinctions','models','nav_links','news_items','pages_content','registration_staff','site_config','site_images','social_links','testimonials','users']
  LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
    EXECUTE format('revoke all on public.%I from anon, authenticated', t);
    EXECUTE format('grant all on public.%I to service_role', t);
    EXECUTE format('create index if not exists %I on public.%I using gin (data)', t || '_data_gin', t);
  END LOOP;
END $$;

create index if not exists models_name_idx on public.models ((data->>'name'));
create index if not exists models_email_idx on public.models (lower(data->>'email'));
create index if not exists models_firebase_uid_idx on public.models ((data->>'firebaseUid'));
create index if not exists users_email_idx on public.users (lower(data->>'email'));
create index if not exists users_role_idx on public.users ((data->>'role'));
create index if not exists casting_applications_email_idx on public.casting_applications (lower(data->>'email'));
create index if not exists casting_applications_status_idx on public.casting_applications ((data->>'status'));
create index if not exists mailing_contacts_email_idx on public.mailing_contacts (lower(data->>'email'));

create table if not exists public.auth_migration_map (
  firebase_uid text primary key,
  supabase_user_id uuid unique,
  email text,
  role text,
  profile_id text,
  must_change_password boolean not null default false,
  migrated_at timestamptz,
  data jsonb not null default '{}'::jsonb
);
alter table public.auth_migration_map enable row level security;
revoke all on public.auth_migration_map from anon, authenticated;
grant all on public.auth_migration_map to service_role;
