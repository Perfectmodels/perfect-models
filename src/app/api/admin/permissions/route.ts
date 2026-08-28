import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { privilegedSupabaseSelect, privilegedSupabaseUpsert } from '@/lib/supabase-backend';

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
    const rows = await privilegedSupabaseSelect('profiles?select=user_id,email,display_name,identifier,metadata&role=eq.admin&order=display_name.asc');
    const adminUsers = (Array.isArray(rows) ? rows : []).map((row: any) => {
      const metadata = row?.metadata && typeof row.metadata === 'object' ? row.metadata : {};
      const basePermissions = metadata?.permissions && typeof metadata.permissions === 'object' ? metadata.permissions : {};
      const adminPermissions = metadata?.admin_permissions && typeof metadata.admin_permissions === 'object' ? metadata.admin_permissions : {};
      return {
        uid: String(row.user_id || ''),
        email: String(row.email || ''),
        name: String(row.display_name || row.email || row.user_id || ''),
        identifier: String(row.identifier || ''),
        permissions: adminPermissions,
        isSuper: Boolean(basePermissions?.all || basePermissions?.isAdmin),
      };
    });

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
    const rows = await privilegedSupabaseSelect(`profiles?select=user_id,role,identifier,display_name,email,model_id,must_change_password,is_active,metadata&user_id=eq.${encodeURIComponent(uid)}&limit=1`);
    const current = Array.isArray(rows) ? rows[0] : null;
    if (!current) return NextResponse.json({ error: 'Profil administrateur introuvable.' }, { status: 404 });

    const metadata = current.metadata && typeof current.metadata === 'object' ? current.metadata : {};
    await privilegedSupabaseUpsert('profiles', {
      ...current,
      metadata: { ...metadata, admin_permissions: permissions },
      updated_at: new Date().toISOString(),
    }, 'user_id');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
