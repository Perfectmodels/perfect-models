const config = {
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
};

async function firebaseDatabaseGet(path) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const url = new URL(`${config.databaseURL}/${cleanPath}.json`);
  console.log(`[db] GET ${url.toString()}`);
  const response = await fetch(url, { cache: 'no-store' });
  console.log(`[db] GET ${cleanPath} -> ${response.status}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`Firebase Realtime Database GET ${response.status}: ${JSON.stringify(data).slice(0, 200)}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function main() {
  try {
    const data = await firebaseDatabaseGet('users');
    if (!data || typeof data !== 'object') {
      console.log('[db] no users data or not an object');
      return;
    }
    const entries = Object.entries(data).filter(([key]) => !key.startsWith('.'));
    console.log(`[db] ${entries.length} users found`);
    for (const [uid, record] of entries.slice(0, 5)) {
      if (!record || typeof record !== 'object') continue;
      const r = record;
      console.log(`  ${uid} | ${String(r.email || '').toLowerCase()} | role=${String(r.role || r.app_role || '')}`);
    }
  } catch (err) {
    console.error('[db] error:', err.message || err);
  }
}

main();
