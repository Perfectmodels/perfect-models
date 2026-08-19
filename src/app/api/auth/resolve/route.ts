import { NextResponse } from 'next/server';
import { firebaseDatabaseGet } from '@/lib/firebase-backend';
import { ADMIN_ALIASES } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
}

function normalizeRole(record: Record<string, unknown>): string {
  const role = String(record.role || record.app_role || record.appRole || 'student');
  const isDelegatedAdmin =
    role === 'admin' ||
    (record.permissions && typeof record.permissions === 'object' && (record.permissions as Record<string, unknown>).isAdmin === true) ||
    record.adminPermissions !== undefined;
  return isDelegatedAdmin ? 'admin' : role.toLowerCase();
}

async function resolve(identifier: string) {
  const candidate = identifier.trim().toLowerCase();
  if (!candidate) return NextResponse.json({ error: 'Identifiant requis.' }, { status: 400 });
  if (ADMIN_ALIASES.has(candidate)) {
    return NextResponse.json({ email: 'admin@perfectmodels.online', identifier: 'admin', role: 'admin', name: 'Administration PMM' });
  }

  try {
    const [models, users, profiles] = await Promise.all([
      firebaseDatabaseGet('models').catch(() => null),
      firebaseDatabaseGet('users').catch(() => null),
      firebaseDatabaseGet('userProfiles').catch(() => null),
    ]);
    const all = [
      ...asArray(models),
      ...asArray(users),
      ...asArray(profiles),
    ];
    const row = all.find((item: unknown) => {
      if (!item || typeof item !== 'object') return false;
      const r = item as Record<string, unknown>;
      const values = [r.identifier, r.matricule, r.email, r.loginEmail, r.login_email, r.username, r.name]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());
      return values.includes(candidate);
    });
    if (!row) return NextResponse.json({ error: 'Identifiant introuvable ou compte inactif.' }, { status: 404 });
    const r = row as Record<string, unknown>;
    const email = String(
      r.email || r.loginEmail || r.login_email ||
      (String(r.matricule || r.identifier || '').toLowerCase() + '@perfectmodels.online')
    );
    return NextResponse.json(
      {
        email,
        identifier: String(r.identifier || r.matricule || candidate),
        role: normalizeRole(r),
        name: String(r.name || r.displayName || candidate),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[auth/resolve] Firebase lookup failed', error);
    return NextResponse.json({ error: "Le service d'authentification est temporairement indisponible." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return resolve(String(body.identifier || ''));
}

export async function GET(request: Request) {
  return resolve(new URL(request.url).searchParams.get('identifier') || '');
}
