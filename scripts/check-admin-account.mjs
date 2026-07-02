/**
 * Vérifie et corrige le compte admin dans Firestore (collection 'accounts')
 * et RTDB (collection 'users')
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth }             from 'firebase-admin/auth';
import { getDatabase }         from 'firebase-admin/database';
import { getFirestore }        from 'firebase-admin/firestore';

const serviceAccount = {
  type: "service_account",
  project_id: "perfect-156b5",
  private_key_id: "fd8972b3a5901bb68bcb4225b330a79b21fb5299",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxCJ3lZCFnNc+t\n7eCPmnmmCNR4TTl9xFU453OB5bRi+T3/eeNmunpq/JtWoeRv+PeoWKwpw1mcLM8G\nnzf2fuGNZC7iDF492/B0JIWT+W8BTBeypiUo6mk59rd7HNLcNvx3Nezvgv1fQWmd\nGvHy5dM0HrguRlJnqDQDUxd+Pkp3xbaqLxw2MYt9iWH0CjgVGxqxq6nBf68JpSRQ\nktsIXm2luNd098DZYvmTlMDXGJ6y0jjzgEfky3FmSawPRPt1Tv6TXyvri2ni38Ph\nEs9dGPFMN2VIqfsWsbsiEkyt3ZbQj9Mv3bifLprUa1CtXtTe3jjljRJZzhon6Yp/\nA0Xop9R/AgMBAAECggEACfon1+1AOq5cMXu2C7HTiEl4G/2SL2XYvbfBmUEGXQuZ\n9GN8ruX0j0IESSofkzXvUzQII+RoEPavhjqD72bwNEVApSm4R/k0wH7sbk4A9QxC\nS6W0c21el88xQQV7VsDckqVd4JO7ztoDZ0DFAQD12bqfe7An5cKjh8pviQReswg/\n6FUxwLp5ygSRum2RfqTWkAtYh7Ue7dxGP0Sp1/e8XVoWg9shX4TOBiRL0NkP4uQU\naZJfvbdxlQe6dHmPOvlfDzzdw1of1NBL43pfpnaqx3a9THFXtQvfoXZXdcotpbv5\n+pP5cvQ5W+rQyf3F1RVyU2HvUtqUClJt+YHgexotRQKBgQDriM54FRz0ZOTu6h9A\nf4mi7NSq92wL2qPq2usMAktDNt/vQGuXqifQeg7gzEBUEdEBFH9Zpmamb2K7xjfC\nK+bgAhPaID6LyOKGNNmNSy8scuUfsIgEbkfeQC3jW658LK6cY51doUYirDCb54pr\nDwTNHrCDFgXx4LvsNz/ypfMfHQKBgQDAaoc07Na6nlpfocHwvg6yy5qeyj1RiV9F\nnubW2MZPwDi9GQVerqWehCK6kd7/mmNOj1hy3SwcRJzhgg8UuQ9Cq8axZLpU3sEQ\nouIXNmIlLptyLuiq6J/g4Q/6jZLqi16m8G9YrMSCi0M3k2+3fBoyx8d5jOlmNtuI\nlyJi0oPjSwKBgD5VNk8RR1hmWy/fReYL2qEDjESytiVs93Rv+0RyVviyzRDEO7Un\nkuHZa5aSd3PIQ0fF5O4U25WwZLDNBHSeqbse0aIoZmUYBNr/oZODEjjxLzHzxgtm\nJB7tXTeOS98Q9CTvN/ZPeAA1Eagw3rD2iI7AUHZgnbIlh5Y8CPBueqkBAoGBAIge\nVEvSiA043MHuUp6WNRuzAUz30O0Pe0BrKu4uKAxe9USAoNXcQvmijFbjvpefhkUb\nDv0jDYNp3nmBYl3MlMkbb9Iqac6ETpwQPlUhecjH8duS57GQIxoY3Q7ofFhEA8+h\nI4PdpJ6dGg4E1PE+b+IghjKsxqgygpdcI005k2eFAoGAQIOI99xf7km5yERGVANn\nQ6msLvLwA0HHUIose93+AwfsGUZl6Ai6yJ06qthC0g080n1D90ACiwsSaAl/8Dl/\nno1RRxlZFJX4U1XpczmejCabgh8n0obBoHlHUORL0vMpORwOUGTx/J8uSyxKEU96\nLVuAxjsO/Petfu4zvj2x0rQ=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@perfect-156b5.iam.gserviceaccount.com",
  client_id: "118127840207205322048",
};

const RTDB_URL = "https://perfect-156b5-default-rtdb.firebaseio.com";
const ADMIN_EMAIL = "admin@perfectmodels.online";

const app       = initializeApp({ credential: cert(serviceAccount), databaseURL: RTDB_URL });
const adminAuth = getAuth(app);
const rtdb      = getDatabase(app);
const firestore = getFirestore(app);

async function main() {
  console.log('🔍 Vérification du compte admin\n');

  // 1. Récupérer l'UID Firebase Auth
  let uid;
  try {
    const user = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    uid = user.uid;
    console.log(`✅ Firebase Auth — UID: ${uid}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   emailVerified: ${user.emailVerified}`);
  } catch {
    console.log('❌ Compte Firebase Auth non trouvé !');
    process.exit(1);
  }

  // 2. Vérifier RTDB users/{uid}
  const rtdbSnap = await rtdb.ref(`users/${uid}`).once('value');
  if (rtdbSnap.exists()) {
    console.log(`\n✅ RTDB users/${uid}:`, JSON.stringify(rtdbSnap.val(), null, 2));
  } else {
    console.log(`\n❌ RTDB users/${uid} — MANQUANT, création…`);
    await rtdb.ref(`users/${uid}`).set({
      role: 'admin', profileId: 'admin', name: 'Admin',
      email: ADMIN_EMAIL, createdAt: new Date().toISOString(),
    });
    console.log('   ✅ Nœud RTDB créé.');
  }

  // 3. Vérifier Firestore accounts/{uid}
  const fsSnap = await firestore.collection('accounts').doc(uid).get();
  if (fsSnap.exists) {
    console.log(`\n✅ Firestore accounts/${uid}:`, JSON.stringify(fsSnap.data(), null, 2));
  } else {
    console.log(`\n❌ Firestore accounts/${uid} — MANQUANT, création…`);
    await firestore.collection('accounts').doc(uid).set({
      uid,
      email: ADMIN_EMAIL,
      displayName: 'Admin',
      role: 'admin',
      profileId: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log('   ✅ Document Firestore créé.');
  }

  // 4. Vérifier aussi Firestore users/{uid} (migration précédente)
  const fsUsersSnap = await firestore.collection('users').doc(uid).get();
  if (fsUsersSnap.exists) {
    console.log(`\n✅ Firestore users/${uid} existe (ancienne migration):`, fsUsersSnap.data()?.role);
  }

  console.log('\n✅ Vérification terminée.');
  console.log(`   Connectez-vous avec : ${ADMIN_EMAIL} / Pmm2026`);
  process.exit(0);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
