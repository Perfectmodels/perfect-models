import fs from 'node:fs/promises';

const API_KEY = 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg';
const DATABASE_URL = 'https://perfect-156b5-default-rtdb.firebaseio.com';
const DEFAULT_PASSWORD = 'Pmm2026@';

const EMAIL_LOCAL_OVERRIDES = {
  'aj-caramela': 'aj',
  'anani-donatien': 'donatien',
  'anne-padou': 'anne',
  'annie-flora': 'annie',
  'benga-sadia': 'sadia',
  'blanche-armancia-ekewa-deacken': 'blanche',
  'cassandra-ibouanga': 'cassandra',
  'cegolaine-biye': 'cegolaine',
  'chafyda-moussavou-swalehe': 'chafyda',
  'christy-ngoua': 'christy',
  'diane-tchibinda': 'diane',
  'diane-vanessa': 'diane.vanessa',
  'dorcas-saphou': 'dorcas',
  'doria-rosina-moutsinga-lewobi': 'doria',
  'essono-lea-danielle': 'lea',
  'esther-mbina': 'esther',
  'gniobo-arselia': 'arselia',
  'hawa-moundeni': 'hawa',
  'kegnia-ompoki-dousca-wesly': 'dousca',
  'kendra-mebiame': 'kendra',
  'kevine-moussavou': 'kevine',
  'khelany-allogho': 'khelany',
  'kouna-asnath-chelsea': 'asnath',
  'laure-seke': 'laure',
  'lesly-zomo': 'lesly',
  'lorielna-moungengui': 'lorielna',
  'lucresse-sendze': 'lucresse',
  'maira-ayang-ndong': 'maira',
  'marisca-bivigou': 'marisca',
  'mbazoghe-latifa-nynelle': 'latifa',
  'moustapha': 'moustapha',
  'nahoumie-mabila': 'nahoumie',
  'ndinga-ibouanga-brice-yowane': 'brice',
  'nelly-rose-nse-allogo': 'nelly',
  'noe-maks': 'noe',
  'noemi-kim': 'noemi',
  'nyamete-towene-ruth-jussy': 'ruth',
  'osee-jn': 'osee',
  'raida-katsini': 'raida',
  'raina-ntsame': 'raina',
  'raiva-mondjo': 'raiva',
  'rosly-emmanuel-eya-biyogho': 'rosly',
  'ruth-danicia-nweninga': 'ruth.danicia',
  'ruth-ella': 'ruth.ella',
  'samantha-abong-obiang': 'samantha',
  'sarah-klomegan': 'sarah',
  'sephora-nawelle': 'sephora',
  'mbazogheoniane-shonlogan-casting-1768260154108': 'shon',
  'stecy-glappier': 'stecy',
  'stephie-ndombi': 'stephie',
  'styna-moutsinga': 'styna',
  'ursula-boumso': 'ursula',
};

const MATRICULE_OVERRIDES = {
  'dorcas-saphou': 'Man-PMMD02',
  'osee-jn': 'Man-PMMO02',
};

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9.]/g, '');

const toList = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((value, index) => value ? ({ id: value.id || String(index), ...value }) : null).filter(Boolean);
  return Object.entries(raw).map(([key, value]) => ({ id: value?.id || key, ...value }));
};

const buildRecords = (models) => models.map((model, index) => {
  const id = String(model.id || index);
  const local = EMAIL_LOCAL_OVERRIDES[id] || normalize(String(model.name || '').trim().split(/\s+/)[0] || `mannequin${index + 1}`);
  const oldUsername = String(model.username || '');
  const matricule = MATRICULE_OVERRIDES[id] || String(model.matricule || oldUsername).trim() || `Man-PMMX${String(index + 1).padStart(2, '0')}`;
  return {
    id,
    name: String(model.name || ''),
    oldEmail: String(model.email || '').trim().toLowerCase(),
    oldFirebaseUid: String(model.firebaseUid || ''),
    legacyPassword: String(model.password || ''),
    oldUsername,
    matricule,
    email: `${local}@perfectmodels.online`,
    password: DEFAULT_PASSWORD,
  };
});

async function firebaseRequest(endpoint, payload) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `AUTH_${response.status}`);
  return data;
}

const signIn = (email, password) => firebaseRequest('accounts:signInWithPassword', { email, password, returnSecureToken: true });
const signUp = (email, password) => firebaseRequest('accounts:signUp', { email, password, returnSecureToken: true });
const updateAccount = (idToken, email, password) => firebaseRequest('accounts:update', { idToken, email, password, returnSecureToken: true });

async function patchDatabase(path, value, idToken) {
  const response = await fetch(`${DATABASE_URL}/${path}.json?auth=${encodeURIComponent(idToken)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`RTDB_WRITE_${response.status}:${await response.text()}`);
}

async function getModels() {
  const response = await fetch(`${DATABASE_URL}/models.json`);
  if (!response.ok) throw new Error(`RTDB_READ_${response.status}`);
  return toList(await response.json());
}

async function migrateRecord(record) {
  let account;
  let status = 'migrated';

  if (record.oldFirebaseUid) {
    try {
      const current = await signIn(record.email, DEFAULT_PASSWORD);
      if (current.localId !== record.oldFirebaseUid) throw new Error('TARGET_EMAIL_UID_CONFLICT');
      account = current;
      status = 'already_migrated';
    } catch (targetError) {
      if (String(targetError?.message).includes('TARGET_EMAIL_UID_CONFLICT')) throw targetError;
      if (!record.oldEmail) throw new Error('MISSING_OLD_EMAIL');

      const candidates = [...new Set([record.legacyPassword, DEFAULT_PASSWORD].filter(Boolean))];
      let signedIn = null;
      let lastError = 'NO_LEGACY_PASSWORD';
      for (const candidatePassword of candidates) {
        try {
          signedIn = await signIn(record.oldEmail, candidatePassword);
          break;
        } catch (error) {
          lastError = error?.message || String(error);
        }
      }
      if (!signedIn) throw new Error(`EXISTING_AUTH_LOGIN_FAILED:${lastError}`);
      if (signedIn.localId !== record.oldFirebaseUid) throw new Error('EXISTING_EMAIL_UID_MISMATCH');
      account = await updateAccount(signedIn.idToken, record.email, DEFAULT_PASSWORD);
    }
  } else {
    account = await signUp(record.email, DEFAULT_PASSWORD);
    status = 'created';
  }

  const uid = account.localId || record.oldFirebaseUid;
  const idToken = account.idToken;
  if (!uid || !idToken) throw new Error('MISSING_AUTH_RESULT');

  await patchDatabase(`users/${uid}`, {
    role: 'student', profileId: record.id, name: record.name, email: record.email,
    matricule: record.matricule, mustChangePassword: true, migratedAt: new Date().toISOString(),
  }, idToken);

  await patchDatabase(`models/${record.id}`, {
    email: record.email, firebaseUid: uid, username: record.matricule,
    matricule: record.matricule, password: '',
  }, idToken);

  return { uid, status };
}

const models = await getModels();
const records = buildRecords(models);
const results = [];

for (const [index, record] of records.entries()) {
  try {
    const migrated = await migrateRecord(record);
    results.push({
      name: record.name, matricule: record.matricule, email: record.email,
      password: DEFAULT_PASSWORD, firebaseUid: migrated.uid, status: migrated.status,
    });
    console.log(`[${index + 1}/${records.length}] OK ${record.name} -> ${record.email} (${migrated.status})`);
  } catch (error) {
    results.push({
      name: record.name, matricule: record.matricule, email: record.email,
      password: DEFAULT_PASSWORD, firebaseUid: record.oldFirebaseUid, status: 'error',
      error: error?.message || String(error),
    });
    console.error(`[${index + 1}/${records.length}] ERROR ${record.name}: ${error?.message || error}`);
  }
}

await fs.mkdir('migration-output', { recursive: true });
await fs.writeFile('migration-output/model-auth-credentials.json', JSON.stringify(results, null, 2));
const csv = [
  ['Nom', 'Matricule', 'Email', 'Mot de passe initial', 'Firebase UID', 'Statut', 'Erreur'],
  ...results.map(r => [r.name, r.matricule, r.email, r.password, r.firebaseUid || '', r.status, r.error || '']),
].map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
await fs.writeFile('migration-output/model-auth-credentials.csv', csv);

const errors = results.filter(r => r.status === 'error');
console.log(`Migration terminée: ${results.length - errors.length}/${results.length} comptes traités, ${errors.length} erreur(s).`);
