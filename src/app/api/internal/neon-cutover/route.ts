import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LEGACY_DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com';
const PUBLIC_KEYS = new Set(['siteConfig','navLinks','socialLinks','agencyTimeline','agencyInfo','modelDistinctions','agencyServices','agencyAchievements','agencyPartners','models','fashionDayEvents','testimonials','articles','courseData','contactInfo','siteImages','newsItems','faqData','gallery','galleryAlbums','missOneLight']);
const SKIP_KEYS = new Set(['apiKeys','users','adminFcmToken','adminFcmTokens']);
const SECRET_KEY = /(password|passcode|secret|api.?key|access.?token|refresh.?token|fcm.?token)/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== 'object') return value;
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (SECRET_KEY.test(key)) continue;
    out[key] = sanitize(child);
  }
  return out;
}

export async function POST(request: NextRequest) {
  const supplied = request.headers.get('x-migration-key') || request.nextUrl.searchParams.get('key') || '';
  const expected = process.env.PMM_MIGRATION_KEY || '';
  if (!expected || supplied !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DATABASE_URL missing' }, { status: 500 });

  const response = await fetch(`${LEGACY_DATABASE_URL.replace(/\/$/, '')}/.json`, { cache: 'no-store' });
  if (!response.ok) return NextResponse.json({ error: `Legacy read failed: ${response.status}` }, { status: 502 });
  const root = await response.json() as Record<string, unknown> | null;
  if (!root || typeof root !== 'object') return NextResponse.json({ error: 'Legacy database empty' }, { status: 502 });

  const sql = neon(process.env.DATABASE_URL);
  const profiles = await sql.query(`SELECT user_id::text, identifier, login_email, app_role, profile_id, permissions FROM public.auth_profiles`);
  const byProfile = new Map((profiles as any[]).map(row => [`${row.app_role}:${row.profile_id}`, row]));

  const imported: Record<string, number> = {};
  for (const [key, rawValue] of Object.entries(root)) {
    if (SKIP_KEYS.has(key)) continue;
    let value = sanitize(rawValue) as any;

    if (key === 'models') {
      const list = Array.isArray(value) ? value : Object.values(value || {});
      value = list.map((item: any, index: number) => {
        const profile = byProfile.get(`student:${index}`);
        return profile ? { ...item, id: item?.id ?? String(index), username: profile.identifier, email: profile.login_email, authUserId: profile.user_id, firebaseUid: profile.user_id, permissions: profile.permissions || {} } : item;
      });
    } else if (key === 'juryMembers') {
      const list = Array.isArray(value) ? value : Object.values(value || {});
      value = list.map((item: any, index: number) => {
        const profile = byProfile.get(`jury:${item?.id || `jury${index + 1}`}`);
        return profile ? { ...item, email: profile.login_email, username: profile.identifier, authUserId: profile.user_id, firebaseUid: profile.user_id, permissions: profile.permissions || {} } : item;
      });
    } else if (key === 'registrationStaff') {
      const list = Array.isArray(value) ? value : Object.values(value || {});
      value = list.map((item: any, index: number) => {
        const profile = byProfile.get(`registration:${item?.id || `reg${index + 1}`}`);
        return profile ? { ...item, email: profile.login_email, username: profile.identifier, authUserId: profile.user_id, firebaseUid: profile.user_id, permissions: profile.permissions || {} } : item;
      });
    }

    await sql.query(
      `INSERT INTO public.app_collections(key,data,is_public,updated_at) VALUES ($1,$2::jsonb,$3,now()) ON CONFLICT(key) DO UPDATE SET data=EXCLUDED.data,is_public=EXCLUDED.is_public,updated_at=now()`,
      [key, JSON.stringify(value ?? null), PUBLIC_KEYS.has(key)],
    );
    imported[key] = Array.isArray(value) ? value.filter(Boolean).length : value && typeof value === 'object' ? Object.keys(value).length : 1;
  }

  await sql.query(`INSERT INTO public.app_data_audit(collection_key,action) VALUES ('__cutover__','legacy-rtdb-import')`);
  return NextResponse.json({ success: true, imported, skipped: [...SKIP_KEYS] });
}
