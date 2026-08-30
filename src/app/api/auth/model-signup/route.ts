import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/config';
import { normalizePhone, validPassword, verificationMode } from '@/lib/model-claims';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.perfectmodels.online').replace(/\/$/, '');
const unavailableStates = new Set(['pending_agency_review', 'claimed', 'claim_in_progress']);

function numberOrNull(value: unknown, min: number, max: number) { const parsed = Number(value); return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null; }

function signupFailure(error: any) {
  const code = String(error?.code || '').toLowerCase();
  if (error?.status === 429 || code.includes('rate_limit')) return { status: 429, code: 'RATE_LIMITED', error: 'Trop de tentatives rapprochées. Patientez quelques minutes avant de recommencer.' };
  if (code === 'user_already_exists' || code === 'user_already_registered' || code === 'identity_already_exists') return { status: 409, code: 'ACCOUNT_EXISTS', error: 'Un compte existe déjà avec cette adresse e-mail. Essayez de vous connecter ou utilisez « Mot de passe oublié ».' };
  if (code === 'weak_password') return { status: 400, code: 'WEAK_PASSWORD', error: 'Choisissez un mot de passe plus robuste : 12 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial.' };
  if (code === 'email_address_invalid') return { status: 400, code: 'INVALID_EMAIL', error: 'Cette adresse e-mail n’est pas valide.' };
  return { status: 503, code: 'SIGNUP_UNAVAILABLE', error: 'La création du compte est momentanément indisponible. Vos informations n’ont pas été perdues : réessayez dans quelques instants.' };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const modelId = String(body.modelId || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = normalizePhone(body.phone);
  const birthDate = String(body.birthDate || '').slice(0, 10);
  const gender = String(body.gender || '').trim();
  const nationality = String(body.nationality || '').trim();
  const city = String(body.city || '').trim();
  const password = String(body.password || '');
  const confirmPassword = String(body.confirmPassword || '');
  if (!modelId || !email || !phone || !birthDate || !gender || !city) return NextResponse.json({ error: 'Complétez le profil, l’e-mail, le téléphone, la date de naissance, le genre et la ville.', code: 'MISSING_REQUIRED_FIELDS' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Saisissez une adresse e-mail valide.', code: 'INVALID_EMAIL' }, { status: 400 });
  if (!validPassword(password)) return NextResponse.json({ error: 'Le mot de passe doit contenir 12 caractères minimum, une majuscule, une minuscule, un chiffre et un caractère spécial.', code: 'WEAK_PASSWORD' }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: 'La confirmation du mot de passe ne correspond pas.', code: 'PASSWORD_MISMATCH' }, { status: 400 });

  const admin = createSupabaseAdminClient() as any;
  const { data: model, error: modelError } = await admin.from('models').select('*').eq('id', modelId).maybeSingle();
  if (modelError) {
    console.error('[model-signup] model lookup failed', modelError);
    return NextResponse.json({ error: 'Nous ne pouvons pas vérifier votre fiche mannequin pour le moment.', code: 'MODEL_LOOKUP_FAILED' }, { status: 503 });
  }
  if (!model) return NextResponse.json({ error: 'Ce profil mannequin n’a pas été retrouvé. Revenez à l’étape précédente et sélectionnez votre fiche dans la liste.', code: 'MODEL_NOT_FOUND' }, { status: 404 });
  if (model.auth_user_id || unavailableStates.has(String(model.claim_status || ''))) return NextResponse.json({ error: 'Ce profil possède déjà un compte ou une activation est déjà en cours. Essayez de vous connecter avant de recommencer la procédure.', code: 'CLAIM_UNAVAILABLE' }, { status: 409 });

  const mode = verificationMode(model, { email, phone, birthDate });
  const publicClient = createClient(getSupabaseUrl(), getSupabasePublishableKey(), { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data: signup, error: signupError } = await publicClient.auth.signUp({ email, password, options: { emailRedirectTo: `${SITE_URL}/auth/complete?next=/profil`, data: { name: model.name, account_source: 'model-self-signup' } } });
  if (signupError) {
    console.warn('[model-signup] Supabase signup rejected', { code: signupError.code, status: signupError.status });
    const friendly = signupFailure(signupError);
    return NextResponse.json({ error: friendly.error, code: friendly.code }, { status: friendly.status });
  }
  if (!signup.user?.id) return NextResponse.json({ error: 'Le service d’authentification n’a pas pu créer votre compte. Réessayez dans quelques instants.', code: 'AUTH_USER_MISSING' }, { status: 502 });
  if (signup.session) {
    await admin.auth.admin.deleteUser(signup.user.id).catch(() => undefined);
    return NextResponse.json({ error: 'La confirmation e-mail doit être activée pour sécuriser les inscriptions mannequin. Contactez l’agence.', code: 'EMAIL_CONFIRMATION_REQUIRED' }, { status: 503 });
  }

  const userId = signup.user.id;
  const now = new Date().toISOString();
  const pendingClaim = {
    userId, email, phone, birthDate, gender, nationality, city,
    heightCm: numberOrNull(body.heightCm, 130, 220),
    measurements: { chest: numberOrNull(body.chest, 50, 160) ?? undefined, waist: numberOrNull(body.waist, 40, 160) ?? undefined, hips: numberOrNull(body.hips, 50, 180) ?? undefined, shoeSize: String(body.shoeSize || '').trim() || undefined },
    instagramUrl: String(body.instagramUrl || '').trim() || null,
    verificationMode: mode, submittedAt: now,
  };
  const identifier = String(model.username || `Man-PMM-${String(model.id).slice(0, 6)}`);
  const { error: authMetaError } = await admin.auth.admin.updateUserById(userId, { app_metadata: { ...(signup.user.app_metadata || {}), role: 'student', identifier, pending_model_id: model.id, account_source: 'model-self-signup', must_change_password: false } });
  if (authMetaError) {
    console.error('[model-signup] auth metadata failed', authMetaError);
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
    return NextResponse.json({ error: 'Le compte a été créé mais sa préparation a échoué. Aucun compte incomplet n’a été conservé ; vous pouvez réessayer.', code: 'ACCOUNT_PREPARATION_FAILED' }, { status: 500 });
  }
  const { error: profileError } = await admin.from('profiles').upsert({ user_id: userId, role: 'student', identifier, display_name: model.name, email, model_id: null, must_change_password: false, is_active: false, metadata: { source: 'model-self-signup', pending_model_id: model.id, pending_claim: pendingClaim, claim_status: 'pending_email_confirmation' }, updated_at: now }, { onConflict: 'user_id' });
  if (profileError) {
    console.error('[model-signup] pending profile failed', profileError);
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
    return NextResponse.json({ error: 'Votre espace n’a pas pu être préparé. Vous pouvez recommencer la procédure sans créer de doublon.', code: 'PROFILE_PREPARATION_FAILED' }, { status: 500 });
  }

  return NextResponse.json({ success: true, confirmationRequired: true, email, verification: mode === 'automatic' ? 'automatic_after_email' : 'agency_review_after_email', message: 'Votre demande est enregistrée. Confirmez maintenant votre adresse e-mail.' }, { status: 201 });
}
