import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { privilegedSupabaseSelect, privilegedSupabaseUpsert } from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const profile = await getCurrentAppProfile();
  return profile?.role === 'admin' ? profile : null;
}

function validKey(value: unknown) {
  const key = String(value || '').trim();
  return /^[A-Za-z][A-Za-z0-9._-]{0,79}$/.test(key) ? key : '';
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  try {
    const rows = await privilegedSupabaseSelect('site_settings?select=key,value,updated_at&order=key.asc');
    return NextResponse.json({ settings: Array.isArray(rows) ? rows : [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || 'Lecture des paramètres impossible.') }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const key = validKey(body.key);
  if (!key || body.value === undefined) return NextResponse.json({ error: 'Clé ou valeur invalide.' }, { status: 400 });

  let encoded = '';
  try { encoded = JSON.stringify(body.value); } catch { return NextResponse.json({ error: 'La valeur doit être sérialisable en JSON.' }, { status: 400 }); }
  if (encoded.length > 250_000) return NextResponse.json({ error: 'Ce paramètre est trop volumineux.' }, { status: 413 });

  try {
    const rows: any = await privilegedSupabaseUpsert('site_settings', {
      key,
      value: body.value,
      updated_at: new Date().toISOString(),
    }, 'key');
    const setting = Array.isArray(rows) ? rows[0] : rows;
    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || 'Enregistrement impossible.') }, { status: Number(error?.status || 500) });
  }
}
