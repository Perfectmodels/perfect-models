import { createClient } from '@neondatabase/neon-js';

export const NEON_AUTH_URL =
  process.env.NEXT_PUBLIC_NEON_AUTH_URL ||
  process.env.NEON_AUTH_BASE_URL ||
  'https://ep-snowy-math-adl80x03.neonauth.c-2.us-east-1.aws.neon.tech/neondb/auth';

export const NEON_DATA_API_URL =
  process.env.NEXT_PUBLIC_NEON_DATA_API_URL ||
  process.env.NEON_DATA_API_URL ||
  'https://ep-snowy-math-adl80x03.apirest.c-2.us-east-1.aws.neon.tech/neondb/rest/v1';

export function createAnonymousNeonClient() {
  return createClient({
    auth: {
      url: NEON_AUTH_URL,
      allowAnonymous: true,
    },
    dataApi: {
      url: NEON_DATA_API_URL,
    },
  });
}
