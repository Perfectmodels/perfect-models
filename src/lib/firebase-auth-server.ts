import { cookies } from 'next/headers';

const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const COOKIE = 'pmm-firebase-token';

export async function firebaseAuthLookup(idToken: string) {
  if (!API_KEY) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not configured');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const payload = await response.json().catch(() => ({}));
  return payload?.users?.[0] || null;
}

export async function getFirebaseAuthSession() {
  const store = await cookies();
  const idToken = store.get(COOKIE)?.value;
  if (!idToken) return null;
  const user = await firebaseAuthLookup(idToken);
  return user ? { idToken, user } : null;
}

export function attachFirebaseToken(response: Response, idToken: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.append('Set-Cookie', `${COOKIE}=${encodeURIComponent(idToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure}`);
}

export function clearFirebaseToken(response: Response) {
  response.headers.append('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
