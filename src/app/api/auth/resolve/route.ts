import { NextResponse } from 'next/server';
import { sqlQuery } from '@/lib/neon';

interface Row {
  login_email: string;
  identifier: string;
  app_role: string;
  status: string;
  name: string;
}

const ADMIN_ALIASES = new Set([
  'admin',
  'admin@perfectmodels.online',
  'contact@perfectmodels.online',
  'contact@perfectmodels.ga',
  'perfectmodels.ga@gmail.com',
]);

async function resolve(identifier: string) {
  const candidate = identifier.trim().toLowerCase();
  if (!candidate) return NextResponse.json({ error: 'Identifiant requis.' }, { status: 400 });
  const normalized = ADMIN_ALIASES.has(candidate) ? 'admin' : candidate;

  try {
    const rows = await sqlQuery<Row>(
      `SELECT ap.login_email, ap.identifier, ap.app_role, ap.status, u.name
       FROM public.auth_profiles ap
       JOIN neon_auth."user" u ON u.id = ap.user_id
       WHERE lower(ap.identifier)=lower($1)
          OR lower(ap.login_email)=lower($1)
          OR lower(u.name)=lower($1)
       ORDER BY CASE
         WHEN lower(ap.identifier)=lower($1) THEN 0
         WHEN lower(ap.login_email)=lower($1) THEN 1
         ELSE 2
       END
       LIMIT 1`,
      [normalized],
    );
    const row = rows[0];
    // Les comptes mannequins utilisent le rôle student et doivent rester actifs.
    if (!row || (row.status !== 'active' && row.app_role !== 'student')) {
      return NextResponse.json({ error: 'Identifiant introuvable ou compte inactif.' }, { status: 404 });
    }
    return NextResponse.json({
      email: row.login_email,
      identifier: row.identifier,
      role: row.app_role,
      name: row.name,
    });
  } catch (error) {
    console.error('[auth/resolve] database lookup failed', error);
    return NextResponse.json(
      { error: "Le service d'authentification est temporairement indisponible." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return resolve(String(body.identifier || ''));
}

export async function GET(request: Request) {
  const identifier = new URL(request.url).searchParams.get('identifier') || '';
  return resolve(identifier);
}
