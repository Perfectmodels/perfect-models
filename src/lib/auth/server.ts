import { clearFirebaseSession, firebaseChangePassword, firebaseLookup, getFirebaseIdToken, getValidFirebaseIdToken, setFirebaseSession } from '../firebase-backend';

export const auth = {
  async getSession() {
    const idToken = await getValidFirebaseIdToken();
    if (!idToken) return { data: null };
    const user = await firebaseLookup(idToken).catch(() => null);
    return { data: user ? { user } : null };
  },
  async signOut() {
    await clearFirebaseSession();
  },
  async changePassword(newPassword: string) {
    const idToken = await getFirebaseIdToken();
    if (!idToken) return { error: new Error('Session Firebase expirée.') };
    try {
      const result = await firebaseChangePassword(idToken, newPassword);
      await setFirebaseSession(result);
      return { data: result };
    } catch (error) {
      return { error };
    }
  },
};
