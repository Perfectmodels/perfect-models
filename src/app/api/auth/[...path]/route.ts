import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ensureUserProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ path: string[] }> };

function canonicalOrigin(request: Request) {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '')
    .trim()
    .replace(/\/$/, '');
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:')) {
        return parsed.origin;
      }
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
  if (password.length < 12) {
    throw Object.assign(new Error('Le mot de passe doit contenir au moins 12 caractères.'), { status: 400 });
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw Object.assign(
      new Error('Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.'),
      { status: 400 },
    );
  }
  return password;
}

function authErrorStatus(error: { status?: number; code?: string } | null) {
  if (!error) return 400;
  if (error.status && error.status >= 400 && error.status < 500) return error.status;
  return 400;
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
      if (!email || !password) return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 401 });

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        const invalid = /invalid login credentials|invalid credentials/i.test(String(error?.message || ''));
        return NextResponse.json({
          error: invalid
            ? 'Identifiants invalides. Utilisez « Mot de passe oublié » pour créer ou réinitialiser votre mot de passe.'
            : 'Connexion temporairement indisponible.',
          code: invalid ? 'INVALID_CREDENTIALS' : error?.code,
        }, { status: invalid ? 401 : authErrorStatus(error) });
      }

      const profile = await ensureUserProfile(data.user);
      if (!profile || profile.status === 'inactive') {
        await supabase.auth.signOut({ scope: 'local' });
        return NextResponse.json({ error: 'Ce compte PMM est inactif ou incomplet.' }, { status: 403 });
      }

      return NextResponse.json({
        user: { id: data.user.id, email: data.user.email || null, name: profile.name, role: profile.role },
      });
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
      if (!email) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
      const redirectTo = `${canonicalOrigin(request)}/auth/confirm?next=/auth/set-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error && error.status !== 429) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'change-password') {
      const password = validatePassword(body.newPassword);
      const { data: current, error: currentError } = await supabase.auth.getUser();
      if (currentError || !current.user) {
        return NextResponse.json({ error: 'Session expirée. Demandez un nouveau lien.' }, { status: 401 });
      }

      const hasPasswordGrant = request.headers.get('cookie')
        ?.split(';')
        .some((cookie) => cookie.trim() === 'pmm_password_grant=1') === true;
      const mustChoosePassword = current.user.app_metadata?.must_change_password === true;
      if (!hasPasswordGrant && !mustChoosePassword) {
        const currentPassword = String(body.currentPassword || '');
        if (!currentPassword || !current.user.email) {
          return NextResponse.json({ error: 'Le mot de passe actuel est requis.' }, { status: 400 });
        }
        const { error: verificationError } = await supabase.auth.signInWithPassword({
          email: current.user.email,
          password: currentPassword,
        });
        if (verificationError) {
          return NextResponse.json({ error: 'Le mot de passe actuel est incorrect.' }, { status: 400 });
        }
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      const admin = createSupabaseAdminClient();
      const appMetadata = current.user.app_metadata || {};
      const [authUpdate, profileUpdate] = await Promise.all([
        admin.auth.admin.updateUserById(current.user.id, {
          app_metadata: { ...appMetadata, must_change_password: false },
        }),
        admin.from('profiles').update({
          must_change_password: false,
          updated_at: new Date().toISOString(),
        }).eq('user_id', current.user.id),
      ]);
      if (authUpdate.error) throw authUpdate.error;
      if (profileUpdate.error) throw profileUpdate.error;

      const response = NextResponse.json({ success: true });
      response.cookies.set('pmm_password_grant', '', { path: '/', maxAge: 0 });
      return response;
    }

    return NextResponse.json({ error: 'Route d’authentification inconnue.' }, { status: 404 });
  } catch (error: any) {
    const message = String(error?.message || 'Erreur Supabase Authentication');
    return NextResponse.json({ error: message, message }, { status: Number(error?.status || 400) });
  }
}

export async function GET(_request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  return NextResponse.json({ service: 'supabase-auth', route: path.join('/') });
}
