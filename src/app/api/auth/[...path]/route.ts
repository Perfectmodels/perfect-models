import { NextResponse } from 'next/server';
import { ensureUserProfile } from '@/lib/auth/profile';
import {
  clearSupabaseSession,
  getSupabaseAccessToken,
  setSupabaseSession,
  supabaseChangePassword,
  supabaseResetPassword,
  supabaseSignIn,
  supabaseSignUp,
} from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ path: string[] }> };

export async function POST(request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  const action = path.join('/');
  const body = await request.json().catch(() => ({}));
  try {
    if (action === 'sign-in/email') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      try {
        const session = await supabaseSignIn(email, password);
        await setSupabaseSession(session);
        return NextResponse.json({ user: { id: session.user.id, email: session.user.email || null, name: session.user.user_metadata?.name || null } });
      } catch (error:any) {
        const message = String(error?.message || 'Connexion impossible');
        if (/invalid login credentials|invalid credentials/i.test(message)) {
          return NextResponse.json({
            error: 'Identifiants invalides. Si c’est votre première connexion depuis la migration, utilisez « Mot de passe oublié » pour définir votre mot de passe Supabase.',
            code: 'PASSWORD_RESET_REQUIRED_OR_INVALID_CREDENTIALS',
          }, { status: 401 });
        }
        throw error;
      }
    }
    if (action === 'sign-up/email') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || email.split('@')[0] || '');
      const session = await supabaseSignUp(email, password, name);
      if (session.access_token && session.refresh_token) await setSupabaseSession(session);
      if (session.user) await ensureUserProfile({ id: session.user.id, email, user_metadata: { name } });
      return NextResponse.json({ user: { id: session.user.id, email: session.user.email || email, name } }, { status: 201 });
    }
    if (action === 'sign-out') {
      await clearSupabaseSession();
      return NextResponse.json({ success: true });
    }
    if (action === 'forget-password') {
      await supabaseResetPassword(String(body.email || '').trim().toLowerCase());
      return NextResponse.json({ success: true });
    }
    if (action === 'change-password') {
      const token = await getSupabaseAccessToken();
      if (!token) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
      await supabaseChangePassword(token, String(body.newPassword || ''));
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Route d’authentification inconnue.' }, { status: 404 });
  } catch (error:any) {
    const message = String(error?.message || 'Erreur Supabase Authentication');
    return NextResponse.json({ error: message, message }, { status: Number(error?.status || 400) });
  }
}

export async function GET(_request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  return NextResponse.json({ service: 'supabase-auth', route: path.join('/') });
}
