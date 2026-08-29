import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { supabaseLookup } from '@/lib/supabase-backend';
import { activateModelClaim, objectValue } from '@/lib/model-claims';

export const dynamic = 'force-dynamic';
const claimableStates = new Set(['', 'available', 'pending_claim', 'not_applicable', 'rejected']);

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
  const [{ data: model, error }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('models').select('*').eq('id', pendingModelId).maybeSingle(),
    supabase.from('profiles').select('metadata').eq('user_id', user.id).maybeSingle(),
  ]);
  if (error || !model) return NextResponse.json({ error: 'Profil mannequin introuvable.' }, { status: 404 });
  if (profileError || !profile) return NextResponse.json({ error: 'Demande de rattachement introuvable.' }, { status: 404 });
  if (model.auth_user_id || !claimableStates.has(String(model.claim_status || ''))) return NextResponse.json({ error: 'Ce profil n’est plus disponible pour une nouvelle inscription.' }, { status: 409 });
  const metadata = objectValue(profile.metadata);
  const pending = objectValue(metadata.pending_claim);
  if (String(pending.userId || '') !== String(user.id)) return NextResponse.json({ error: 'La demande de rattachement ne correspond pas à ce compte.' }, { status: 409 });

  const now = new Date().toISOString();
  const raw = objectValue(model.raw_data);
  const enrichedPending = { ...pending, emailConfirmedAt: now, previousClaimStatus: String(model.claim_status || 'available') };
  const targetStatus = pending.verificationMode === 'automatic' ? 'pending_email_confirmation' : 'pending_agency_review';
  const { data: reserved, error: reserveError } = await supabase.from('models').update({ claim_status: targetStatus, raw_data: { ...raw, pendingClaim: enrichedPending }, updated_at: now }).eq('id', model.id).is('auth_user_id', null).or('claim_status.is.null,claim_status.eq.available,claim_status.eq.pending_claim,claim_status.eq.not_applicable,claim_status.eq.rejected').select('*').maybeSingle();
  if (reserveError || !reserved) return NextResponse.json({ error: 'Ce profil vient d’être revendiqué par un autre compte.' }, { status: 409 });

  if (pending.verificationMode === 'automatic') {
    try { const result = await activateModelClaim(reserved, user); return NextResponse.json({ status: 'claimed', ...result, redirect: '/profil' }); }
    catch (cause) {
      await supabase.from('models').update({ claim_status: enrichedPending.previousClaimStatus || 'available', raw_data: raw, updated_at: now }).eq('id', model.id).is('auth_user_id', null).eq('claim_status', 'pending_email_confirmation');
      return NextResponse.json({ error: cause instanceof Error ? cause.message : 'Activation impossible.' }, { status: 409 });
    }
  }

  await supabase.from('profiles').update({ is_active: false, metadata: { ...metadata, pending_claim: enrichedPending, claim_status: 'pending_agency_review' }, updated_at: now }).eq('user_id', user.id);
  return NextResponse.json({ status: 'pending_review', redirect: '/inscription/mannequin?status=pending-review' });
}
