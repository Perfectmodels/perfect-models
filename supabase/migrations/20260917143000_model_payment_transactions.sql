-- Model payment declaration and administrative validation workflow.
-- The production data backfill is intentionally not included here: this migration
-- only versions the reusable schema and indexes.

alter table public.monthly_payments
  drop constraint if exists monthly_payments_model_id_period_key;

alter table public.monthly_payments
  add column if not exists transaction_type text not null default 'membership_package',
  add column if not exists payment_method text,
  add column if not exists reference text,
  add column if not exists proof_url text,
  add column if not exists submitted_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists submitted_at timestamptz not null default now(),
  add column if not exists validation_notes text,
  add column if not exists validated_at timestamptz,
  add column if not exists validated_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

update public.monthly_payments
set status = case
  when status in ('paid', 'approved', 'confirmed') then 'validated'
  when status in ('failed', 'cancelled') then 'rejected'
  when status in ('pending', 'validated', 'rejected') then status
  else 'pending'
end
where status is null or status not in ('pending', 'validated', 'rejected');

alter table public.monthly_payments alter column status set default 'pending';
alter table public.monthly_payments alter column status set not null;
alter table public.monthly_payments alter column amount set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'monthly_payments_status_check'
      and conrelid = 'public.monthly_payments'::regclass
  ) then
    alter table public.monthly_payments
      add constraint monthly_payments_status_check
      check (status in ('pending', 'validated', 'rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'monthly_payments_amount_positive_check'
      and conrelid = 'public.monthly_payments'::regclass
  ) then
    alter table public.monthly_payments
      add constraint monthly_payments_amount_positive_check
      check (amount > 0);
  end if;
end $$;

create index if not exists monthly_payments_model_period_idx
  on public.monthly_payments (model_id, period desc);

create index if not exists monthly_payments_status_created_idx
  on public.monthly_payments (status, created_at desc);

create index if not exists monthly_payments_reference_idx
  on public.monthly_payments (reference)
  where reference is not null;
