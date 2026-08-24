import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { firebaseDatabaseGet, firebaseDatabasePatch, firebaseDatabasePut, getValidFirebaseIdToken } from '@/lib/firebase-backend';

export const dynamic = 'force-dynamic';
const VALID_KINDS = new Set(['absence', 'contribution', 'shooting-theme']);
const canSupervise = (role?: string | null) => role === 'admin' || role === 'manager';

export async function GET() {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const token = await getValidFirebaseIdToken();
  const all = await firebaseDatabaseGet('classroomRequests', token).catch(() => ({}));
  const rows = Object.values(all || {}) as any[];
  const requests = canSupervise(profile.role) ? rows : rows.filter((item) => item?.profileId === profile.profileId);
  return NextResponse.json({ requests }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'student') return NextResponse.json({ error: 'Réservé aux mannequins.' }, { status: 403 });
  const body = await request.json().catch(() => null) as any;
  if (!body || !VALID_KINDS.has(String(body.kind))) return NextResponse.json({ error: 'Type de demande invalide.' }, { status: 400 });
  const token = await getValidFirebaseIdToken();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const item = {
    id,
    kind: String(body.kind),
    profileId: profile.profileId,
    modelName: profile.name,
    modelEmail: profile.email,
    title: String(body.title || '').slice(0, 180),
    message: String(body.message || '').slice(0, 5000),
    amount: body.amount ? Number(body.amount) : null,
    period: body.period ? String(body.period).slice(0, 80) : null,
    eventDate: body.eventDate ? String(body.eventDate).slice(0, 30) : null,
    attachmentUrl: body.attachmentUrl ? String(body.attachmentUrl).slice(0, 1500) : null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await firebaseDatabasePut(`classroomRequests/${id}`, item, token);
  return NextResponse.json({ success: true, request: item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !canSupervise(profile.role)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  const body = await request.json().catch(() => null) as any;
  if (!body?.id) return NextResponse.json({ error: 'Identifiant requis.' }, { status: 400 });
  const allowed = new Set(['pending', 'approved', 'rejected', 'processed']);
  const status = allowed.has(String(body.status)) ? String(body.status) : 'pending';
  const token = await getValidFirebaseIdToken();
  await firebaseDatabasePatch(`classroomRequests/${body.id}`, {
    status,
    adminNote: String(body.adminNote || '').slice(0, 3000),
    reviewedBy: profile.name,
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, token);
  return NextResponse.json({ success: true });
}
