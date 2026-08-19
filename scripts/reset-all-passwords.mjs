const config = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
};

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';

async function firebaseDatabaseGet(path) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  const response = await fetch(url, { cache: 'no-store' });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database GET ${response.status}: ${JSON.stringify(data).slice(0, 200)}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function firebaseAuth(path, body) {
  const url = new URL(`${AUTH_BASE}/${path}?key=${encodeURIComponent(config.apiKey)}`);
  const response = await fetch(url.toString(), {
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

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const newPassword = 'Pmm2026@';

  console.log('[reset-passwords] fetching users from Realtime Database...');
  const data = await firebaseDatabaseGet('users');
  if (!data || typeof data !== 'object') {
    console.log('[reset-passwords] no users found');
    return;
  }

  const entries = Object.entries(data).filter(([key]) => !key.startsWith('.'));
  console.log(`[reset-passwords] ${entries.length} users found\n`);

  if (dryRun) {
    console.log('[reset-passwords] DRY RUN - no changes will be made\n');
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const [uid, record] of entries) {
    try {
      if (!record || typeof record !== 'object') {
        skipped++;
        continue;
      }
      const r = record;
      const email = String(r.email || '').toLowerCase();
      if (!email) {
        skipped++;
        continue;
      }

      if (dryRun) {
        console.log(`[reset-passwords] WOULD UPDATE: ${email} (${uid})`);
        updated++;
        continue;
      }

      console.log(`[reset-passwords] looking up ${email} (${uid})...`);
      const lookup = await firebaseAuth('accounts:lookup', { localId: [uid] });
      const user = lookup.users?.[0];
      if (!user?.idToken) {
        console.log(`[reset-passwords] skipping ${email}: no idToken returned`);
        skipped++;
        continue;
      }

      await firebaseAuth('accounts:update', {
        idToken: user.idToken,
        password: newPassword,
        returnSecureToken: true,
      });

      console.log(`[reset-passwords] ✓ updated: ${email} (${uid})`);
      updated++;
    } catch (err) {
      errors++;
      console.error(`[reset-passwords] ✗ failed for ${uid}:`, err.message || err);
    }
  }

  console.log(`\n[reset-passwords] summary: ${updated} processed, ${skipped} skipped, ${errors} errors`);
  if (dryRun) {
    console.log('\n[reset-passwords] This was a dry run. Run without --dry-run to apply changes.');
  }
}

main().catch((err) => {
  console.error('[reset-passwords] fatal:', err);
  process.exit(1);
});
