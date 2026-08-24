import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabaseGet, firebaseDatabasePut, getValidFirebaseIdToken } from '@/lib/firebase-backend';

export const dynamic = 'force-dynamic';
const canSupervise = (role?: string | null) => role === 'admin' || role === 'manager';
const flatten = (value: unknown): any[] => Object.values((value && typeof value === 'object' ? value : {}) as Record<string, unknown>).flatMap((bucket) => Object.values((bucket && typeof bucket === 'object' ? bucket : {}) as Record<string, unknown>));

export async function GET(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const token = await getValidFirebaseIdToken();
  const target = canSupervise(profile.role) ? new URL(request.url).searchParams.get('profileId') : profile.profileId;
  const source = canSupervise(profile.role) && !target
    ? await firebaseDatabaseGet('classroomMessages', token).catch(() => ({}))
    : await firebaseDatabaseGet(`classroomMessages/${target || profile.profileId}`, token).catch(() => ({}));
  const rows = canSupervise(profile.role) && !target ? flatten(source) : Object.values(source || {});
  const messages = (rows as any[]).sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
  return NextResponse.json({ messages }, { headers: { 'Cache-Control':'no-store' } });
}

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error:'Non authentifié.' }, { status:401 });
  const body = await request.json().catch(()=>null) as any;
  const text = String(body?.message || '').trim();
  if (!text) return NextResponse.json({ error:'Message vide.' }, { status:400 });
  const profileId = canSupervise(profile.role) ? String(body?.profileId || '').trim() : profile.profileId;
  if (!profileId) return NextResponse.json({ error:'Destinataire requis.' }, { status:400 });
  const token = await getValidFirebaseIdToken();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  const item = { id, profileId, modelName: canSupervise(profile.role) ? String(body?.modelName || profileId) : profile.name, senderId:profile.userId, senderName:profile.name, senderRole:profile.role, message:text.slice(0,5000), createdAt:new Date().toISOString() };
  await firebaseDatabasePut(`classroomMessages/${profileId}/${id}`, item, token);
  return NextResponse.json({ success:true, message:item }, { status:201 });
}
