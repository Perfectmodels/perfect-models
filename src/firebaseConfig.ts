export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'perfect-156b5.firebaseapp.com',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://perfect-156b5-default-rtdb.firebaseio.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'perfect-156b5',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'perfect-156b5.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '435536634816',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:435536634816:web:2f480f6d627e032da1de25',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-H9WJWPEY59',
};
export const app = { name: 'pmm-firebase' };
export const db = {};
export const firestore = {};
export const messaging = {};
export const auth = {};
