import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { activateModelClaim, objectValue } from '@/lib/model-claims';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const adminProfile = await getCurrentAppProfile();
  if (!adminProfile || adminProfile.role !== 'admin') return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const modelId = String(body.modelId || '').trim();
  const action = String(body.action || '');
  if (!modelId || !['approve','release'].includes(action)) return NextResponse.json({ error: 'Action invalide.' }, { status: 400 });
  const supabase = createSupabaseAdminClient() as any;
  const { data: model, error } = await supabase.from('models').select('*').eq('id', modelId).maybeSingle();
  if (error || !model) return NextResponse.json({ error: 'Profil mannequin introuvable.' }, { status: 404 });
  if (model.claim_status !== 'pending_agency_review') return NextResponse.json({ error: 'Ce profil n’attend pas de validation agence.' }, { status: 409 });
  const raw = objectValue(model.raw_data); const pending = objectValue(raw.pendingClaim); const userId = String(pending.userId || '');
  if (!userId) return NextResponse.json({ error: 'Compte Supabase lié à la demande introuvable.' }, { status: 409 });
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
  if (userError || !userData.user) return NextResponse.json({ error: 'Utilisateur Supabase introuvable.' }, { status: 404 });

  if (action === 'approve') {
    if (!userData.user.email_confirmed_at) return NextResponse.json({ error: 'Le mannequin n’a pas encore confirmé son adresse e-mail.' }, { status: 409 });
    const { error: statusError } = await supabase.from('models').update({ claim_status: 'pending_email_confirmation' }).eq('id', model.id).eq('claim_status', 'pending_agency_review').is('auth_user_id', null);
    if (statusError) return NextResponse.json({ error: statusError.message }, { status: 500 });
    const refreshed = { ...model, claim_status: 'pending_email_confirmation' };
    try { const result = await activateModelClaim(refreshed, userData.user); return NextResponse.json({ success: true, ...result }); }
    catch (cause) {
      await supabase.from('models').update({ claim_status: 'pending_agency_review' }).eq('id', model.id).is('auth_user_id', null);
      return NextResponse.json({ error: cause instanceof Error ? cause.message : 'Activation impossible.' }, { status: 409 });
    }
  }

  const now = new Date().toISOString();
  await supabase.from('profiles').delete().eq('user_id', userId);
  if (userData.user.app_metadata?.account_source === 'model-self-signup' && String(userData.user.app_metadata?.pending_model_id || '') === String(model.id)) await supabase.auth.admin.deleteUser(userId);
  const previousStatus = ['available','pending_claim','not_applicable'].includes(String(pending.previousClaimStatus || '')) ? String(pending.previousClaimStatus) : 'available';
  const { error: releaseError } = await supabase.from('models').update({ claim_status: previousStatus, raw_data: { ...raw, pendingClaim: null, lastRejectedClaim: { ...pending, rejectedAt: now } }, updated_at: now }).eq('id', model.id).is('auth_user_id', null);
  if (releaseError) return NextResponse.json({ error: releaseError.message }, { status: 500 });
  return NextResponse.json({ success: true, released: true });
}
