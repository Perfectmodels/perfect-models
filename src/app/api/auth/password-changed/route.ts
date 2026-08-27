import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { getCollection, setCollection } from '@/lib/app-data';
import { privilegedSupabaseUpsert, supabaseAdminUpdateUser } from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';

export async function POST() {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const users = ((await getCollection('users').catch(() => null)) || {}) as Record<string, any>;
  const existing = users[profile.userId] || {};
  users[profile.userId] = {
    ...existing,
    id: existing.id || profile.userId,
    uid: existing.uid || profile.userId,
    supabaseUserId: existing.supabaseUserId || profile.userId,
    email: existing.email || profile.email,
    name: existing.name || profile.name,
    identifier: existing.identifier || profile.identifier,
    role: existing.role || profile.role,
    profileId: existing.profileId || profile.profileId,
    mustChangePassword: false,
    updatedAt: new Date().toISOString(),
  };
  await setCollection('users', users);

  await Promise.allSettled([
    privilegedSupabaseUpsert('profiles', {
      user_id: profile.userId,
      role: profile.role,
      identifier: profile.identifier || null,
      display_name: profile.name || null,
      email: profile.email || null,
      model_id: profile.profileId || null,
      must_change_password: false,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, 'user_id'),
    supabaseAdminUpdateUser(profile.userId, {
      app_metadata: {
        role: profile.role,
        profile_id: profile.profileId,
        identifier: profile.identifier,
        must_change_password: false,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
