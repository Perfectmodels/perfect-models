import 'server-only';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type ProvisionResult = {
  modelId: string;
  status: 'invited' | 'already_linked' | 'missing_email' | 'pending_claim' | 'error';
  reason?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function provisionModelAccount(modelId: string): Promise<ProvisionResult> {
  const admin = createSupabaseAdminClient() as any;
  const { data: model, error: readError } = await admin.from('models')
    .select('id,name,username,email,raw_data,auth_user_id,claim_status')
    .eq('id', modelId).maybeSingle();
  if (readError || !model) return { modelId, status: 'error', reason: 'Fiche introuvable ou inaccessible.' };
  if (model.auth_user_id) return { modelId, status: 'already_linked' };

  // Do not take over an identity that is being claimed by the model.
  const claimStatus = String(model.claim_status || '');
  if (!['', 'not_applicable', 'available'].includes(claimStatus)) {
    return { modelId, status: 'pending_claim', reason: 'Activation ou revendication déjà en cours.' };
  }

  const raw = model.raw_data && typeof model.raw_data === 'object' ? model.raw_data : {};
  const email = String(model.email || raw.email || '').trim().toLowerCase();
  if (!emailPattern.test(email)) return { modelId, status: 'missing_email' };
  const name = String(model.name || '').trim();
  const identifier = String(model.username || model.id).trim();
  const now = new Date().toISOString();

  // Atomic reservation prevents two admins from inviting the same profile.
  let reservation = admin.from('models').update({ claim_status: 'claim_in_progress', updated_at: now })
    .eq('id', model.id).is('auth_user_id', null);
  reservation = claimStatus ? reservation.eq('claim_status', claimStatus) : reservation.is('claim_status', null);
  const { data: reserved, error: reservationError } = await reservation.select('id').maybeSingle();
  if (reservationError || !reserved) return { modelId, status: 'pending_claim', reason: 'Ce profil a été pris en charge par une autre demande.' };

  let invitedUserId = '';
  try {
    const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.perfectmodels.online').replace(/\/$/, '');
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: siteUrl + '/auth/confirm?next=/auth/set-password',
      data: { name, model_id: model.id, onboarding_source: 'pmm-model-account-provision' },
    });
    if (inviteError || !invited?.user?.id) throw new Error('Invitation refusée : adresse déjà utilisée ou service e-mail indisponible.');
    invitedUserId = invited.user.id;

    const { error: authError } = await admin.auth.admin.updateUserById(invitedUserId, {
      app_metadata: {
        ...(invited.user.app_metadata || {}), role: 'student', identifier,
        model_id: model.id, profile_id: model.id, account_source: 'admin_model_invite',
        must_change_password: true,
      },
    });
    if (authError) throw authError;

    const { error: profileError } = await admin.from('profiles').upsert({
      user_id: invitedUserId, role: 'student', identifier, display_name: name, email,
      model_id: model.id, must_change_password: true, is_active: true,
      metadata: { source: 'admin_model_invite', permissions: { isActive: true } },
      updated_at: now,
    }, { onConflict: 'user_id' });
    if (profileError) throw profileError;

    const { data: linked, error: linkError } = await admin.from('models').update({
      auth_user_id: invitedUserId, claim_status: 'claimed', email, updated_at: now,
    }).eq('id', model.id).is('auth_user_id', null)
      .eq('claim_status', 'claim_in_progress').select('id').maybeSingle();
    if (linkError || !linked) throw new Error('Rattachement du compte à la fiche impossible.');

    return { modelId, status: 'invited' };
  } catch (error) {
    // Only remove a user created by this attempt; never delete a preexisting account.
    if (invitedUserId) {
      await admin.from('profiles').delete().eq('user_id', invitedUserId).eq('model_id', modelId).catch(() => undefined);
      await admin.auth.admin.deleteUser(invitedUserId).catch(() => undefined);
    }
    await admin.from('models').update({ claim_status: claimStatus || null })
      .eq('id', model.id).eq('claim_status', 'claim_in_progress').is('auth_user_id', null);
    return { modelId, status: 'error', reason: error instanceof Error ? error.message : 'Invitation impossible.' };
  }
}

export type { ProvisionResult };
