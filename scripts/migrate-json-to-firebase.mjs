/**
 * Migration : auth_profiles.json → Firebase Authentication
 * Crée ou met à jour chaque utilisateur avec le mot de passe Pmm2026@
 *
 * Usage: node scripts/migrate-json-to-firebase.mjs
 */

import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_PASSWORD   = 'Pmm2026@';
const FIREBASE_PROJECT_ID = 'perfect-156b5';

const SERVICE_ACCOUNT = {
  client_email: 'firebase-adminsdk-fbsvc@perfect-156b5.iam.gserviceaccount.com',
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDIo4SVR7hpk1z3
oxLbIN5CSd6cOLr8QDOEVrjdkArbTT6NTSTDhenJKTSnnSSywpLh2zsnd42b/sXi
ifUw/+WFPoZMG8CJUXRePQewfQ84YCVjnaBJVBht35SlUN+KP9yw4waMN3L912cy
ZDgRtbaPUCSgxw3a/Q1FQ69S7LK0tZqGaWk8Q1Oqs5wpe/3El7eWmPNFIlvyEp67
VPhHjd7kMJsEKQDJvpF17hkmI9eU9qfX2orz0qgSa/8JzOOPGlrkmr/6HWZeIxSG
1MOgcIeYmTd4pdR+ckg7epLymqpK9pzkHB7qcxqMDAf4pOO2HOLOLKb0O1GO0yWk
R8RswMrHAgMBAAECggEAGVHdZPNYl+YzaMLpGcMzmTz2PVPBcRzvA2foS3mmjRdZ
6f4OwifvoWW0UeS4YWDBpYQDmo7xTXrg4R5U1Xqtrdt+mjM0YH/phg0An+qgVZZ4
kXIubKKStKbu/M/QbgNyJ9Z2mJJUzij1SnwwQTfj0oEkJjAIlRazKocIpJffU4OQ
OzXnnK/f9evcQKwSo/k2i15HtWik1JtcIM8INQleMbrG61w0neX+UgX6mmf6SNnE
7/mMA5tIvdaUlzlGDRL0MgWFiW+T/Vj/01tZWgi/yjL6CvxUlukRFfP7GxGa2QPL
NfMOf7nBieAVJM9HIKnFWQhm4ikiGoio/qEIeN+B7QKBgQDs3NFXKoDtEWioM88Q
P7dtEVhfY15wDRQ/UtqVHeeA/NBVGOIG+QkOUn0ogHTuH9PMHc+erDiKJkT4FVn7
8RVFwF6VHNiI0SK7ppfRW+/R2OgQ9H7cdiymT3VN9jqutycfkF8SrttINJEou8LE
dKC2MWGxI6nP1T7IDJDChDxJ/QKBgQDY2XWQI8JZivOQ8FNyhjol8lJrf1KX/NJl
aGlFBwazvArOY2dKuWXQ5JDJgpxNlOSGVZGGLNlb/uZ16dIP/DX7CHqFb21mtSH8
9twOSLWVc1ZTYmLQnwaQqjI2RBZgzoZTAZxgyeip6ZtvNJMhiF8X3ULQd69qPdnH
FpuAkouREwKBgB1BvT3WCyy9LL8x/w6TwDVhohfOL1kJ1Ilp04P9uJ2vHJCWTTzt
P9gcCkeZblgHaGLa/80qmqU9yuEVyhKbmbQO6d/jOz/TDUY+cpwyjfHOqAOIH69d
jXBRejzSADeaeeOlMokdPgqyK4frgUhA26UFfnqh3BTG00Vkf/D24neFAoGABDBf
NwOZ04T9o4Ug94tkQCtoMC9rdwgpQFA+CFlUZdByHP6KlkTylJB1w47EWjNQHtA0
WXUwVbic1xZHOovStyC4zS8T2/IP0AUsxxHcgCCUQFQcOI953v2KrsWt8PzMV3om
fTApUG7007ceSH2L6LgbfE9zkgfT1ya2pksuawUCgYAGU20wdRvHVy+MkFlFmXoE
t/RJBRe8Ebb6FT0sKcAOiJjO7iVRFyXwnt2B21kR4q9dhqb3r7TljFn7fM02Vwk6
M5ct9ptaCKiRjXtqPq3ZzgvAaQKovpDcPWXDLU4ryW6C9Anip7orEhH7sC0xoZbC
I6///SRZsPJgrltanDbLVA==
-----END PRIVATE KEY-----`,
};

// ─── OAuth2 token ─────────────────────────────────────────────────────────────

function base64url(data) {
  const b = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
  return b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAdminAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header  = base64url({ alg: 'RS256', typ: 'JWT' });
  const payload = base64url({
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase',
  });

  const sigInput = `${header}.${payload}`;
  const sign = createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = sign.sign(SERVICE_ACCOUNT.private_key, 'base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${sigInput}.${sig}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`OAuth2 error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// ─── Firebase Identity Toolkit helpers ───────────────────────────────────────

const BASE = `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}`;

async function lookupByEmail(email, token) {
  const resp = await fetch(`${BASE}/accounts:lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email: [email] }),
  });
  const data = await resp.json();
  if (resp.status === 400 && data?.error?.message?.includes('USER_NOT_FOUND')) return null;
  if (!resp.ok) throw new Error(`lookup error: ${JSON.stringify(data?.error)}`);
  return data.users?.[0] ?? null;
}

async function createUser(email, displayName, token) {
  const resp = await fetch(`${BASE}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      email,
      displayName,
      password: DEFAULT_PASSWORD,
      emailVerified: false,
      disabled: false,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`create error for ${email}: ${JSON.stringify(data?.error)}`);
  return data;
}

async function updateUser(localId, email, displayName, token) {
  const resp = await fetch(`${BASE}/accounts:update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      localId,
      email,
      displayName,
      password: DEFAULT_PASSWORD,
      emailVerified: false,
      disabled: false,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`update error for ${localId}: ${JSON.stringify(data?.error)}`);
  return data;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Migration auth_profiles.json → Firebase Auth');
  console.log('═══════════════════════════════════════════════════════\n');

  // Charger le fichier JSON (chercher dans Downloads et le dossier courant)
  let users;
  const candidates = [
    'C:\\Users\\DELL\\Downloads\\auth_profiles.json',
    'scripts\\auth_profiles.json',
    'auth_profiles.json',
  ];
  for (const p of candidates) {
    try {
      users = JSON.parse(readFileSync(p, 'utf8'));
      console.log(`📂 Fichier chargé : ${p}`);
      break;
    } catch { /* essayer suivant */ }
  }
  if (!users) throw new Error('Fichier auth_profiles.json introuvable. Placez-le dans Downloads ou à la racine du projet.');

  console.log(`   ${users.length} utilisateur(s) à migrer\n`);

  // Token Firebase Admin
  console.log('🔑 Obtention du token Firebase Admin…');
  const token = await getAdminAccessToken();
  console.log('   ✅ Token obtenu\n');

  // Afficher la liste
  console.log('Utilisateurs à migrer :');
  users.forEach((u, i) => {
    console.log(`  ${String(i + 1).padStart(2)}. ${u.login_email.padEnd(45)} rôle: ${u.app_role}`);
  });
  console.log('');

  // Migration
  console.log('🔄 Migration en cours…\n');
  const results = { created: [], updated: [], skipped: [], errors: [] };

  for (const u of users) {
    const email = (u.login_email || '').toLowerCase().trim();
    if (!email) {
      console.warn(`  ⚠  Ignoré (pas d'email) : user_id=${u.user_id}`);
      results.skipped.push({ user_id: u.user_id, reason: 'no email' });
      continue;
    }

    const displayName = u.identifier || email.split('@')[0];

    try {
      const existing = await lookupByEmail(email, token);

      if (existing) {
        await updateUser(existing.localId, email, displayName, token);
        console.log(`  ↻  MàJ  : ${email} (uid=${existing.localId})`);
        results.updated.push({ email, uid: existing.localId, role: u.app_role });
      } else {
        const created = await createUser(email, displayName, token);
        console.log(`  +  Créé : ${email} (uid=${created.localId})`);
        results.created.push({ email, uid: created.localId, role: u.app_role });
      }

      // Petit délai pour éviter le rate-limit Firebase (600 req/min)
      await new Promise(r => setTimeout(r, 120));

    } catch (err) {
      console.error(`  ✗  Erreur : ${email} → ${err.message}`);
      results.errors.push({ email, error: err.message });
    }
  }

  // Rapport final
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Rapport de migration');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ✅ Créés      : ${results.created.length}`);
  console.log(`  🔄 Mis à jour : ${results.updated.length}`);
  console.log(`  ⚠  Ignorés    : ${results.skipped.length}`);
  console.log(`  ❌ Erreurs    : ${results.errors.length}`);

  if (results.created.length > 0) {
    console.log('\nCréés :');
    results.created.forEach(u => console.log(`  - ${u.email}  [${u.role}]  uid=${u.uid}`));
  }
  if (results.updated.length > 0) {
    console.log('\nMis à jour :');
    results.updated.forEach(u => console.log(`  - ${u.email}  [${u.role}]  uid=${u.uid}`));
  }
  if (results.errors.length > 0) {
    console.log('\nErreurs :');
    results.errors.forEach(e => console.log(`  - ${e.email} : ${e.error}`));
  }

  console.log(`\n✅ Terminé — mot de passe appliqué : ${DEFAULT_PASSWORD}`);
}

main().catch(err => {
  console.error('\n❌ Erreur fatale :', err.message);
  process.exit(1);
});
