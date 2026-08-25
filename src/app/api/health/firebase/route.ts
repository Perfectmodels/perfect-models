import { NextResponse } from 'next/server';
import { firebaseAdminConfigured, firebaseAdminDatabaseGet } from '@/lib/firebase-admin-backend';

export const dynamic = 'force-dynamic';

export async function GET() {
  const configured = firebaseAdminConfigured();
  if (!configured) {
    return NextResponse.json({
      ok: false,
      configured: false,
      transport: 'firebase-admin-oauth',
      error: 'FIREBASE_SERVICE_ACCOUNT_JSON manquant côté serveur.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const startedAt = Date.now();
  try {
    const sample = await firebaseAdminDatabaseGet('siteConfig');
    return NextResponse.json({
      ok: true,
      configured: true,
      transport: 'firebase-admin-oauth',
      latencyMs: Date.now() - startedAt,
      databaseReachable: true,
      samplePresent: sample != null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      configured: true,
      transport: 'firebase-admin-oauth',
      latencyMs: Date.now() - startedAt,
      databaseReachable: false,
      error: error instanceof Error ? error.message : 'Firebase Admin indisponible.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
