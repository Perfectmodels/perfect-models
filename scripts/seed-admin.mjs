/**
 * seed-admin.mjs
 * Crée le compte admin dans Firebase Auth via le SDK Admin,
 * puis écrit le nœud users/{uid} dans le Realtime Database.
 *
 * Usage:
 *   node scripts/seed-admin.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

// ─── Service Account (clé privée) ─────────────────────────────────────────────
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

// ─── Compte à créer ───────────────────────────────────────────────────────────
const ADMIN_EMAIL    = "admin@perfectmodels.online";
const ADMIN_PASSWORD = "Pmm2025";
const ADMIN_NAME     = "Admin";
const RTDB_URL       = "https://perfect-156b5-default-rtdb.firebaseio.com";

// ─── Init Firebase Admin ──────────────────────────────────────────────────────
const app = initializeApp({
  credential: cert(serviceAccount),
  databaseURL: RTDB_URL,
});

const adminAuth = getAuth(app);
const db        = getDatabase(app);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔥 Seed Admin — Firebase Admin SDK");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log("");

  let uid;

  // 1. Créer ou récupérer l'utilisateur Firebase Auth
  try {
    console.log("1. Création du compte Firebase Auth…");
    const userRecord = await adminAuth.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME,
      emailVerified: true,
    });
    uid = userRecord.uid;
    console.log(`   ✅ Compte créé — UID: ${uid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      console.log("   ℹ️  Le compte existe déjà — récupération de l'UID…");
      const existing = await adminAuth.getUserByEmail(ADMIN_EMAIL);
      uid = existing.uid;
      console.log(`   ✅ UID récupéré : ${uid}`);

      // Mettre à jour le mot de passe au cas où il serait différent
      await adminAuth.updateUser(uid, { password: ADMIN_PASSWORD });
      console.log("   ✅ Mot de passe mis à jour.");
    } else {
      console.error(`   ❌ Erreur Auth: ${err.message}`);
      process.exit(1);
    }
  }

  // 2. Écrire le nœud users/{uid} dans le RTDB
  try {
    console.log(`\n2. Écriture du nœud RTDB users/${uid}…`);
    const ref = db.ref(`users/${uid}`);
    await ref.set({
      role: "admin",
      profileId: "admin",
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      createdAt: new Date().toISOString(),
    });
    console.log("   ✅ Nœud RTDB écrit avec succès.");
  } catch (err) {
    console.error(`   ❌ Erreur RTDB: ${err.message}`);
    process.exit(1);
  }

  console.log("\n✅ Seed terminé !");
  console.log("   Connectez-vous sur /login avec :");
  console.log(`   Email    : ${ADMIN_EMAIL}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur non gérée:", err);
  process.exit(1);
});
