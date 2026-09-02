import 'server-only';
import { cookies } from 'next/headers';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qzkodgqxrcxsnfwpmwfb.supabase.co').replace(/\/$/, '');
const PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function keyFor(privileged = false) {
  const key = privileged ? SECRET_KEY : PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !key) throw Object.assign(new Error('Supabase non configuré côté serveur.'), { status: 503 });
  return key;
}

async function rest(path: string, init: RequestInit = {}, privileged = true) {
  const key = keyFor(privileged);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path.replace(/^\//, '')}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw Object.assign(new Error(`Supabase ${response.status}: ${String(data?.message || data?.error_description || data?.error || text || response.statusText)}`), { status: response.status });
  return data;
}

export function hasSupabasePrivilegedKey() { return Boolean(SUPABASE_URL && SECRET_KEY); }
export function supabaseConfigured() { return Boolean(SUPABASE_URL && PUBLISHABLE_KEY && SECRET_KEY); }
export function supabasePublicConfigured() { return Boolean(SUPABASE_URL && PUBLISHABLE_KEY); }

export async function getSupabasePublicModels() {
  const [models, images] = await Promise.all([
    rest('public_models?select=*&order=name.asc', {}, false),
    rest('model_portfolio_images?select=model_id,url,position&order=position.asc', {}, false),
  ]);
  const imageMap = new Map<string, string[]>();
  for (const image of Array.isArray(images) ? images : []) {
    const id = String(image?.model_id || ''); if (!id) continue;
    const arr = imageMap.get(id) || []; if (image?.url) arr.push(String(image.url)); imageMap.set(id, arr);
  }
  return (Array.isArray(models) ? models : []).map((model: any) => ({
    id: model.id, username: model.username, name: model.name, gender: model.gender, age: model.age,
    height: model.height, location: model.location, level: model.level, imageUrl: model.image_url,
    categories: model.categories || [], measurements: model.measurements || {}, distinctions: model.distinctions || [],
    experience: model.experience, journey: model.journey, fashionDayEditions: model.fashion_day_editions || [],
    portfolioImages: imageMap.get(String(model.id)) || [], isPublic: true, isActive: true, status: model.status || 'active',
  }));
}

// Intake writes are server-only and must use the privileged Supabase key. Public
// browsers submit through PMM's validated API routes and never write directly to
// the normalized intake tables.
export async function submitSupabaseRow(table: string, row: Record<string, unknown>) {
  await rest(table, { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) }, true);
}
export async function privilegedSupabaseUpsert(table: string, rows: Record<string, unknown> | Record<string, unknown>[], onConflict?: string) {
  const conflict = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : '';
  return rest(`${table}${conflict}`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(rows) }, true);
}
export async function privilegedSupabaseDelete(table: string, filter: string) { return rest(`${table}?${filter}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } }, true); }
export async function privilegedSupabaseSelect(path: string) { return rest(path, {}, true); }

export interface SupabaseAuthUser { id: string; email?: string | null; user_metadata?: Record<string, any>; app_metadata?: Record<string, any>; }
export interface SupabaseSession { access_token: string; refresh_token: string; expires_in?: number; user: SupabaseAuthUser; }

type OtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

async function authRequest(path: string, body?: any, opts: { method?: string; accessToken?: string; admin?: boolean } = {}) {
  const key = keyFor(Boolean(opts.admin));
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: opts.method || (body === undefined ? 'GET' : 'POST'),
    headers: { apikey: key, Authorization: `Bearer ${opts.accessToken || key}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(String(data?.msg || data?.message || data?.error_description || data?.error || 'Supabase Auth error')), { status: response.status, code: data?.code });
  return data;
}

function withRedirect(path: string, redirectTo?: string) {
  if (!redirectTo) return path;
  return `${path}${path.includes('?') ? '&' : '?'}redirect_to=${encodeURIComponent(redirectTo)}`;
}

export async function supabaseSignIn(email: string, password: string) { return authRequest('/token?grant_type=password', { email, password }, { admin: false }) as Promise<SupabaseSession>; }
export async function supabaseRefresh(refreshToken: string) { return authRequest('/token?grant_type=refresh_token', { refresh_token: refreshToken }, { admin: false }) as Promise<SupabaseSession>; }
export async function supabaseLookup(accessToken: string) { return authRequest('/user', undefined, { accessToken, admin: false }) as Promise<SupabaseAuthUser>; }
export async function supabaseResetPassword(email: string, redirectTo?: string) { return authRequest(withRedirect('/recover', redirectTo), { email }, { admin: false }); }
export async function supabaseChangePassword(accessToken: string, password: string) { return authRequest('/user', { password }, { method: 'PUT', accessToken, admin: false }) as Promise<SupabaseAuthUser>; }
export async function supabaseVerifyOtp(tokenHash: string, type: OtpType) { return authRequest('/verify', { token_hash: tokenHash, type }, { admin: false }) as Promise<SupabaseSession>; }
export async function supabaseInviteUserByEmail(email: string, redirectTo: string, data: Record<string, unknown> = {}) {
  return authRequest(withRedirect('/invite', redirectTo), { email, data }, { method: 'POST', admin: true });
}
export async function supabaseAdminCreateUser(attributes: Record<string, any>) { return authRequest('/admin/users', attributes, { method: 'POST', admin: true }); }
export async function supabaseAdminGetUser(userId: string) { return authRequest(`/admin/users/${encodeURIComponent(userId)}`, undefined, { method: 'GET', admin: true }) as Promise<SupabaseAuthUser>; }
export async function supabaseAdminUpdateUser(userId: string, attributes: Record<string, any>) { return authRequest(`/admin/users/${encodeURIComponent(userId)}`, attributes, { method: 'PUT', admin: true }); }

export async function getSupabaseAccessToken() { return (await cookies()).get('sb_access_token')?.value || null; }
export async function getSupabaseRefreshToken() { return (await cookies()).get('sb_refresh_token')?.value || null; }
export async function getValidSupabaseAccessToken() {
  const access = await getSupabaseAccessToken();
  if (access) { try { await supabaseLookup(access); return access; } catch {} }
  const refresh = await getSupabaseRefreshToken(); if (!refresh) return null;
  const session = await supabaseRefresh(refresh); await setSupabaseSession(session); return session.access_token;
}
export async function setSupabaseSession(session: SupabaseSession) {
  const store = await cookies(); const secure = process.env.NODE_ENV === 'production';
  store.set('sb_access_token', session.access_token, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: Number(session.expires_in || 3600), priority: 'high' });
  store.set('sb_refresh_token', session.refresh_token, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 60 * 60 * 24 * 30, priority: 'high' });
}
export async function clearSupabaseSession() { const store = await cookies(); store.delete('sb_access_token'); store.delete('sb_refresh_token'); }
