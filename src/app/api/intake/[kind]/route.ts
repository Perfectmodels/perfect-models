import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { notifyIntakeSubmission } from '@/lib/email/server';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ kind: string }> };

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}
function text(value: unknown, max = 500) { return String(value ?? '').trim().slice(0, max); }
function email(value: unknown) {
  const valueText = text(value, 160).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueText) ? valueText : '';
}
function number(value: unknown) {
  const parsed = Number(String(value ?? '').replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}
function imgbb(value: string) {
  if (!value) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'i.ibb.co'; } catch { return false; }
}

export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const { kind } = await context.params;
  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;

  let table = '';
  let row: Record<string, unknown> = {};
  let notificationType = kind;
  let notificationTitle = 'Nouvelle demande';
  let legacyEmailKey = '';

  if (kind === 'casting') {
    const firstName = text(raw.firstName, 80);
    const lastName = text(raw.lastName, 80);
    const userEmail = email(raw.email);
    const phone = text(raw.phone, 40);
    const birthDate = text(raw.birthDate, 10);
    const height = number(raw.height);
    const portrait = text(raw.photoPortraitUrl, 700);
    const fullBody = text(raw.photoFullBodyUrl, 700);
    const profile = text(raw.photoProfileUrl, 700);
    const photos = [profile, portrait, fullBody].filter(Boolean);
    if (!firstName || !lastName || !userEmail || !phone || !birthDate || !height || !photos.length) {
      return NextResponse.json({ error: 'Champs obligatoires incomplets.' }, { status: 400 });
    }
    if (!photos.every(imgbb)) return NextResponse.json({ error: 'Les photos doivent provenir du service d’images autorisé.' }, { status: 400 });
    table = 'casting_applications';
    row = {
      legacy_id: crypto.randomUUID(), full_name: `${firstName} ${lastName}`, first_name: firstName, last_name: lastName,
      email: userEmail, phone, gender: text(raw.gender, 20) || null, birth_date: birthDate, city: text(raw.city, 80) || null,
      height_cm: height, status: 'Nouveau', photos,
      measurements: { hips: text(raw.hips, 20), chest: text(raw.chest, 20), waist: text(raw.waist, 20), weight: text(raw.weight, 20), shoeSize: text(raw.shoeSize, 20), eyeColor: text(raw.eyeColor, 40), hairColor: text(raw.hairColor, 60) },
      experience: text(raw.experience, 40) || null, notes: text(raw.motivation, 2000) || null, raw_data: raw,
    };
    notificationType = 'casting'; notificationTitle = 'Nouvelle candidature casting'; legacyEmailKey = 'castingApplications';
  } else if (kind === 'contact') {
    const name = text(raw.name, 120); const userEmail = email(raw.email); const message = text(raw.message, 5000);
    if (!name || !userEmail || !message) return NextResponse.json({ error: 'Nom, email et message requis.' }, { status: 400 });
    table = 'contact_messages';
    row = { legacy_id: crypto.randomUUID(), name, email: userEmail, phone: text(raw.phone, 40) || null, subject: text(raw.subject, 180) || null, message, status: 'Nouveau', raw_data: raw };
    notificationType = 'contact'; notificationTitle = 'Nouveau message de contact'; legacyEmailKey = 'contactMessages';
  } else if (kind === 'booking') {
    const name = text(raw.clientName || raw.name, 120); const userEmail = email(raw.clientEmail || raw.email);
    if (!name || !userEmail) return NextResponse.json({ error: 'Nom et email requis.' }, { status: 400 });
    table = 'booking_requests';
    row = { legacy_id: crypto.randomUUID(), name, email: userEmail, phone: text(raw.phone, 40) || null, model_id: text(raw.modelId, 160) || null, status: 'Nouveau', raw_data: raw };
    notificationType = 'booking'; notificationTitle = 'Nouvelle demande de booking'; legacyEmailKey = 'bookingRequests';
  } else if (kind === 'fashion-day') {
    const name = text(raw.name || raw.applicantName || raw.brandName || raw.designerName, 160); const userEmail = email(raw.email);
    if (!name || !userEmail) return NextResponse.json({ error: 'Nom et email requis.' }, { status: 400 });
    table = 'fashion_day_applications';
    row = { legacy_id: crypto.randomUUID(), applicant_name: name, email: userEmail, phone: text(raw.phone, 40) || null, application_type: text(raw.type || raw.applicationType || raw.role || raw.category, 100) || null, status: 'Nouveau', raw_data: raw };
    notificationType = 'fashionday'; notificationTitle = 'Nouvelle candidature Fashion Day';
  } else if (kind === 'recovery') {
    const userEmail = email(raw.email); const identifier = text(raw.identifier, 160);
    if (!userEmail && !identifier) return NextResponse.json({ error: 'Email ou identifiant requis.' }, { status: 400 });
    table = 'recovery_requests';
    row = { legacy_id: crypto.randomUUID(), email: userEmail || null, identifier: identifier || null, status: 'Nouveau', raw_data: raw };
    notificationType = 'recovery'; notificationTitle = 'Nouvelle demande de récupération';
  } else {
    return NextResponse.json({ error: 'Type de formulaire inconnu.' }, { status: 404 });
  }

  const { data, error: insertError } = await supabase.from(table).insert(row).select('*').single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  await supabase.from('notifications').insert({
    audience_role: 'admin', type: notificationType, title: notificationTitle,
    body: String((data as any)?.full_name || (data as any)?.name || (data as any)?.applicant_name || (data as any)?.email || ''),
    href: kind === 'casting' ? '/admin/casting-applications' : '/admin', is_read: false,
    metadata: { source: 'intake', table, row_id: (data as any)?.id },
  });

  if (legacyEmailKey) {
    try { await notifyIntakeSubmission(legacyEmailKey, raw, String((data as any)?.id || '')); } catch (error) { console.error('[intake] email transactionnel impossible', error); }
  }
  return NextResponse.json({ id: (data as any)?.id, data }, { status: 201 });
}
