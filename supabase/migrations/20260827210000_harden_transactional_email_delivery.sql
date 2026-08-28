-- Perfect Models Management — retry-safe transactional email delivery.

alter table public.email_delivery_log
  add column if not exists idempotency_key text,
  add column if not exists attempt_count integer not null default 1,
  add column if not exists last_attempt_at timestamptz not null default now();

alter table public.email_delivery_log
  drop constraint if exists email_delivery_log_attempt_count_check;

alter table public.email_delivery_log
  add constraint email_delivery_log_attempt_count_check
  check (attempt_count between 1 and 20);

create unique index if not exists email_delivery_log_idempotency_key_idx
  on public.email_delivery_log (idempotency_key)
  where idempotency_key is not null;

create index if not exists email_delivery_log_status_created_at_idx
  on public.email_delivery_log (status, created_at desc);

create index if not exists email_delivery_log_recipient_created_at_idx
  on public.email_delivery_log (lower(recipient_email), created_at desc);

alter table public.email_delivery_log enable row level security;
revoke all on table public.email_delivery_log from anon, authenticated;
