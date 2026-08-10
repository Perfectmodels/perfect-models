import { createHash } from 'node:crypto';
import { createNeonAuth } from '@neondatabase/auth/next/server';
import { getDatabaseUrl } from '../neon';

const baseUrl = process.env.NEON_AUTH_BASE_URL || process.env.NEXT_NEON_AUTH_BASE_URL || process.env.NEXT_VITE_NEON_AUTH_URL || 'https://ep-snowy-math-adl80x03.neonauth.c-2.us-east-1.aws.neon.tech/neondb/auth';
const derivedSecret = createHash('sha256').update(getDatabaseUrl() || 'perfect-models-neon-auth-local-development').digest('hex');
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET || derivedSecret;

export const auth = createNeonAuth({ baseUrl, cookies: { secret: cookieSecret } });
