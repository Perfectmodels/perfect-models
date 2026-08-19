const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
};

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';

function randomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }
  return password;
}

async function firebaseAuth(path, body) {
  const response = await fetch(`${AUTH_BASE}/${path}?key=${encodeURIComponent(config.apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Firebase Auth ${path} failed: ${data?.error?.message || response.status}`);
    error.status = response.status;
    error.body = data;
    throw error;
  }
  return data;
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

async function migrateModelsToAuth() {
  console.log('[migration-models] fetching models from database...');
  const data = await firebaseDatabaseGet('models').catch(() => null);
  if (!data || typeof data !== 'object') {
    console.log('[migration-models] no models found');
    return;
  }

  const entries = Object.entries(data).filter(([key]) => !key.startsWith('.'));
  console.log(`[migration-models] ${entries.length} models found`);

  let created = 0;
  let skipped = 0;
  let errors = 0;
  const results = [];

  for (const [id, record] of entries) {
    try {
      if (!record || typeof record !== 'object') {
        skipped++;
        continue;
      }
      const r = record;
      const email = String(r.email || r.loginEmail || r.login_email || '').toLowerCase();
      if (!email) {
        console.log(`[migration-models] skipping model ${id}: no email`);
        skipped++;
        continue;
      }

      if (r.authUserId || r.firebaseUid) {
        skipped++;
        continue;
      }

      const name = String(r.name || r.displayName || email.split('@')[0] || id);
      const password = randomPassword(12);
      console.log(`[migration-models] creating account for ${email} (${name})...`);

      const result = await firebaseAuth('accounts:signUp', {
        email,
        password,
        displayName: name,
        returnSecureToken: true,
      });

      const uid = String(result.localId || '');
      if (!uid) {
        console.log(`[migration-models] failed to create account for ${email}: no UID returned`);
        errors++;
        continue;
      }

      const updatedModel = {
        ...r,
        authUserId: uid,
        firebaseUid: uid,
        email,
        name,
        username: String(r.username || r.identifier || email.split('@')[0] || id),
      };

      await firebaseDatabasePut(`models/${id}`, updatedModel);

      const profileId = String(r.id || uid);
      const role = 'student';
      const profile = {
        id: uid,
        uid,
        email,
        name,
        identifier: String(r.identifier || r.matricule || email.split('@')[0] || id),
        role,
        profileId,
        status: 'active',
        mustChangePassword: false,
        permissions: { isActive: true },
        contestId: r.contestId ? String(r.contestId) : null,
        source: 'models',
        migratedAt: new Date().toISOString(),
      };

      await firebaseDatabasePut(`users/${uid}`, profile);

      created++;
      results.push({ email, name, uid, password, modelId: id });
      console.log(`[migration-models] ✓ created ${email} -> ${uid}`);
    } catch (err) {
      errors++;
      console.error(`[migration-models] ✗ failed for ${id}:`, err.message || err);
    }
  }

  console.log(`\n[migration-models] summary: ${created} created, ${skipped} skipped, ${errors} errors`);
  if (results.length > 0) {
    console.log('\n[migration-models] created accounts:');
    for (const r of results) {
      console.log(`  ${r.email} | ${r.name} | uid: ${r.uid} | temp password: ${r.password}`);
    }
  }
}

migrateModelsToAuth().catch((err) => {
  console.error('[migration-models] fatal:', err);
  process.exit(1);
});
