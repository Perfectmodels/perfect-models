import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { privilegedSupabaseSelect, privilegedSupabaseUpsert } from '@/lib/supabase-backend';

export const dynamic = 'force-dynamic';

function canSupervise(role?: string | null) {
  return role === 'admin' || role === 'manager';
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveUserId(identifier: string, fallbackUserId: string) {
  const value = String(identifier || '').trim();
  if (!value) return fallbackUserId;
  const byModel = await privilegedSupabaseSelect(`profiles?model_id=eq.${encodeURIComponent(value)}&select=user_id&limit=1`).catch(() => []);
  if (Array.isArray(byModel) && byModel[0]?.user_id) return String(byModel[0].user_id);
  if (UUID_RE.test(value)) {
    const byUser = await privilegedSupabaseSelect(`profiles?user_id=eq.${encodeURIComponent(value)}&select=user_id&limit=1`).catch(() => []);
    if (Array.isArray(byUser) && byUser[0]?.user_id) return String(byUser[0].user_id);
  }
  return fallbackUserId;
}

function mapProgress(rows: any[]) {
  return Object.fromEntries(rows.map((row) => {
    const data = row?.progress && typeof row.progress === 'object' && !Array.isArray(row.progress) ? row.progress : {};
    const courseId = String(row.course_id || '');
    return [courseId, { ...data, moduleId: data.moduleId ?? courseId, courseId, updatedAt: row.updated_at, completedAt: row.completed_at }];
  }).filter(([key]) => Boolean(key)));
}

export async function GET(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const requestedProfileId = canSupervise(profile.role) ? new URL(request.url).searchParams.get('profileId') : null;
  if (canSupervise(profile.role) && !requestedProfileId) {
    const rows = await privilegedSupabaseSelect('course_progress?select=id,user_id,course_id,progress,completed_at,updated_at&order=updated_at.desc');
    return NextResponse.json({ progress: Array.isArray(rows) ? rows : [] }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const targetUserId = await resolveUserId(requestedProfileId || profile.profileId, profile.userId);
  const rows = await privilegedSupabaseSelect(`course_progress?user_id=eq.${encodeURIComponent(targetUserId)}&select=id,user_id,course_id,progress,completed_at,updated_at&order=updated_at.desc`);
  return NextResponse.json({ progress: mapProgress(Array.isArray(rows) ? rows : []) }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const body = await request.json().catch(() => null) as any;
  const courseId = String(body?.courseId ?? body?.moduleId ?? '').trim();
  if (!body || !courseId) return NextResponse.json({ error: 'Progression invalide.' }, { status: 400 });

  const requestedProfileId = canSupervise(profile.role) && body.profileId ? String(body.profileId) : profile.profileId;
  if (!canSupervise(profile.role) && requestedProfileId !== profile.profileId) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  const targetUserId = await resolveUserId(requestedProfileId, profile.userId);
  const updatedAt = new Date().toISOString();
  const progress = { ...body, moduleId: body.moduleId ?? courseId, courseId, profileId: requestedProfileId, modelName: body.modelName || profile.name, updatedAt };
  delete progress.profileIdOverride;

  const completedAt = body.completed === true || body.isCompleted === true ? (body.completedAt || updatedAt) : (body.completedAt || null);
  const rows = await privilegedSupabaseUpsert('course_progress', {
    user_id: targetUserId,
    course_id: courseId,
    progress,
    completed_at: completedAt,
    updated_at: updatedAt,
  }, 'user_id,course_id');

  return NextResponse.json({ success: true, progress: Array.isArray(rows) && rows[0] ? { ...progress, completedAt: rows[0].completed_at } : progress });
}
