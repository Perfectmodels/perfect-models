import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };
const STAGES = new Set(['invited','confirmed','attended','shortlist','callback','selected','booked','rejected','declined']);

async function access() {
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin','manager'].includes(profile.role) || !hasAdminPermission(profile, 'castingApplications')) return null;
  return profile;
}

export async function POST(request: Request, context: Context) {
  const profile = await access();
  if (!profile) return NextResponse.json({ error: 'Accès casting requis.' }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const modelId = String(body.modelId || '').trim();
  const score = Number(body.matchScore);
  if (!modelId) return NextResponse.json({ error: 'Mannequin requis.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase.from('casting_talents').upsert({ casting_id: id, model_id: modelId, stage: 'invited', match_score: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null, invited_at: new Date().toISOString() }, { onConflict: 'casting_id,model_id' }).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from('castings').update({ status: 'matching' }).eq('id', id).in('status', ['draft','open']);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request, context: Context) {
  const profile = await access();
  if (!profile) return NextResponse.json({ error: 'Accès casting requis.' }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const talentId = String(body.talentId || '').trim();
  const stage = String(body.stage || '').trim();
  if (!talentId || !STAGES.has(stage)) return NextResponse.json({ error: 'Étape invalide.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;
  const patch: Record<string, unknown> = { stage };
  if (stage === 'confirmed') patch.responded_at = new Date().toISOString();
  if (stage === 'attended') patch.attended_at = new Date().toISOString();
  const { data, error } = await supabase.from('casting_talents').update(patch).eq('id', talentId).eq('casting_id', id).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
