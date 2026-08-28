import { createSupabaseServerClient } from '../supabase/server';

export const auth = {
  /**
   * Vérifie la session auprès de Supabase Auth et renvoie un utilisateur frais.
   * Les décisions d'autorisation serveur ne doivent pas s'appuyer sur un objet
   * de session client non revalidé.
   */
  async getVerifiedUser() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { data: null, error: error || null };
    return { data: { user: data.user }, error: null };
  },
  async signOut() {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut({ scope: 'local' });
  },
  async changePassword(newPassword: string) {
    const supabase = await createSupabaseServerClient();
    return supabase.auth.updateUser({ password: newPassword });
  },
};
