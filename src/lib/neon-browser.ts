'use client';

import { createClient } from '@neondatabase/neon-js';
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters';

const authUrl =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
  'https://ep-snowy-math-adl80x03.neonauth.c-2.us-east-1.aws.neon.tech/neondb/auth';
const dataApiUrl =
  process.env.NEXT_PUBLIC_NEON_DATA_API_URL ||
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
