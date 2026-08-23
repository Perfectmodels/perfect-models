import { NextResponse } from 'next/server';
import { getSiteRuntimeConfig } from '@/lib/site-runtime';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getSiteRuntimeConfig();
  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
