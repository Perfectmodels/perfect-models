import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'perfect-156b5.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'perfect-156b5',
};

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const TOKEN_BASE = 'https://securetoken.googleapis.com/v1/token';

export interface FirebaseAuthUser {
  localId: string;
  email?: string;
  displayName?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string;
}

export function firebaseConfig() {
  return config;
}

async function firebaseAuth(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${AUTH_BASE}/${path}?key=${encodeURIComponent(config.apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = String(data?.error?.message || 'Firebase Authentication error');
    const error = new Error(message);
    (error as any).status = response.status;
    throw error;
  }
  return data as any;
}

export async function firebaseSignIn(email: string, password: string) {
  return firebaseAuth('accounts:signInWithPassword', { email, password, returnSecureToken: true }) as Promise<FirebaseAuthUser>;
}

export async function firebaseSignUp(email: string, password: string, displayName?: string) {
  const result = await firebaseAuth('accounts:signUp', { email, password, returnSecureToken: true }) as FirebaseAuthUser;
  if (displayName && result.idToken) {
    await firebaseAuth('accounts:update', { idToken: result.idToken, displayName, returnSecureToken: true });
  }
  return result;
}

export async function firebaseLookup(idToken: string) {
  const data = await firebaseAuth('accounts:lookup', { idToken });
  return (data.users?.[0] || null) as FirebaseAuthUser | null;
}

export async function firebaseRefresh(refreshToken: string) {
  const response = await fetch(`${TOKEN_BASE}?key=${encodeURIComponent(config.apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }).toString(),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(data?.error?.message || 'Firebase token refresh failed'));
  return data as { id_token: string; refresh_token: string; expires_in: string; user_id: string };
}

export async function firebaseResetPassword(email: string) {
  return firebaseAuth('accounts:sendOobCode', { requestType: 'PASSWORD_RESET', email });
}

export async function firebaseChangePassword(idToken: string, password: string) {
  return firebaseAuth('accounts:update', { idToken, password, returnSecureToken: true }) as Promise<FirebaseAuthUser>;
}

export async function firebaseDatabaseGet(path: string, idToken?: string | null) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  if (idToken) url.searchParams.set('auth', idToken);
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database GET ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  return data;
}

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '';
  if (raw) {
    try { return JSON.parse(raw); } catch { return null; }
  }
  const client_email = process.env.FIREBASE_CLIENT_EMAIL || '';
  const private_key = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const project_id = process.env.FIREBASE_PROJECT_ID || config.projectId;
  return client_email && private_key ? { client_email, private_key, project_id } : null;
}

export function hasFirebaseAdminCredentials() {
  const service = serviceAccount();
  return Boolean(service?.client_email && service?.private_key && service?.project_id);
}

function b64url(value: string | Buffer) { return Buffer.from(value).toString('base64url'); }

async function firebaseAdminAccessToken() {
  const service = serviceAccount();
  if (!service) throw new Error('Compte de service Firebase non configuré côté serveur.');
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    iss: service.client_email,
    sub: service.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email',
  }));
  const unsigned = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${b64url(signer.sign(service.private_key))}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.access_token) throw new Error(`Google OAuth ${response.status}`);
  return String(data.access_token);
}

export async function firebaseAdminDatabaseGet(path: string) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  url.searchParams.set('access_token', await firebaseAdminAccessToken());
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Firebase Admin Realtime Database GET ${response.status}`);
  return data;
}

export async function firebaseDatabasePut(path: string, value: unknown, idToken?: string | null) {
  return firebaseDatabaseWrite('PUT', path, value, idToken);
}

export async function firebaseDatabasePatch(path: string, value: unknown, idToken?: string | null) {
  return firebaseDatabaseWrite('PATCH', path, value, idToken);
}

export async function firebaseDatabaseDelete(path: string, idToken?: string | null) {
  return firebaseDatabaseWrite('DELETE', path, undefined, idToken);
}

async function firebaseDatabaseWrite(method: string, path: string, value: unknown, idToken?: string | null) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  if (idToken) url.searchParams.set('auth', idToken);
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'DELETE' ? undefined : JSON.stringify(value),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database ${method} ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  return data;
}

export async function getFirebaseIdToken() {
  const store = await cookies();
  return store.get('firebase_id_token')?.value || null;
}

export async function getFirebaseRefreshToken() {
  const store = await cookies();
  return store.get('firebase_refresh_token')?.value || null;
}

export async function getValidFirebaseIdToken() {
  const idToken = await getFirebaseIdToken();
  if (idToken) {
    try {
      await firebaseLookup(idToken);
      return idToken;
    } catch {
      // Fall through to refresh.
    }
  }
  const refreshToken = await getFirebaseRefreshToken();
  if (!refreshToken) return null;
  const refreshed = await firebaseRefresh(refreshToken);
  const store = await cookies();
  store.set('firebase_id_token', refreshed.id_token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: Number(refreshed.expires_in || 3600) });
  store.set('firebase_refresh_token', refreshed.refresh_token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return refreshed.id_token;
}

export async function setFirebaseSession(user: FirebaseAuthUser) {
  const store = await cookies();
  store.set('firebase_id_token', String(user.idToken || ''), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: Number(user.expiresIn || 3600) });
  store.set('firebase_refresh_token', String(user.refreshToken || ''), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
}

export async function clearFirebaseSession() {
  const store = await cookies();
  store.delete('firebase_id_token');
  store.delete('firebase_refresh_token');
}
