import { NextResponse } from 'next/server';
import {
  clearSupabaseSession,
  getSupabaseAccessToken,
  privilegedSupabaseUpsert,
  setSupabaseSession,
  supabaseAdminUpdateUser,
  supabaseChangePassword,
  supabaseResetPassword,
  supabaseSignIn,
} from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ path: string[] }> };

function canonicalOrigin(request: Request) {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').trim().replace(/\/$/, '');
  if (configured) {
    try {
      const parsed = new URL(configured);
      if (parsed.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && parsed.protocol === 'http:')) return parsed.origin;
    } catch {}
  }
  const origin = new URL(request.url).origin;
  return origin;
}

function validEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function validatePassword(value: unknown) {
  const password = String(value || '');
  if (password.length < 12) throw Object.assign(new Error('Le mot de passe doit contenir au moins 12 caractères.'), { status: 400 });
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    throw Object.assign(new Error('Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.'), { status: 400 });
  }
  return password;
}

export async function POST(request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  const action = path.join('/');
  const body = await request.json().catch(() => ({}));

  try {
    if (action === 'sign-in/email') {
      const email = validEmail(body.email);
      const password = String(body.password || '');
      if (!email || !password) return NextResponse.json({ error: 'Identifiants invalides.' }, { status: 400 });
      try {
        const session = await supabaseSignIn(email, password);
        await setSupabaseSession(session);
        return NextResponse.json({ user: { id: session.user.id, email: session.user.email || null, name: session.user.user_metadata?.name || null } });
      } catch (error: any) {
        const message = String(error?.message || 'Connexion impossible');
        if (/invalid login credentials|invalid credentials/i.test(message)) {
          return NextResponse.json({
            error: 'Identifiants invalides. Utilisez « Mot de passe oublié » si vous devez créer ou réinitialiser votre mot de passe.',
            code: 'INVALID_CREDENTIALS',
          }, { status: 401 });
        }
        throw error;
      }
    }

    if (action === 'sign-up/email') {
      return NextResponse.json({
        error: "L'inscription directe est désactivée. Les comptes PMM sont créés après validation de l'agence.",
        code: 'PUBLIC_SIGNUP_DISABLED',
      }, { status: 403 });
    }

    if (action === 'sign-out') {
      await clearSupabaseSession();
      return NextResponse.json({ success: true });
    }

    if (action === 'forget-password') {
      const email = validEmail(body.email);
      if (!email) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });
      const redirectTo = `${canonicalOrigin(request)}/auth/set-password`;
      await supabaseResetPassword(email, redirectTo);
      // Réponse volontairement générique pour éviter l'énumération de comptes.
      return NextResponse.json({ success: true });
    }

    if (action === 'change-password') {
      const token = await getSupabaseAccessToken();
      if (!token) return NextResponse.json({ error: 'Session expirée. Demandez un nouveau lien.' }, { status: 401 });
      const password = validatePassword(body.newPassword);
      const user = await supabaseChangePassword(token, password);
      if (user?.id) {
        await Promise.all([
          supabaseAdminUpdateUser(user.id, {
            app_metadata: { ...(user.app_metadata || {}), must_change_password: false },
          }),
          privilegedSupabaseUpsert('profiles', {
            user_id: user.id,
            email: String(user.email || '').toLowerCase() || null,
            must_change_password: false,
            is_active: true,
            updated_at: new Date().toISOString(),
          }, 'user_id'),
        ]);
      }
      return NextResponse.json({ success: true });
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