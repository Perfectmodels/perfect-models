/**
 * fix-firestore-rules.mjs
 * Met à jour les règles de sécurité Firestore pour permettre
 * à chaque utilisateur authentifié de lire son propre document accounts/{uid}.
 *
 * Usage: node scripts/fix-firestore-rules.mjs
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

// ── Nouvelles règles Firestore ─────────────────────────────────────────────────
// Principe :
//  - accounts/{uid}  : chaque utilisateur lit/écrit uniquement son propre doc
//  - users/{uid}     : idem (ancienne collection de migration)
//  - Toutes les autres collections : accès refusé par défaut (sécurisé)
const NEW_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Compte utilisateur (rôle + profil) ─────────────────────────────────
    // Chaque utilisateur authentifié peut lire et mettre à jour son propre doc.
    // L'écriture initiale et la création sont réservées au backend (Admin SDK).
    match /accounts/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false; // écriture via Admin SDK uniquement
    }

    // ── Ancienne collection users/ (migration) ─────────────────────────────
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }

    // ── Galerie ────────────────────────────────────────────────────────────
    // Lecture publique, écriture refusée côté client
    match /gallery/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /galleryAlbums/{doc} {
      allow read: if true;
      allow write: if false;
    }

    // ── MissOneLight / votes ───────────────────────────────────────────────
    match /missOneLightCandidates/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /missOneLightVotes/{doc} {
      allow read: if true;
      allow create: if true; // vote public
      allow update, delete: if false;
    }
    match /missOneLightPendingVotes/{doc} {
      allow read: if request.auth != null;
      allow write: if false; // Admin SDK seulement
    }

    // ── Tout le reste : refusé ─────────────────────────────────────────────
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`;

// ── Init ──────────────────────────────────────────────────────────────────────
const credential = cert(serviceAccount);
initializeApp({ credential });

async function getAccessToken() {
  const tokenObj = await credential.getAccessToken();
  return tokenObj.access_token;
}

async function main() {
  console.log('🔒 Mise à jour des règles Firestore\n');

  const token = await getAccessToken();

  // API REST Firestore Rules
  const url = `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/rulesets`;

  // 1. Créer un nouveau ruleset
  console.log('1. Création du nouveau ruleset…');
  const createRes = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: {
        files: [{
          name: 'firestore.rules',
          content: NEW_RULES,
        }],
      },
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    console.error('❌ Erreur création ruleset:', JSON.stringify(createData, null, 2));
    process.exit(1);
  }
  const rulesetName = createData.name;
  console.log(`   ✅ Ruleset créé : ${rulesetName}`);

  // 2. Appliquer le ruleset sur la base de données par défaut
  console.log('\n2. Application du ruleset…');
  const releaseUrl = `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases/cloud.firestore`;
  const releaseRes = await fetch(releaseUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      release: {
        name: `projects/${PROJECT_ID}/releases/cloud.firestore`,
        rulesetName,
      },
    }),
  });

  const releaseData = await releaseRes.json();
  if (!releaseRes.ok) {
    // Si le release n'existe pas encore, on le crée
    if (releaseData.error?.status === 'NOT_FOUND') {
      console.log('   Release inexistante, création…');
      const createReleaseRes = await fetch(
        `https://firebaserules.googleapis.com/v1/projects/${PROJECT_ID}/releases`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `projects/${PROJECT_ID}/releases/cloud.firestore`,
            rulesetName,
          }),
        }
      );
      const createReleaseData = await createReleaseRes.json();
      if (!createReleaseRes.ok) {
        console.error('❌ Erreur création release:', JSON.stringify(createReleaseData, null, 2));
        process.exit(1);
      }
      console.log('   ✅ Release créée.');
    } else {
      console.error('❌ Erreur application ruleset:', JSON.stringify(releaseData, null, 2));
      process.exit(1);
    }
  } else {
    console.log('   ✅ Règles appliquées avec succès.');
  }

  console.log('\n✅ Règles Firestore mises à jour.');
  console.log('\n   Résumé des accès :');
  console.log('   • accounts/{uid}  → lecture par le propriétaire uniquement');
  console.log('   • users/{uid}     → lecture par le propriétaire uniquement');
  console.log('   • gallery/**      → lecture publique');
  console.log('   • missOneLight**  → vote public, lecture authentifiée');
  console.log('   • Reste           → refusé');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur fatale:', err.message);
  process.exit(1);
});
