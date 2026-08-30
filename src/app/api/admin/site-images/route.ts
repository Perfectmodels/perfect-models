import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { legacyFallback, SITE_IMAGE_MANAGED_COLLECTIONS, SITE_IMAGE_PAGES, SITE_IMAGE_SLOT_KEYS } from '@/lib/site-image-registry';

export const dynamic = 'force-dynamic';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

async function requireAdmin() {
  const profile = await getCurrentAppProfile();
  return profile?.role === 'admin' ? profile : null;
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function isDirectImgBB(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'i.ibb.co' && url.pathname.length > 1;
  } catch {
    return false;
  }
}

async function readSettings() {
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('site_settings').select('value,updated_at').eq('key', 'siteImages').maybeSingle();
  if (error) throw error;
  const values = objectValue(data?.value);
  const effective = Object.fromEntries(SITE_IMAGE_PAGES.flatMap((page) => page.slots.map((item) => [
    item.key,
    String(values[item.key] || legacyFallback(values, item.legacyKey) || ''),
  ])));
  return { values, effective, updatedAt: data?.updated_at || null };
}

export async function GET() {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  try {
    const settings = await readSettings();
    return NextResponse.json({ ...settings, pages: SITE_IMAGE_PAGES, collections: SITE_IMAGE_MANAGED_COLLECTIONS }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[site-images] admin read failed', error);
    return NextResponse.json({ error: 'Impossible de charger les visuels du site.' }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const key = String(body?.key || '').trim();
  const value = String(body?.value || '').trim();
  if (!SITE_IMAGE_SLOT_KEYS.has(key)) return NextResponse.json({ error: 'Emplacement visuel inconnu.' }, { status: 400 });
  if (value && !isDirectImgBB(value)) return NextResponse.json({ error: 'Les nouvelles images du site doivent être téléversées via le module ImgBB.' }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient() as any;
    const { data: current, error: readError } = await supabase.from('site_settings').select('value').eq('key', 'siteImages').maybeSingle();
    if (readError) throw readError;
    const next = { ...objectValue(current?.value) };
    if (value) next[key] = value;
    else delete next[key];
    const now = new Date().toISOString();
    const { error } = await supabase.from('site_settings').upsert({ key: 'siteImages', value: next, updated_at: now }, { onConflict: 'key' });
    if (error) throw error;

    const slot = SITE_IMAGE_PAGES.flatMap((page) => page.slots).find((item) => item.key === key);
    const effective = value || legacyFallback(next, slot?.legacyKey) || '';
    return NextResponse.json({ success: true, key, value, effective, updatedAt: now });
  } catch (error) {
    console.error('[site-images] admin update failed', error);
    return NextResponse.json({ error: 'La modification n’a pas pu être enregistrée.' }, { status: 503 });
  }
}
