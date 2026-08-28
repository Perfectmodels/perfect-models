import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Payload invalide.' }, { status: 400 });

  const eventType = String(body.eventType || 'page_view').slice(0, 80);
  const path = String(body.path || '').slice(0, 500);
  const metadata = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata : {};
  const profile = await getCurrentAppProfile();
  const supabase = createSupabaseAdminClient() as any;
  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    path: path || null,
    user_id: profile?.userId || null,
    session_id: String(body.sessionId || '').slice(0, 120) || null,
    metadata,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accepted: true }, { status: 202 });
}
