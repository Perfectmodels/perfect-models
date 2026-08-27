import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  const p = await getCurrentAppProfile();

  // Un visiteur non connecté n'est pas une erreur applicative : le client peut
  // initialiser son état d'authentification sans générer un 401 dans la console.
  if (!p) {
    return NextResponse.json(
      { user: null },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      user: {
        uid: p.userId,
        email: p.email,
        displayName: p.name,
        role: p.role,
        userId: p.profileId,
        contestId: p.contestId || undefined,
        permissions: p.permissions,
        adminPermissions: p.adminPermissions || null,
        mustChangePassword: p.mustChangePassword,
        identifier: p.identifier,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
