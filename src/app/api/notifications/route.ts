import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

function safeLimit(value: string | null) {
  const parsed = Number(value || 30);
  return Number.isFinite(parsed) ? Math.min(50, Math.max(1, Math.trunc(parsed))) : 30;
}

async function notificationIdentity() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const admin = createSupabaseAdminClient() as any;
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role,is_active')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (profileError || !profile?.is_active) return null;
  return { userId: data.user.id, role: String(profile.role || '') };
}

function audienceFilter(userId: string, role: string) {
  const clauses = [`recipient_user_id.eq.${userId}`];
  if (role) clauses.push(`and(recipient_user_id.is.null,audience_role.eq.${role})`);
  return clauses.join(',');
}

export async function GET(request: Request) {
  const identity = await notificationIdentity();
  if (!identity) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });

  const admin = createSupabaseAdminClient() as any;
  const filter = audienceFilter(identity.userId, identity.role);
  const limit = safeLimit(new URL(request.url).searchParams.get('limit'));
  const [{ data, error }, { count, error: countError }] = await Promise.all([
    admin.from('notifications')
      .select('id,type,title,body,href,is_read,created_at')
      .or(filter)
      .order('created_at', { ascending: false })
      .limit(limit),
    admin.from('notifications')
      .select('id', { count: 'exact', head: true })
      .or(filter)
      .eq('is_read', false),
  ]);
  if (error || countError) {
    console.error('[notifications] read failed', error || countError);
    return NextResponse.json({ error: 'Impossible de charger les notifications pour le moment.' }, { status: 503 });
  }
  return NextResponse.json({ notifications: data || [], unread: count || 0 });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const identity = await notificationIdentity();
  if (!identity) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });

  const admin = createSupabaseAdminClient() as any;
  const filter = audienceFilter(identity.userId, identity.role);
  const now = new Date().toISOString();
  let query = admin.from('notifications')
    .update({ is_read: true, read_at: now })
    .or(filter)
    .eq('is_read', false);

  if (body.all !== true) {
    const id = String(body.id || '').trim();
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Notification invalide.' }, { status: 400 });
    query = query.eq('id', id);
  }

  const { error } = await query;
  if (error) {
    console.error('[notifications] mark read failed', error);
    return NextResponse.json({ error: 'Impossible de mettre à jour cette notification.' }, { status: 503 });
  }
  return NextResponse.json({ success: true });
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
  if (error) {
    console.error('[notifications] insert failed', error);
    return NextResponse.json({ error: 'Notification non enregistrée.' }, { status: 500 });
  }
  return NextResponse.json({ accepted: true }, { status: 202 });
}
