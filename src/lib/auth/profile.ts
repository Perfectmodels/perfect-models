import { auth } from './server';
import { collectionToArray, getCollection } from '../app-data';
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
    admin: 'admin',
    manager: 'manager',
    gestionnaire: 'manager',
    student: 'student',
    mannequin: 'student',
    model: 'student',
    modele: 'student',
    jury: 'jury',
    registration: 'registration',
    'jury-contest': 'jury-contest',
    accueil: 'registration',
    staff: 'registration',
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

async function delegatedPermissions(role: AppRole, uid: string, legacyId?: string) {
  if (role !== 'admin' && role !== 'manager') return undefined;
  const root = await getCollection('adminPermissions').catch(() => null) as Record<string, any> | null;
  const candidate = root && typeof root === 'object' ? (root[uid] || (legacyId ? root[legacyId] : null)) : null;
  return candidate && typeof candidate === 'object' ? candidate as Record<string, boolean> : undefined;
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

  // Source de vérité : public.profiles. Les rôles d'autorisation viennent de
  // auth.users.app_metadata / profiles, jamais de user_metadata contrôlable par le client.
  const normalizedRows = await privilegedSupabaseSelect(
    `profiles?user_id=eq.${encodeURIComponent(uid)}&select=*&limit=1`,
  ).catch(() => []);
  const normalized = Array.isArray(normalizedRows) ? normalizedRows[0] : null;

  if (normalized) {
    const role = normalizeAppRole(normalized.role, fallbackRole);
    const metadata = objectValue(normalized.metadata);
    const permissions = objectValue(metadata.permissions);
    const resolvedPermissions = Object.keys(permissions).length
      ? permissions as Record<string, boolean>
      : role === 'admin'
        ? { all: true, isAdmin: true }
        : { isActive: normalized.is_active !== false };
    const adminPermissions = await delegatedPermissions(role, uid);

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
      adminPermissions,
      contestId: metadata.contestId ? String(metadata.contestId) : null,
    };
  }

  // Compatibilité transitoire pour les anciens profils qui n'ont pas encore été
  // normalisés. Ce bloc ne doit plus être utilisé comme source d'autorisation primaire.
  const usersRoot = await getCollection('users').catch(() => null) as Record<string, any> | null;
  const userRows = usersRoot && typeof usersRoot === 'object' && !Array.isArray(usersRoot)
    ? Object.values(usersRoot)
    : collectionToArray(usersRoot);
  const legacy: any = userRows.find((row: any) => row && (
    String(row.supabaseUserId || row.authUserId || '') === uid ||
    String(row.email || '').trim().toLowerCase() === email
  ));

  const models = collectionToArray(await getCollection('models').catch(() => null));
  const model: any = models.find((candidate: any) =>
    String(candidate?.authUserId || '') === uid ||
    String(candidate?.email || '').trim().toLowerCase() === email ||
    String(candidate?.id || '') === String(legacy?.profileId || app.profile_id || app.model_id || '')
  );

  const role = normalizeAppRole(legacy?.role || legacy?.app_role || legacy?.appRole, fallbackRole);
  const permissions = objectValue(legacy?.permissions);
  const resolvedPermissions = Object.keys(permissions).length
    ? permissions as Record<string, boolean>
    : role === 'admin' ? { all: true, isAdmin: true } : { isActive: true };

  return {
    userId: uid,
    email: String(legacy?.email || model?.email || email),
    name: String(legacy?.name || legacy?.displayName || model?.name || fallbackName),
    identifier: String(legacy?.identifier || legacy?.matricule || model?.matricule || model?.identifier || fallbackIdentifier),
    role: resolvedPermissions.isAdmin === true ? 'admin' : role,
    profileId: String(legacy?.profileId || model?.id || app.profile_id || app.model_id || uid),
    status: String(legacy?.status || model?.status || 'active'),
    mustChangePassword: Boolean(legacy?.mustChangePassword || legacy?.must_change_password || app.must_change_password),
    permissions: resolvedPermissions,
    adminPermissions: await delegatedPermissions(role, uid, String(legacy?.uid || legacy?.id || '')),
    contestId: legacy?.contestId ? String(legacy.contestId) : (model?.contestId ? String(model.contestId) : null),
  };
}

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try {
    const { data } = await auth.getSession();
    return data?.user ? findProfile(data.user) : null;
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

  const email = String(user?.email || '').trim().toLowerCase();
  const app = appMeta(user);
  const meta = userMeta(user);
  const role = normalizeAppRole(app.role, ADMIN_ALIASES.has(email) ? 'admin' : 'student');
  const name = String(meta.name || meta.display_name || email.split('@')[0] || '');
  const identifier = String(app.identifier || (ADMIN_ALIASES.has(email) ? 'admin' : email.split('@')[0] || uid));
  const modelId = app.model_id || app.profile_id || null;
  const permissions = role === 'admin' ? { all: true, isAdmin: true } : { isActive: true };
  const now = new Date().toISOString();

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
    updated_at: now,
  }, 'user_id');

  return findProfile({ ...user, app_metadata: app, user_metadata: meta });
}