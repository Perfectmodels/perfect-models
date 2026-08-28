import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublishableKey, getSupabaseUrl } from './config';
import type { Database } from './database.types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          });
        } catch {
          // Server Components cannot always mutate cookies. Route Handlers and
          // the Next proxy perform the session refresh/write when required.
        }
      },
    },
  });
}
