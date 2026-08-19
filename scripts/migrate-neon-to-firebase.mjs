/**
 * Script de migration : Neon → Firebase Authentication
 * 
 * Récupère tous les utilisateurs depuis Neon (neon_auth.user + public.auth_profiles)
 * et les crée dans Firebase Auth via l'API REST Identity Toolkit
 * (pas besoin de firebase-admin SDK)
 * 
 * Usage: node scripts/migrate-neon-to-firebase.mjs
 */

import { neon } from '@neondatabase/serverless';

// ─── Config ───────────────────────────────────────────────────────────────────

const DATABASE_URL =
  'postgresql://neondb_owner:npg_XxKmV4YJv8uS@ep-royal-silence-aul8zkgt-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require';

const FIREBASE_PROJECT_ID = 'perfect-156b5';
const FIREBASE_API_KEY    = 'AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg';

const DEFAULT_PASSWORD = 'Pmm2026@';

// Service account pour obtenir un access token OAuth2
const SERVICE_ACCOUNT = {
  client_email: 'firebase-adminsdk-fbsvc@perfect-156b5.iam.gserviceaccount.com',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDIo4SVR7hpk1z3\noxLbIN5CSd6cOLr8QDOEVrjdkArbTT6NTSTDhenJKTSnnSSywpLh2zsnd42b/sXi\nifUw/+WFPoZMG8CJUXRePQewfQ84YCVjnaBJVBht35SlUN+KP9yw4waMN3L912cy\nZDgRtbaPUCSgxw3a/Q1FQ69S7LK0tZqGaWk8Q1Oqs5wpe/3El7eWmPNFIlvyEp67\nVPhHjd7kMJsEKQDJvpF17hkmI9eU9qfX2orz0qgSa/8JzOOPGlrkmr/6HWZeIxSG\n1MOgcIeYmTd4pdR+ckg7epLymqpK9pzkHB7qcxqMDAf4pOO2HOLOLKb0O1GO0yWk\nR8RswMrHAgMBAAECggEAGVHdZPNYl+YzaMLpGcMzmTz2PVPBcRzvA2foS3mmjRdZ\n6f4OwifvoWW0UeS4YWDBpYQDmo7xTXrg4R5U1Xqtrdt+mjM0YH/phg0An+qgVZZ4\nkXIubKKStKbu/M/QbgNyJ9Z2mJJUzij1SnwwQTfj0oEkJjAIlRazKocIpJffU4OQ\nOzXnnK/f9evcQKwSo/k2i15HtWik1JtcIM8INQleMbrG61w0neX+UgX6mmf6SNnE\n7/mMA5tIvdaUlzlGDRL0MgWFiW+T/Vj/01tZWgi/yjL6CvxUlukRFfP7GxGa2QPL\nNfMOf7nBieAVJM9HIKnFWQhm4ikiGoio/qEIeN+B7QKBgQDs3NFXKoDtEWioM88Q\nP7dtEVhfY15wDRQ/UtqVHeeA/NBVGOIG+QkOUn0ogHTuH9PMHc+erDiKJkT4FVn7\n8RVFwF6VHNiI0SK7ppfRW+/R2OgQ9H7cdiymT3VN9jqutycfkF8SrttINJEou8LE\ndKC2MWGxI6nP1T7IDJDChDxJ/QKBgQDY2XWQI8JZivOQ8FNyhjol8lJrf1KX/NJl\naGlFBwazvArOY2dKuWXQ5JDJgpxNlOSGVZGGLNlb/uZ16dIP/DX7CHqFb21mtSH8\n9twOSLWVc1ZTYmLQnwaQqjI2RBZgzoZTAZxgyeip6ZtvNJMhiF8X3ULQd69qPdnH\nFpuAkouREwKBgB1BvT3WCyy9LL8x/w6TwDVhohfOL1kJ1Ilp04P9uJ2vHJCWTTzt\nP9gcCkeZblgHaGLa/80qmqU9yuEVyhKbmbQO6d/jOz/TDUY+cpwyjfHOqAOIH69d\njXBRejzSADeaeeOlMokdPgqyK4frgUhA26UFfnqh3BTG00Vkf/D24neFAoGABDBf\nNwOZ04T9o4Ug94tkQCtoMC9rdwgpQFA+CFlUZdByHP6KlkTylJB1w47EWjNQHtA0\nWXUwVbic1xZHOovStyC4zS8T2/IP0AUsxxHcgCCUQFQcOI953v2KrsWt8PzMV3om\nfTApUG7007ceSH2L6LgbfE9zkgfT1ya2pksuawUCgYAGU20wdRvHVy+MkFlFmXoE\nt/RJBRe8Ebb6FT0sKcAOiJjO7iVRFyXwnt2B21kR4q9dhqb3r7TljFn7fM02Vwk6\nM5ct9ptaCKiRjXtqPq3ZzgvAaQKovpDcPWXDLU4ryW6C9Anip7orEhH7sC0xoZbC\nI6///SRZsPJgrltanDbLVA==\n-----END PRIVATE KEY-----\n',
};

// ─── JWT / OAuth2 pour l'Admin API ──────────────────────────────────────────

const { createSign } = await import('node:crypto');

function base64url(data) {
  const b = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
  return b.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAdminAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url({ alg: 'RS256', typ: 'JWT' });
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

// ─── Firebase Identity API (Admin) ──────────────────────────────────────────

const IDENTITY_BASE = `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}`;

async function lookupByEmail(email, accessToken) {
  const resp = await fetch(`${IDENTITY_BASE}/accounts:lookup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email: [email] }),
  });
  const data = await resp.json();
  if (resp.status === 400 && data?.error?.message?.includes('USER_NOT_FOUND')) return null;
  if (!resp.ok) throw new Error(`lookupByEmail error: ${JSON.stringify(data?.error)}`);
  return data.users?.[0] || null;
}

async function createUser(email, displayName, password, emailVerified, disabled, accessToken) {
  const resp = await fetch(`${IDENTITY_BASE}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email, displayName, password, emailVerified: !!emailVerified, disabled: !!disabled }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`createUser error for ${email}: ${JSON.stringify(data?.error)}`);
  return data;
}

async function updateUser(localId, updates, accessToken) {
  const resp = await fetch(`${IDENTITY_BASE}/accounts:update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ localId, ...updates }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`updateUser error ${localId}: ${JSON.stringify(data?.error)}`);
  return data;
}

// ─── Neon ────────────────────────────────────────────────────────────────────

async function getUsersFromNeon() {
  const sql = neon(DATABASE_URL);
  const rows = await sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u."emailVerified",
      u.role          AS neon_role,
      u.banned,
      u."createdAt",
      p.identifier,
      p.app_role,
      p.login_email,
      p.profile_id,
      p.status,
      p.must_change_password,
      p.permissions,
      p.contest_id
    FROM neon_auth.user u
    LEFT JOIN public.auth_profiles p ON p.user_id = u.id
    ORDER BY u."createdAt" ASC
  `;
  return rows;
}

// ─── Migration ───────────────────────────────────────────────────────────────

async function migrateUser(user, accessToken) {
  const email = (user.login_email || user.email || '').toLowerCase().trim();
  if (!email) {
    console.warn(`  ⚠  Ignoré (pas d'email) : id=${user.id}`);
    return { status: 'skipped', reason: 'no email' };
  }

  const displayName = user.name || email.split('@')[0];
  const role        = user.app_role || user.neon_role || 'student';
  const disabled    = user.banned === true || user.status === 'disabled';

  const existing = await lookupByEmail(email, accessToken);

  if (existing) {
    console.log(`  ↻  Mise à jour : ${email} (uid=${existing.localId}, rôle=${role})`);
    await updateUser(existing.localId, {
      displayName,
      password: DEFAULT_PASSWORD,
      emailVerified: user.emailVerified ?? false,
      disabled,
    }, accessToken);
    return { status: 'updated', uid: existing.localId, email, role };
  }

  console.log(`  +  Création : ${email} (rôle=${role})`);
  const created = await createUser(email, displayName, DEFAULT_PASSWORD, user.emailVerified ?? false, disabled, accessToken);
  return { status: 'created', uid: created.localId, email, role };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Migration Neon → Firebase Authentication');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Récupérer un token admin Firebase
  console.log('🔑 Obtention du token d\'accès Firebase Admin…');
  const accessToken = await getAdminAccessToken();
  console.log('   ✅ Token obtenu\n');

  // 2. Récupérer les utilisateurs Neon
  console.log('📥 Récupération des utilisateurs depuis Neon…');
  const users = await getUsersFromNeon();
  console.log(`   ${users.length} utilisateur(s) trouvé(s)\n`);

  if (users.length === 0) {
    console.log('Aucun utilisateur à migrer.');
    return;
  }

  console.log('Utilisateurs Neon :');
  users.forEach((u, i) => {
    const email = u.login_email || u.email || '(no email)';
    const role  = u.app_role || u.neon_role || 'student';
    const status = u.status || 'active';
    console.log(`  ${i + 1}. ${email} | rôle: ${role} | statut: ${status}`);
  });
  console.log('');

  // 3. Migrer
  console.log('🔄 Migration en cours…\n');
  const results = { created: [], updated: [], skipped: [], errors: [] };

  for (const user of users) {
    try {
      const result = await migrateUser(user, accessToken);
      if (result.status === 'created')      results.created.push(result);
      else if (result.status === 'updated') results.updated.push(result);
      else                                   results.skipped.push(result);
    } catch (err) {
      const email = user.login_email || user.email || user.id;
      console.error(`  ✗  Erreur pour ${email} : ${err.message}`);
      results.errors.push({ email, error: err.message });
    }
  }

  // 4. Rapport
  console.log('\n═══════════════════════════════════════════════');
  console.log('  Rapport de migration');
  console.log('═══════════════════════════════════════════════');
  console.log(`  ✅ Créés       : ${results.created.length}`);
  console.log(`  🔄 Mis à jour  : ${results.updated.length}`);
  console.log(`  ⚠  Ignorés     : ${results.skipped.length}`);
  console.log(`  ❌ Erreurs     : ${results.errors.length}`);

  if (results.created.length > 0) {
    console.log('\nUtilisateurs créés :');
    results.created.forEach(u => console.log(`  - ${u.email} [${u.role}] → uid=${u.uid}`));
  }
  if (results.updated.length > 0) {
    console.log('\nUtilisateurs mis à jour :');
    results.updated.forEach(u => console.log(`  - ${u.email} [${u.role}] → uid=${u.uid}`));
  }
  if (results.errors.length > 0) {
    console.log('\nErreurs :');
    results.errors.forEach(e => console.log(`  - ${e.email} : ${e.error}`));
  }

  console.log(`\n✅ Migration terminée. Mot de passe pour tous : ${DEFAULT_PASSWORD}`);
}

main().catch(err => {
  console.error('\n❌ Erreur fatale :', err.message);
  process.exit(1);
});
