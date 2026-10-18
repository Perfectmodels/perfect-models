import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { SURVEY_QUESTIONS } from '@/lib/agency-survey';

export const dynamic = 'force-dynamic';

async function authorized() {
  const profile = await getCurrentAppProfile();
  return profile?.role === 'admin';
}

export async function GET(request: NextRequest) {
  if (!await authorized()) return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  const state = request.nextUrl.searchParams.get('status') || 'pending';
  const allowed = ['pending', 'approved', 'rejected', 'none', 'all'];
  if (!allowed.includes(state)) return NextResponse.json({ error: 'Filtre invalide.' }, { status: 400 });
  const page = Math.min(100, Math.max(0, Number(request.nextUrl.searchParams.get('page') || 0) || 0));
  const db = createSupabaseAdminClient() as any;
  let query = db.from('agency_survey_responses')
    .select('id,created_at,private_comments,public_comments,moderation_status,moderated_at', { count: 'exact' })
    .order('created_at', { ascending: false }).range(page * 20, page * 20 + 19);
  if (state !== 'all') query = query.eq('moderation_status', state);
  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: 'Impossible de charger la modération.' }, { status: 503 });
  return NextResponse.json({ rows: data || [], total: count || 0 }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: NextRequest) {
  if (!await authorized()) return NextResponse.json({ error: 'Accès réservé aux administrateurs.' }, { status: 403 });
  const origin = request.headers.get('origin');
  if (!origin || new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' ||
    typeof body.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.id) ||
    !['approved', 'rejected'].includes(body.status)) {
    return NextResponse.json({ error: 'Décision invalide.' }, { status: 400 });
  }
  const allowedKeys = new Set(SURVEY_QUESTIONS.filter(q => q.type === 'text').map(q => String(q.id)));
  const published: Record<string,string> = {};
  if (body.status === 'approved') {
    if (body.confirmedAnonymized !== true || !body.publicComments ||
        typeof body.publicComments !== 'object' || Array.isArray(body.publicComments)) {
      return NextResponse.json({ error: 'Confirmez que les propos ont été anonymisés.' }, { status: 400 });
    }
    for (const [key, value] of Object.entries(body.publicComments as Record<string, unknown>)) {
      if (!allowedKeys.has(key) || typeof value !== 'string' || value.length > 1600) {
        return NextResponse.json({ error: 'Contenu à publier invalide.' }, { status: 400 });
      }
      if (value.trim()) {
        // Protect against obvious contact details; review of names and indirect identifiers remains manual.
        const safe = value.trim()
          .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[adresse masquée]')
          .replace(/(?:\+?\d[\d .()-]{7,}\d)/g, '[numéro masqué]')
          .replace(/https?:\/\/\S+/gi, '[lien masqué]');
        published[key] = safe;
      }
    }
    if (!Object.keys(published).length) return NextResponse.json({ error: 'Aucun témoignage à publier.' }, { status: 400 });
  }
  const db = createSupabaseAdminClient() as any;
  const { data, error } = await db.from('agency_survey_responses')
    .update({ moderation_status: body.status, public_comments: body.status === 'approved' ? published : {}, moderated_at: new Date().toISOString() })
    .eq('id', body.id).select('id').single();
  if (error || !data) return NextResponse.json({ error: 'Échec de la modération.' }, { status: 503 });
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
}
