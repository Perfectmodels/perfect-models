import { createSupabaseServerClient } from '../supabase/server';

export const auth = {
  async getSession() {
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
