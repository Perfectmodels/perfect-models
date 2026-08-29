-- Le schéma agency_erp_core est appliqué sur Supabase production via la migration du même nom.
-- Cette migration est volontairement idempotente sur les colonnes et tables afin de documenter le noyau métier.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

alter table public.models add column if not exists hair_color text;
alter table public.models add column if not exists eye_color text;
alter table public.models add column if not exists mobility text[] not null default '{}';
alter table public.models add column if not exists base_rate numeric(12,2);
alter table public.models add column if not exists rate_currency text not null default 'XAF';
alter table public.models add column if not exists agent_user_id uuid references public.profiles(user_id) on delete set null;

-- Tables créées par agency_erp_core : agency_clients, agency_contacts, castings,
-- casting_talents, model_availability, bookings, booking_options,
-- agency_calendar_events, quotes, contracts, invoices, invoice_payments,
-- image_rights, client_selections et client_selection_items.
-- La migration live contient également les contraintes, index, triggers updated_at
-- et politiques RLS. Ce fichier est complété par les migrations suivantes de la branche.
