import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl = process.env.NEON_AUTH_BASE_URL || 'https://ep-snowy-math-adl80x03.neonauth.c-2.us-east-1.aws.neon.tech/neondb/auth';
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || process.env.DATABASE_URL || 'pmm-local-development-cookie-secret-change-me';

export const auth = createNeonAuth({
  baseUrl,
  cookies: { secret: cookieSecret },
});
