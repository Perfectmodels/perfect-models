import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { supabaseLookup } from '@/lib/supabase-backend';
import { activateModelClaim, objectValue } from '@/lib/model-claims';

export const dynamic = 'force-dynamic';
const claimableStates = new Set(['', 'available', 'pending_claim', 'not_applicable', 'rejected']);

async function insertNotices(supabase: any, rows: Record<string, unknown>[]) {
  const { error } = await supabase.from('notifications').insert(rows);
  if (error) console.warn('[model-signup/finalize] notification insert failed', error);
}

export async function POST(request: Request) {
  const bearer = request.headers.get('authorization') || '';
  const token = bearer.startsWith('Bearer ') ? bearer.slice(7).trim() : '';
  if (!token) return NextResponse.json({ error: 'Votre session de confirmation est absente. Ouvrez de nouveau le lien reçu par e-mail.', code: 'AUTH_SESSION_REQUIRED' }, { status: 401 });
  let user: any;
  try { user = await supabaseLookup(token); } catch { return NextResponse.json({ error: 'Votre session de confirmation a expiré. Demandez un nouveau lien si nécessaire.', code: 'AUTH_SESSION_INVALID' }, { status: 401 }); }
  if (!user?.id || !user?.email_confirmed_at) return NextResponse.json({ error: 'Confirmez votre adresse e-mail avant de continuer.', code: 'EMAIL_NOT_CONFIRMED' }, { status: 409 });
  const pendingModelId = String(user?.app_metadata?.pending_model_id || '');
  if (!pendingModelId || user?.app_metadata?.account_source !== 'model-self-signup') return NextResponse.json({ status: 'not_applicable' });

  const supabase = createSupabaseAdminClient() as any;
  const [{ data: model, error }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from('models').select('*').eq('id', pendingModelId).maybeSingle(),
    supabase.from('profiles').select('metadata').eq('user_id', user.id).maybeSingle(),
  ]);
  if (error || !model) return NextResponse.json({ error: 'Votre fiche mannequin n’a pas été retrouvée. Contactez l’agence avant de recommencer.', code: 'MODEL_NOT_FOUND' }, { status: 404 });
  if (profileError || !profile) return NextResponse.json({ error: 'Votre demande d’activation n’a pas été retrouvée. Contactez l’agence si vous avez déjà confirmé votre e-mail.', code: 'CLAIM_NOT_FOUND' }, { status: 404 });
  if (model.auth_user_id || !claimableStates.has(String(model.claim_status || ''))) return NextResponse.json({ error: 'Ce profil n’est plus disponible pour une nouvelle activation. Essayez de vous connecter ou contactez l’agence.', code: 'CLAIM_UNAVAILABLE' }, { status: 409 });
  const metadata = objectValue(profile.metadata);
  const pending = objectValue(metadata.pending_claim);
  if (String(pending.userId || '') !== String(user.id)) return NextResponse.json({ error: 'Cette demande d’activation ne correspond pas au compte connecté.', code: 'CLAIM_MISMATCH' }, { status: 409 });

  const now = new Date().toISOString();
  const raw = objectValue(model.raw_data);
  const enrichedPending = { ...pending, emailConfirmedAt: now, previousClaimStatus: String(model.claim_status || 'available') };
  const targetStatus = pending.verificationMode === 'automatic' ? 'pending_email_confirmation' : 'pending_agency_review';
  const { data: reserved, error: reserveError } = await supabase.from('models').update({ claim_status: targetStatus, raw_data: { ...raw, pendingClaim: enrichedPending }, updated_at: now }).eq('id', model.id).is('auth_user_id', null).or('claim_status.is.null,claim_status.eq.available,claim_status.eq.pending_claim,claim_status.eq.not_applicable,claim_status.eq.rejected').select('*').maybeSingle();
  if (reserveError || !reserved) return NextResponse.json({ error: 'Ce profil vient d’être rattaché ou réservé. Actualisez la page puis essayez de vous connecter.', code: 'CLAIM_CONFLICT' }, { status: 409 });

  if (pending.verificationMode === 'automatic') {
    try {
      const result = await activateModelClaim(reserved, user);
      await insertNotices(supabase, [{
        recipient_user_id: user.id,
        type: 'account',
        title: 'Compte mannequin activé',
        body: 'Votre profil Perfect Models Management est maintenant rattaché à votre espace personnel. Vous pouvez accéder à vos outils agence.',
        href: '/profil',
        is_read: false,
        metadata: { event: 'model_claim_activated', model_id: model.id },
      }]);
      return NextResponse.json({ status: 'claimed', ...result, redirect: '/profil', message: 'Votre compte mannequin est activé.' });
    } catch (cause) {
      await supabase.from('models').update({ claim_status: enrichedPending.previousClaimStatus || 'available', raw_data: raw, updated_at: now }).eq('id', model.id).is('auth_user_id', null).eq('claim_status', 'pending_email_confirmation');
      console.error('[model-signup/finalize] automatic activation failed', cause);
      return NextResponse.json({ error: 'Votre e-mail est confirmé, mais le rattachement du profil n’a pas pu être finalisé. Vos informations sont conservées ; contactez l’agence si le problème persiste.', code: 'CLAIM_ACTIVATION_FAILED' }, { status: 409 });
    }
  }

  const { error: pendingError } = await supabase.from('profiles').update({ is_active: false, metadata: { ...metadata, pending_claim: enrichedPending, claim_status: 'pending_agency_review' }, updated_at: now }).eq('user_id', user.id);
  if (pendingError) {
    console.error('[model-signup/finalize] pending review profile update failed', pendingError);
    return NextResponse.json({ error: 'Votre e-mail est confirmé, mais la demande n’a pas pu être placée en validation agence. Contactez l’équipe PMM.', code: 'REVIEW_STATE_FAILED' }, { status: 500 });
  }

  await insertNotices(supabase, [
    {
      recipient_user_id: user.id,
      type: 'account',
      title: 'Validation agence en cours',
      body: 'Votre adresse e-mail est confirmée. L’équipe Perfect Models Management vérifie maintenant le rattachement de votre profil.',
      href: '/inscription/mannequin?status=pending-review',
      is_read: false,
      metadata: { event: 'model_claim_pending_review', model_id: model.id },
    },
    {
      audience_role: 'admin',
      type: 'model_claim',
      title: 'Compte mannequin à valider',
      body: `${String(model.name || 'Un mannequin')} a confirmé son adresse e-mail et attend la validation de son rattachement.`,
      href: '/admin/model-access',
      is_read: false,
      metadata: { event: 'model_claim_pending_review', model_id: model.id, user_id: user.id },
    },
  ]);
  return NextResponse.json({ status: 'pending_review', redirect: '/inscription/mannequin?status=pending-review', message: 'Votre e-mail est confirmé. La validation agence est maintenant en cours.' });
}
