import 'server-only';
import { firebaseAdminAccessToken, firebaseAdminCredentials } from './firebase-admin-backend';

const COLLECTION = process.env.FIRESTORE_APPDATA_COLLECTION || 'appData';

function projectId() {
  return firebaseAdminCredentials()?.project_id || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'perfect-156b5';
}

function documentUrl(key: string) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId())}/databases/(default)/documents/${encodeURIComponent(COLLECTION)}/${encodeURIComponent(key)}`;
}

async function firestoreRequest(method: 'GET'|'PATCH'|'DELETE', key: string, payload?: unknown) {
  const token = await firebaseAdminAccessToken();
  const response = await fetch(documentUrl(key), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === 'GET' || method === 'DELETE' ? {} : { 'Content-Type': 'application/json' }),
    },
    body: method === 'PATCH' ? JSON.stringify(payload) : undefined,
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firestore ${method} ${response.status}: ${String(data?.error?.message || 'requête refusée')}`);
    (error as any).status = response.status;
    throw error;
  }
  return data;
}

export async function firestoreGetCollection(key: string) {
  try {
    const doc = await firestoreRequest('GET', key);
    const payload = doc?.fields?.payload?.stringValue;
    if (typeof payload !== 'string') return null;
    return JSON.parse(payload);
  } catch (error: any) {
    if (error?.status === 404) return null;
    throw error;
  }
}

export async function firestoreSetCollection(key: string, value: unknown) {
  const payload = JSON.stringify(value ?? null);
  if (Buffer.byteLength(payload, 'utf8') > 900_000) {
    throw new Error(`Collection ${key} trop volumineuse pour le document Firestore de compatibilité.`);
  }
  return firestoreRequest('PATCH', key, {
    fields: {
      payload: { stringValue: payload },
      schemaVersion: { integerValue: '1' },
      updatedAt: { timestampValue: new Date().toISOString() },
      source: { stringValue: 'perfect-models-nextjs' }
    }
  });
}

export async function firestoreDeleteCollection(key: string) {
  try { await firestoreRequest('DELETE', key); } catch (error: any) { if (error?.status !== 404) throw error; }
}

export async function firestoreHealthcheck() {
  const token = await firebaseAdminAccessToken();
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId())}/databases/(default)/documents/${encodeURIComponent(COLLECTION)}?pageSize=1`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Firestore health ${response.status}: ${String(data?.error?.message || 'indisponible')}`);
  return { ok: true, projectId: projectId(), collection: COLLECTION };
}
