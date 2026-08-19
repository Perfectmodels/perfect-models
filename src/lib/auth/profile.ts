import { firebaseDatabaseGet, firebaseDatabasePut, getValidFirebaseIdToken } from '../firebase-backend';
import { auth } from './server';

export type AppRole = 'admin' | 'student' | 'jury' | 'registration' | 'jury-contest';
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

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
}

function normalizeAppRole(value: unknown, fallback: AppRole = 'student'): AppRole {
  const map: Record<string, AppRole> = {
    admin: 'admin',
    student: 'student',
    mannequin: 'student',
    modele: 'student',
    jury: 'jury',
    registration: 'registration',
    'jury-contest': 'jury-contest',
    accueil: 'registration',
    staff: 'registration',
  };
  const key = String(value || '').trim().toLowerCase();
  return map[key] || fallback;
}

export async function findProfile(user: unknown, idToken?: string | null): Promise<AppSessionProfile | null> {
  const u = user as Record<string, unknown> | null;
  const email = String(u?.email || '').toLowerCase();
  const name = String(u?.displayName || email.split('@')[0] || '');
  const uid = String(u?.localId || u?.uid || '');
  const identifier = email === 'admin@perfectmodels.online' ? 'admin' : email.split('@')[0];

  if (!uid) return null;

  if (ADMIN_ALIASES.has(email)) {
    return {
      userId: uid,
      email,
      name: u?.displayName ? String(u.displayName) : 'Administration PMM',
      identifier: 'admin',
      role: 'admin',
      profileId: 'admin',
      status: 'active',
      mustChangePassword: false,
      permissions: { all: true, isAdmin: true },
      adminPermissions: undefined,
    };
  }

  const central = await firebaseDatabaseGet(`users/${uid}`, idToken || undefined).catch(() => null);
  if (central && typeof central === 'object') {
    const c = central as Record<string, unknown>;
    const baseRole = normalizeAppRole(c.role || c.app_role || c.appRole);
    const isDelegatedAdmin =
      baseRole === 'admin' ||
      (c.permissions && typeof c.permissions === 'object' && (c.permissions as Record<string, unknown>).isAdmin === true) ||
      c.adminPermissions !== undefined;
    const role = isDelegatedAdmin ? 'admin' : baseRole;
    let adminPermissions: Record<string, boolean> | undefined;
    if (role === 'admin') {
      const ap = await firebaseDatabaseGet(`adminPermissions/${uid}`, idToken || undefined).catch(() => null);
      adminPermissions = ap && typeof ap === 'object' ? (ap as Record<string, boolean>) : undefined;
    }
    return {
      userId: uid,
      email: String(c.email || email),
      name: String(c.name || c.displayName || name),
      identifier: String(c.identifier || c.matricule || identifier),
      role,
      profileId: String(c.profileId || c.id || uid),
      status: String(c.status || 'active'),
      mustChangePassword: Boolean(c.mustChangePassword || c.must_change_password),
      permissions: c.permissions && typeof c.permissions === 'object' ? (c.permissions as Record<string, boolean>) : {},
      adminPermissions,
      contestId: c.contestId ? String(c.contestId) : null,
    };
  }

  const models = asArray(await firebaseDatabaseGet('models', idToken || undefined).catch(() => null)) as Record<string, unknown>[];
  const model = models.find((m) => {
    if (!m || typeof m !== 'object') return false;
    const values = [m.email, m.loginEmail, m.login_email, m.identifier, m.matricule, m.name]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return values.includes(email) || values.includes(identifier);
  });
  if (model) {
    const isModelAdmin =
      (model.permissions && typeof model.permissions === 'object' && (model.permissions as Record<string, unknown>).isAdmin === true) ||
      model.adminPermissions !== undefined;
    return {
      userId: uid,
      email: String(model.email || email),
      name: String(model.name || name),
      identifier: String(model.matricule || model.identifier || identifier),
      role: isModelAdmin ? 'admin' : 'student',
      profileId: String(model.id || uid),
      status: 'active',
      mustChangePassword: Boolean(model.mustChangePassword),
      permissions: model.permissions && typeof model.permissions === 'object' ? (model.permissions as Record<string, boolean>) : { isActive: true },
      adminPermissions: isModelAdmin ? (model.adminPermissions as Record<string, boolean> | undefined) : undefined,
      contestId: model.contestId ? String(model.contestId) : null,
    };
  }

  if (email.endsWith('@perfectmodels.online')) {
    return {
      userId: uid,
      email,
      name,
      identifier,
      role: 'student',
      profileId: uid,
      status: 'active',
      mustChangePassword: false,
      permissions: { isActive: true },
      adminPermissions: undefined,
      contestId: null,
    };
  }

  return null;
}

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try {
    const { data } = await auth.getSession();
    const idToken = await getValidFirebaseIdToken();
    return findProfile(data?.user, idToken);
  } catch {
    return null;
  }
}

export async function getFirebaseSessionUser() {
  const { data } = await auth.getSession();
  return data?.user || null;
}

export async function ensureUserProfile(user: {
  localId?: string;
  email?: string | null;
  displayName?: string | null;
}): Promise<AppSessionProfile | null> {
  const uid = String(user?.localId || '');
  if (!uid) return null;
  const idToken = await getValidFirebaseIdToken();
  const existing = await findProfile(user, idToken);
  if (existing) return existing;
  const email = String(user?.email || '').toLowerCase();
  const name = String(user?.displayName || email.split('@')[0] || '');
  const identifier = email === 'admin@perfectmodels.online' ? 'admin' : email.split('@')[0];
  const role = ADMIN_ALIASES.has(email) ? 'admin' : 'student';
  const profile: AppSessionProfile = {
    userId: uid,
    email,
    name,
    identifier,
    role,
    profileId: uid,
    status: 'active',
    mustChangePassword: false,
    permissions: role === 'admin' ? { all: true, isAdmin: true } : { isActive: true },
    adminPermissions: role === 'admin' ? undefined : undefined,
    contestId: null,
  };
  await firebaseDatabasePut(`users/${uid}`, {
    id: uid,
    uid,
    email,
    name,
    identifier,
    role,
    profileId: uid,
    status: 'active',
    mustChangePassword: false,
    permissions: profile.permissions,
    createdAt: new Date().toISOString(),
  }).catch(() => undefined);
  return profile;
}
