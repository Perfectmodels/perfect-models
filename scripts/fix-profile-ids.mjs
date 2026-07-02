/**
 * fix-profile-ids.mjs
 * 
 * Corrige les profileId dans Firestore accounts/ :
 * Les scripts précédents ont stocké la clé numérique RTDB (ex: "6")
 * comme profileId, mais l'app cherche par model.id (le slug, ex: "cassandra-ibouanga").
 * 
 * Ce script met à jour chaque document accounts/ avec le bon profileId.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('perfect-156b5-firebase-adminsdk-fbsvc-fd8972b3a5.json', 'utf8'));
const app = initializeApp({
  credential: cert(sa),
  databaseURL: 'https://perfect-156b5-default-rtdb.firebaseio.com'
});
const firestore = getFirestore(app);
const rtdb = getDatabase(app);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('🔧 Correction des profileId dans Firestore accounts/\n');

  // 1. Charger toutes les collections RTDB pour construire des maps email→id
  const [modelsSnap, jurySnap, staffSnap] = await Promise.all([
    rtdb.ref('models').once('value'),
    rtdb.ref('juryMembers').once('value'),
    rtdb.ref('registrationStaff').once('value'),
  ]);

  // Map email → model.id (slug) pour les mannequins
  const emailToModelId = {};       // email → model.id (slug)
  const emailToRtdbKey = {};       // email → rtdbKey numérique (string)
  const emailToJuryId = {};
  const emailToStaffId = {};

  if (modelsSnap.exists()) {
    Object.entries(modelsSnap.val()).forEach(([rtdbKey, m]) => {
      if (m.email) {
        emailToModelId[m.email.toLowerCase()] = m.id || rtdbKey;
        emailToRtdbKey[m.email.toLowerCase()] = rtdbKey;
      }
    });
  }
  if (jurySnap.exists()) {
    Object.entries(jurySnap.val()).forEach(([rtdbKey, j]) => {
      if (j.email) emailToJuryId[j.email.toLowerCase()] = j.id || rtdbKey;
    });
  }
  if (staffSnap.exists()) {
    Object.entries(staffSnap.val()).forEach(([rtdbKey, s]) => {
      if (s.email) emailToStaffId[s.email.toLowerCase()] = s.id || rtdbKey;
    });
  }

  console.log(`  Models RTDB indexés: ${Object.keys(emailToModelId).length}`);
  console.log(`  Jury RTDB indexés: ${Object.keys(emailToJuryId).length}`);
  console.log(`  Staff RTDB indexés: ${Object.keys(emailToStaffId).length}\n`);

  // 2. Lire tous les comptes Firestore
  const accountsSnap = await firestore.collection('accounts').get();
  console.log(`${accountsSnap.size} compte(s) à vérifier\n`);
  console.log(`${'Email'.padEnd(45)} ${'Rôle'.padEnd(14)} ${'Ancien ID'.padEnd(20)} Nouveau ID`);
  console.log('─'.repeat(100));

  let updated = 0, skipped = 0, errors = 0;

  for (const doc of accountsSnap.docs) {
    const data = doc.data();
    const email = data.email?.toLowerCase();
    const role = data.role;
    const currentProfileId = data.profileId;

    let correctProfileId = null;

    if (role === 'student' && email) {
      correctProfileId = emailToModelId[email];
    } else if (role === 'jury' && email) {
      correctProfileId = emailToJuryId[email];
    } else if (role === 'registration' && email) {
      correctProfileId = emailToStaffId[email];
    } else if (role === 'admin') {
      correctProfileId = 'admin';
    }

    if (!correctProfileId) {
      console.log(`  ⚠  ${(email||'?').padEnd(45)} ${role.padEnd(14)} ${String(currentProfileId).padEnd(20)} (non résolu)`);
      skipped++;
      continue;
    }

    if (String(currentProfileId) === String(correctProfileId)) {
      console.log(`  ✓  ${(email||'?').padEnd(45)} ${role.padEnd(14)} ${String(currentProfileId).padEnd(20)} OK`);
      skipped++;
      continue;
    }

    try {
      await doc.ref.update({ profileId: correctProfileId });
      console.log(`  ✅ ${(email||'?').padEnd(45)} ${role.padEnd(14)} ${String(currentProfileId).padEnd(20)} → ${correctProfileId}`);
      updated++;
    } catch (err) {
      console.log(`  ❌ ${(email||'?').padEnd(45)} ${role.padEnd(14)} ERREUR: ${err.message}`);
      errors++;
    }

    await sleep(50);
  }

  console.log('\n' + '─'.repeat(100));
  console.log(`✅ Mis à jour: ${updated}  |  ✓ Déjà corrects: ${skipped}  |  ❌ Erreurs: ${errors}`);

  // 3. Faire pareil dans RTDB users/
  console.log('\n🔧 Correction des profileId dans RTDB users/\n');
  const rtdbUsersSnap = await rtdb.ref('users').once('value');
  if (rtdbUsersSnap.exists()) {
    const rtdbUsers = rtdbUsersSnap.val();
    let rtdbUpdated = 0;

    for (const [uid, userData] of Object.entries(rtdbUsers)) {
      const email = userData.email?.toLowerCase();
      const role = userData.role;
      let correctProfileId = null;

      if (role === 'student' && email) correctProfileId = emailToModelId[email];
      else if (role === 'jury' && email) correctProfileId = emailToJuryId[email];
      else if (role === 'registration' && email) correctProfileId = emailToStaffId[email];
      else if (role === 'admin') correctProfileId = 'admin';

      if (correctProfileId && String(userData.profileId) !== String(correctProfileId)) {
        await rtdb.ref(`users/${uid}`).update({ profileId: correctProfileId });
        console.log(`  ✅ RTDB users/${uid.substring(0,20)} profileId: ${userData.profileId} → ${correctProfileId}`);
        rtdbUpdated++;
        await sleep(30);
      }
    }
    console.log(`\n  RTDB mis à jour: ${rtdbUpdated} nœud(s)`);
  }

  console.log('\n✅ Correction terminée. Relancez l\'application.');
  process.exit(0);
}

main().catch(err => { console.error('❌ Fatal:', err.message); process.exit(1); });
