import { clearSupabaseSession, getSupabaseAccessToken, getValidSupabaseAccessToken, supabaseChangePassword, supabaseLookup } from '../supabase-backend';

export const auth = {
  async getSession() {
    const accessToken = await getValidSupabaseAccessToken();
    if (!accessToken) return { data: null };
    const user = await supabaseLookup(accessToken).catch(() => null);
    return { data: user ? { user } : null };
  },
  async signOut() {
    await clearSupabaseSession();
  },
  async changePassword(newPassword: string) {
    const accessToken = await getSupabaseAccessToken();
    if (!accessToken) return { error: new Error('Session Supabase expirée.') };
    try {
      const user = await supabaseChangePassword(accessToken, newPassword);
      return { data: user };
    } catch (error) {
      return { error };
    }
  },
};
