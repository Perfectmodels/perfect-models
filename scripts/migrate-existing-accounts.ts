/**
 * Script de migration des comptes existants vers Firebase Auth
 * Usage: npx tsx scripts/migrate-existing-accounts.ts
 * 
 * IMPORTANT: Remplacer la clé serviceAccount par la clé du projet perfectmodels-4e5fa
 */

import admin from 'firebase-admin';

// IMPORTANT: Remplacer par la vraie clé du projet perfectmodels-4e5fa
const serviceAccount = {
  projectId: "perfectmodels-4e5fa",
  // Ajouter la clé service account ici depuis Firebase Console > Project Settings > Service Accounts
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://perfectmodels-4e5fa-default-rtdb.firebaseio.com"
});

const db = admin.database();

async function migrateAllModels() {
  console.log('🚀 Début de la migration des comptes...');
  
  const modelsSnap = await db.ref('models').once('value');
  if (!modelsSnap.exists()) {
    console.log('❌ Aucun modèle trouvé');
    return;
  }
  
  const models = modelsSnap.val();
  let migrated = 0;
  let errors = 0;
  
  for (const [id, model] of Object.entries(models)) {
    const m = model as any;
    
    // Skip already migrated accounts
    if (m.firebaseUid) {
      console.log(`⏭️ ${m.name} déjà migré`);
      continue;
    }
    
    // Generate email if missing
    const sanitizeForEmail = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[^a-z0-9-]/g, '');
    const email = m.email || `${sanitizeForEmail(m.name.replace(' ', '.'))}@perfectmodels.online`;
    
    // Use existing password or generate one
    const password = m.password || Math.random().toString(36).substring(2, 8) + 'Aa1!';
    
    try {
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: m.name,
        uid: `model_${id}` // Custom UID to link to RTDB
      });
      
      // Update RTDB with Firebase UID
      await db.ref(`models/${id}`).update({
        email: email,
        firebaseUid: userRecord.uid,
        migratedAt: new Date().toISOString()
      });
      
      console.log(`✅ ${m.name} migré avec UID: ${userRecord.uid}`);
      migrated++;
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`ℹ️ ${m.name} - email déjà existant`);
        // Still update RTDB to link existing account
        const existingUser = await admin.auth().getUserByEmail(email);
        await db.ref(`models/${id}`).update({
          firebaseUid: existingUser.uid,
          migratedAt: new Date().toISOString()
        });
        migrated++;
      } else {
        console.error(`❌ Erreur pour ${m.name}:`, error.message);
        errors++;
      }
    }
  }
  
  console.log(`\n📊 Résultat: ${migrated} migrés, ${errors} erreurs`);
}

async function createAdminAccount() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'admin@perfectmodels.online',
      password: 'Pmm2025',
      displayName: 'Admin Principal'
    });
    console.log(`✅ Compte admin créé: ${userRecord.uid}`);
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.log('ℹ️ Le compte admin existe déjà');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  }
}

// Exécuter
console.log('=== Création compte admin ===');
createAdminAccount().then(() => {
  console.log('\n=== Migration des mannequins ===');
  return migrateAllModels();
}).then(() => {
  console.log('\n✅ Migration terminée');
  process.exit(0);
}).catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});