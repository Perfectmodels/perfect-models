import { NextResponse } from 'next/server';
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

  const type = String(body.type || 'notification').slice(0, 80);
  const title = String(body.title || type).slice(0, 180);
  const message = String(body.body || '').slice(0, 2000);
  const href = String(body.href || body.url || '/admin').slice(0, 500);
  const metadata = body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) ? body.metadata : {};
  const supabase = createSupabaseAdminClient() as any;
  const { error } = await supabase.from('notifications').insert({
    audience_role: 'admin', type, title, body: message || null, href, is_read: false, metadata,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accepted: true }, { status: 202 });
}
