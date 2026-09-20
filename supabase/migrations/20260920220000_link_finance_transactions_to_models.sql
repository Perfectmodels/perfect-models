alter table if exists public.finance_transactions add column if not exists model_id text references public.models(id) on delete set null;
create index if not exists finance_transactions_model_id_idx on public.finance_transactions(model_id);
