import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabaseGet, firebaseDatabasePut, getValidFirebaseIdToken } from '@/lib/firebase-backend';

export const dynamic = 'force-dynamic';

function canSupervise(role?: string | null) {
  return role === 'admin' || role === 'manager';
}

export async function GET(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const token = await getValidFirebaseIdToken();
  const url = new URL(request.url);
  const requestedProfileId = url.searchParams.get('profileId');

  if (canSupervise(profile.role)) {
    if (requestedProfileId) {
      const progress = await firebaseDatabaseGet(`classroomProgress/${requestedProfileId}`, token).catch(() => null);
      return NextResponse.json({ progress: progress || {} }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const progress = await firebaseDatabaseGet('classroomProgress', token).catch(() => ({}));
    return NextResponse.json({ progress: progress || {} }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const progress = await firebaseDatabaseGet(`classroomProgress/${profile.profileId}`, token).catch(() => null);
  return NextResponse.json({ progress: progress || {} }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const body = await request.json().catch(() => null) as any;
  if (!body || !Number.isFinite(Number(body.moduleId))) {
    return NextResponse.json({ error: 'Progression invalide.' }, { status: 400 });
  }

  const targetProfileId = canSupervise(profile.role) && body.profileId ? String(body.profileId) : profile.profileId;
  if (!canSupervise(profile.role) && targetProfileId !== profile.profileId) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const token = await getValidFirebaseIdToken();
  const moduleId = String(Number(body.moduleId));
  const payload = {
    ...body,
    moduleId: Number(body.moduleId),
    profileId: targetProfileId,
    modelName: body.modelName || profile.name,
    updatedAt: new Date().toISOString(),
  };
  delete payload.profileIdOverride;

  await firebaseDatabasePut(`classroomProgress/${targetProfileId}/${moduleId}`, payload, token);
  return NextResponse.json({ success: true, progress: payload });
}
