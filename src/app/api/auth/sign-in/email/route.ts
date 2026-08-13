import { NextResponse } from 'next/server';
import { attachFirebaseToken } from '@/lib/firebase-auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Firebase Auth non configuré.' }, { status: 503 });
  if (!email || !password) return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: payload?.error?.message || 'Identifiants incorrects.' }, { status: 401 });

  const result = NextResponse.json({ ok: true, user: { uid: payload.localId, email: payload.email } });
  attachFirebaseToken(result, payload.idToken);
  return result;
}
