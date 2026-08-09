import { getSql } from './neon';
import { neonDataApiFetch } from './neon-data-api';
import { isPublicCollection } from './data-policy';

export interface CollectionRow {
  key: string;
  data: unknown;
  is_public: boolean;
  updated_at: string;
}

async function directCollection(key: string) {
  const sql = getSql();
  const rows = (await sql.query(
    'SELECT data FROM public.app_collections WHERE key=$1 LIMIT 1',
    [key],
  )) as Array<{ data: unknown }>;
  return rows[0]?.data ?? null;
}

async function apiCollection(key: string) {
  const rows = await neonDataApiFetch<Array<{ data: unknown }>>(
    `/app_collections?select=data&key=eq.${encodeURIComponent(key)}&limit=1`,
  );
  return rows[0]?.data ?? null;
}

export async function getCollection(key: string) {
  if (process.env.DATABASE_URL) {
    try {
      return await directCollection(key);
    } catch (error) {
      if (!isPublicCollection(key)) throw error;
      console.warn('[neon] direct collection read failed; using Data API fallback', { key });
    }
  }

  if (!isPublicCollection(key)) return null;
  return apiCollection(key);
}

export async function getCollections(): Promise<CollectionRow[]> {
  if (process.env.DATABASE_URL) {
    try {
      const sql = getSql();
      return (await sql.query(
        'SELECT key,data,is_public,updated_at::text FROM public.app_collections ORDER BY key',
      )) as CollectionRow[];
    } catch {
      console.warn('[neon] direct database read failed; using public Data API fallback');
    }
  }

  return neonDataApiFetch<CollectionRow[]>(
    '/app_collections?select=key,data,is_public,updated_at&is_public=eq.true&order=key.asc',
  );
}

export async function setCollection(
  key: string,
  data: unknown,
  actorUserId?: string | null,
  action = 'replace',
) {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is required for authenticated Neon writes. Public reads remain available through the Neon Data API.',
    );
  }

  const sql = getSql();
  await sql.query(
    `INSERT INTO public.app_collections(key,data,is_public,updated_at)
     VALUES($1,$2::jsonb,$3,now())
     ON CONFLICT(key) DO UPDATE
     SET data=EXCLUDED.data,is_public=EXCLUDED.is_public,updated_at=now()`,
    [key, JSON.stringify(data ?? null), isPublicCollection(key)],
  );

  if (actorUserId) {
    await sql
      .query(
        'INSERT INTO public.app_data_audit(collection_key,action,actor_user_id) VALUES($1,$2,$3::uuid)',
        [key, action, actorUserId],
      )
      .catch(() => undefined);
  }
}

export function collectionToArray(value: unknown): any[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).filter(Boolean);
  }
  return [];
}

const idx = (arr: any[], s: string) =>
  /^\d+$/.test(s) ? Number(s) : arr.findIndex((i) => i && String(i.id) === s);

export function getNestedValue(root: any, segs: string[]) {
  let c = root;
  for (const s of segs) {
    if (c == null) return null;
    if (Array.isArray(c)) {
      const i = idx(c, s);
      if (i < 0) return null;
      c = c[i];
    } else c = c[s];
  }
  return c ?? null;
}

export function setNestedValue(root: any, segs: string[], value: any): any {
  if (!segs.length) return value;
  const copy = Array.isArray(root)
    ? [...root]
    : { ...(root && typeof root === 'object' ? root : {}) };
  const [h, ...t] = segs;
  if (Array.isArray(copy)) {
    let i = idx(copy, h);
    if (i < 0) {
      copy.push({ id: h });
      i = copy.length - 1;
    }
    copy[i] = t.length ? setNestedValue(copy[i], t, value) : value;
    return copy;
  }
  copy[h] = t.length ? setNestedValue(copy[h], t, value) : value;
  return copy;
}

export function patchNestedValue(root: any, segs: string[], updates: Record<string, unknown>) {
  const current = getNestedValue(root, segs);
  return setNestedValue(root, segs, {
    ...(current && typeof current === 'object' ? current : {}),
    ...updates,
  });
}

export function deleteNestedValue(root: any, segs: string[]): any {
  if (!segs.length) return null;
  const copy = Array.isArray(root)
    ? [...root]
    : { ...(root && typeof root === 'object' ? root : {}) };
  const [h, ...t] = segs;
  if (Array.isArray(copy)) {
    const i = idx(copy, h);
    if (i < 0) return copy;
    if (!t.length) {
      copy.splice(i, 1);
      return copy;
    }
    copy[i] = deleteNestedValue(copy[i], t);
    return copy;
  }
  if (!t.length) delete copy[h];
  else if (copy[h] != null) copy[h] = deleteNestedValue(copy[h], t);
  return copy;
}
