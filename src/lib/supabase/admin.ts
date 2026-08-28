import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseSecretKey, getSupabaseUrl } from './config';
import type { Database } from './database.types';

let adminClient: SupabaseClient<Database> | null = null;

export function createSupabaseAdminClient() {
  if (!adminClient) {
    adminClient = createClient<Database>(getSupabaseUrl(), getSupabaseSecretKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }
  return adminClient;
}
