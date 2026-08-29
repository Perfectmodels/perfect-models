import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };
const typeMap: Record<string,string> = { 'shooting photo':'commercial', 'défilé de mode':'runway', 'publicité / campagne':'commercial', 'vidéo / audiovisuel':'commercial', 'événement / accueil':'commercial', 'essayage / showroom':'fashion', 'influence / contenu digital':'influence' };

export async function POST(_request: Request, context: Context) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'bookings')) return NextResponse.json({ error: 'Accès booking requis.' }, { status: 403 });
  const { id } = await context.params;
  const supabase = createSupabaseAdminClient() as any;
  const { data: requestRow, error } = await supabase.from('booking_requests').select('*').eq('id', id).maybeSingle();
  if (error || !requestRow) return NextResponse.json({ error: 'Demande introuvable.' }, { status: 404 });
  if (!requestRow.model_id) return NextResponse.json({ error: 'La demande doit être rattachée à un mannequin avant conversion.' }, { status: 409 });
  const { data: existing } = await supabase.from('bookings').select('id').eq('booking_request_id', id).maybeSingle();
  if (existing?.id) return NextResponse.json({ error: 'Cette demande a déjà été convertie.', bookingId: existing.id }, { status: 409 });
  const raw = requestRow.raw_data || {};
  const company = String(raw.clientCompany || '').trim();
  let clientId: string | null = null;
  if (company) {
    const { data: found } = await supabase.from('agency_clients').select('id').ilike('name', company).limit(1).maybeSingle();
    if (found?.id) clientId = String(found.id);
    else {
      const { data: created, error: clientError } = await supabase.from('agency_clients').insert({ name: company, client_type: 'brand', status: 'lead', billing_email: requestRow.email || null, billing_phone: requestRow.phone || null, notes: `Créé automatiquement depuis la demande de booking ${id}` }).select('id').single();
      if (clientError) return NextResponse.json({ error: clientError.message }, { status: 400 });
      clientId = String(created.id);
    }
  }
  const startDate = String(raw.startDate || '').slice(0,10); const endDate = String(raw.endDate || raw.startDate || '').slice(0,10);
  const startsAt = startDate ? `${startDate}T09:00:00+01:00` : null; const endsAt = endDate ? `${endDate}T18:00:00+01:00` : null;
  const projectLabel = String(raw.projectType || 'Booking');
  const { data: booking, error: bookingError } = await supabase.from('bookings').insert({ booking_request_id: id, client_id: clientId, model_id: requestRow.model_id, title: `${projectLabel}${company ? ` · ${company}` : ''}`, project_type: typeMap[projectLabel.toLowerCase()] || 'other', status: 'option', starts_at: startsAt, ends_at: endsAt, notes: String(raw.message || '') || null, metadata: { intake: raw, contact_name: requestRow.name, contact_email: requestRow.email } }).select('*').single();
  if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 400 });
  if (startsAt && endsAt) await supabase.from('booking_options').insert({ booking_id: booking.id, client_id: clientId, model_id: requestRow.model_id, title: booking.title, option_rank: 1, status: 'active', starts_at: startsAt, ends_at: endsAt, notes: 'Option créée automatiquement lors de la conversion de la demande.' });
  await supabase.from('booking_requests').update({ status: 'converted' }).eq('id', id);
  return NextResponse.json({ success: true, bookingId: booking.id, clientId }, { status: 201 });
}
