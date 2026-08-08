import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';

const API_KEY = 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg';
const DATABASE_URL = 'https://perfect-156b5-default-rtdb.firebaseio.com';
const DEFAULT_PASSWORD = 'Pmm2026@';
const TOKEN_HASH = '7ac4cbe44dad706ea9b0a46de84739d8e8f47d42740a866f37f901ef21c18f02';

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

const firstNameFromName = (name: string) => normalize((name || '').trim().split(/\s+/)[0] || 'mannequin');

const toList = (raw: any) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((value, index) => value ? ({ id: value.id || String(index), ...value }) : null).filter(Boolean);
  return Object.entries(raw).map(([key, value]: [string, any]) => ({ id: value?.id || key, ...value }));
};

const buildRecords = (models: any[]) => {
  const usedEmails = new Map<string, number>();
  const usedMatricules = new Set<string>();

  return models.map((model, index) => {
    const baseLocal = firstNameFromName(model.name || model.username || `mannequin${index + 1}`);
    const emailCount = usedEmails.get(baseLocal) || 0;
    usedEmails.set(baseLocal, emailCount + 1);
    const local = emailCount === 0 ? baseLocal : `${baseLocal}${emailCount + 1}`;

    let matricule = String(model.matricule || model.username || '').trim();
    if (!matricule || usedMatricules.has(matricule.toLowerCase())) {
      const genderCode = model.gender === 'Homme' ? 'H' : model.gender === 'Femme' ? 'F' : 'M';
      const year = new Date().getFullYear();
      const seq = String(index + 1).padStart(3, '0');
      matricule = `PMM-${genderCode}-${year}-${seq}`;
    }
    usedMatricules.add(matricule.toLowerCase());

    return {
      id: model.id,
      name: model.name || '',
      existingUsername: model.username || '',
      existingEmail: model.email || '',
      existingFirebaseUid: model.firebaseUid || '',
      matricule,
      email: `${local}@perfectmodels.online`,
      password: DEFAULT_PASSWORD,
      isPublic: model.isPublic !== false,
    };
  });
};

async function getModels() {
  const response = await fetch(`${DATABASE_URL}/models.json`);
  if (!response.ok) throw new Error(`RTDB read failed: ${response.status}`);
  return toList(await response.json());
}

async function signUp(email: string, password: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await response.json();
  if (!response.ok) {
    const code = data?.error?.message || `AUTH_${response.status}`;
    throw new Error(code);
  }
  return data as { localId: string; email: string; idToken: string };
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const models = await getModels();
    const records = buildRecords(models);
    const action = String(req.query.action || 'preview');

    if (action !== 'run') {
      return res.status(200).json({ count: records.length, records });
    }

    const token = String(req.query.token || '');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    if (!token || tokenHash !== TOKEN_HASH) return res.status(403).json({ error: 'Forbidden' });

    const results: any[] = [];
    for (const record of records) {
      try {
        const account = await signUp(record.email, record.password);
        await patchDatabase(`users/${account.localId}`, {
          role: 'student',
          profileId: record.id,
          name: record.name,
          email: record.email,
          matricule: record.matricule,
          createdAt: new Date().toISOString(),
        }, account.idToken);
        await patchDatabase(`models/${record.id}`, {
          email: record.email,
          firebaseUid: account.localId,
          username: record.matricule,
          matricule: record.matricule,
          password: '',
        }, account.idToken);
        results.push({ ...record, firebaseUid: account.localId, status: 'created' });
      } catch (error: any) {
        results.push({ ...record, status: 'error', error: error?.message || String(error) });
      }
    }

    return res.status(200).json({ count: records.length, results });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
