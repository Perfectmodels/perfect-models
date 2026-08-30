import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ensureUserProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ path: string[] }> };
type AuthLikeError = { status?: number; code?: string; message?: string } | null | undefined;

function canonicalOrigin(request: Request) {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '')
    .trim()
    .replace(/\/$/, '');
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:')) return parsed.origin;
    } catch {}
  }
  return new URL(request.url).origin;
}

function validEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

async function resolveLoginEmail(value: unknown) {
  const candidate = String(value || '').trim().toLowerCase().slice(0, 254);
  const directEmail = validEmail(candidate);
  if (directEmail) return directEmail;
  if (!candidate || !/^[a-z0-9._-]{1,120}$/.test(candidate)) return '';
  if (candidate === 'admin') return 'admin@perfectmodels.online';

  const admin = createSupabaseAdminClient();
  const pattern = candidate.replace(/[%_\\]/g, '\\$&');
  const { data, error } = await admin
    .from('profiles')
    .select('email')
    .ilike('identifier', pattern)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return validEmail(data?.email);
}

function validatePassword(value: unknown) {
  const password = String(value || '');
  if (password.length < 12) throw Object.assign(new Error('Le mot de passe doit contenir au moins 12 caractères.'), { status: 400, code: 'PASSWORD_TOO_SHORT' });
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw Object.assign(new Error('Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.'), { status: 400, code: 'PASSWORD_POLICY' });
  }
  return password;
}

function isRateLimited(error: AuthLikeError) {
  const code = String(error?.code || '').toLowerCase();
  return error?.status === 429 || code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || code.includes('rate_limit');
}

function friendlyAuthError(error: AuthLikeError, context: 'login' | 'recovery' | 'password' = 'login') {
  const code = String(error?.code || '').toLowerCase();
  if (isRateLimited(error)) return { status: 429, code: 'RATE_LIMITED', error: 'Trop de tentatives rapprochées. Patientez quelques minutes avant de réessayer.' };
  if (code === 'invalid_credentials' || code === 'invalid_login_credentials') return { status: 401, code: 'INVALID_CREDENTIALS', error: context === 'password' ? 'Le mot de passe actuel est incorrect.' : 'E-mail, identifiant ou mot de passe incorrect.' };
  if (code === 'email_not_confirmed') return { status: 403, code: 'EMAIL_NOT_CONFIRMED', error: 'Votre adresse e-mail n’est pas encore confirmée. Ouvrez le message reçu lors de l’inscription, puis réessayez.' };
  if (code === 'weak_password') return { status: 400, code: 'WEAK_PASSWORD', error: 'Choisissez un mot de passe plus robuste : 12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.' };
  if (code === 'same_password') return { status: 400, code: 'SAME_PASSWORD', error: 'Choisissez un nouveau mot de passe différent de l’ancien.' };
  if (code === 'session_not_found' || code === 'refresh_token_not_found' || code === 'refresh_token_already_used') return { status: 401, code: 'SESSION_EXPIRED', error: 'Votre session a expiré. Reconnectez-vous pour continuer.' };
  if (context === 'recovery') return { status: 503, code: 'RECOVERY_UNAVAILABLE', error: 'L’envoi du lien de réinitialisation est momentanément indisponible. Réessayez un peu plus tard.' };
  if (context === 'password') return { status: 400, code: 'PASSWORD_UPDATE_FAILED', error: 'Le mot de passe n’a pas pu être mis à jour. Vérifiez les informations saisies puis réessayez.' };
  return { status: 503, code: 'AUTH_UNAVAILABLE', error: 'La connexion est momentanément indisponible. Réessayez dans quelques instants.' };
}

export async function POST(request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  const action = path.join('/');
  const body = await request.json().catch(() => ({}));

  try {
    const supabase = await createSupabaseServerClient();

    if (action === 'sign-in/email') {
      const email = await resolveLoginEmail(body.identifier || body.email);
      const password = String(body.password || '');
      if (!email || !password) return NextResponse.json({ error: 'Saisissez votre e-mail ou identifiant PMM ainsi que votre mot de passe.', code: 'MISSING_CREDENTIALS' }, { status: 400 });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        if (error) console.warn('[auth] sign-in rejected', { code: error.code, status: error.status });
        const friendly = friendlyAuthError(error, 'login');
        return NextResponse.json({ error: friendly.error, code: friendly.code }, { status: friendly.status });
      }

      const profile = await ensureUserProfile(data.user);
      if (!profile || profile.status === 'inactive') {
        await supabase.auth.signOut({ scope: 'local' });
        return NextResponse.json({ error: 'Votre compte existe mais son accès PMM n’est pas encore actif. Contactez l’agence si cette situation persiste.', code: 'PROFILE_INACTIVE' }, { status: 403 });
      }

      return NextResponse.json({ user: { id: data.user.id, email: data.user.email || null, name: profile.name, role: profile.role } });
    }

    if (action === 'sign-up/email') {
      return NextResponse.json({
        error: "L'inscription directe est désactivée. Les comptes PMM sont créés après validation de l'agence.",
        code: 'PUBLIC_SIGNUP_DISABLED',
      }, { status: 403 });
    }

    if (action === 'sign-out') {
      await supabase.auth.signOut({ scope: 'local' });
      const response = NextResponse.json({ success: true });
      response.cookies.set('pmm_password_grant', '', { path: '/', maxAge: 0 });
      return response;
    }

    if (action === 'forget-password') {
      const email = validEmail(body.email);
      if (!email) return NextResponse.json({ error: 'Saisissez une adresse e-mail valide.', code: 'INVALID_EMAIL' }, { status: 400 });
      const redirectTo = `${canonicalOrigin(request)}/auth/confirm?next=/auth/set-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        console.warn('[auth] recovery request failed', { code: error.code, status: error.status });
        const friendly = friendlyAuthError(error, 'recovery');
        return NextResponse.json({ error: friendly.error, code: friendly.code }, { status: friendly.status });
      }
      return NextResponse.json({ success: true, message: 'Si un compte correspond à cette adresse, un lien de réinitialisation vient d’être envoyé.' });
    }

    if (action === 'change-password') {
      const password = validatePassword(body.newPassword);
      const { data: current, error: currentError } = await supabase.auth.getUser();
      if (currentError || !current.user) return NextResponse.json({ error: 'Votre session de sécurité a expiré. Demandez un nouveau lien ou reconnectez-vous.', code: 'SESSION_EXPIRED' }, { status: 401 });

      const hasPasswordGrant = request.headers.get('cookie')
        ?.split(';')
        .some((cookie) => cookie.trim() === 'pmm_password_grant=1') === true;
      const mustChoosePassword = current.user.app_metadata?.must_change_password === true;
      if (!hasPasswordGrant && !mustChoosePassword) {
        const currentPassword = String(body.currentPassword || '');
        if (!currentPassword || !current.user.email) return NextResponse.json({ error: 'Saisissez votre mot de passe actuel pour confirmer cette modification.', code: 'CURRENT_PASSWORD_REQUIRED' }, { status: 400 });
        const { error: verificationError } = await supabase.auth.signInWithPassword({ email: current.user.email, password: currentPassword });
        if (verificationError) {
          const friendly = friendlyAuthError(verificationError, 'password');
          return NextResponse.json({ error: friendly.error, code: friendly.code }, { status: friendly.status });
        }
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error('[auth] password update failed', { code: error.code, status: error.status });
        const friendly = friendlyAuthError(error, 'password');
        return NextResponse.json({ error: friendly.error, code: friendly.code }, { status: friendly.status });
      }

      const admin = createSupabaseAdminClient() as any;
      const appMetadata = current.user.app_metadata || {};
      const now = new Date().toISOString();
      const [authUpdate, profileUpdate] = await Promise.all([
        admin.auth.admin.updateUserById(current.user.id, { app_metadata: { ...appMetadata, must_change_password: false } }),
        admin.from('profiles').update({ must_change_password: false, updated_at: now }).eq('user_id', current.user.id),
      ]);
      if (authUpdate.error || profileUpdate.error) {
        console.error('[auth] password metadata synchronization failed', authUpdate.error || profileUpdate.error);
        return NextResponse.json({ error: 'Le mot de passe a été modifié, mais votre profil PMM n’a pas pu être synchronisé. Reconnectez-vous avant de continuer.', code: 'PROFILE_SYNC_FAILED' }, { status: 503 });
      }

      const notice = await admin.from('notifications').insert({
        recipient_user_id: current.user.id,
        type: 'security',
        title: 'Mot de passe mis à jour',
        body: 'Votre mot de passe Perfect Models Management a été modifié avec succès.',
        href: '/profil',
        is_read: false,
        metadata: { event: 'password_changed' },
      });
      if (notice.error) console.warn('[auth] password notification not persisted', notice.error);

      const response = NextResponse.json({ success: true, message: 'Votre mot de passe a été enregistré.' });
      response.cookies.set('pmm_password_grant', '', { path: '/', maxAge: 0 });
      return response;
    }

    return NextResponse.json({ error: 'Cette action d’authentification n’existe pas.', code: 'UNKNOWN_AUTH_ROUTE' }, { status: 404 });
  } catch (error: any) {
    console.error('[auth] unexpected failure', error);
    const status = Number(error?.status || 500);
    if (status >= 400 && status < 500 && error?.message && (error?.code === 'PASSWORD_TOO_SHORT' || error?.code === 'PASSWORD_POLICY')) {
      return NextResponse.json({ error: String(error.message), code: String(error.code) }, { status });
    }
    return NextResponse.json({ error: 'Une erreur technique empêche momentanément cette action. Réessayez dans quelques instants.', code: 'AUTH_TECHNICAL_ERROR' }, { status: 500 });
  }
}

export async function GET(_request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  return NextResponse.json({ service: 'supabase-auth', route: path.join('/') });
}
