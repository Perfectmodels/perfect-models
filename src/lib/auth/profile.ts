import { auth } from './server';
import { privilegedSupabaseSelect, privilegedSupabaseUpsert } from '../supabase-backend';

export type AppRole = 'admin' | 'manager' | 'student' | 'jury' | 'registration' | 'jury-contest';
export interface AppSessionProfile {
  userId: string;
  email: string;
  name: string;
  identifier: string;
  role: AppRole;
  profileId: string;
  status: string;
  mustChangePassword: boolean;
  permissions: Record<string, boolean>;
  adminPermissions?: Record<string, boolean>;
  contestId?: string | null;
}

export const ADMIN_ALIASES = new Set([
  'admin',
  'admin@perfectmodels.online',
  'contact@perfectmodels.online',
  'contact@perfectmodels.ga',
  'perfectmodels.ga@gmail.com',
]);

function normalizeAppRole(value: unknown, fallback: AppRole = 'student'): AppRole {
  const map: Record<string, AppRole> = {
    admin: 'admin', manager: 'manager', gestionnaire: 'manager', student: 'student', mannequin: 'student',
    model: 'student', modele: 'student', jury: 'jury', registration: 'registration', accueil: 'registration',
    staff: 'registration', 'jury-contest': 'jury-contest',
  };
  return map[String(value || '').trim().toLowerCase()] || fallback;
}

function appMeta(user: any) {
  return user?.app_metadata && typeof user.app_metadata === 'object' ? user.app_metadata : {};
}
function userMeta(user: any) {
  return user?.user_metadata && typeof user.user_metadata === 'object' ? user.user_metadata : {};
}
function objectValue(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

async function delegatedPermissions(role: AppRole, uid: string, metadata?: Record<string, any>) {
  if (role !== 'admin' && role !== 'manager') return undefined;
  const rows = await privilegedSupabaseSelect(
    `admin_permissions?permission_key=eq.${encodeURIComponent(uid)}&select=value&limit=1`,
  ).catch(() => []);
  const value = Array.isArray(rows) ? rows[0]?.value : null;
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, boolean>;
  const fallback = metadata?.admin_permissions;
  return fallback && typeof fallback === 'object' && !Array.isArray(fallback)
    ? fallback as Record<string, boolean>
    : undefined;
}

export async function findProfile(user: unknown): Promise<AppSessionProfile | null> {
  const u = user as Record<string, any> | null;
  const uid = String(u?.id || '');
  const email = String(u?.email || '').trim().toLowerCase();
  if (!uid) return null;

  const app = appMeta(u);
  const meta = userMeta(u);
  const fallbackRole = normalizeAppRole(app.role, ADMIN_ALIASES.has(email) ? 'admin' : 'student');
  const fallbackName = String(meta.name || meta.display_name || email.split('@')[0] || '');
  const fallbackIdentifier = String(app.identifier || (ADMIN_ALIASES.has(email) ? 'admin' : email.split('@')[0] || uid));

  const rows = await privilegedSupabaseSelect(
    `profiles?user_id=eq.${encodeURIComponent(uid)}&select=*&limit=1`,
  ).catch(() => []);
  const normalized = Array.isArray(rows) ? rows[0] : null;
  if (!normalized) return null;

  const role = normalizeAppRole(normalized.role, fallbackRole);
  const metadata = objectValue(normalized.metadata);
  const permissions = objectValue(metadata.permissions);
  const resolvedPermissions = Object.keys(permissions).length
    ? permissions as Record<string, boolean>
    : role === 'admin'
      ? { all: true, isAdmin: true }
      : { isActive: normalized.is_active !== false };

  return {
    userId: uid,
    email: String(normalized.email || email),
    name: String(normalized.display_name || fallbackName),
    identifier: String(normalized.identifier || fallbackIdentifier),
    role: resolvedPermissions.isAdmin === true ? 'admin' : role,
    profileId: String(normalized.model_id || app.profile_id || app.model_id || uid),
    status: normalized.is_active === false ? 'inactive' : 'active',
    mustChangePassword: Boolean(normalized.must_change_password || app.must_change_password),
    permissions: resolvedPermissions,
    adminPermissions: await delegatedPermissions(role, uid, metadata),
    contestId: metadata.contestId ? String(metadata.contestId) : null,
  };
}

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try {
    const { data } = await auth.getVerifiedUser();
    const profile = data?.user ? await ensureUserProfile(data.user) : null;
    return profile?.status === 'inactive' ? null : profile;
  } catch {
    return null;
  }
}

export async function ensureUserProfile(user: {
  id?: string;
  email?: string | null;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}): Promise<AppSessionProfile | null> {
  const uid = String(user?.id || '');
  if (!uid) return null;

  const existing = await findProfile(user);
  if (existing) return existing;

  const email = String(user?.email || '').trim().toLowerCase();
  const app = appMeta(user);
  const meta = userMeta(user);
  const role = normalizeAppRole(app.role, ADMIN_ALIASES.has(email) ? 'admin' : 'student');
  const name = String(meta.name || meta.display_name || email.split('@')[0] || '');
  const identifier = String(app.identifier || (ADMIN_ALIASES.has(email) ? 'admin' : email.split('@')[0] || uid));
  const requestedModelId = role === 'student' ? String(app.model_id || app.profile_id || '') : '';
  const matchingModels = requestedModelId
    ? await privilegedSupabaseSelect(`models?id=eq.${encodeURIComponent(requestedModelId)}&select=id&limit=1`).catch(() => [])
    : [];
  const modelId = Array.isArray(matchingModels) && matchingModels.length ? requestedModelId : null;
  const permissions = role === 'admin' ? { all: true, isAdmin: true } : { isActive: true };

  await privilegedSupabaseUpsert('profiles', {
    user_id: uid,
    role,
    identifier,
    display_name: name,
    email: email || null,
    model_id: modelId,
    must_change_password: Boolean(app.must_change_password),
    is_active: true,
    metadata: { permissions },
    updated_at: new Date().toISOString(),
  }, 'user_id');

  return findProfile({ ...user, app_metadata: app, user_metadata: meta });
}
