import { NextResponse } from 'next/server';
import { collectionToArray, getCollection, getCollections } from '@/lib/app-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows, models] = await Promise.all([getCollections(), getCollection('models')]);
    const publicRows = rows.filter((row) => row.is_public);

    return NextResponse.json(
      {
        ok: true,
        provider: 'neon',
        transport: process.env.DATABASE_URL ? 'serverless-driver' : 'data-api-fallback',
        collections: publicRows.length,
        models: collectionToArray(models).length,
        checkedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[neon-health] connection failed', error);
    return NextResponse.json(
      { ok: false, provider: 'neon', error: 'Neon connection unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
