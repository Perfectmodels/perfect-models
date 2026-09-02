import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import {
  privilegedSupabaseDelete,
  privilegedSupabaseSelect,
  privilegedSupabaseUpsert,
  supabaseAdminGetUser,
  supabaseAdminUpdateUser,
  supabaseInviteUserByEmail,
} from '@/lib/supabase-backend';
import type { AppRole } from '@/lib/auth/profile';

const allowed = new Set<AppRole>(['admin', 'manager', 'student', 'jury', 'registration', 'jury-contest']);
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.perfectmodels.online').replace(/\/$/, '');
const MANAGER_DEFAULT_PERMISSIONS = {
  dashboard: false, models: true, absences: true, agency: false, artisticDirection: true, beautyContests: false, bookings: true, castingApplications: false,
  castingResults: false, classroom: true, classroomProgress: true, comments: false, fashionDayApplications: false, fashionDayEvents: false, gallery: false,
  imageAnalysis: false, imageGeneration: false, liveChat: false, magazine: false, mailing: false, mediaLibrary: false, messages: true, modelAccess: false, news: false,
  payments: true, recovery: false, settings: false, userPermissions: false,
};

function validEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function objectValue(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

async function requireAdmin() {
  const profile = await getCurrentAppProfile();
  return profile?.role === 'admin' ? profile : null;
}

async function listUsers() {
  const [profileRows, permissionRows] = await Promise.all([
    privilegedSupabaseSelect('profiles?select=user_id,email,display_name,identifier,role,model_id,is_active,must_change_password,metadata,created_at,updated_at&order=display_name.asc'),
    privilegedSupabaseSelect('admin_permissions?select=permission_key,value'),
  ]);
  const permissionMap = new Map((Array.isArray(permissionRows) ? permissionRows : []).map((row: any) => [String(row.permission_key || ''), objectValue(row.value)]));
  return (Array.isArray(profileRows) ? profileRows : []).map((row: any) => {
    const metadata = objectValue(row.metadata);
    return {
      uid: String(row.user_id || ''),
      email: String(row.email || ''),
      name: String(row.display_name || row.email || row.user_id || ''),
      identifier: String(row.identifier || ''),
      role: String(row.role || 'student'),
      modelId: row.model_id ? String(row.model_id) : null,
      isActive: row.is_active !== false,
      mustChangePassword: Boolean(row.must_change_password),
      permissions: objectValue(metadata.permissions),
      adminPermissions: permissionMap.get(String(row.user_id || '')) || objectValue(metadata.admin_permissions),
      createdAt: row.created_at || null,
      updatedAt: row.updated_at || null,
    };
  });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  try {
    return NextResponse.json({ users: await listUsers() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || 'Lecture des comptes impossible.') }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const uid = String(body.uid || '').trim();
  const role = String(body.role || '') as AppRole;
  const isActive = body.isActive !== false;
  if (!uid || !allowed.has(role)) return NextResponse.json({ error: 'Compte ou rôle invalide.' }, { status: 400 });

  try {
    const rows = await privilegedSupabaseSelect(`profiles?select=*&user_id=eq.${encodeURIComponent(uid)}&limit=1`);
    const current = Array.isArray(rows) ? rows[0] : null;
    if (!current) return NextResponse.json({ error: 'Compte applicatif introuvable.' }, { status: 404 });

    const currentRole = String(current.role || 'student') as AppRole;
    const activeAdmins = await privilegedSupabaseSelect('profiles?select=user_id&role=eq.admin&is_active=eq.true');
    const wouldRemoveAdmin = currentRole === 'admin' && (role !== 'admin' || !isActive);
    if (wouldRemoveAdmin && Array.isArray(activeAdmins) && activeAdmins.length <= 1) {
      return NextResponse.json({ error: 'Impossible de retirer ou désactiver le dernier administrateur actif.' }, { status: 409 });
    }

    const metadata = objectValue(current.metadata);
    const existingPermissions = objectValue(metadata.permissions);
    const requestedAdminPermissions = objectValue(body.adminPermissions);
    const currentAdminRows = await privilegedSupabaseSelect(`admin_permissions?select=value&permission_key=eq.${encodeURIComponent(uid)}&limit=1`).catch(() => []);
    const currentAdminPermissions = Array.isArray(currentAdminRows) ? objectValue(currentAdminRows[0]?.value) : {};
    const adminPermissions = role === 'manager'
      ? { ...MANAGER_DEFAULT_PERMISSIONS, ...currentAdminPermissions, ...requestedAdminPermissions }
      : {};

    const permissions = role === 'admin'
      ? { ...existingPermissions, all: true, isAdmin: true, isManager: false, isActive }
      : role === 'manager'
        ? { ...existingPermissions, all: false, isAdmin: false, isManager: true, isActive }
        : { ...existingPermissions, all: false, isAdmin: false, isManager: false, isActive };

    const authUser: any = await supabaseAdminGetUser(uid);
    await supabaseAdminUpdateUser(uid, {
      app_metadata: {
        ...objectValue(authUser?.app_metadata),
        role,
        identifier: current.identifier || authUser?.app_metadata?.identifier,
        profile_id: current.model_id || metadata.profile_id || uid,
        model_id: role === 'student' ? current.model_id || authUser?.app_metadata?.model_id : undefined,
      },
    });

    await privilegedSupabaseUpsert('profiles', {
      ...current,
      role,
      is_active: isActive,
      metadata: {
        ...metadata,
        permissions,
        ...(role === 'manager' ? { admin_permissions: adminPermissions } : { admin_permissions: {} }),
      },
      updated_at: new Date().toISOString(),
    }, 'user_id');

    if (role === 'manager') {
      await privilegedSupabaseUpsert('admin_permissions', {
        permission_key: uid,
        value: adminPermissions,
        updated_at: new Date().toISOString(),
      }, 'permission_key');
    } else {
      await privilegedSupabaseDelete('admin_permissions', `permission_key=eq.${encodeURIComponent(uid)}`).catch(() => null);
    }

    return NextResponse.json({ success: true, user: (await listUsers()).find((user) => user.uid === uid) || null });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || 'Mise à jour du compte impossible.') }, { status: Number(error?.status || 500) });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const email = validEmail(body.email);
  const role = String(body.role || '') as AppRole;
  const profileData = body.profileData || {};
  const name = String(profileData.name || email).trim();
  const profileId = String(profileData.id || '').trim();
  const identifier = String(profileData.username || profileData.matricule || profileId || email).trim();

  if (!email || !profileId || !identifier || !allowed.has(role)) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
  }

  try {
    const permissions = role === 'admin'
      ? { ...(profileData.permissions || {}), all: true, isAdmin: true, isActive: true }
      : role === 'manager'
        ? { ...(profileData.permissions || {}), isManager: true, isActive: true }
        : { ...(profileData.permissions || {}), isActive: true };
    const adminPermissions = role === 'manager'
      ? { ...MANAGER_DEFAULT_PERMISSIONS, ...(profileData.adminPermissions || {}) }
      : undefined;

    const invited: any = await supabaseInviteUserByEmail(email, `${SITE_URL}/auth/complete?next=/auth/set-password`, {
      name,
      identifier,
      profile_id: profileId,
      role,
      source: 'admin_invite',
    });
    const user = invited?.user || invited;
    const userId = String(user?.id || '');
    if (!userId) return NextResponse.json({ error: 'Identifiant Supabase absent.' }, { status: 502 });

    await supabaseAdminUpdateUser(userId, {
      app_metadata: {
        ...(user?.app_metadata || {}),
        role,
        profile_id: profileId,
        model_id: role === 'student' ? profileId : undefined,
        identifier,
        must_change_password: true,
        account_source: 'admin_invite',
      },
    });

    if (role === 'student') {
      await privilegedSupabaseUpsert('models', {
        id: profileId,
        auth_user_id: userId,
        username: identifier,
        name,
        email,
        phone: profileData.phone || null,
        gender: profileData.gender || null,
        height: profileData.height || null,
        location: profileData.location || null,
        level: profileData.level || 'Débutant',
        image_url: profileData.imageUrl || null,
        categories: Array.isArray(profileData.categories) ? profileData.categories : [],
        measurements: profileData.measurements || {},
        distinctions: Array.isArray(profileData.distinctions) ? profileData.distinctions : [],
        experience: profileData.experience || '',
        journey: profileData.journey || '',
        permissions,
        quiz_scores: profileData.quizScores || {},
        is_public: Boolean(profileData.isPublic),
        is_active: true,
        status: 'active',
        raw_data: profileData,
        updated_at: new Date().toISOString(),
      }, 'id');
    } else if (role === 'jury') {
      await privilegedSupabaseUpsert('jury_members', {
        id: userId,
        name,
        email,
        phone: profileData.phone || null,
        is_active: true,
        permissions,
        raw_data: { ...profileData, agency_identifier: identifier, profile_id: profileId },
        updated_at: new Date().toISOString(),
      }, 'id');
    } else if (role === 'registration') {
      await privilegedSupabaseUpsert('registration_staff', {
        id: userId,
        name,
        email,
        phone: profileData.phone || null,
        is_active: true,
        permissions,
        raw_data: { ...profileData, agency_identifier: identifier, profile_id: profileId },
        updated_at: new Date().toISOString(),
      }, 'id');
    }

    await privilegedSupabaseUpsert('profiles', {
      user_id: userId,
      role,
      identifier,
      display_name: name,
      email,
      model_id: role === 'student' ? profileId : null,
      must_change_password: true,
      is_active: true,
      metadata: {
        permissions,
        ...(adminPermissions ? { admin_permissions: adminPermissions } : {}),
        source: 'admin_invite',
        profile_id: profileId,
      },
      updated_at: new Date().toISOString(),
    }, 'user_id');

    if (adminPermissions) {
      await privilegedSupabaseUpsert('admin_permissions', {
        permission_key: userId,
        value: adminPermissions,
        updated_at: new Date().toISOString(),
      }, 'permission_key');
    }

    return NextResponse.json({ success: true, userId, invitationSent: true }, { status: 201 });
  } catch (error: any) {
    const message = String(error?.message || 'Invitation Supabase impossible.');
    const status = /already|exists|registered/i.test(message) ? 409 : Number(error?.status || 400);
    return NextResponse.json({ error: message }, { status });
  }
}
