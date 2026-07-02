import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync('perfect-156b5-firebase-adminsdk-fbsvc-fd8972b3a5.json', 'utf8'));
const app = initializeApp({ credential: cert(sa), databaseURL: 'https://perfect-156b5-default-rtdb.firebaseio.com' });
const fs = getFirestore(app);
const rtdb = getDatabase(app);

async function main() {
  console.log('=== Firestore accounts (10 premiers) ===');
  const accounts = await fs.collection('accounts').limit(10).get();
  accounts.forEach(d => {
    const data = d.data();
    console.log(`  uid: ${d.id.substring(0,20)}  role: ${data.role}  profileId: ${data.profileId}  email: ${data.email}`);
  });

  console.log('\n=== RTDB models (10 premiers — id et nom) ===');
  const modelsSnap = await rtdb.ref('models').limitToFirst(10).once('value');
  const models = modelsSnap.val();
  if (models) {
    Object.entries(models).forEach(([key, m]) => {
      console.log(`  rtdbKey: ${key}  model.id: ${m.id}  name: ${m.name}`);
    });
  }

  process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
