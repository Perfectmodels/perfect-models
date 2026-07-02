/**
 * Script pour créer le compte admin Firebase Auth
 * À exécuter avec: npx tsx scripts/create-admin.ts
 * ou: node --loader ts-node/esm scripts/create-admin.ts
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC_5TsXHPLloX80SzN9GQaaDL4EPlL-WSc",
    authDomain: "perfectmodels-4e5fa.firebaseapp.com",
    databaseURL: "https://perfectmodels-4e5fa-default-rtdb.firebaseio.com",
    projectId: "perfectmodels-4e5fa",
    storageBucket: "perfectmodels-4e5fa.firebasestorage.app",
    messagingSenderId: "1072431985374",
    appId: "1:1072431985374:web:55f7a7899d05e68fe5484f",
    measurementId: "G-CSP65WPY89"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin() {
    const email = 'admin@perfectmodels.online';
    const password = 'Pmm2025';

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Compte admin créé avec succès!');
        console.log(`UID: ${userCredential.user.uid}`);
        console.log(`Email: ${userCredential.user.email}`);
        
        // Pour connecter l'admin, il suffit de se connecter avec ces identifiants
        // Le mot de passe hardcodé 'admin2025' reste fonctionnel pour compatibilité
    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('ℹ️ Le compte admin existe déjà');
        } else if (error.code === 'auth/weak-password') {
            console.log('❌ Le mot de passe est trop faible (minimum 6 caractères)');
        } else {
            console.error('❌ Erreur:', error.message);
        }
    }
}

createAdmin();