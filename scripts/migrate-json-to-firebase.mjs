/**
 * Migration : auth_profiles.json → Firebase Authentication.
 *
 * Variables requises :
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY
 * - FIREBASE_MIGRATION_DEFAULT_PASSWORD
 *
 * Variables optionnelles :
 * - FIREBASE_PROJECT_ID (perfect-156b5 par défaut)
 * - FIREBASE_MIGRATION_INPUT (auth_profiles.json par défaut)
 *
 * Usage : node scripts/migrate-json-to-firebase.mjs
 */

import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Variable d'environnement requise : ${name}`);
  return value;
}

const DEFAULT_PASSWORD = requireEnv('FIREBASE_MIGRATION_DEFAULT_PASSWORD');
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID?.trim() || 'perfect-156b5';
const INPUT_PATH = process.env.FIREBASE_MIGRATION_INPUT?.trim() || 'auth_profiles.json';
const SERVICE_ACCOUNT = {
  clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
  privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
};

function base64url(data) {
  const value = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
  return value.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAdminAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url({ alg: 'RS256', typ: 'JWT' });
  const payload = base64url({
    iss: SERVICE_ACCOUNT.clientEmail,
    sub: SERVICE_ACCOUNT.clientEmail,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
  });
  const signingInput = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = signer.sign(SERVICE_ACCOUNT.privateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const assertion = `${signingInput}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data?.access_token) {
    throw new Error(`OAuth2 error: ${JSON.stringify(data?.error || data)}`);
  }
  return data.access_token;
}

const BASE = `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}`;
const headers = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function lookupByEmail(email, token) {
  const response = await fetch(`${BASE}/accounts:lookup`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ email: [email] }),
  });
  const data = await response.json();
  if (response.status === 400 && data?.error?.message?.includes('USER_NOT_FOUND')) return null;
  if (!response.ok) throw new Error(`lookup error: ${JSON.stringify(data?.error)}`);
  return data.users?.[0] ?? null;
}

async function createUser(email, displayName, token) {
  const response = await fetch(`${BASE}/accounts`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      email,
      displayName,
      password: DEFAULT_PASSWORD,
      emailVerified: false,
      disabled: false,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`create error for ${email}: ${JSON.stringify(data?.error)}`);
  return data;
}

async function updateUser(localId, email, displayName, token) {
  const response = await fetch(`${BASE}/accounts:update`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      localId,
      email,
      displayName,
      password: DEFAULT_PASSWORD,
      emailVerified: false,
      disabled: false,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`update error for ${localId}: ${JSON.stringify(data?.error)}`);
  return data;
}

function loadUsers() {
  const parsed = JSON.parse(readFileSync(INPUT_PATH, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('Le fichier de migration doit contenir un tableau JSON.');
  return parsed;
}

async function main() {
  const users = loadUsers();
  const token = await getAdminAccessToken();
  const results = { created: [], updated: [], skipped: [], errors: [] };

  console.log(`Migration de ${users.length} utilisateur(s) depuis ${INPUT_PATH}.`);

  for (const user of users) {
    const email = String(user.login_email || '').toLowerCase().trim();
    if (!email) {
      results.skipped.push({ userId: user.user_id, reason: 'no email' });
      continue;
    }

    const displayName = user.identifier || email.split('@')[0];
    try {
      const existing = await lookupByEmail(email, token);
      if (existing) {
        await updateUser(existing.localId, email, displayName, token);
        results.updated.push({ email, uid: existing.localId, role: user.app_role });
      } else {
        const created = await createUser(email, displayName, token);
        results.created.push({ email, uid: created.localId, role: user.app_role });
      }
      await new Promise((resolve) => setTimeout(resolve, 120));
    } catch (error) {
      results.errors.push({ email, error: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(JSON.stringify({
    created: results.created.length,
    updated: results.updated.length,
    skipped: results.skipped.length,
    errors: results.errors,
  }, null, 2));
}

main().catch((error) => {
  console.error('Migration Firebase échouée :', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
