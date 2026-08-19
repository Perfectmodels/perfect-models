const ADMIN_ALIASES = new Set([
  'admin',
  'admin@perfectmodels.online',
  'contact@perfectmodels.online',
  'contact@perfectmodels.ga',
  'perfectmodels.ga@gmail.com',
]);

const config = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
};

function asArray(value) {
  return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
}

function normalizeAppRole(value, fallback = 'student') {
  const map = {
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

async function firebaseDatabaseGet(path) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database GET ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function firebaseDatabasePut(path, value) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database PUT ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function migrateNode(sourceKey, sourceLabel) {
  console.log(`[migration] scanning ${sourceLabel} (${sourceKey})...`);
  const data = await firebaseDatabaseGet(sourceKey).catch(() => null);
  if (!data || typeof data !== 'object') {
    console.log(`[migration] ${sourceLabel}: empty or missing`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  const entries = Object.entries(data).filter(([key]) => key !== '.priority' && key !== '.value' && !key.startsWith('.'));
  console.log(`[migration] ${sourceLabel}: ${entries.length} entries found`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [id, record] of entries) {
    try {
      if (!record || typeof record !== 'object') {
        skipped++;
        continue;
      }
      const r = record;
      const email = String(r.email || r.loginEmail || r.login_email || '').toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }

      const uid = String(r.authUserId || r.firebaseUid || id);
      const existing = await firebaseDatabaseGet(`users/${uid}`).catch(() => null);
      if (existing && typeof existing === 'object' && existing.email) {
        skipped++;
        continue;
      }

      const name = String(r.name || r.displayName || email.split('@')[0] || uid);
      const identifier = String(r.identifier || r.matricule || r.username || email.split('@')[0] || uid);
      const baseRole = normalizeAppRole(r.role || r.app_role || r.appRole);
      const isDelegatedAdmin =
        baseRole === 'admin' ||
        (r.permissions && typeof r.permissions === 'object' && r.permissions.isAdmin === true) ||
        r.adminPermissions !== undefined;
      const role = ADMIN_ALIASES.has(email) ? 'admin' : isDelegatedAdmin ? 'admin' : baseRole;
      const profileId = String(r.profileId || r.id || uid);
      const status = String(r.status || 'active');
      const mustChangePassword = Boolean(r.mustChangePassword || r.must_change_password);
      const permissions = (r.permissions && typeof r.permissions === 'object') ? r.permissions : (role === 'admin' ? { all: true, isAdmin: true } : { isActive: true });
      const adminPermissions = role === 'admin' ? (r.adminPermissions || undefined) : undefined;
      const contestId = r.contestId ? String(r.contestId) : null;

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
        source: sourceLabel,
        migratedAt: new Date().toISOString(),
      };

      await firebaseDatabasePut(`users/${uid}`, central);
      migrated++;
      if (migrated % 50 === 0) console.log(`[migration] ${sourceLabel}: ${migrated} migrated...`);
    } catch (err) {
      errors++;
      console.error(`[migration] ${sourceLabel} failed for ${id}:`, err);
    }
  }

  console.log(`[migration] ${sourceLabel} done: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
  return { migrated, skipped, errors };
}

async function migrateModels() {
  console.log(`[migration] scanning models...`);
  const data = await firebaseDatabaseGet('models').catch(() => null);
  if (!data || typeof data !== 'object') {
    console.log(`[migration] models: empty or missing`);
    return { migrated: 0, skipped: 0, errors: 0 };
  }

  const entries = Object.entries(data).filter(([key]) => key !== '.priority' && key !== '.value' && !key.startsWith('.'));
  console.log(`[migration] models: ${entries.length} entries found`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [id, record] of entries) {
    try {
      if (!record || typeof record !== 'object') {
        skipped++;
        continue;
      }
      const r = record;
      const email = String(r.email || r.loginEmail || r.login_email || '').toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }

      const uid = String(r.authUserId || r.firebaseUid || id);
      const existing = await firebaseDatabaseGet(`users/${uid}`).catch(() => null);
      if (existing && typeof existing === 'object' && existing.email) {
        skipped++;
        continue;
      }

      const name = String(r.name || r.displayName || email.split('@')[0] || uid);
      const identifier = String(r.identifier || r.matricule || r.username || email.split('@')[0] || uid);
      const baseRole = 'student';
      const isDelegatedAdmin =
        (r.permissions && typeof r.permissions === 'object' && r.permissions.isAdmin === true) ||
        r.adminPermissions !== undefined;
      const role = ADMIN_ALIASES.has(email) ? 'admin' : isDelegatedAdmin ? 'admin' : baseRole;
      const profileId = String(r.id || uid);
      const status = String(r.status || 'active');
      const mustChangePassword = Boolean(r.mustChangePassword);
      const permissions = (r.permissions && typeof r.permissions === 'object') ? r.permissions : (role === 'admin' ? { all: true, isAdmin: true } : { isActive: true });
      const adminPermissions = role === 'admin' ? (r.adminPermissions || undefined) : undefined;
      const contestId = r.contestId ? String(r.contestId) : null;

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
        source: 'models',
        migratedAt: new Date().toISOString(),
      };

      await firebaseDatabasePut(`users/${uid}`, central);
      migrated++;
      if (migrated % 50 === 0) console.log(`[migration] models: ${migrated} migrated...`);
    } catch (err) {
      errors++;
      console.error(`[migration] models failed for ${id}:`, err);
    }
  }

  console.log(`[migration] models done: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
  return { migrated, skipped, errors };
}

async function migrate() {
  console.log('[migration] starting migration to central users/{uid}...');

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  const sources = [
    { key: 'users', label: 'users' },
    { key: 'userProfiles', label: 'userProfiles' },
    { key: 'authProfiles', label: 'authProfiles' },
  ];

  for (const source of sources) {
    const result = await migrateNode(source.key, source.label);
    totalMigrated += result.migrated;
    totalSkipped += result.skipped;
    totalErrors += result.errors;
  }

  const modelsResult = await migrateModels();
  totalMigrated += modelsResult.migrated;
  totalSkipped += modelsResult.skipped;
  totalErrors += modelsResult.errors;

  console.log(`[migration] total: ${totalMigrated} migrated, ${totalSkipped} skipped, ${totalErrors} errors`);
}

migrate().catch((err) => {
  console.error('[migration] fatal:', err);
  process.exit(1);
});
