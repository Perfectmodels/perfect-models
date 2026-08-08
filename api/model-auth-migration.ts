import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

const API_KEY = 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg';
const DATABASE_URL = 'https://perfect-156b5-default-rtdb.firebaseio.com';
const DEFAULT_PASSWORD = 'Pmm2026@';
const TOKEN_HASH = 'f591155db5d1fecc38df25290a8bc626095153db316a2cd013adea873ebae9db';

const EMAIL_LOCAL_OVERRIDES: Record<string, string> = {
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

const MATRICULE_OVERRIDES: Record<string, string> = {
  'dorcas-saphou': 'Man-PMMD02',
  'osee-jn': 'Man-PMMO02',
};

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9.]/g, '');

const toList = (raw: any) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((value, index) => value ? ({ id: value.id || String(index), ...value }) : null).filter(Boolean);
  return Object.entries(raw).map(([key, value]: [string, any]) => ({ id: value?.id || key, ...value }));
};

const firstNameFromName = (name: string) => normalize((name || '').trim().split(/\s+/)[0] || 'mannequin');

const buildRecords = (models: any[]) => models.map((model, index) => {
  const id = String(model.id || index);
  const local = EMAIL_LOCAL_OVERRIDES[id] || firstNameFromName(model.name || model.username || `mannequin${index + 1}`);
  const existingMatricule = String(model.matricule || model.username || '').trim();
  const matricule = MATRICULE_OVERRIDES[id] || existingMatricule || `Man-PMMX${String(index + 1).padStart(2, '0')}`;
  return {
    id,
    name: model.name || '',
    oldEmail: String(model.email || '').trim().toLowerCase(),
    oldFirebaseUid: String(model.firebaseUid || ''),
    legacyPassword: String(model.password || ''),
    oldUsername: String(model.username || ''),
    matricule,
    email: `${local}@perfectmodels.online`,
    password: DEFAULT_PASSWORD,
    isPublic: model.isPublic !== false,
  };
});

async function getModels() {
  const response = await fetch(`${DATABASE_URL}/models.json`);
  if (!response.ok) throw new Error(`RTDB read failed: ${response.status}`);
  return toList(await response.json());
}

async function firebaseRequest(endpoint: string, payload: any) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `AUTH_${response.status}`);
  return data;
}

async function signIn(email: string, password: string) {
  return firebaseRequest('accounts:signInWithPassword', { email, password, returnSecureToken: true });
}

async function signUp(email: string, password: string) {
  return firebaseRequest('accounts:signUp', { email, password, returnSecureToken: true });
}

async function updateAccount(idToken: string, email: string, password: string) {
  return firebaseRequest('accounts:update', { idToken, email, password, returnSecureToken: true });
}

async function patchDatabase(path: string, value: any, idToken?: string) {
  const auth = idToken ? `?auth=${encodeURIComponent(idToken)}` : '';
  const response = await fetch(`${DATABASE_URL}/${path}.json${auth}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`RTDB write failed ${path}: ${response.status} ${await response.text()}`);
}

async function migrateRecord(record: any) {
  let account: any;
  let status = 'migrated';

  if (record.oldFirebaseUid) {
    // Déjà migré ?
    try {
      const current = await signIn(record.email, DEFAULT_PASSWORD);
      if (current.localId === record.oldFirebaseUid) {
        account = current;
        status = 'already_migrated';
      } else {
        throw new Error('TARGET_EMAIL_UID_CONFLICT');
      }
    } catch (targetError: any) {
      if (String(targetError?.message).includes('TARGET_EMAIL_UID_CONFLICT')) throw targetError;

      const candidates = [record.legacyPassword, DEFAULT_PASSWORD].filter(Boolean);
      let signedIn: any = null;
      let lastError = '';
      for (const candidatePassword of [...new Set(candidates)]) {
        try {
          signedIn = await signIn(record.oldEmail, candidatePassword);
          break;
        } catch (error: any) {
          lastError = error?.message || String(error);
        }
      }
      if (!signedIn) throw new Error(`EXISTING_AUTH_LOGIN_FAILED:${lastError || 'NO_LEGACY_PASSWORD'}`);
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
    role: 'student',
    profileId: record.id,
    name: record.name,
    email: record.email,
    matricule: record.matricule,
    mustChangePassword: true,
    migratedAt: new Date().toISOString(),
  }, idToken);

  await patchDatabase(`models/${record.id}`, {
    email: record.email,
    firebaseUid: uid,
    username: record.matricule,
    matricule: record.matricule,
    password: '',
  }, idToken);

  return { uid, status };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const models = await getModels();
    const records = buildRecords(models);
    const action = String(req.query.action || 'preview');

    if (action !== 'run') {
      return res.status(200).json({
        count: records.length,
        records: records.map(({ legacyPassword, password, ...record }) => ({ ...record, hasLegacyPassword: Boolean(legacyPassword) })),
      });
    }

    const token = String(req.query.token || '');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (!token || tokenHash !== TOKEN_HASH) return res.status(403).json({ error: 'Forbidden' });

    const results: any[] = [];
    for (const record of records) {
      try {
        const migrated = await migrateRecord(record);
        results.push({
          id: record.id,
          name: record.name,
          matricule: record.matricule,
          email: record.email,
          password: DEFAULT_PASSWORD,
          firebaseUid: migrated.uid,
          status: migrated.status,
        });
      } catch (error: any) {
        results.push({
          id: record.id,
          name: record.name,
          matricule: record.matricule,
          email: record.email,
          password: DEFAULT_PASSWORD,
          firebaseUid: record.oldFirebaseUid,
          status: 'error',
          error: error?.message || String(error),
        });
      }
    }

    return res.status(200).json({ count: records.length, results });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
