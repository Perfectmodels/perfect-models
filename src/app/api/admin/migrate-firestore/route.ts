import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseAdminConfigured, firebaseAdminDatabaseGet } from '@/lib/firebase-admin-backend';
import { firestoreGetCollection, firestoreSetCollection, firestoreHealthcheck } from '@/lib/firestore-backend';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function topLevelEntries(value: unknown): [string, unknown][] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>);
}

export async function GET() {
  const profile = await getCurrentAppProfile();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  if (!firebaseAdminConfigured()) return NextResponse.json({ ok: false, configured: false, error: 'Firebase Admin non configuré.' }, { status: 503 });
  try {
    const health = await firestoreHealthcheck();
    const siteConfig = await firestoreGetCollection('siteConfig');
    return NextResponse.json({ ok: true, configured: true, firestore: health, migrated: siteConfig !== null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ ok: false, configured: true, error: error instanceof Error ? error.message : 'Firestore indisponible.' }, { status: 503 });
  }
}

export async function POST() {
  const profile = await getCurrentAppProfile();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  if (!firebaseAdminConfigured()) return NextResponse.json({ error: 'Firebase Admin non configuré.' }, { status: 503 });

  const startedAt = Date.now();
  try {
    await firestoreHealthcheck();
    const root = await firebaseAdminDatabaseGet('');
    const entries = topLevelEntries(root);
    if (!entries.length) return NextResponse.json({ error: 'Realtime Database est vide ou inaccessible.' }, { status: 409 });

    const results: { key: string; bytes: number; ok: boolean; error?: string }[] = [];
    for (const [key, value] of entries) {
      const bytes = Buffer.byteLength(JSON.stringify(value ?? null), 'utf8');
      try {
        await firestoreSetCollection(key, value);
        const verify = await firestoreGetCollection(key);
        const same = JSON.stringify(verify) === JSON.stringify(value ?? null);
        if (!same) throw new Error('Vérification post-écriture différente de la source.');
        results.push({ key, bytes, ok: true });
      } catch (error) {
        results.push({ key, bytes, ok: false, error: error instanceof Error ? error.message : 'Erreur inconnue' });
      }
    }

    const failed = results.filter((item) => !item.ok);
    return NextResponse.json({
      ok: failed.length === 0,
      source: 'realtime-database',
      target: 'firestore',
      migrated: results.length - failed.length,
      failed: failed.length,
      durationMs: Date.now() - startedAt,
      results,
    }, { status: failed.length ? 207 : 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Migration impossible.' }, { status: 500 });
  }
}
