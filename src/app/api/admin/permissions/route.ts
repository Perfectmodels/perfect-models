import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { getCollection, setCollection } from '@/lib/app-data';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'admin') return null;
  if (!(profile.permissions as any)?.all && !(profile.permissions as any)?.isAdmin) return null;
  return profile;
}

export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  try {
    const usersNode = await getCollection('users').catch(() => null);
    const users: Record<string, any> = usersNode && typeof usersNode === 'object' && !Array.isArray(usersNode) ? usersNode as Record<string, any> : {};
    const permNode = await getCollection('adminPermissions').catch(() => null);
    const perms: Record<string, any> = permNode && typeof permNode === 'object' && !Array.isArray(permNode) ? permNode as Record<string, any> : {};

    const adminUsers = Object.entries(users)
      .filter(([, u]) => u?.role === 'admin' || u?.app_role === 'admin')
      .map(([uid, u]) => ({
        uid,
        email: u.email || '',
        name: u.name || u.displayName || u.email || uid,
        identifier: u.identifier || u.matricule || '',
        permissions: perms[uid] || {},
        isSuper: !!(u.permissions?.all || u.permissions?.isAdmin),
      }));

    return NextResponse.json({ users: adminUsers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const uid = String(body.uid || '').trim();
  const permissions = body.permissions;
  if (!uid || !permissions || typeof permissions !== 'object') {
    return NextResponse.json({ error: 'uid et permissions requis.' }, { status: 400 });
  }

  try {
    const current = ((await getCollection('adminPermissions').catch(() => null)) || {}) as Record<string, any>;
    current[uid] = permissions;
    await setCollection('adminPermissions', current);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
