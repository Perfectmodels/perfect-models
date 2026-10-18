-- PMM anonymous survey. The database stores no respondent identity, IP address or browser identifier.
create table if not exists public.agency_survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  answers jsonb not null default '{}'::jsonb,
  private_comments jsonb not null default '{}'::jsonb,
  public_comments jsonb not null default '{}'::jsonb,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected','none')),
  moderated_at timestamptz,
  constraint survey_answers_object check (jsonb_typeof(answers) = 'object'),
  constraint survey_comments_object check (jsonb_typeof(private_comments) = 'object'),
  constraint survey_public_comments_object check (jsonb_typeof(public_comments) = 'object')
);
create index if not exists agency_survey_responses_created_idx on public.agency_survey_responses (created_at desc);
create index if not exists agency_survey_responses_moderation_idx on public.agency_survey_responses (moderation_status);
alter table public.agency_survey_responses enable row level security;
revoke all on public.agency_survey_responses from PUBLIC, anon, authenticated;
grant all on public.agency_survey_responses to service_role;
comment on table public.agency_survey_responses is 'Sondage anonyme PMM : aucune identité, email, IP, empreinte ou session stockée. Lecture/écriture exclusivement côté serveur.';
