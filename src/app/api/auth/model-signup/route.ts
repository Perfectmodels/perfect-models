import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/supabase/config';
import { normalizePhone, objectValue, validPassword, verificationMode } from '@/lib/model-claims';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.perfectmodels.online').replace(/\/$/, '');
const claimedStates = new Set(['pending_email_confirmation', 'pending_agency_review', 'claimed', 'claim_in_progress']);

function numberOrNull(value: unknown, min: number, max: number) { const parsed = Number(value); return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null; }

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
  if (!modelId || !email || !phone || !birthDate || !gender || !city) return NextResponse.json({ error: 'Profil, e-mail, téléphone, date de naissance, genre et ville sont obligatoires.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
  if (!validPassword(password)) return NextResponse.json({ error: 'Le mot de passe doit contenir 12 caractères minimum, une majuscule, une minuscule, un chiffre et un caractère spécial.' }, { status: 400 });
  if (password !== confirmPassword) return NextResponse.json({ error: 'Les mots de passe ne correspondent pas.' }, { status: 400 });

  const admin = createSupabaseAdminClient() as any;
  const { data: model, error: modelError } = await admin.from('models').select('*').eq('id', modelId).maybeSingle();
  if (modelError || !model) return NextResponse.json({ error: 'Profil mannequin introuvable.' }, { status: 404 });
  if (model.auth_user_id || claimedStates.has(String(model.claim_status || ''))) return NextResponse.json({ error: 'Ce profil est déjà rattaché à un compte ou fait l’objet d’une activation en cours.' }, { status: 409 });

  const mode = verificationMode(model, { email, phone, birthDate });
  const publicClient = createClient(getSupabaseUrl(), getSupabasePublishableKey(), { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data: signup, error: signupError } = await publicClient.auth.signUp({ email, password, options: { emailRedirectTo: `${SITE_URL}/auth/complete?next=/profil`, data: { name: model.name, account_source: 'model-self-signup' } } });
  if (signupError) return NextResponse.json({ error: signupError.message || 'Création du compte Supabase impossible.' }, { status: 400 });
  if (!signup.user?.id) return NextResponse.json({ error: 'Supabase Auth n’a pas retourné de compte utilisateur.' }, { status: 502 });
  if (signup.session) {
    await admin.auth.admin.deleteUser(signup.user.id).catch(() => undefined);
    return NextResponse.json({ error: 'La confirmation e-mail Supabase doit être activée pour les inscriptions mannequin.' }, { status: 503 });
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
  const raw = objectValue(model.raw_data);
  const { data: reserved, error: reserveError } = await admin.from('models').update({ claim_status: 'pending_email_confirmation', raw_data: { ...raw, pendingClaim }, updated_at: now }).eq('id', model.id).is('auth_user_id', null).or('claim_status.is.null,claim_status.eq.pending_claim,claim_status.eq.not_applicable,claim_status.eq.rejected').select('id').maybeSingle();
  if (reserveError || !reserved) {
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
    return NextResponse.json({ error: 'Ce profil vient d’être réservé par une autre inscription. Rechargez la page.' }, { status: 409 });
  }

  const identifier = String(model.username || `Man-PMM-${String(model.id).slice(0, 6)}`);
  const { error: authMetaError } = await admin.auth.admin.updateUserById(userId, { app_metadata: { ...(signup.user.app_metadata || {}), role: 'student', identifier, pending_model_id: model.id, account_source: 'model-self-signup', must_change_password: false } });
  if (authMetaError) return NextResponse.json({ error: authMetaError.message }, { status: 500 });
  const { error: profileError } = await admin.from('profiles').upsert({ user_id: userId, role: 'student', identifier, display_name: model.name, email, model_id: null, must_change_password: false, is_active: false, metadata: { source: 'model-self-signup', pending_model_id: model.id, claim_status: 'pending_email_confirmation' }, updated_at: now }, { onConflict: 'user_id' });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ success: true, confirmationRequired: true, email, verification: mode === 'automatic' ? 'automatic_after_email' : 'agency_review_after_email' }, { status: 201 });
}
