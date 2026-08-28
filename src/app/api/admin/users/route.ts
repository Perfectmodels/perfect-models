import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import {
  privilegedSupabaseUpsert,
  supabaseAdminUpdateUser,
  supabaseInviteUserByEmail,
} from '@/lib/supabase-backend';
import { collectionToArray, getCollection, setCollection } from '@/lib/app-data';
import type { AppRole } from '@/lib/auth/profile';

const allowed = new Set<AppRole>(['manager', 'student', 'jury', 'registration', 'jury-contest']);
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

export async function POST(request: Request) {
  const admin = await getCurrentAppProfile();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  }

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
    const permissions = role === 'manager'
      ? { ...(profileData.permissions || {}), isManager: true }
      : { ...(profileData.permissions || {}), isActive: true };

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

    await privilegedSupabaseUpsert('profiles', {
      user_id: userId,
      role,
      identifier,
      display_name: name,
      email,
      model_id: role === 'student' ? profileId : null,
      must_change_password: true,
      is_active: true,
      metadata: { permissions, source: 'admin_invite' },
      updated_at: new Date().toISOString(),
    }, 'user_id');

    if (role === 'manager') {
      const adminPermissions = ((await getCollection('adminPermissions').catch(() => null)) || {}) as Record<string, any>;
      adminPermissions[userId] = { ...MANAGER_DEFAULT_PERMISSIONS, ...(profileData.adminPermissions || {}) };
      await setCollection('adminPermissions', adminPermissions);
    }

    const key = role === 'student' ? 'models' : role === 'jury' ? 'juryMembers' : role === 'registration' ? 'registrationStaff' : null;
    if (key) {
      const items = collectionToArray(await getCollection(key));
      const item = { ...profileData, id: profileId, name, username: identifier, email, authUserId: userId, supabaseUserId: userId };
      const index = items.findIndex((entry) => String(entry?.id) === profileId);
      if (index >= 0) items[index] = { ...items[index], ...item };
      else items.push(item);
      await setCollection(key, items);
    }

    return NextResponse.json({ success: true, userId, invitationSent: true }, { status: 201 });
  } catch (error: any) {
    const message = String(error?.message || 'Invitation Supabase impossible.');
    const status = /already|exists|registered/i.test(message) ? 409 : Number(error?.status || 400);
    return NextResponse.json({ error: message }, { status });
  }
}
