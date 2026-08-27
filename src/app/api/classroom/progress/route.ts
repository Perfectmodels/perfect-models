import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { getCollection, getNestedValue, setCollection, setNestedValue } from '@/lib/app-data';

export const dynamic = 'force-dynamic';

function canSupervise(role?: string | null) {
  return role === 'admin' || role === 'manager';
}

export async function GET(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const url = new URL(request.url);
  const requestedProfileId = url.searchParams.get('profileId');
  const root = await getCollection('classroomProgress').catch(() => ({}));

  if (canSupervise(profile.role)) {
    if (requestedProfileId) {
      const progress = getNestedValue(root, [requestedProfileId]) || {};
      return NextResponse.json({ progress }, { headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json({ progress: root || {} }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const progress = getNestedValue(root, [profile.profileId]) || {};
  return NextResponse.json({ progress }, { headers: { 'Cache-Control': 'no-store' } });
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

  const moduleId = String(Number(body.moduleId));
  const payload = {
    ...body,
    moduleId: Number(body.moduleId),
    profileId: targetProfileId,
    modelName: body.modelName || profile.name,
    updatedAt: new Date().toISOString(),
  };
  delete payload.profileIdOverride;

  const root = await getCollection('classroomProgress').catch(() => ({}));
  await setCollection('classroomProgress', setNestedValue(root || {}, [targetProfileId, moduleId], payload));
  return NextResponse.json({ success: true, progress: payload });
}
