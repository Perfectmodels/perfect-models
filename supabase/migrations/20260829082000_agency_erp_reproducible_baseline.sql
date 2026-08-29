-- Baseline reproductible du noyau ERP/CRM Perfect Models Management.
-- Idempotent : rejouer ce fichier sur une base possédant déjà les migrations live est sans effet destructif.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.models add column if not exists hair_color text;
alter table public.models add column if not exists eye_color text;
alter table public.models add column if not exists mobility text[] not null default '{}';
alter table public.models add column if not exists base_rate numeric(12,2);
alter table public.models add column if not exists rate_currency text not null default 'XAF';
alter table public.models add column if not exists agent_user_id uuid references public.profiles(user_id) on delete set null;
alter table public.models add column if not exists height_cm numeric(6,2);
alter table public.models add column if not exists chest_cm numeric(6,2);
alter table public.models add column if not exists waist_cm numeric(6,2);
alter table public.models add column if not exists hips_cm numeric(6,2);
alter table public.models add column if not exists shoe_size text;

create table if not exists public.agency_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_type text not null default 'brand',
  industry text,
  status text not null default 'active',
  website_url text,
  billing_email text,
  billing_phone text,
  address text,
  city text,
  country text not null default 'Gabon',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.agency_clients(id) on delete cascade,
  first_name text,
  last_name text,
  role_title text,
  email text,
  phone text,
  is_primary boolean not null default false,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.castings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.agency_clients(id) on delete set null,
  title text not null,
  project_type text not null default 'fashion',
  brief text,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  budget numeric(12,2),
  currency text not null default 'XAF',
  gender_requirement text,
  age_min integer,
  age_max integer,
  height_min_cm numeric(6,2),
  height_max_cm numeric(6,2),
  hair_colors text[] not null default '{}',
  eye_colors text[] not null default '{}',
  categories text[] not null default '{}',
  requested_talents integer,
  documents jsonb not null default '[]'::jsonb,
  internal_notes text,
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.casting_talents (
  id uuid primary key default gen_random_uuid(),
  casting_id uuid not null references public.castings(id) on delete cascade,
  model_id text not null references public.models(id) on delete cascade,
  stage text not null default 'invited',
  match_score numeric(5,2),
  invited_at timestamptz,
  responded_at timestamptz,
  attended_at timestamptz,
  client_feedback text,
  internal_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(casting_id, model_id)
);

create table if not exists public.model_availability (
  id uuid primary key default gen_random_uuid(),
  model_id text not null references public.models(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'available',
  reason text,
  source text not null default 'agency',
  created_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid references public.booking_requests(id) on delete set null,
  casting_id uuid references public.castings(id) on delete set null,
  client_id uuid references public.agency_clients(id) on delete set null,
  model_id text not null references public.models(id) on delete restrict,
  title text not null,
  project_type text not null default 'fashion',
  status text not null default 'option',
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  fee_gross numeric(12,2),
  currency text not null default 'XAF',
  agency_commission_rate numeric(5,2) not null default 20,
  agency_commission_amount numeric(12,2),
  model_net_amount numeric(12,2),
  travel_expenses numeric(12,2) not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_options (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  client_id uuid references public.agency_clients(id) on delete set null,
  model_id text not null references public.models(id) on delete cascade,
  title text not null,
  option_rank integer not null default 1,
  status text not null default 'active',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  amount numeric(12,2),
  currency text not null default 'XAF',
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agency_calendar_events (
  id uuid primary key default gen_random_uuid(),
  model_id text references public.models(id) on delete cascade,
  casting_id uuid references public.castings(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  option_id uuid references public.booking_options(id) on delete cascade,
  event_type text not null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.agency_clients(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete set null,
  quote_number text not null unique,
  status text not null default 'draft',
  issued_at date not null default current_date,
  valid_until date,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'XAF',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.agency_clients(id) on delete set null,
  model_id text references public.models(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  contract_type text not null default 'booking',
  title text not null,
  status text not null default 'draft',
  document_url text,
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  expires_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.agency_clients(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  invoice_number text not null unique,
  status text not null default 'draft',
  issued_at date not null default current_date,
  due_at date,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_paid numeric(12,2) not null default 0,
  currency text not null default 'XAF',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  paid_at timestamptz not null default now(),
  payment_method text,
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.image_rights (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  client_id uuid references public.agency_clients(id) on delete set null,
  model_id text not null references public.models(id) on delete cascade,
  campaign text not null,
  territory text[] not null default '{}',
  usage_channels text[] not null default '{}',
  starts_on date not null,
  ends_on date not null,
  status text not null default 'active',
  rights_fee numeric(12,2),
  currency text not null default 'XAF',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_selections (
  id uuid primary key default gen_random_uuid(),
  casting_id uuid references public.castings(id) on delete set null,
  client_id uuid references public.agency_clients(id) on delete set null,
  title text not null,
  public_token uuid not null default gen_random_uuid() unique,
  status text not null default 'active',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_selection_items (
  id uuid primary key default gen_random_uuid(),
  selection_id uuid not null references public.client_selections(id) on delete cascade,
  model_id text not null references public.models(id) on delete cascade,
  decision text not null default 'pending',
  client_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(selection_id, model_id)
);

alter table public.messages add column if not exists client_id uuid;
alter table public.messages add column if not exists casting_id uuid;
alter table public.messages add column if not exists booking_id uuid;
alter table public.messages add column if not exists invoice_id uuid;

do $$ begin
  if not exists(select 1 from pg_constraint where conname='messages_client_id_fkey') then alter table public.messages add constraint messages_client_id_fkey foreign key(client_id) references public.agency_clients(id) on delete set null; end if;
  if not exists(select 1 from pg_constraint where conname='messages_casting_id_fkey') then alter table public.messages add constraint messages_casting_id_fkey foreign key(casting_id) references public.castings(id) on delete set null; end if;
  if not exists(select 1 from pg_constraint where conname='messages_booking_id_fkey') then alter table public.messages add constraint messages_booking_id_fkey foreign key(booking_id) references public.bookings(id) on delete set null; end if;
  if not exists(select 1 from pg_constraint where conname='messages_invoice_id_fkey') then alter table public.messages add constraint messages_invoice_id_fkey foreign key(invoice_id) references public.invoices(id) on delete set null; end if;
end $$;

create index if not exists agency_contacts_client_id_idx on public.agency_contacts(client_id);
create index if not exists castings_client_id_idx on public.castings(client_id);
create index if not exists castings_created_by_idx on public.castings(created_by);
create index if not exists castings_status_starts_at_idx on public.castings(status, starts_at);
create index if not exists casting_talents_casting_stage_idx on public.casting_talents(casting_id, stage);
create index if not exists casting_talents_model_id_idx on public.casting_talents(model_id);
create index if not exists model_availability_model_dates_idx on public.model_availability(model_id, starts_at, ends_at);
create index if not exists model_availability_created_by_idx on public.model_availability(created_by);
create index if not exists bookings_booking_request_id_idx on public.bookings(booking_request_id);
create index if not exists bookings_casting_id_idx on public.bookings(casting_id);
create index if not exists bookings_client_id_idx on public.bookings(client_id);
create index if not exists bookings_model_dates_idx on public.bookings(model_id, starts_at, ends_at);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists booking_options_booking_id_idx on public.booking_options(booking_id);
create index if not exists booking_options_client_id_idx on public.booking_options(client_id);
create index if not exists booking_options_model_dates_idx on public.booking_options(model_id, starts_at, ends_at) where status='active';
create index if not exists booking_options_expires_at_idx on public.booking_options(expires_at) where status='active';
create index if not exists agency_calendar_events_casting_id_idx on public.agency_calendar_events(casting_id);
create index if not exists calendar_events_dates_idx on public.agency_calendar_events(starts_at, ends_at);
create index if not exists calendar_events_model_id_idx on public.agency_calendar_events(model_id);
create unique index if not exists calendar_booking_unique_idx on public.agency_calendar_events(booking_id,event_type) where booking_id is not null and event_type='booking';
create unique index if not exists calendar_option_unique_idx on public.agency_calendar_events(option_id,event_type) where option_id is not null and event_type='option';
create index if not exists quotes_client_id_idx on public.quotes(client_id);
create index if not exists quotes_booking_id_idx on public.quotes(booking_id);
create index if not exists contracts_client_id_idx on public.contracts(client_id);
create index if not exists contracts_booking_id_idx on public.contracts(booking_id);
create index if not exists contracts_model_id_idx on public.contracts(model_id);
create index if not exists contracts_expires_at_idx on public.contracts(expires_at);
create index if not exists invoices_booking_id_idx on public.invoices(booking_id);
create index if not exists invoices_quote_id_idx on public.invoices(quote_id);
create index if not exists invoices_client_due_idx on public.invoices(client_id,due_at);
create index if not exists invoices_status_due_idx on public.invoices(status,due_at);
create index if not exists invoice_payments_invoice_id_idx on public.invoice_payments(invoice_id);
create index if not exists image_rights_booking_id_idx on public.image_rights(booking_id);
create index if not exists image_rights_client_id_idx on public.image_rights(client_id);
create index if not exists image_rights_model_id_idx on public.image_rights(model_id);
create index if not exists image_rights_ends_on_idx on public.image_rights(ends_on) where status in ('active','expiring');
create index if not exists client_selections_casting_id_idx on public.client_selections(casting_id);
create index if not exists client_selections_client_id_idx on public.client_selections(client_id);
create index if not exists client_selection_items_selection_idx on public.client_selection_items(selection_id);
create index if not exists client_selection_items_model_id_idx on public.client_selection_items(model_id);
create index if not exists messages_client_id_idx on public.messages(client_id);
create index if not exists messages_casting_id_idx on public.messages(casting_id);
create index if not exists messages_booking_id_idx on public.messages(booking_id);
create index if not exists messages_invoice_id_idx on public.messages(invoice_id);
create index if not exists models_height_cm_idx on public.models(height_cm) where is_active=true;
create index if not exists models_hair_eye_idx on public.models(hair_color,eye_color) where is_active=true;
create index if not exists models_talent_search_idx on public.models(gender,age,location) where is_active=true;
create index if not exists models_agent_user_id_idx on public.models(agent_user_id);

create or replace function public.compute_booking_financials()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  if new.fee_gross is not null then
    new.agency_commission_amount := round((new.fee_gross * coalesce(new.agency_commission_rate,0) / 100.0)::numeric, 2);
    new.model_net_amount := round((new.fee_gross - new.agency_commission_amount)::numeric, 2);
  end if;
  return new;
end;
$$;

create or replace function public.sync_booking_calendar()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  if new.starts_at is null or new.ends_at is null then return new; end if;
  if new.status in ('confirmed','in_production') then
    insert into public.agency_calendar_events(model_id,booking_id,event_type,title,starts_at,ends_at,location,status)
    values(new.model_id,new.id,'booking',new.title,new.starts_at,new.ends_at,new.location,'active') on conflict do nothing;
    update public.agency_calendar_events set model_id=new.model_id,title=new.title,starts_at=new.starts_at,ends_at=new.ends_at,location=new.location,status='active',updated_at=now() where booking_id=new.id and event_type='booking';
  elsif new.status in ('completed','cancelled') then
    update public.agency_calendar_events set status=case when new.status='completed' then 'completed' else 'cancelled' end,updated_at=now() where booking_id=new.id and event_type='booking';
  end if;
  return new;
end;
$$;

create or replace function public.sync_option_calendar()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  if new.status='active' then
    insert into public.agency_calendar_events(model_id,option_id,event_type,title,starts_at,ends_at,status)
    values(new.model_id,new.id,'option',new.title,new.starts_at,new.ends_at,'tentative') on conflict do nothing;
    update public.agency_calendar_events set model_id=new.model_id,title=new.title,starts_at=new.starts_at,ends_at=new.ends_at,status='tentative',updated_at=now() where option_id=new.id and event_type='option';
  else
    update public.agency_calendar_events set status=case when new.status='confirmed' then 'active' else 'cancelled' end,updated_at=now() where option_id=new.id and event_type='option';
  end if;
  return new;
end;
$$;

create or replace function public.recalculate_invoice_payment()
returns trigger language plpgsql set search_path to 'public' as $$
declare target uuid; declare paid numeric; declare invoice_total numeric;
begin
  target := coalesce(new.invoice_id, old.invoice_id);
  select coalesce(sum(amount),0) into paid from public.invoice_payments where invoice_id=target;
  select total into invoice_total from public.invoices where id=target;
  update public.invoices set amount_paid=paid,status=case when paid>=coalesce(invoice_total,0) and coalesce(invoice_total,0)>0 then 'paid' when paid>0 then 'partial' else status end,updated_at=now() where id=target;
  return coalesce(new,old);
end;
$$;

create or replace function public.sync_model_legacy_fields_to_professional()
returns trigger language plpgsql set search_path to 'public' as $$
declare raw_height text;
begin
  if new.height_cm is null then
    raw_height := regexp_replace(coalesce(new.height,''), '[^0-9.,]', '', 'g');
    if raw_height ~ '^[0-9]+([.,][0-9]+)?$' then new.height_cm := replace(raw_height,',','.')::numeric; end if;
  end if;
  if new.chest_cm is null and coalesce(new.measurements->>'chest','') ~ '^[0-9]+([.,][0-9]+)?' then new.chest_cm := replace(regexp_replace(new.measurements->>'chest','[^0-9.,]','','g'),',','.')::numeric; end if;
  if new.waist_cm is null and coalesce(new.measurements->>'waist','') ~ '^[0-9]+([.,][0-9]+)?' then new.waist_cm := replace(regexp_replace(new.measurements->>'waist','[^0-9.,]','','g'),',','.')::numeric; end if;
  if new.hips_cm is null and coalesce(new.measurements->>'hips','') ~ '^[0-9]+([.,][0-9]+)?' then new.hips_cm := replace(regexp_replace(new.measurements->>'hips','[^0-9.,]','','g'),',','.')::numeric; end if;
  new.shoe_size := coalesce(new.shoe_size, nullif(new.measurements->>'shoeSize',''));
  new.eye_color := coalesce(new.eye_color, nullif(new.measurements->>'eyeColor',''));
  new.hair_color := coalesce(new.hair_color, nullif(new.measurements->>'hairColor',''));
  return new;
end;
$$;

create or replace function public.sync_model_professional_fields()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  new.measurements := coalesce(new.measurements,'{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object('chest',new.chest_cm,'waist',new.waist_cm,'hips',new.hips_cm,'shoeSize',new.shoe_size,'eyeColor',new.eye_color,'hairColor',new.hair_color));
  if new.height_cm is not null then new.height := trim(to_char(new.height_cm,'FM999D99')) || ' cm'; end if;
  return new;
end;
$$;

create or replace function public.automate_confirmed_booking()
returns trigger language plpgsql set search_path to 'public' as $$
declare model_user uuid; declare invoice_ref text;
begin
  if new.status <> 'confirmed' or (tg_op='UPDATE' and old.status='confirmed') then return new; end if;
  if not exists(select 1 from public.contracts where booking_id=new.id and contract_type='booking') then
    insert into public.contracts(client_id,model_id,booking_id,contract_type,title,status,metadata) values(new.client_id,new.model_id,new.id,'booking','Booking agreement · '||new.title,'draft',jsonb_build_object('generated_by','confirmed_booking'));
  end if;
  if new.client_id is not null and not exists(select 1 from public.invoices where booking_id=new.id) then
    invoice_ref := 'INV-'||to_char(current_date,'YYYY')||'-'||upper(substr(replace(new.id::text,'-',''),1,8));
    insert into public.invoices(client_id,booking_id,invoice_number,status,issued_at,due_at,subtotal,tax_amount,total,amount_paid,currency,metadata) values(new.client_id,new.id,invoice_ref,'draft',current_date,current_date+30,coalesce(new.fee_gross,0),0,coalesce(new.fee_gross,0),0,new.currency,jsonb_build_object('generated_by','confirmed_booking')) on conflict(invoice_number) do nothing;
  end if;
  select auth_user_id into model_user from public.models where id=new.model_id;
  if model_user is not null then insert into public.notifications(recipient_user_id,audience_role,type,title,body,href,is_read,metadata) values(model_user,'student','booking','Booking confirmé',new.title,'/profil/agency',false,jsonb_build_object('booking_id',new.id,'source','erp_automation')); end if;
  return new;
end;
$$;

do $$ declare t text; begin
  foreach t in array array['agency_clients','agency_contacts','castings','casting_talents','model_availability','bookings','booking_options','agency_calendar_events','quotes','contracts','invoices','image_rights','client_selections','client_selection_items'] loop
    execute format('drop trigger if exists %I_set_updated_at on public.%I', t, t);
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

drop trigger if exists bookings_compute_financials on public.bookings;
create trigger bookings_compute_financials before insert or update on public.bookings for each row execute function public.compute_booking_financials();
drop trigger if exists bookings_sync_calendar on public.bookings;
create trigger bookings_sync_calendar after insert or update on public.bookings for each row execute function public.sync_booking_calendar();
drop trigger if exists booking_options_sync_calendar on public.booking_options;
create trigger booking_options_sync_calendar after insert or update on public.booking_options for each row execute function public.sync_option_calendar();
drop trigger if exists invoice_payments_recalculate on public.invoice_payments;
create trigger invoice_payments_recalculate after insert or update or delete on public.invoice_payments for each row execute function public.recalculate_invoice_payment();
drop trigger if exists bookings_confirmed_workflow on public.bookings;
create trigger bookings_confirmed_workflow after insert or update on public.bookings for each row execute function public.automate_confirmed_booking();
drop trigger if exists models_sync_legacy_to_professional on public.models;
create trigger models_sync_legacy_to_professional before insert or update on public.models for each row execute function public.sync_model_legacy_fields_to_professional();
drop trigger if exists models_sync_professional_fields on public.models;
create trigger models_sync_professional_fields before insert or update on public.models for each row execute function public.sync_model_professional_fields();

alter table public.agency_clients enable row level security;
alter table public.agency_contacts enable row level security;
alter table public.castings enable row level security;
alter table public.casting_talents enable row level security;
alter table public.model_availability enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_options enable row level security;
alter table public.agency_calendar_events enable row level security;
alter table public.quotes enable row level security;
alter table public.contracts enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_payments enable row level security;
alter table public.image_rights enable row level security;
alter table public.client_selections enable row level security;
alter table public.client_selection_items enable row level security;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='agency_clients' and policyname='agency_clients_direct_deny') then create policy agency_clients_direct_deny on public.agency_clients for all to anon, authenticated using(false) with check(false); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='agency_contacts' and policyname='agency_contacts_direct_deny') then create policy agency_contacts_direct_deny on public.agency_contacts for all to anon, authenticated using(false) with check(false); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='castings' and policyname='castings_direct_deny') then create policy castings_direct_deny on public.castings for all to anon, authenticated using(false) with check(false); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='quotes' and policyname='quotes_direct_deny') then create policy quotes_direct_deny on public.quotes for all to anon, authenticated using(false) with check(false); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='invoices' and policyname='invoices_direct_deny') then create policy invoices_direct_deny on public.invoices for all to anon, authenticated using(false) with check(false); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='invoice_payments' and policyname='invoice_payments_direct_deny') then create policy invoice_payments_direct_deny on public.invoice_payments for all to anon, authenticated using(false) with check(false); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='client_selections' and policyname='client_selections_direct_deny') then create policy client_selections_direct_deny on public.client_selections for all to anon, authenticated using(false) with check(false); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='client_selection_items' and policyname='client_selection_items_direct_deny') then create policy client_selection_items_direct_deny on public.client_selection_items for all to anon, authenticated using(false) with check(false); end if;
end $$;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='casting_talents' and policyname='casting_talents_owner_read') then create policy casting_talents_owner_read on public.casting_talents for select to authenticated using(exists(select 1 from public.models m where m.id=casting_talents.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='bookings' and policyname='bookings_owner_read') then create policy bookings_owner_read on public.bookings for select to authenticated using(exists(select 1 from public.models m where m.id=bookings.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='booking_options' and policyname='booking_options_owner_read') then create policy booking_options_owner_read on public.booking_options for select to authenticated using(exists(select 1 from public.models m where m.id=booking_options.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='agency_calendar_events' and policyname='calendar_events_owner_read') then create policy calendar_events_owner_read on public.agency_calendar_events for select to authenticated using(model_id is not null and exists(select 1 from public.models m where m.id=agency_calendar_events.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='contracts' and policyname='contracts_owner_read') then create policy contracts_owner_read on public.contracts for select to authenticated using(model_id is not null and exists(select 1 from public.models m where m.id=contracts.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='image_rights' and policyname='image_rights_owner_read') then create policy image_rights_owner_read on public.image_rights for select to authenticated using(exists(select 1 from public.models m where m.id=image_rights.model_id and m.auth_user_id=(select auth.uid()))); end if;
end $$;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='model_availability' and policyname='model_availability_owner_read') then create policy model_availability_owner_read on public.model_availability for select to authenticated using(exists(select 1 from public.models m where m.id=model_availability.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='model_availability' and policyname='model_availability_owner_insert') then create policy model_availability_owner_insert on public.model_availability for insert to authenticated with check(source='model' and exists(select 1 from public.models m where m.id=model_availability.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='model_availability' and policyname='model_availability_owner_update') then create policy model_availability_owner_update on public.model_availability for update to authenticated using(source='model' and exists(select 1 from public.models m where m.id=model_availability.model_id and m.auth_user_id=(select auth.uid()))) with check(source='model' and exists(select 1 from public.models m where m.id=model_availability.model_id and m.auth_user_id=(select auth.uid()))); end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='model_availability' and policyname='model_availability_owner_delete') then create policy model_availability_owner_delete on public.model_availability for delete to authenticated using(source='model' and exists(select 1 from public.models m where m.id=model_availability.model_id and m.auth_user_id=(select auth.uid()))); end if;
end $$;
