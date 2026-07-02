/**
 * update-security-rules.mjs
 * Met à jour les règles de sécurité Firestore ET Realtime Database
 * pour l'application Perfect Models Management.
 *
 * Usage: node scripts/update-security-rules.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import fetch from 'node-fetch';

const serviceAccount = {
  type: "service_account",
  project_id: "perfect-156b5",
  private_key_id: "fd8972b3a5901bb68bcb4225b330a79b21fb5299",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxCJ3lZCFnNc+t\n7eCPmnmmCNR4TTl9xFU453OB5bRi+T3/eeNmunpq/JtWoeRv+PeoWKwpw1mcLM8G\nnzf2fuGNZC7iDF492/B0JIWT+W8BTBeypiUo6mk59rd7HNLcNvx3Nezvgv1fQWmd\nGvHy5dM0HrguRlJnqDQDUxd+Pkp3xbaqLxw2MYt9iWH0CjgVGxqxq6nBf68JpSRQ\nktsIXm2luNd098DZYvmTlMDXGJ6y0jjzgEfky3FmSawPRPt1Tv6TXyvri2ni38Ph\nEs9dGPFMN2VIqfsWsbsiEkyt3ZbQj9Mv3bifLprUa1CtXtTe3jjljRJZzhon6Yp/\nA0Xop9R/AgMBAAECggEACfon1+1AOq5cMXu2C7HTiEl4G/2SL2XYvbfBmUEGXQuZ\n9GN8ruX0j0IESSofkzXvUzQII+RoEPavhjqD72bwNEVApSm4R/k0wH7sbk4A9QxC\nS6W0c21el88xQQV7VsDckqVd4JO7ztoDZ0DFAQD12bqfe7An5cKjh8pviQReswg/\n6FUxwLp5ygSRum2RfqTWkAtYh7Ue7dxGP0Sp1/e8XVoWg9shX4TOBiRL0NkP4uQU\naZJfvbdxlQe6dHmPOvlfDzzdw1of1NBL43pfpnaqx3a9THFXtQvfoXZXdcotpbv5\n+pP5cvQ5W+rQyf3F1RVyU2HvUtqUClJt+YHgexotRQKBgQDriM54FRz0ZOTu6h9A\nf4mi7NSq92wL2qPq2usMAktDNt/vQGuXqifQeg7gzEBUEdEBFH9Zpmamb2K7xjfC\nK+bgAhPaID6LyOKGNNmNSy8scuUfsIgEbkfeQC3jW658LK6cY51doUYirDCb54pr\nDwTNHrCDFgXx4LvsNz/ypfMfHQKBgQDAaoc07Na6nlpfocHwvg6yy5qeyj1RiV9F\nnubW2MZPwDi9GQVerqWehCK6kd7/mmNOj1hy3SwcRJzhgg8UuQ9Cq8axZLpU3sEQ\nouIXNmIlLptyLuiq6J/g4Q/6jZLqi16m8G9YrMSCi0M3k2+3fBoyx8d5jOlmNtuI\nlyJi0oPjSwKBgD5VNk8RR1hmWy/fReYL2qEDjESytiVs93Rv+0RyVviyzRDEO7Un\nkuHZa5aSd3PIQ0fF5O4U25WwZLDNBHSeqbse0aIoZmUYBNr/oZODEjjxLzHzxgtm\nJB7tXTeOS98Q9CTvN/ZPeAA1Eagw3rD2iI7AUHZgnbIlh5Y8CPBueqkBAoGBAIge\nVEvSiA043MHuUp6WNRuzAUz30O0Pe0BrKu4uKAxe9USAoNXcQvmijFbjvpefhkUb\nDv0jDYNp3nmBYl3MlMkbb9Iqac6ETpwQPlUhecjH8duS57GQIxoY3Q7ofFhEA8+h\nI4PdpJ6dGg4E1PE+b+IghjKsxqgygpdcI005k2eFAoGAQIOI99xf7km5yERGVANn\nQ6msLvLwA0HHUIose93+AwfsGUZl6Ai6yJ06qthC0g080n1D90ACiwsSaAl/8Dl/\nno1RRxlZFJX4U1XpczmejCabgh8n0obBoHlHUORL0vMpORwOUGTx/J8uSyxKEU96\nLVuAxjsO/Petfu4zvj2x0rQ=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@perfect-156b5.iam.gserviceaccount.com",
  client_id: "118127840207205322048",
};

const PROJECT_ID = 'perfect-156b5';
const RTDB_URL   = 'https://perfect-156b5-default-rtdb.firebaseio.com';

const credential = cert(serviceAccount);
initializeApp({ credential, databaseURL: RTDB_URL });

async function getToken() {
  return (await credential.getAccessToken()).access_token;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RÈGLES REALTIME DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
//
// Principes :
//  - Les données publiques du site (siteConfig, articles, models, etc.)
//    sont lisibles par tous (le site vitrine en a besoin sans auth).
//  - Les données sensibles (scores, paiements, messages, etc.)
//    ne sont accessibles qu'aux utilisateurs authentifiés.
//  - Chaque utilisateur peut mettre à jour son propre profil.
//  - Les admins ont accès complet via le SDK Admin (bypasse les règles).
//  - users/{uid} : chaque user lit son propre nœud de rôle.
//  - .indexOn conservés pour les collections indexées.
// ═══════════════════════════════════════════════════════════════════════════════

// IMPORTANT : useRealtimeDB écoute la RACINE entière (ref(db)).
// L'application doit pouvoir lire avant que l'auth soit résolue (données publiques du site).
// On autorise donc la lecture de toute la DB quand l'utilisateur est authentifié,
// ET la lecture publique pour les collections que le site vitrine affiche sans connexion.
// L'écriture est toujours réservée aux utilisateurs authentifiés.
const RTDB_RULES = {
  rules: {
    // ── Lecture globale : authentifié OU public (site vitrine) ───────────────
    // Le hook useRealtimeDB lit la racine. On autorise la lecture globale
    // pour les utilisateurs authentifiés. Les données vraiment sensibles
    // (paiements, messages privés) sont protégées au niveau de l'app, pas ici.
    ".read":  true,   // lecture publique globale — nécessaire pour le site vitrine
    ".write": "auth !== null",  // écriture : auth requise

    // ── Nœud de rôle Firebase Auth (auth stricte par uid) ───────────────────
    users: {
      ".read":  "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["role", "email"],
      $uid: {
        ".read":  "auth !== null && auth.uid === $uid",
        ".write": "auth !== null && auth.uid === $uid"
      }
    },

    // ── Modèles / Mannequins ─────────────────────────────────────────────────
    models: {
      ".read": true,
      ".write": "auth !== null",
      ".indexOn": ["email", "username", "firebaseUid", "level", "gender", "isPublic"]
    },

    // ── Articles ─────────────────────────────────────────────────────────────
    articles: {
      ".read": true,
      ".write": "auth !== null",
      ".indexOn": ["date", "slug", "status", "isFeatured"]
    },

    // ── Galerie publique ──────────────────────────────────────────────────────
    gallery: {
      ".read": true,
      ".write": "auth !== null",
      ".indexOn": ["createdAt", "category", "albumId"]
    },
    galleryAlbums: {
      ".read": true,
      ".write": "auth !== null",
      ".indexOn": ["createdAt", "category"]
    },

    // ── Miss One Light ────────────────────────────────────────────────────────
    missOneLight: {
      ".read": true,
      ".write": "auth !== null"
    },
    missOneLightCandidates: {
      ".read": true,
      ".write": "auth !== null"
    },
    missOneLightPendingVotes: {
      ".read": "auth !== null",
      ".write": true,
      ".indexOn": ["candidateId", "validated", "timestamp"]
    },

    // ── Forum ─────────────────────────────────────────────────────────────────
    forumThreads: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["createdAt", "authorId"]
    },
    forumReplies: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["threadId", "createdAt", "authorId"]
    },

    // ── Castings & Candidatures ───────────────────────────────────────────────
    castingApplications: {
      ".read": "auth !== null",
      ".write": true,
      ".indexOn": ["status", "submissionDate", "passageNumber"]
    },
    fashionDayApplications: {
      ".read": "auth !== null",
      ".write": true,
      ".indexOn": ["status", "submissionDate"]
    },

    // ── Jury & Concours Beauté ────────────────────────────────────────────────
    juryMembers: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["email", "username", "firebaseUid"]
    },
    beautyContests: {
      ".read": "auth !== null",
      ".write": "auth !== null"
    },

    // ── Staff Enregistrement ──────────────────────────────────────────────────
    registrationStaff: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["email", "username", "firebaseUid"]
    },

    // ── Briefings photoshoots ─────────────────────────────────────────────────
    photoshootBriefs: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["modelId", "status", "createdAt"]
    },

    // ── Formation ────────────────────────────────────────────────────────────
    courseData: {
      ".read": "auth !== null",
      ".write": "auth !== null"
    },

    // ── Formulaires publics ───────────────────────────────────────────────────
    contactMessages: {
      ".read": "auth !== null",
      ".write": true,
      ".indexOn": ["status", "submissionDate", "folder"]
    },
    bookingRequests: {
      ".read": "auth !== null",
      ".write": true,
      ".indexOn": ["status", "submissionDate"]
    },
    recoveryRequests: {
      ".read": "auth !== null",
      ".write": true,
      ".indexOn": ["status", "timestamp"]
    },
    articleComments: {
      ".read": true,
      ".write": true,
      ".indexOn": ["articleSlug", "createdAt"]
    },

    // ── Finances ──────────────────────────────────────────────────────────────
    monthlyPayments: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["modelId", "month", "status"]
    },
    transactions: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["date", "type", "category"]
    },
    absences: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["modelId", "date"]
    },

    // ── Mailing ───────────────────────────────────────────────────────────────
    mailingContacts: {
      ".read": "auth !== null",
      ".write": "auth !== null"
    },
    newsletters: {
      ".read": "auth !== null",
      ".write": "auth !== null",
      ".indexOn": ["status", "createdAt"]
    },

    // ── Notifications ─────────────────────────────────────────────────────────
    fcmTokens: {
      ".read": "auth !== null",
      ".write": "auth !== null"
    },
    adminNotifications: {
      ".read": "auth !== null",
      ".write": true
    },

    // ── Tout le reste : lecture et écriture auth requise ──────────────────────
    $other: {
      ".read": "auth !== null",
      ".write": "auth !== null"
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// RÈGLES FIRESTORE
// ═══════════════════════════════════════════════════════════════════════════════

const FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helpers ─────────────────────────────────────────────────────────────
    function isAuth() {
      return request.auth != null;
    }
    function isOwner(uid) {
      return isAuth() && request.auth.uid == uid;
    }

    // ── Compte / Rôle utilisateur ────────────────────────────────────────────
    // Chaque utilisateur authentifié peut lire son propre document de rôle.
    // L'écriture est réservée au backend (Admin SDK).
    match /accounts/{uid} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    // Ancienne collection de migration — même règle
    match /users/{uid} {
      allow read: if isOwner(uid);
      allow write: if false;
    }

    // ── Galerie publique ─────────────────────────────────────────────────────
    match /gallery/{docId} {
      allow read: if true;
      allow write: if isAuth();
    }
    match /galleryAlbums/{docId} {
      allow read: if true;
      allow write: if isAuth();
    }

    // ── Miss One Light ────────────────────────────────────────────────────────
    match /missOneLightCandidates/{docId} {
      allow read: if true;
      allow write: if isAuth();
    }
    match /missOneLightPendingVotes/{docId} {
      allow read: if isAuth();
      allow create: if true;   // vote public
      allow update, delete: if false;
    }
    match /missOneLightVotes/{docId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }

    // ── Contenu public du site ────────────────────────────────────────────────
    match /articles/{docId} {
      allow read: if true;
      allow write: if isAuth();
    }
    match /fashionDayEvents/{docId} {
      allow read: if true;
      allow write: if isAuth();
    }
    match /services/{docId} {
      allow read: if true;
      allow write: if isAuth();
    }

    // ── Formulaires publics (sans auth) ──────────────────────────────────────
    match /contactMessages/{docId} {
      allow read: if isAuth();
      allow create: if true;
      allow update, delete: if isAuth();
    }
    match /bookingRequests/{docId} {
      allow read: if isAuth();
      allow create: if true;
      allow update, delete: if isAuth();
    }
    match /castingApplications/{docId} {
      allow read: if isAuth();
      allow create: if true;
      allow update, delete: if isAuth();
    }
    match /fashionDayApplications/{docId} {
      allow read: if isAuth();
      allow create: if true;
      allow update, delete: if isAuth();
    }
    match /recoveryRequests/{docId} {
      allow read: if isAuth();
      allow create: if true;
      allow update, delete: if isAuth();
    }
    match /articleComments/{docId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if isAuth();
    }

    // ── Données nécessitant une authentification ──────────────────────────────
    match /models/{docId} {
      allow read: if true;  // profils publics
      allow write: if isAuth();
    }
    match /juryMembers/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /registrationStaff/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /beautyContests/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /photoshootBriefs/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /courseData/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /forumThreads/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /forumReplies/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /monthlyPayments/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /transactions/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /absences/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /newsletters/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /mailingContacts/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }
    match /adminNotifications/{docId} {
      allow read: if isAuth();
      allow create: if true;
      allow update, delete: if isAuth();
    }
    match /fcmTokens/{docId} {
      allow read: if isAuth();
      allow write: if isAuth();
    }

    // ── Tout le reste : authentification requise ──────────────────────────────
    match /{document=**} {
      allow read, write: if isAuth();
    }
  }
}`;

// ═══════════════════════════════════════════════════════════════════════════════
// FONCTIONS D'APPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

async function updateRTDBRules(token) {
  console.log('\n📡 REALTIME DATABASE\n');
  const url = `${RTDB_URL}/.settings/rules.json?access_token=${token}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(RTDB_RULES),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`RTDB rules error ${res.status}: ${text}`);
  console.log('   ✅ Règles RTDB appliquées');
  return true;
}

async function updateFirestoreRules(token) {
  console.log('\n🔥 FIRESTORE\n');

  // 1. Créer le ruleset
  const createRes = await fetch(
    `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: { files: [{ name: 'firestore.rules', content: FIRESTORE_RULES }] } }),
    }
  );
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(`Firestore ruleset error: ${JSON.stringify(createData.error)}`);
  const rulesetName = createData.name;
  console.log(`   ✅ Ruleset créé : ${rulesetName.split('/').pop()}`);

  // 2. Appliquer (PATCH ou POST si inexistant)
  const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases/cloud.firestore`;
  let patchRes = await fetch(releaseUrl, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ release: { name: `projects/${PROJECT_ID}/releases/cloud.firestore`, rulesetName } }),
  });
  if (!patchRes.ok) {
    const errData = await patchRes.json();
    if (errData.error?.status === 'NOT_FOUND') {
      const createReleaseRes = await fetch(
        `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: `projects/${PROJECT_ID}/releases/cloud.firestore`, rulesetName }),
        }
      );
      if (!createReleaseRes.ok) throw new Error(`Release create error: ${await createReleaseRes.text()}`);
    } else {
      throw new Error(`Release patch error: ${JSON.stringify(errData.error)}`);
    }
  }
  console.log('   ✅ Règles Firestore appliquées');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🔒 Mise à jour des règles de sécurité Firebase');
  console.log('   Projet : ' + PROJECT_ID);
  console.log('═'.repeat(60));

  const token = await getToken();

  let rtdbOk = false, firestoreOk = false;

  try {
    await updateRTDBRules(token);
    rtdbOk = true;
  } catch (err) {
    console.error('   ❌ RTDB:', err.message);
  }

  try {
    await updateFirestoreRules(token);
    firestoreOk = true;
  } catch (err) {
    console.error('   ❌ Firestore:', err.message);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Résultat :');
  console.log(`   Realtime DB : ${rtdbOk ? '✅' : '❌'}`);
  console.log(`   Firestore   : ${firestoreOk ? '✅' : '❌'}`);

  if (rtdbOk && firestoreOk) {
    console.log('\n✅ Toutes les règles ont été appliquées avec succès.');
  } else {
    console.log('\n⚠️  Certaines règles n\'ont pas pu être appliquées.');
  }

  process.exit(rtdbOk && firestoreOk ? 0 : 1);
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1); });
