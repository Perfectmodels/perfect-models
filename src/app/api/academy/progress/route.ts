import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['student', 'admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const chapterId = String(body?.chapterId || '');
  const readPercent = Math.max(0, Math.min(100, Math.round(Number(body?.readPercent || 0))));
  const activeSeconds = Math.max(0, Math.round(Number(body?.activeSeconds || 0)));
  if (!chapterId) return NextResponse.json({ error: 'Chapitre invalide.' }, { status: 400 });

  const supabase = createSupabaseAdminClient() as any;
  const { data: chapter } = await supabase
    .from('academy_chapters')
    .select('id,minimum_read_percent,minimum_read_seconds,is_active')
    .eq('id', chapterId)
    .eq('is_active', true)
    .maybeSingle();
  if (!chapter) return NextResponse.json({ error: 'Chapitre introuvable.' }, { status: 404 });

  const { data: existing } = await supabase
    .from('academy_chapter_progress')
    .select('read_percent,active_seconds,status,best_score,attempts_count,started_at,completed_at')
    .eq('user_id', profile.userId)
    .eq('chapter_id', chapterId)
    .maybeSingle();

  const nextRead = Math.max(Number(existing?.read_percent || 0), readPercent);
  const nextSeconds = Math.max(Number(existing?.active_seconds || 0), activeSeconds);
  const alreadyPassed = existing?.status === 'passed';
  const unlocked = nextRead >= Number(chapter.minimum_read_percent) && nextSeconds >= Number(chapter.minimum_read_seconds);
  const status = alreadyPassed ? 'passed' : unlocked ? 'quiz_unlocked' : 'in_progress';
  const now = new Date().toISOString();

  const { error } = await supabase.from('academy_chapter_progress').upsert({
    user_id: profile.userId,
    chapter_id: chapterId,
    read_percent: nextRead,
    active_seconds: nextSeconds,
    status,
    best_score: existing?.best_score ?? null,
    attempts_count: Number(existing?.attempts_count || 0),
    started_at: existing?.started_at || now,
    completed_at: existing?.completed_at || null,
    updated_at: now,
  }, { onConflict: 'user_id,chapter_id' });

  if (error) return NextResponse.json({ error: 'Impossible d’enregistrer la progression.' }, { status: 500 });
  return NextResponse.json({ ok: true, readPercent: nextRead, activeSeconds: nextSeconds, status, quizUnlocked: unlocked || alreadyPassed });
}
