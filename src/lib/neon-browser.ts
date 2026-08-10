'use client';

import { createClient } from '@neondatabase/neon-js';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

const legacyEnv = import.meta.env as { VITE_NEON_AUTH_URL?: string; VITE_NEON_DATA_API_URL?: string };
// Route all browser authentication through Next so the session cookie belongs to
// the current application origin and can be read by server-side role checks.
const authUrl = '/api/auth';
const dataApiUrl =
  process.env.NEXT_PUBLIC_NEON_DATA_API_URL ||
  legacyEnv.VITE_NEON_DATA_API_URL ||
  (legacyEnv.VITE_NEON_AUTH_URL || process.env.NEXT_PUBLIC_NEON_AUTH_URL || '').replace('.neonauth.', '.apirest.').replace(/\/auth$/, '/rest/v1') ||
  'https://ep-snowy-math-adl80x03.apirest.c-2.us-east-1.aws.neon.tech/neondb/rest/v1';

export const neonClient = createClient({
  auth: {
    adapter: BetterAuthReactAdapter(),
    url: authUrl,
    allowAnonymous: true,
  },
  dataApi: {
    url: dataApiUrl,
  },
});
