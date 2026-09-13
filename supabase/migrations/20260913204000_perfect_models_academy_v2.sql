-- Perfect Models Academy v2
-- Rebuilds only the training/classroom curriculum data. Other PMM business data is untouched.

begin;

delete from public.course_progress;
delete from public.courses;

create table if not exists public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  level text not null check (level in ('foundation','technical','industry','professional','advanced')),
  position integer not null unique check (position between 1 and 10),
  pass_score integer not null default 70 check (pass_score between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_chapters (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.academy_modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null,
  objectives jsonb not null default '[]'::jsonb,
  sections jsonb not null default '[]'::jsonb,
  key_points jsonb not null default '[]'::jsonb,
  practical_exercise text,
  position integer not null check (position between 1 and 10),
  estimated_minutes integer not null default 25 check (estimated_minutes > 0),
  minimum_read_seconds integer not null default 60 check (minimum_read_seconds >= 0),
  minimum_read_percent integer not null default 90 check (minimum_read_percent between 0 and 100),
  pass_score integer not null default 70 check (pass_score between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(module_id, slug),
  unique(module_id, position)
);

create table if not exists public.academy_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.academy_chapters(id) on delete cascade,
  question_type text not null check (question_type in ('comprehension','scenario','logic','ordering','visual','calculation')),
  prompt text not null,
  choices jsonb not null,
  difficulty integer not null default 2 check (difficulty between 1 and 5),
  position integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(chapter_id, position)
);

create table if not exists public.academy_quiz_keys (
  question_id uuid primary key references public.academy_quiz_questions(id) on delete cascade,
  correct_choice text not null,
  explanation text not null
);

create table if not exists public.academy_chapter_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.academy_chapters(id) on delete cascade,
  read_percent integer not null default 0 check (read_percent between 0 and 100),
  active_seconds integer not null default 0 check (active_seconds >= 0),
  status text not null default 'not_started' check (status in ('not_started','in_progress','quiz_unlocked','passed')),
  best_score numeric(5,2),
  attempts_count integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, chapter_id)
);

create table if not exists public.academy_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.academy_chapters(id) on delete cascade,
  attempt_number integer not null check (attempt_number between 1 and 3),
  score numeric(5,2),
  passed boolean,
  incident_count integer not null default 0 check (incident_count between 0 and 3),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique(user_id, chapter_id, attempt_number)
);

create table if not exists public.academy_quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.academy_quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.academy_quiz_questions(id) on delete cascade,
  selected_choice text,
  is_correct boolean,
  response_ms integer,
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create table if not exists public.academy_certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_id uuid references public.academy_modules(id) on delete cascade,
  certificate_type text not null check (certificate_type in ('module','academy')),
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists academy_certificates_module_id_idx on public.academy_certificates(module_id);
create index if not exists academy_certificates_user_id_idx on public.academy_certificates(user_id);
create index if not exists academy_chapter_progress_chapter_id_idx on public.academy_chapter_progress(chapter_id);
create index if not exists academy_quiz_answers_question_id_idx on public.academy_quiz_answers(question_id);
create index if not exists academy_quiz_attempts_chapter_id_idx on public.academy_quiz_attempts(chapter_id);
create unique index if not exists academy_certificates_user_module_type_uidx on public.academy_certificates(user_id,module_id,certificate_type) where module_id is not null;

alter table public.academy_modules enable row level security;
alter table public.academy_chapters enable row level security;
alter table public.academy_quiz_questions enable row level security;
alter table public.academy_quiz_keys enable row level security;
alter table public.academy_chapter_progress enable row level security;
alter table public.academy_quiz_attempts enable row level security;
alter table public.academy_quiz_answers enable row level security;
alter table public.academy_certificates enable row level security;

drop policy if exists "academy modules authenticated read" on public.academy_modules;
create policy "academy modules authenticated read" on public.academy_modules for select to authenticated using (is_active);

drop policy if exists "academy chapters authenticated read" on public.academy_chapters;
create policy "academy chapters authenticated read" on public.academy_chapters for select to authenticated using (is_active);

drop policy if exists "academy questions authenticated read" on public.academy_quiz_questions;
create policy "academy questions authenticated read" on public.academy_quiz_questions for select to authenticated using (is_active);

drop policy if exists "academy quiz keys deny clients" on public.academy_quiz_keys;
create policy "academy quiz keys deny clients" on public.academy_quiz_keys for select to authenticated using (false);

drop policy if exists "academy progress own read" on public.academy_chapter_progress;
create policy "academy progress own read" on public.academy_chapter_progress for select to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role in ('admin','manager')));

drop policy if exists "academy progress own insert" on public.academy_chapter_progress;
create policy "academy progress own insert" on public.academy_chapter_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "academy progress own update" on public.academy_chapter_progress;
create policy "academy progress own update" on public.academy_chapter_progress for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "academy attempts own read" on public.academy_quiz_attempts;
create policy "academy attempts own read" on public.academy_quiz_attempts for select to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role in ('admin','manager')));

drop policy if exists "academy attempts own insert" on public.academy_quiz_attempts;
create policy "academy attempts own insert" on public.academy_quiz_attempts for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "academy answers own read" on public.academy_quiz_answers;
create policy "academy answers own read" on public.academy_quiz_answers for select to authenticated
using (exists (select 1 from public.academy_quiz_attempts a where a.id=attempt_id and (a.user_id=(select auth.uid()) or exists (select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role in ('admin','manager')))));

drop policy if exists "academy answers own insert" on public.academy_quiz_answers;
create policy "academy answers own insert" on public.academy_quiz_answers for insert to authenticated
with check (exists (select 1 from public.academy_quiz_attempts a where a.id=attempt_id and a.user_id=(select auth.uid())));

drop policy if exists "academy certificates own read" on public.academy_certificates;
create policy "academy certificates own read" on public.academy_certificates for select to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.role in ('admin','manager')));

commit;
