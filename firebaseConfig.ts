import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBawZl4SJz7drhzIrG0dnazSglyF6vmKCg",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "perfect-156b5.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://perfect-156b5-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "perfect-156b5",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "perfect-156b5.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "435536634816",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:435536634816:web:2f480f6d627e032da1de25",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H9WJWPEY59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const db = getDatabase(app);