const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzkodgqxrcxsnfwpmwfb.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-uHAzK1mDnmY7oXextZYAg_ZsDeHSOA';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function headers(privileged = false) {
  const key = privileged && SUPABASE_SECRET_KEY ? SUPABASE_SECRET_KEY : SUPABASE_PUBLISHABLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

async function rest(path: string, init: RequestInit = {}, privileged = false) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers(privileged), ...(init.headers || {}) },
    cache: 'no-store',
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`Supabase ${response.status}: ${data?.message || text || response.statusText}`);
    (error as any).status = response.status;
    throw error;
  }
  return data;
}

export function hasSupabasePrivilegedKey() {
  return Boolean(SUPABASE_SECRET_KEY);
}

export async function getSupabaseLegacyCollection(key: string) {
  const rows = await rest(`legacy_firebase_collections?collection_name=eq.${encodeURIComponent(key)}&select=payload&limit=1`);
  return Array.isArray(rows) && rows.length ? rows[0]?.payload ?? null : null;
}

export async function setSupabaseLegacyCollection(key: string, payload: unknown) {
  if (!SUPABASE_SECRET_KEY) return false;
  await rest('legacy_firebase_collections?on_conflict=collection_name', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ collection_name: key, payload: payload ?? null, migrated_at: new Date().toISOString(), source: 'firebase-rtdb-dual-write' }),
  }, true);
  return true;
}

export async function getSupabasePublicModels() {
  const [models, images] = await Promise.all([
    rest('public_models?select=*&order=name.asc'),
    rest('model_portfolio_images?select=model_id,url,position&order=position.asc'),
  ]);
  const imageMap = new Map<string,string[]>();
  for (const image of Array.isArray(images) ? images : []) {
    const id = String(image?.model_id || '');
    if (!id) continue;
    const arr = imageMap.get(id) || [];
    if (image?.url) arr.push(String(image.url));
    imageMap.set(id, arr);
  }
  return (Array.isArray(models) ? models : []).map((model:any) => ({
    id: model.id,
    username: model.username,
    name: model.name,
    gender: model.gender,
    age: model.age,
    height: model.height,
    location: model.location,
    level: model.level,
    imageUrl: model.image_url,
    categories: model.categories || [],
    measurements: model.measurements || {},
    distinctions: model.distinctions || [],
    experience: model.experience,
    journey: model.journey,
    fashionDayEditions: model.fashion_day_editions || [],
    portfolioImages: imageMap.get(String(model.id)) || [],
    isPublic: true,
    isActive: true,
    status: model.status || 'active',
  }));
}

export async function submitSupabaseRow(table: string, row: Record<string, unknown>) {
  await rest(table, {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify(row),
  });
}
