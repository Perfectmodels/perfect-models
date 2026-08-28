import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { privilegedSupabaseSelect, privilegedSupabaseUpsert } from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';
const canSupervise = (role?: string | null) => role === 'admin' || role === 'manager';

function mapMessage(row: any) {
  const raw = row?.raw_data && typeof row.raw_data === 'object' ? row.raw_data : {};
  return {
    id: String(row.id),
    profileId: String(row.model_id || raw.profileId || ''),
    modelName: String(raw.modelName || row.model_id || ''),
    senderId: String(raw.senderId || ''),
    senderName: String(raw.senderName || ''),
    senderRole: String(raw.senderRole || ''),
    message: String(row.body || ''),
    createdAt: String(row.created_at || ''),
  };
}

export async function GET(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const requested = canSupervise(profile.role) ? new URL(request.url).searchParams.get('profileId') : profile.profileId;
  const target = String(requested || '').trim();
  const filter = target ? `&model_id=eq.${encodeURIComponent(target)}` : '';
  const rows = await privilegedSupabaseSelect(`classroom_messages?select=id,model_id,direction,subject,body,status,raw_data,created_at${filter}&order=created_at.asc`);
  const messages = (Array.isArray(rows) ? rows : []).map(mapMessage);
  return NextResponse.json({ messages }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const body = await request.json().catch(() => null) as any;
  const text = String(body?.message || '').trim();
  if (!text) return NextResponse.json({ error: 'Message vide.' }, { status: 400 });

  const profileId = canSupervise(profile.role) ? String(body?.profileId || '').trim() : profile.profileId;
  if (!profileId) return NextResponse.json({ error: 'Destinataire requis.' }, { status: 400 });

  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const item = {
    id,
    profileId,
    modelName: canSupervise(profile.role) ? String(body?.modelName || profileId) : profile.name,
    senderId: profile.userId,
    senderName: profile.name,
    senderRole: profile.role,
    message: text.slice(0, 5000),
    createdAt,
  };

  await privilegedSupabaseUpsert('classroom_messages', {
    id,
    model_id: profileId,
    direction: canSupervise(profile.role) ? 'outbound' : 'inbound',
    subject: canSupervise(profile.role) ? `Message de ${profile.name}` : `Message de ${item.modelName}`,
    body: item.message,
    status: 'unread',
    raw_data: item,
    created_at: createdAt,
  }, 'id');

  return NextResponse.json({ success: true, message: item }, { status: 201 });
}
