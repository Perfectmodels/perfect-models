import 'server-only';
import { createSign } from 'node:crypto';

const DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email';

type ServiceAccount = { project_id?: string; client_email?: string; private_key?: string };
let cachedToken: { value: string; expiresAt: number } | null = null;

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function credentials(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ServiceAccount;
      if (parsed.client_email && parsed.private_key) return parsed;
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON est invalide.');
    }
  }
  const client_email = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const private_key = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  const project_id = process.env.FIREBASE_PROJECT_ID?.trim() || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (client_email && private_key) return { client_email, private_key, project_id };
  return null;
}

export function firebaseAdminConfigured() {
  return Boolean(credentials());
}

async function accessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  const account = credentials();
  if (!account?.client_email || !account.private_key) {
    throw new Error('Firebase Admin non configuré côté serveur. Ajoutez FIREBASE_SERVICE_ACCOUNT_JSON dans Vercel.');
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    iss: account.client_email,
    sub: account.client_email,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
    scope: SCOPE,
  }));
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(account.private_key);
  const assertion = `${unsigned}.${base64url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.access_token) {
    throw new Error(`Firebase Admin OAuth ${response.status}: ${String(data?.error_description || data?.error || 'token indisponible')}`);
  }
  cachedToken = { value: String(data.access_token), expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

function urlFor(path: string) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  return `${DATABASE_URL.replace(/\/$/, '')}/${cleanPath ? `${cleanPath}.json` : '.json'}`;
}

async function request(method: 'GET'|'PUT'|'PATCH'|'DELETE', path: string, value?: unknown) {
  const token = await accessToken();
  const response = await fetch(urlFor(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === 'GET' || method === 'DELETE' ? {} : { 'Content-Type': 'application/json' }),
    },
    body: method === 'GET' || method === 'DELETE' ? undefined : JSON.stringify(value ?? null),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Admin Realtime Database ${method} ${response.status}`);
    (error as any).status = response.status;
    throw error;
  }
  return data;
}

export const firebaseAdminDatabaseGet = (path: string) => request('GET', path);
export const firebaseAdminDatabasePut = (path: string, value: unknown) => request('PUT', path, value);
export const firebaseAdminDatabasePatch = (path: string, value: unknown) => request('PATCH', path, value);
export const firebaseAdminDatabaseDelete = (path: string) => request('DELETE', path);
