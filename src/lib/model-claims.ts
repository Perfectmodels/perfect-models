import 'server-only';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type PendingModelClaim = {
  userId: string; email: string; phone: string; birthDate: string; gender: string; nationality: string; city: string;
  heightCm: number | null; measurements: { chest?: number; waist?: number; hips?: number; shoeSize?: string };
  instagramUrl: string | null; verificationMode: 'automatic' | 'agency_review'; submittedAt: string;
  emailConfirmedAt?: string; previousClaimStatus?: string;
};

export function normalizePhone(value: unknown) { return String(value || '').replace(/[^0-9+]/g, '').replace(/^00/, '+'); }
export function validPassword(value: string) { return value.length >= 12 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value); }
export function objectValue(value: unknown) { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {}; }

export function verificationMode(model: any, input: { email: string; phone: string; birthDate: string }): 'automatic' | 'agency_review' {
  const storedEmail = String(model?.email || '').trim().toLowerCase(); const storedPhone = normalizePhone(model?.phone); const storedBirth = String(model?.birth_date || '').slice(0, 10);
  const emailMatch = Boolean(storedEmail && storedEmail === input.email.toLowerCase()); const phoneMatch = Boolean(storedPhone && storedPhone === normalizePhone(input.phone)); const birthMatch = Boolean(storedBirth && storedBirth === input.birthDate);
  return emailMatch || (phoneMatch && birthMatch) ? 'automatic' : 'agency_review';
}

export async function activateModelClaim(model: any, authUser: any) {
  const supabase = createSupabaseAdminClient() as any; const raw = objectValue(model?.raw_data); const pending = objectValue(raw.pendingClaim) as PendingModelClaim;
  if (!pending?.userId || String(pending.userId) !== String(authUser?.id || '')) throw new Error('Cette revendication ne correspond pas au compte authentifié.');
  if (!authUser?.email_confirmed_at) throw new Error('L’adresse e-mail doit être confirmée avant l’activation.');
  const now = new Date().toISOString(); const identifier = String(model.username || `Man-PMM-${String(model.id).slice(0, 6)}`);
  const permissions = objectValue(model.permissions); const resolvedPermissions = Object.keys(permissions).length ? permissions : { canAccessFormation: true, canAccessClassroom: true, canAccessForum: true, canViewPhotoshootBriefs: true, canViewResults: true, canEditProfile: true, isActive: true };
  const birth = pending.birthDate || null; const age = birth ? Math.max(0, new Date().getFullYear() - new Date(birth).getFullYear()) : model.age;
  const measures = { ...objectValue(model.measurements), ...(pending.measurements || {}) };
  const { data: linked, error: linkError } = await supabase.from('models').update({
    auth_user_id: authUser.id, email: pending.email, phone: pending.phone, birth_date: birth, age,
    gender: pending.gender || model.gender, nationality: pending.nationality || model.nationality, location: pending.city || model.location,
    height_cm: pending.heightCm ?? model.height_cm ?? null,
    chest_cm: pending.measurements?.chest ?? model.chest_cm ?? null,
    waist_cm: pending.measurements?.waist ?? model.waist_cm ?? null,
    hips_cm: pending.measurements?.hips ?? model.hips_cm ?? null,
    shoe_size: pending.measurements?.shoeSize || model.shoe_size || null,
    measurements: measures, instagram_url: pending.instagramUrl || model.instagram_url, permissions: resolvedPermissions,
    is_active: true, status: 'active', claim_status: 'claimed', claimed_at: now,
    raw_data: { ...raw, pendingClaim: null, lastClaim: { ...pending, status: 'claimed', completedAt: now } }, updated_at: now,
  }).eq('id', model.id).is('auth_user_id', null).eq('claim_status', 'pending_email_confirmation').select('id').maybeSingle();
  if (linkError || !linked) throw new Error(linkError?.message || 'Ce profil vient déjà d’être rattaché à un autre compte.');
  const { error: authError } = await supabase.auth.admin.updateUserById(authUser.id, { app_metadata: { ...(authUser.app_metadata || {}), role: 'student', identifier, model_id: model.id, profile_id: model.id, account_source: 'model-self-signup', pending_model_id: null, must_change_password: false } });
  if (authError) throw new Error(authError.message);
  const { error: profileError } = await supabase.from('profiles').upsert({ user_id: authUser.id, role: 'student', identifier, display_name: model.name, email: pending.email, model_id: model.id, must_change_password: false, is_active: true, metadata: { permissions: resolvedPermissions, source: 'model-self-signup', claim_status: 'claimed' }, updated_at: now }, { onConflict: 'user_id' });
  if (profileError) throw new Error(profileError.message);
  return { modelId: model.id, identifier };
}
