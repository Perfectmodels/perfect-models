import { NextResponse } from 'next/server';
import { clearFirebaseSession, firebaseChangePassword, firebaseResetPassword, firebaseSignIn, firebaseSignUp, setFirebaseSession } from '@/lib/firebase-backend';
import { ensureUserProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ path: string[] }> };

export async function POST(request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  const action = path.join('/');
  const body = await request.json().catch(() => ({}));

  try {
    if (action === 'sign-in/email') {
      const result = await firebaseSignIn(String(body.email || '').trim().toLowerCase(), String(body.password || ''));
      await setFirebaseSession(result);
      return NextResponse.json({ user: { id: result.localId, email: result.email || null, name: result.displayName || null } });
    }

    if (action === 'sign-up/email') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const name = String(body.name || email.split('@')[0] || '');
      const result = await firebaseSignUp(email, password, name);
      await ensureUserProfile({ localId: result.localId, email, displayName: name });
      await setFirebaseSession(result);
      return NextResponse.json({ user: { id: result.localId, email: result.email || null, name: result.displayName || null } }, { status: 201 });
    }

    if (action === 'sign-out') {
      await clearFirebaseSession();
      return NextResponse.json({ success: true });
    }

    if (action === 'forget-password') {
      await firebaseResetPassword(String(body.email || '').trim().toLowerCase());
      return NextResponse.json({ success: true });
    }

    if (action === 'change-password') {
      const { getFirebaseIdToken } = await import('@/lib/firebase-backend');
      const token = await getFirebaseIdToken();
      if (!token) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
      const result = await firebaseChangePassword(token, String(body.newPassword || ''));
      await setFirebaseSession(result);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Route d’authentification inconnue.' }, { status: 404 });
  } catch (error:any) {
    const message = String(error?.message || 'Erreur Firebase Authentication');
    const status = Number(error?.status || 400);
    return NextResponse.json({ error: message, message }, { status });
  }
}

export async function GET(_request: Request, context: Ctx) {
  const { path = [] } = await context.params;
  return NextResponse.json({ service: 'firebase-auth', route: path.join('/') });
}
