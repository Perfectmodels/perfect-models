import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { supabaseLookup } from '@/lib/supabase-backend';
import { activateModelClaim, objectValue } from '@/lib/model-claims';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const bearer = request.headers.get('authorization') || '';
  const token = bearer.startsWith('Bearer ') ? bearer.slice(7).trim() : '';
  if (!token) return NextResponse.json({ error: 'Session Supabase requise.' }, { status: 401 });
  let user: any;
  try { user = await supabaseLookup(token); } catch { return NextResponse.json({ error: 'Session Supabase invalide.' }, { status: 401 }); }
  if (!user?.id || !user?.email_confirmed_at) return NextResponse.json({ error: 'Confirmez votre adresse e-mail avant de continuer.' }, { status: 409 });
  const pendingModelId = String(user?.app_metadata?.pending_model_id || '');
  if (!pendingModelId || user?.app_metadata?.account_source !== 'model-self-signup') return NextResponse.json({ status: 'not_applicable' });

  const supabase = createSupabaseAdminClient() as any;
  const { data: model, error } = await supabase.from('models').select('*').eq('id', pendingModelId).maybeSingle();
  if (error || !model) return NextResponse.json({ error: 'Profil mannequin introuvable.' }, { status: 404 });
  const raw = objectValue(model.raw_data);
  const pending = objectValue(raw.pendingClaim);
  if (String(pending.userId || '') !== String(user.id)) return NextResponse.json({ error: 'La demande de rattachement ne correspond pas à ce compte.' }, { status: 409 });

  const now = new Date().toISOString();
  if (pending.verificationMode === 'automatic') {
    try { const result = await activateModelClaim(model, user); return NextResponse.json({ status: 'claimed', ...result, redirect: '/profil' }); }
    catch (cause) { return NextResponse.json({ error: cause instanceof Error ? cause.message : 'Activation impossible.' }, { status: 409 }); }
  }

  await supabase.from('models').update({ claim_status: 'pending_agency_review', raw_data: { ...raw, pendingClaim: { ...pending, emailConfirmedAt: now } }, updated_at: now }).eq('id', model.id);
  await supabase.from('profiles').update({ is_active: false, metadata: { source: 'model-self-signup', pending_model_id: model.id, claim_status: 'pending_agency_review' }, updated_at: now }).eq('user_id', user.id);
  return NextResponse.json({ status: 'pending_review', redirect: '/inscription/mannequin?status=pending-review' });
}
