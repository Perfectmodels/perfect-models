import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { privilegedSupabaseSelect, privilegedSupabaseUpsert } from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';
const VALID_KINDS = new Set(['absence', 'contribution', 'shooting-theme']);
const canSupervise = (role?: string | null) => role === 'admin' || role === 'manager';

function mapRequest(row: any) {
  const raw = row?.raw_data && typeof row.raw_data === 'object' && !Array.isArray(row.raw_data) ? row.raw_data : {};
  return {
    ...raw,
    id: String(row.id || raw.id || ''),
    kind: String(row.request_type || raw.kind || ''),
    profileId: String(row.model_id || raw.profileId || ''),
    message: String(row.message || raw.message || ''),
    status: String(row.status || raw.status || 'pending'),
    createdAt: String(row.created_at || raw.createdAt || ''),
    updatedAt: String(row.updated_at || raw.updatedAt || ''),
  };
}

export async function GET() {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const filter = canSupervise(profile.role) ? '' : `&model_id=eq.${encodeURIComponent(profile.profileId)}`;
  const rows = await privilegedSupabaseSelect(`classroom_requests?select=id,model_id,request_type,status,message,raw_data,created_at,updated_at${filter}&order=created_at.desc`);
  return NextResponse.json({ requests: (Array.isArray(rows) ? rows : []).map(mapRequest) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || profile.role !== 'student') return NextResponse.json({ error: 'Réservé aux mannequins.' }, { status: 403 });

  const body = await request.json().catch(() => null) as any;
  const kind = String(body?.kind || '').trim();
  if (!body || !VALID_KINDS.has(kind)) return NextResponse.json({ error: 'Type de demande invalide.' }, { status: 400 });

  const id = randomUUID();
  const now = new Date().toISOString();
  const item = {
    id,
    kind,
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
    createdAt: now,
    updatedAt: now,
  };

  await privilegedSupabaseUpsert('classroom_requests', {
    id,
    model_id: profile.profileId,
    request_type: kind,
    status: 'pending',
    message: item.message,
    raw_data: item,
    created_at: now,
    updated_at: now,
  }, 'id');

  return NextResponse.json({ success: true, request: item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !canSupervise(profile.role)) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });

  const body = await request.json().catch(() => null) as any;
  const id = String(body?.id || '').trim();
  if (!id) return NextResponse.json({ error: 'Identifiant requis.' }, { status: 400 });
  const allowed = new Set(['pending', 'approved', 'rejected', 'processed']);
  const status = allowed.has(String(body.status)) ? String(body.status) : 'pending';

  const existingRows = await privilegedSupabaseSelect(`classroom_requests?id=eq.${encodeURIComponent(id)}&select=id,model_id,request_type,status,message,raw_data,created_at,updated_at&limit=1`);
  const existing = Array.isArray(existingRows) ? existingRows[0] : null;
  if (!existing) return NextResponse.json({ error: 'Demande introuvable.' }, { status: 404 });

  const updatedAt = new Date().toISOString();
  const raw = existing.raw_data && typeof existing.raw_data === 'object' && !Array.isArray(existing.raw_data) ? existing.raw_data : {};
  const nextRaw = {
    ...raw,
    status,
    adminNote: String(body.adminNote || '').slice(0, 3000),
    reviewedBy: profile.name,
    reviewedAt: updatedAt,
    updatedAt,
  };

  await privilegedSupabaseUpsert('classroom_requests', {
    id,
    model_id: existing.model_id,
    request_type: existing.request_type,
    status,
    message: existing.message,
    raw_data: nextRaw,
    created_at: existing.created_at,
    updated_at: updatedAt,
  }, 'id');

  return NextResponse.json({ success: true, request: mapRequest({ ...existing, status, raw_data: nextRaw, updated_at: updatedAt }) });
}
