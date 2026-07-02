/**
 * Script de migration Firebase Admin pour le projet perfect-156b5
 * Usage: node --env-file=.env scripts/migrate-accounts-admin.js
 * 
 * Pour les clés sensibles, créer .env.admin avec:
 * FIREBASE_PROJECT_ID=perfect-156b5
 * FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@perfect-156b5.iam.gserviceaccount.com
 * FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
 */

import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://perfect-156b5-default-rtdb.firebaseio.com"
});

const db = admin.database();

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

async function migrateAllModels() {
  console.log('🚀 Début de la migration...');
  
  const modelsSnap = await db.ref('models').once('value');
  if (!modelsSnap.exists()) return;
  
  const models = modelsSnap.val();
  let migrated = 0;
  
  for (const [id, model] of Object.entries(models)) {
    const m = model as any;
    if (m.firebaseUid) continue;
    
    const sanitizeForEmail = (name: string) => 
      name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f']/g, '').replace(/[^a-z0-9-]/g, '');
    
    const email = m.email || `${sanitizeForEmail(m.name.replace(' ', '.'))}@perfectmodels.online`;
    const password = m.password || Math.random().toString(36).substring(2, 8) + 'Aa1!';
    
    try {
      const user = await admin.auth().createUser({
        email,
        password,
        displayName: m.name,
        uid: `model_${id}`
      });
      await db.ref(`models/${id}`).update({
        email, firebaseUid: user.uid, migratedAt: new Date().toISOString()
      });
      console.log(`✅ ${m.name} migré`);
      migrated++;
    } catch (err) {
      console.error(`❌ ${m.name}:`, (err as any).message);
    }
  }
  
  console.log(`📊 ${migrated} comptes migrés`);
}

createAdminAccount().then(() => migrateAllModels());