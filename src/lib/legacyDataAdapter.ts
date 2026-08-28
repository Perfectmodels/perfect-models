'use client';

type LegacyRef = { path: string; key: string | null };
type LegacySnapshot = {
  val: () => any;
  exists: () => boolean;
};

export const legacyDb = { provider: 'supabase' } as const;

const clean = (value: string) => String(value || '').replace(/^\/+|\/+$/g, '');
const encodePath = (value: string) => clean(value).split('/').filter(Boolean).map(encodeURIComponent).join('/');
const SERVER_CREATED_COLLECTIONS = new Set([
  'castingApplications',
  'contactMessages',
  'bookingRequests',
  'fashionDayApplications',
  'recoveryRequests',
]);

export function ref(_db: unknown, path: string): LegacyRef {
  const normalized = clean(path);
  const parts = normalized.split('/').filter(Boolean);
  return { path: normalized, key: parts.length ? parts[parts.length - 1] : null };
}

export function push(parent: LegacyRef): LegacyRef {
  const key = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return ref(legacyDb, `${parent.path}/${key}`);
}

async function request(target: LegacyRef, init?: RequestInit) {
  const response = await fetch(`/api/data/${encodePath(target.path)}`, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || `Erreur de données (${response.status}).`);
  return data;
}

export async function get(target: LegacyRef): Promise<LegacySnapshot> {
  const data = await request(target);
  return {
    val: () => data,
    exists: () => data !== null && data !== undefined,
  };
}

export async function set(target: LegacyRef, value: unknown) {
  const parts = clean(target.path).split('/').filter(Boolean);
  const [collection] = parts;

  // Les anciens formulaires Firebase faisaient push()+set(). Pour les collections
  // publiques, on laisse désormais le serveur créer l'identifiant afin que la
  // validation, la persistance et les emails transactionnels soient atomiques.
  if (parts.length === 2 && SERVER_CREATED_COLLECTIONS.has(collection)) {
    await request(ref(legacyDb, collection), { method: 'POST', body: JSON.stringify(value) });
    return;
  }

  await request(target, { method: 'PUT', body: JSON.stringify(value) });
}

export async function update(target: LegacyRef, value: Record<string, unknown>) {
  await request(target, { method: 'PATCH', body: JSON.stringify(value) });
}

export async function remove(target: LegacyRef) {
  await request(target, { method: 'DELETE' });
}

export function onValue(target: LegacyRef, callback: (snapshot: LegacySnapshot) => void) {
  let active = true;
  let timer: ReturnType<typeof setInterval> | null = null;
  const load = async () => {
    try {
      const snapshot = await get(target);
      if (active) callback(snapshot);
    } catch (error) {
      if (active) console.error('[legacyDataAdapter] lecture Supabase impossible', error);
    }
  };
  void load();
  timer = setInterval(() => { void load(); }, 2500);
  return () => {
    active = false;
    if (timer) clearInterval(timer);
  };
}
