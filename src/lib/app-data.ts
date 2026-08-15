import { firebaseDatabaseGet, firebaseDatabasePut, getValidFirebaseIdToken } from './firebase-backend';

export interface CollectionRow {
  key: string;
  data: unknown;
  is_public: boolean;
  updated_at: string;
}

export async function getCollection(key: string) {
  const token = await getValidFirebaseIdToken();
  return firebaseDatabaseGet(key, token);
}

export async function getCollections(): Promise<CollectionRow[]> {
  const root = (await getCollection('')) || {};
  return Object.entries(root).map(([key, data]) => ({
    key,
    data,
    is_public: true,
    updated_at: new Date().toISOString(),
  }));
}

export async function setCollection(key: string, data: unknown) {
  const token = await getValidFirebaseIdToken();
  if (!token) throw new Error('Authentification Firebase requise pour cette opération.');
  await firebaseDatabasePut(key, data ?? null, token);
}

export function collectionToArray(value: unknown): any[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).filter(Boolean);
  return [];
}

const idx = (arr: any[], s: string) => /^\d+$/.test(s) ? Number(s) : arr.findIndex((i) => i && String(i.id) === s);

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
  const copy = Array.isArray(root) ? [...root] : { ...(root && typeof root === 'object' ? root : {}) };
  const [h, ...t] = segs;
  if (Array.isArray(copy)) {
    let i = idx(copy, h);
    if (i < 0) { copy.push({ id: h }); i = copy.length - 1; }
    copy[i] = t.length ? setNestedValue(copy[i], t, value) : value;
    return copy;
  }
  copy[h] = t.length ? setNestedValue(copy[h], t, value) : value;
  return copy;
}

export function patchNestedValue(root: any, segs: string[], updates: Record<string, unknown>) {
  const current = getNestedValue(root, segs);
  return setNestedValue(root, segs, { ...(current && typeof current === 'object' ? current : {}), ...updates });
}

export function deleteNestedValue(root: any, segs: string[]): any {
  if (!segs.length) return null;
  const copy = Array.isArray(root) ? [...root] : { ...(root && typeof root === 'object' ? root : {}) };
  const [h, ...t] = segs;
  if (Array.isArray(copy)) {
    const i = idx(copy, h);
    if (i < 0) return copy;
    if (!t.length) { copy.splice(i, 1); return copy; }
    copy[i] = deleteNestedValue(copy[i], t);
    return copy;
  }
  if (!t.length) delete copy[h];
  else if (copy[h] != null) copy[h] = deleteNestedValue(copy[h], t);
  return copy;
}
