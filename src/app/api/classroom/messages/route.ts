import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabaseGet, firebaseDatabasePut, getValidFirebaseIdToken } from '@/lib/firebase-backend';

export const dynamic = 'force-dynamic';
const canSupervise = (role?: string | null) => role === 'admin' || role === 'manager';

export async function GET(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const token = await getValidFirebaseIdToken();
  const url = new URL(request.url);
  const target = canSupervise(profile.role) ? url.searchParams.get('profileId') : profile.profileId;
  const all = await firebaseDatabaseGet('classroomMessages', token).catch(() => ({}));
  const rows = Object.values(all || {}) as any[];
  const messages = rows
    .filter((item) => !target || item?.profileId === target)
    .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
  return NextResponse.json({ messages }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const body = await request.json().catch(() => null) as any;
  const message = String(body?.message || '').trim();
  if (!message) return NextResponse.json({ error: 'Message vide.' }, { status: 400 });

  let profileId = profile.profileId;
  let modelName = profile.name;
  if (canSupervise(profile.role)) {
    profileId = String(body?.profileId || '').trim();
    modelName = String(body?.modelName || profileId).trim();
    if (!profileId) return NextResponse.json({ error: 'Destinataire requis.' }, { status: 400 });
  }

  const token = await getValidFirebaseIdToken();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const item = {
    id,
    profileId,
    modelName,
    senderId: profile.userId,
    senderName: profile.name,
    senderRole: profile.role,
    message: message.slice(0, 5000),
    createdAt: new Date().toISOString(),
  };
  await firebaseDatabasePut(`classroomMessages/${id}`, item, token);
  return NextResponse.json({ success: true, message: item }, { status: 201 });
}
