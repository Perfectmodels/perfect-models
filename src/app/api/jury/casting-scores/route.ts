import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function score(value: unknown) {
  const n = Number(value); return Number.isFinite(n) ? Math.max(0, Math.min(10, n)) : 0;
}

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['jury','admin','manager'].includes(profile.role)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const castingApplicationId = String(body?.castingApplicationId || '');
  if (!castingApplicationId) return NextResponse.json({ error: 'Candidature requise.' }, { status: 400 });
  const physique = score(body?.physique); const presence = score(body?.presence); const photogenie = score(body?.photogenie); const potentiel = score(body?.potentiel);
  const overall = Math.round(((physique + presence + photogenie + potentiel) / 4) * 100) / 100;
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('casting_scores').upsert({
    casting_application_id: castingApplicationId,
    jury_user_id: profile.userId,
    physique, presence, photogenie, potentiel, overall,
    notes: String(body?.notes || '').slice(0, 3000) || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'casting_application_id,jury_user_id' }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
