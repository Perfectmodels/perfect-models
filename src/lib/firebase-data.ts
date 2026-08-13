const FIREBASE_DATABASE_URL = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '').replace(/\/$/, '');

function endpoint(path: string) {
  if (!FIREBASE_DATABASE_URL) throw new Error('NEXT_PUBLIC_FIREBASE_DATABASE_URL is not configured');
  const clean = path.replace(/^\/+|\/+$/g, '');
  return `${FIREBASE_DATABASE_URL}/${clean}.json`;
}

export async function firebaseRead<T = unknown>(path: string): Promise<T | null> {
  const response = await fetch(endpoint(path), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Firebase read failed (${response.status})`);
  return response.json();
}

export async function firebaseWrite<T = unknown>(path: string, value: T, method: 'PUT' | 'PATCH' = 'PUT') {
  const response = await fetch(endpoint(path), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`Firebase write failed (${response.status})`);
  return response.json();
}

export async function firebaseRemove(path: string) {
  const response = await fetch(endpoint(path), { method: 'DELETE' });
  if (!response.ok) throw new Error(`Firebase delete failed (${response.status})`);
  return response.json();
}
