/**
 * migrate-all-users.mjs
 * 
 * Migre TOUS les comptes depuis RTDB vers :
 *   1. Firebase Auth (email/password)
 *   2. RTDB  users/{uid}   — nœud de rôle (source de vérité AuthContext)
 *   3. Firestore users/{uid} — copie enrichie pour requêtes Firestore
 * 
 * Rôles traités : admin, student (mannequins), jury, registration
 * 
 * Usage : node scripts/migrate-all-users.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth }             from 'firebase-admin/auth';
import { getDatabase }         from 'firebase-admin/database';
import { getFirestore }        from 'firebase-admin/firestore';

// ─── Service Account ──────────────────────────────────────────────────────────
const serviceAccount = {
  type: "service_account",
  project_id: "perfect-156b5",
  private_key_id: "fd8972b3a5901bb68bcb4225b330a79b21fb5299",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxCJ3lZCFnNc+t\n7eCPmnmmCNR4TTl9xFU453OB5bRi+T3/eeNmunpq/JtWoeRv+PeoWKwpw1mcLM8G\nnzf2fuGNZC7iDF492/B0JIWT+W8BTBeypiUo6mk59rd7HNLcNvx3Nezvgv1fQWmd\nGvHy5dM0HrguRlJnqDQDUxd+Pkp3xbaqLxw2MYt9iWH0CjgVGxqxq6nBf68JpSRQ\nktsIXm2luNd098DZYvmTlMDXGJ6y0jjzgEfky3FmSawPRPt1Tv6TXyvri2ni38Ph\nEs9dGPFMN2VIqfsWsbsiEkyt3ZbQj9Mv3bifLprUa1CtXtTe3jjljRJZzhon6Yp/\nA0Xop9R/AgMBAAECggEACfon1+1AOq5cMXu2C7HTiEl4G/2SL2XYvbfBmUEGXQuZ\n9GN8ruX0j0IESSofkzXvUzQII+RoEPavhjqD72bwNEVApSm4R/k0wH7sbk4A9QxC\nS6W0c21el88xQQV7VsDckqVd4JO7ztoDZ0DFAQD12bqfe7An5cKjh8pviQReswg/\n6FUxwLp5ygSRum2RfqTWkAtYh7Ue7dxGP0Sp1/e8XVoWg9shX4TOBiRL0NkP4uQU\naZJfvbdxlQe6dHmPOvlfDzzdw1of1NBL43pfpnaqx3a9THFXtQvfoXZXdcotpbv5\n+pP5cvQ5W+rQyf3F1RVyU2HvUtqUClJt+YHgexotRQKBgQDriM54FRz0ZOTu6h9A\nf4mi7NSq92wL2qPq2usMAktDNt/vQGuXqifQeg7gzEBUEdEBFH9Zpmamb2K7xjfC\nK+bgAhPaID6LyOKGNNmNSy8scuUfsIgEbkfeQC3jW658LK6cY51doUYirDCb54pr\nDwTNHrCDFgXx4LvsNz/ypfMfHQKBgQDAaoc07Na6nlpfocHwvg6yy5qeyj1RiV9F\nnubW2MZPwDi9GQVerqWehCK6kd7/mmNOj1hy3SwcRJzhgg8UuQ9Cq8axZLpU3sEQ\nouIXNmIlLptyLuiq6J/g4Q/6jZLqi16m8G9YrMSCi0M3k2+3fBoyx8d5jOlmNtuI\nlyJi0oPjSwKBgD5VNk8RR1hmWy/fReYL2qEDjESytiVs93Rv+0RyVviyzRDEO7Un\nkuHZa5aSd3PIQ0fF5O4U25WwZLDNBHSeqbse0aIoZmUYBNr/oZODEjjxLzHzxgtm\nJB7tXTeOS98Q9CTvN/ZPeAA1Eagw3rD2iI7AUHZgnbIlh5Y8CPBueqkBAoGBAIge\nVEvSiA043MHuUp6WNRuzAUz30O0Pe0BrKu4uKAxe9USAoNXcQvmijFbjvpefhkUb\nDv0jDYNp3nmBYl3MlMkbb9Iqac6ETpwQPlUhecjH8duS57GQIxoY3Q7ofFhEA8+h\nI4PdpJ6dGg4E1PE+b+IghjKsxqgygpdcI005k2eFAoGAQIOI99xf7km5yERGVANn\nQ6msLvLwA0HHUIose93+AwfsGUZl6Ai6yJ06qthC0g080n1D90ACiwsSaAl/8Dl/\nno1RRxlZFJX4U1XpczmejCabgh8n0obBoHlHUORL0vMpORwOUGTx/J8uSyxKEU96\nLVuAxjsO/Petfu4zvj2x0rQ=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@perfect-156b5.iam.gserviceaccount.com",
  client_id: "118127840207205322048",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

const RTDB_URL = "https://perfect-156b5-default-rtdb.firebaseio.com";

// ─── Init Firebase Admin ──────────────────────────────────────────────────────
const app       = initializeApp({ credential: cert(serviceAccount), databaseURL: RTDB_URL });
const adminAuth = getAuth(app);
const rtdb      = getDatabase(app);
const firestore = getFirestore(app);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sanitizeEmail = (name) =>
  name.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f']/g, '')
    .replace(/[^a-z0-9-]/g, '') + '@perfectmodels.online';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Crée ou récupère un utilisateur Firebase Auth.
 * Retourne { uid, created: bool }
 */
async function upsertAuthUser(email, password, displayName) {
  // Mot de passe minimum 6 chars
  const safePassword = (password && password.length >= 6)
    ? password
    : (password ? password.padEnd(6, '0') : 'Pmm2025');

  try {
    const user = await adminAuth.createUser({
      email,
      password: safePassword,
      displayName,
      emailVerified: true,
    });
    return { uid: user.uid, created: true };
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      const existing = await adminAuth.getUserByEmail(email);
      // Mettre à jour le mot de passe
      await adminAuth.updateUser(existing.uid, { password: safePassword, displayName });
      return { uid: existing.uid, created: false };
    }
    throw err;
  }
}

/**
 * Écrit le nœud RTDB users/{uid} (source de vérité du rôle)
 */
async function writeRtdbUserNode(uid, payload) {
  await rtdb.ref(`users/${uid}`).set(payload);
}

/**
 * Écrit le document Firestore users/{uid}
 */
async function writeFirestoreUser(uid, payload) {
  await firestore.collection('users').doc(uid).set(payload, { merge: true });
}

/**
 * Met à jour la collection métier RTDB avec le firebaseUid
 */
async function patchRtdbProfile(collection, profileId, uid, email) {
  await rtdb.ref(`${collection}/${profileId}`).update({
    firebaseUid: uid,
    email,
    migratedAt: new Date().toISOString(),
  });
}

// ─── Résultats ────────────────────────────────────────────────────────────────
const results = { created: [], updated: [], skipped: [], errors: [] };

function logRow(icon, name, email, note) {
  console.log(`  ${icon} ${name.padEnd(30)} ${email.padEnd(45)} ${note}`);
}

// ─── Processeurs par rôle ─────────────────────────────────────────────────────

async function migrateModels() {
  console.log('\n📋 MANNEQUINS (models → student)');
  console.log('  ' + '─'.repeat(100));

  const snap = await rtdb.ref('models').once('value');
  if (!snap.exists()) { console.log('  (aucun mannequin trouvé)'); return; }

  const models = snap.val();

  for (const [profileId, model] of Object.entries(models)) {
    const name     = model.name || profileId;
    const email    = model.email || sanitizeEmail(name);
    const password = model.password || 'Pmm2025';

    try {
      const { uid, created } = await upsertAuthUser(email, password, name);

      const now = new Date().toISOString();
      const rtdbPayload = {
        role: 'student',
        profileId,
        name,
        email,
        createdAt: model.createdAt || now,
        migratedAt: now,
      };
      const firestorePayload = {
        ...rtdbPayload,
        uid,
        // Données profil enrichies
        username:    model.username  || '',
        gender:      model.gender    || '',
        height:      model.height    || '',
        location:    model.location  || '',
        imageUrl:    model.imageUrl  || '',
        level:       model.level     || '',
        categories:  model.categories || [],
        experience:  model.experience || '',
        isPublic:    model.isPublic   ?? true,
        lastLogin:   model.lastLogin  || null,
        updatedAt:   now,
      };

      await Promise.all([
        writeRtdbUserNode(uid, rtdbPayload),
        writeFirestoreUser(uid, firestorePayload),
        patchRtdbProfile('models', profileId, uid, email),
      ]);

      const icon = created ? '✅' : '🔄';
      logRow(icon, name, email, created ? 'créé' : 'mis à jour');
      (created ? results.created : results.updated).push({ name, email, role: 'student' });
    } catch (err) {
      logRow('❌', name, email, `ERREUR: ${err.message}`);
      results.errors.push({ name, email, role: 'student', error: err.message });
    }

    await sleep(100); // éviter rate limiting Firebase Auth
  }
}

async function migrateJury() {
  console.log('\n⚖️  JURY (juryMembers → jury)');
  console.log('  ' + '─'.repeat(100));

  const snap = await rtdb.ref('juryMembers').once('value');
  if (!snap.exists()) { console.log('  (aucun jury trouvé)'); return; }

  const members = snap.val();

  for (const [profileId, member] of Object.entries(members)) {
    const name     = member.name || profileId;
    const email    = member.email || sanitizeEmail(name);
    const password = member.password || 'Pmm2025';

    try {
      const { uid, created } = await upsertAuthUser(email, password, name);

      const now = new Date().toISOString();
      const rtdbPayload = {
        role: 'jury',
        profileId,
        name,
        email,
        createdAt: now,
        migratedAt: now,
      };
      const firestorePayload = {
        ...rtdbPayload,
        uid,
        username: member.username || '',
        updatedAt: now,
      };

      await Promise.all([
        writeRtdbUserNode(uid, rtdbPayload),
        writeFirestoreUser(uid, firestorePayload),
        patchRtdbProfile('juryMembers', profileId, uid, email),
      ]);

      const icon = created ? '✅' : '🔄';
      logRow(icon, name, email, created ? 'créé' : 'mis à jour');
      (created ? results.created : results.updated).push({ name, email, role: 'jury' });
    } catch (err) {
      logRow('❌', name, email, `ERREUR: ${err.message}`);
      results.errors.push({ name, email, role: 'jury', error: err.message });
    }

    await sleep(100);
  }
}

async function migrateStaff() {
  console.log('\n🪪  STAFF ENREGISTREMENT (registrationStaff → registration)');
  console.log('  ' + '─'.repeat(100));

  const snap = await rtdb.ref('registrationStaff').once('value');
  if (!snap.exists()) { console.log('  (aucun staff trouvé)'); return; }

  const staff = snap.val();

  for (const [profileId, member] of Object.entries(staff)) {
    const name     = member.name || profileId;
    const email    = member.email || sanitizeEmail(name);
    const password = member.password || 'Pmm2025';

    try {
      const { uid, created } = await upsertAuthUser(email, password, name);

      const now = new Date().toISOString();
      const rtdbPayload = {
        role: 'registration',
        profileId,
        name,
        email,
        createdAt: now,
        migratedAt: now,
      };
      const firestorePayload = {
        ...rtdbPayload,
        uid,
        username: member.username || '',
        updatedAt: now,
      };

      await Promise.all([
        writeRtdbUserNode(uid, rtdbPayload),
        writeFirestoreUser(uid, firestorePayload),
        patchRtdbProfile('registrationStaff', profileId, uid, email),
      ]);

      const icon = created ? '✅' : '🔄';
      logRow(icon, name, email, created ? 'créé' : 'mis à jour');
      (created ? results.created : results.updated).push({ name, email, role: 'registration' });
    } catch (err) {
      logRow('❌', name, email, `ERREUR: ${err.message}`);
      results.errors.push({ name, email, role: 'registration', error: err.message });
    }

    await sleep(100);
  }
}

async function ensureAdmin() {
  console.log('\n🛡️  ADMIN');
  console.log('  ' + '─'.repeat(100));

  const email    = 'admin@perfectmodels.online';
  const password = 'Pmm2025';
  const name     = 'Admin';

  try {
    const { uid, created } = await upsertAuthUser(email, password, name);

    const now = new Date().toISOString();
    const payload = {
      role: 'admin',
      profileId: 'admin',
      name,
      email,
      uid,
      createdAt: now,
      migratedAt: now,
    };

    await Promise.all([
      writeRtdbUserNode(uid, { ...payload }),
      writeFirestoreUser(uid, { ...payload }),
    ]);

    const icon = created ? '✅' : '🔄';
    logRow(icon, name, email, created ? 'créé' : 'mis à jour');
    (created ? results.created : results.updated).push({ name, email, role: 'admin' });
  } catch (err) {
    logRow('❌', name, email, `ERREUR: ${err.message}`);
    results.errors.push({ name, email, role: 'admin', error: err.message });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═'.repeat(100));
  console.log('🔥  MIGRATION COMPLÈTE — RTDB → Firebase Auth + RTDB users/ + Firestore users/');
  console.log('═'.repeat(100));

  await migrateModels();
  await migrateJury();
  await migrateStaff();
  await ensureAdmin();

  // ── Rapport final ──────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(100));
  console.log('📊 RAPPORT FINAL');
  console.log('═'.repeat(100));
  console.log(`  ✅ Créés    : ${results.created.length}`);
  console.log(`  🔄 Mis à jour : ${results.updated.length}`);
  console.log(`  ❌ Erreurs  : ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n  Détail des erreurs :');
    for (const e of results.errors) {
      console.log(`    • [${e.role}] ${e.name} (${e.email}) → ${e.error}`);
    }
  }

  const total = results.created.length + results.updated.length;
  console.log(`\n✅ ${total} compte(s) migrés avec succès vers Firebase Auth + Firestore.`);
  process.exit(results.errors.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\n❌ Erreur fatale:', err.message);
  process.exit(1);
});
