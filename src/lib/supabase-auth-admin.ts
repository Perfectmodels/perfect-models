import 'server-only';
import { createSupabaseAdminClient } from './supabase/admin';

export async function inviteSupabaseUserByEmail(input: {
  email: string;
  name: string;
  redirectTo: string;
}) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    redirectTo: input.redirectTo,
    data: { name: input.name, onboarding_source: 'casting' },
  });
  if (error) throw error;
  return data;
}
