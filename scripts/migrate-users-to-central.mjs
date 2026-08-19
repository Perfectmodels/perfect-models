import { firebaseDatabaseGet, firebaseDatabasePut } from '../lib/firebase-backend';

const ADMIN_ALIASES = new Set([
  'admin',
  'admin@perfectmodels.online',
  'contact@perfectmodels.online',
  'contact@perfectmodels.ga',
  'perfectmodels.ga@gmail.com',
]);

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
}

function normalizeAppRole(value: unknown, fallback = 'student'): string {
  const map: Record<string, string> = {
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

async function listAuthUids(): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg';
  const uids: string[] = [];
  let pageToken: string | undefined;
  do {
    const url = new URL(`https://identitytoolkit.googleapis.com/v1/projects/perfect-156b5/accounts:batchGet`);
    url.searchParams.set('key', apiKey);
    const body: Record<string, unknown> = { localIds: [] };
    if (pageToken) body.nextPageToken = pageToken;
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[migration] batchGet failed', res.status, await res.text());
      break;
    }
    const data = (await res.json()) as { users?: { localId: string }[]; nextPageToken?: string };
    if (data.users) {
      for (const u of data.users) {
        if (u.localId) uids.push(u.localId);
      }
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return uids;
}

async function migrate() {
  console.log('[migration] listing Firebase Auth users...');
  const uids = await listAuthUids();
  console.log(`[migration] ${uids.length} auth users found`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const uid of uids) {
    try {
      const existing = await firebaseDatabaseGet(`users/${uid}`).catch(() => null);
      if (existing && typeof existing === 'object') {
        skipped++;
        continue;
      }

      const candidates = await Promise.all([
        firebaseDatabaseGet(`users/${uid}`).catch(() => null),
        firebaseDatabaseGet(`userProfiles/${uid}`).catch(() => null),
        firebaseDatabaseGet(`authProfiles/${uid}`).catch(() => null),
        firebaseDatabaseGet(`models`).catch(() => null),
      ]);

      const [userRecord, userProfile, authProfile, models] = candidates;
      let profile: Record<string, unknown> | null = null;
      let source = '';

      if (userRecord && typeof userRecord === 'object') {
        profile = userRecord as Record<string, unknown>;
        source = 'users';
      } else if (userProfile && typeof userProfile === 'object') {
        profile = userProfile as Record<string, unknown>;
        source = 'userProfiles';
      } else if (authProfile && typeof authProfile === 'object') {
        profile = authProfile as Record<string, unknown>;
        source = 'authProfiles';
      }

      const modelsArr = asArray(models) as Record<string, unknown>[];
      const model = modelsArr.find((m) => String(m?.authUserId || m?.firebaseUid || '') === uid);

      const email = String(profile?.email || model?.email || '');
      const name = String(profile?.name || profile?.displayName || model?.name || email.split('@')[0] || uid);
      const identifier = String(profile?.identifier || profile?.matricule || model?.matricule || model?.identifier || email.split('@')[0] || uid);
      const baseRole = profile ? normalizeAppRole(profile.role || profile.app_role || profile.appRole) : 'student';
      const isDelegatedAdmin =
        baseRole === 'admin' ||
        (profile?.permissions && typeof profile.permissions === 'object' && (profile.permissions as Record<string, unknown>).isAdmin === true) ||
        profile?.adminPermissions !== undefined ||
        model?.adminPermissions !== undefined;
      const role = ADMIN_ALIASES.has(email.toLowerCase()) ? 'admin' : isDelegatedAdmin ? 'admin' : baseRole;
      const profileId = String(profile?.profileId || profile?.id || model?.id || uid);
      const status = String(profile?.status || 'active');
      const mustChangePassword = Boolean(profile?.mustChangePassword || profile?.must_change_password || model?.mustChangePassword);
      const permissions = (profile?.permissions && typeof profile.permissions === 'object') ? profile.permissions : (model?.permissions && typeof model.permissions === 'object') ? model.permissions : (role === 'admin' ? { all: true, isAdmin: true } : { isActive: true });
      const adminPermissions = role === 'admin' ? (profile?.adminPermissions || model?.adminPermissions || undefined) : undefined;
      const contestId = profile?.contestId ? String(profile.contestId) : model?.contestId ? String(model.contestId) : null;

      const central = {
        id: uid,
        uid,
        email,
        name,
        identifier,
        role,
        profileId,
        status,
        mustChangePassword,
        permissions,
        adminPermissions,
        contestId,
        source,
        migratedAt: new Date().toISOString(),
      };

      await firebaseDatabasePut(`users/${uid}`, central);
      migrated++;
      if (migrated % 50 === 0) console.log(`[migration] ${migrated} migrated...`);
    } catch (err) {
      errors++;
      console.error(`[migration] failed for ${uid}:`, err);
    }
  }

  console.log(`[migration] done: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
}

migrate().catch((err) => {
  console.error('[migration] fatal:', err);
  process.exit(1);
});
