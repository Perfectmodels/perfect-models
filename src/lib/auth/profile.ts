import { getFirebaseAuthSession } from '../firebase-auth-server';
import { firebaseRead } from '../firebase-data';

export type AppRole = 'admin' | 'student' | 'jury' | 'registration' | 'jury-contest';
export interface AppSessionProfile { userId: string; email: string; name: string; identifier: string; role: AppRole; profileId: string; status: string; mustChangePassword: boolean; permissions: Record<string, boolean>; contestId?: string | null; }

type ProfileData = Partial<AppSessionProfile> & { name?: string; role?: AppRole; identifier?: string; profileId?: string; status?: string; permissions?: Record<string, boolean>; contestId?: string | null; mustChangePassword?: boolean };

const ADMIN_EMAILS = new Set(['admin@perfectmodels.online', 'contact@perfectmodels.online', 'contact@perfectmodels.ga', 'perfectmodels.ga@gmail.com']);

export async function getCurrentAppProfile(): Promise<AppSessionProfile | null> {
  try {
    const session = await getFirebaseAuthSession();
    if (!session) return null;
    const { idToken, user } = session;
    const email = String(user.email || '').toLowerCase();
    const candidates = [
      `auth_profiles/${user.localId}`,
      `authProfiles/${user.localId}`,
      `users/${user.localId}`,
    ];
    let raw: ProfileData | null = null;
    for (const path of candidates) {
      const value = await firebaseRead<ProfileData>(path);
      if (value) { raw = value; break; }
    }

    let modelProfile: any = null;
    if (!raw && email.endsWith('@perfectmodels.online')) {
      const models = await firebaseRead<Record<string, any>>('models');
      modelProfile = Object.values(models || {}).find((m: any) => String(m?.email || '').toLowerCase() === email) || null;
    }

    const isAdmin = ADMIN_EMAILS.has(email);
    const role: AppRole = isAdmin ? 'admin' : (raw?.role || 'student');
    const identifier = raw?.identifier || modelProfile?.matricule || modelProfile?.identifier || email.split('@')[0];
    const profileId = raw?.profileId || modelProfile?.id || user.localId;
    const name = raw?.name || modelProfile?.name || user.displayName || identifier;
    const permissions = { ...(raw?.permissions || {}), ...(role === 'student' ? { isActive: true } : {}) };

    return {
      userId: user.localId,
      email,
      name,
      identifier,
      role,
      profileId,
      status: raw?.status || 'active',
      mustChangePassword: Boolean(raw?.mustChangePassword),
      permissions,
      contestId: raw?.contestId || null,
    };
  } catch {
    return null;
  }
}
