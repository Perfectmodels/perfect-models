import { firestore, db as realTimeDb, auth, messaging } from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Default export 'db' for Firestore (used by new MissOneLight pages)
export const db = firestore;

// Export RTDB as rtdb
export const rtdb = realTimeDb;

// Export Firebase Auth
export { auth };

// Export Messaging
export { messaging };

// Export RTDB as default for backward compatibility
export default realTimeDb;