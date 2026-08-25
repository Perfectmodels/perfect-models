import { NextResponse } from 'next/server';
import { firebaseAdminConfigured } from '@/lib/firebase-admin-backend';
import { firestoreGetCollection, firestoreHealthcheck } from '@/lib/firestore-backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = firebaseAdminConfigured();
  if (!configured) {
    return NextResponse.json({
      ok: false,
      configured: false,
      transport: 'firebase-admin-oauth',
      primaryDatabase: 'firestore',
      error: 'FIREBASE_SERVICE_ACCOUNT_JSON manquant côté serveur.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const startedAt = Date.now();
  try {
    const health = await firestoreHealthcheck();
    const sample = await firestoreGetCollection('siteConfig');
    return NextResponse.json({
      ok: true,
      configured: true,
      transport: 'firebase-admin-oauth',
      primaryDatabase: 'firestore',
      latencyMs: Date.now() - startedAt,
      databaseReachable: true,
      samplePresent: sample != null,
      ...health,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      configured: true,
      transport: 'firebase-admin-oauth',
      primaryDatabase: 'firestore',
      latencyMs: Date.now() - startedAt,
      databaseReachable: false,
      error: error instanceof Error ? error.message : 'Firestore indisponible.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
