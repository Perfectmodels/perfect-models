const config = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
};

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

async function diagnostic() {
  console.log('[diagnostic] fetching users from Realtime Database...');
  const data = await firebaseDatabaseGet('users').catch(() => null);
  if (!data || typeof data !== 'object') {
    console.log('[diagnostic] no users found in database');
    return;
  }

  const entries = Object.entries(data).filter(([key]) => key !== '.priority' && key !== '.value' && !key.startsWith('.'));
  console.log(`[diagnostic] ${entries.length} users found\n`);

  for (const [uid, record] of entries) {
    if (!record || typeof record !== 'object') continue;
    const r = record;
    const email = String(r.email || '').toLowerCase();
    const role = String(r.role || r.app_role || r.appRole || 'student');
    const permissions = r.permissions && typeof r.permissions === 'object' ? JSON.stringify(r.permissions) : 'none';
    const adminPermissions = r.adminPermissions ? JSON.stringify(r.adminPermissions) : 'none';
    console.log(`UID: ${uid}`);
    console.log(`  email: ${email}`);
    console.log(`  name: ${String(r.name || r.displayName || '')}`);
    console.log(`  role: ${role}`);
    console.log(`  permissions: ${permissions}`);
    console.log(`  adminPermissions: ${adminPermissions}`);
    console.log(`  identifier: ${String(r.identifier || r.matricule || '')}`);
    console.log('');
  }
}

diagnostic().catch((err) => {
  console.error('[diagnostic] fatal:', err);
  process.exit(1);
});
