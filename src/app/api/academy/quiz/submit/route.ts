import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type SubmittedAnswer = { questionId: string; choice: string | null; responseMs?: number };

export async function POST(request: Request) {
  const profile = await getCurrentAppProfile();
  if (!profile || !['student', 'admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const chapterId = String(body?.chapterId || '');
  const incidentCount = Math.max(0, Math.min(3, Math.round(Number(body?.incidentCount || 0))));
  const answers = Array.isArray(body?.answers) ? body.answers as SubmittedAnswer[] : [];
  if (!chapterId) return NextResponse.json({ error: 'Chapitre invalide.' }, { status: 400 });

  const supabase = createSupabaseAdminClient() as any;
  const { data: chapter } = await supabase
    .from('academy_chapters')
    .select('id,module_id,pass_score,minimum_read_percent,minimum_read_seconds,is_active')
    .eq('id', chapterId)
    .eq('is_active', true)
    .maybeSingle();
  if (!chapter) return NextResponse.json({ error: 'Chapitre introuvable.' }, { status: 404 });

  const { data: progress } = await supabase
    .from('academy_chapter_progress')
    .select('*')
    .eq('user_id', profile.userId)
    .eq('chapter_id', chapterId)
    .maybeSingle();

  if (profile.role === 'student') {
    const unlocked = Number(progress?.read_percent || 0) >= Number(chapter.minimum_read_percent)
      && Number(progress?.active_seconds || 0) >= Number(chapter.minimum_read_seconds);
    if (!unlocked && progress?.status !== 'passed') {
      return NextResponse.json({ error: 'Terminez la lecture du chapitre avant le quiz.' }, { status: 403 });
    }
  }

  const { count: previousAttempts } = await supabase
    .from('academy_quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.userId)
    .eq('chapter_id', chapterId);
  const attemptNumber = Number(previousAttempts || 0) + 1;
  if (attemptNumber > 3) return NextResponse.json({ error: 'Les 3 tentatives ont été utilisées.' }, { status: 429 });

  const { data: questions } = await supabase
    .from('academy_quiz_questions')
    .select('id,position')
    .eq('chapter_id', chapterId)
    .eq('is_active', true)
    .order('position');
  const questionRows = Array.isArray(questions) ? questions : [];
  if (!questionRows.length) return NextResponse.json({ error: 'Quiz indisponible.' }, { status: 409 });

  const questionIds = questionRows.map((question: any) => String(question.id));
  const { data: keys } = await supabase
    .from('academy_quiz_keys')
    .select('question_id,correct_choice,explanation')
    .in('question_id', questionIds);
  const keyMap = new Map((keys || []).map((item: any) => [String(item.question_id), item]));
  const answerMap = new Map(answers.map((item) => [String(item.questionId), item]));

  let correct = 0;
  const graded = questionRows.map((question: any) => {
    const questionId = String(question.id);
    const submitted = answerMap.get(questionId);
    const key = keyMap.get(questionId) as any;
    const selected = submitted?.choice ? String(submitted.choice).toUpperCase() : null;
    const isCorrect = Boolean(key && selected === String(key.correct_choice));
    if (isCorrect) correct += 1;
    return {
      questionId,
      selectedChoice: selected,
      correctChoice: key ? String(key.correct_choice) : null,
      isCorrect,
      explanation: key ? String(key.explanation) : '',
      responseMs: Math.max(0, Math.round(Number(submitted?.responseMs || 0))) || null,
    };
  });

  const score = Math.round((correct / questionRows.length) * 10000) / 100;
  const passed = score >= Number(chapter.pass_score || 70);
  const now = new Date().toISOString();

  const { data: attempt, error: attemptError } = await supabase
    .from('academy_quiz_attempts')
    .insert({ user_id: profile.userId, chapter_id: chapterId, attempt_number: attemptNumber, score, passed, incident_count: incidentCount, submitted_at: now })
    .select('id')
    .single();
  if (attemptError || !attempt) return NextResponse.json({ error: 'Impossible d’enregistrer la tentative.' }, { status: 500 });

  const answerRows = graded.map((item) => ({
    attempt_id: attempt.id,
    question_id: item.questionId,
    selected_choice: item.selectedChoice,
    is_correct: item.isCorrect,
    response_ms: item.responseMs,
  }));
  const { error: answersError } = await supabase.from('academy_quiz_answers').insert(answerRows);
  if (answersError) return NextResponse.json({ error: 'Impossible d’enregistrer les réponses.' }, { status: 500 });

  const bestScore = Math.max(Number(progress?.best_score || 0), score);
  const { error: progressError } = await supabase.from('academy_chapter_progress').upsert({
    user_id: profile.userId,
    chapter_id: chapterId,
    read_percent: Math.max(90, Number(progress?.read_percent || 0)),
    active_seconds: Math.max(60, Number(progress?.active_seconds || 0)),
    status: passed || progress?.status === 'passed' ? 'passed' : 'quiz_unlocked',
    best_score: bestScore,
    attempts_count: attemptNumber,
    started_at: progress?.started_at || now,
    completed_at: passed ? (progress?.completed_at || now) : progress?.completed_at || null,
    updated_at: now,
  }, { onConflict: 'user_id,chapter_id' });
  if (progressError) return NextResponse.json({ error: 'Score enregistré, mais progression non synchronisée.' }, { status: 500 });

  if (passed) {
    const { data: moduleChapters } = await supabase.from('academy_chapters').select('id').eq('module_id', chapter.module_id).eq('is_active', true);
    const moduleIds = (moduleChapters || []).map((item: any) => String(item.id));
    const { data: moduleProgress } = moduleIds.length
      ? await supabase.from('academy_chapter_progress').select('chapter_id,status').eq('user_id', profile.userId).in('chapter_id', moduleIds)
      : { data: [] };
    const passedSet = new Set((moduleProgress || []).filter((item: any) => item.status === 'passed').map((item: any) => String(item.chapter_id)));
    if (moduleIds.length && moduleIds.every((id: string) => passedSet.has(id))) {
      const { data: existingCertificate } = await supabase.from('academy_certificates').select('id').eq('user_id', profile.userId).eq('module_id', chapter.module_id).eq('certificate_type', 'module').maybeSingle();
      if (!existingCertificate) {
        const certificateNumber = `PMM-${new Date().getUTCFullYear()}-${String(chapter.module_id).slice(0, 6).toUpperCase()}-${String(profile.userId).slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        await supabase.from('academy_certificates').insert({ user_id: profile.userId, module_id: chapter.module_id, certificate_type: 'module', certificate_number: certificateNumber, metadata: { score: bestScore } });
      }
    }
  }

  return NextResponse.json({
    ok: true,
    score,
    passed,
    passScore: Number(chapter.pass_score || 70),
    attemptNumber,
    attemptsRemaining: Math.max(0, 3 - attemptNumber),
    correct,
    total: questionRows.length,
    review: graded.map(({ questionId, correctChoice, isCorrect, explanation }) => ({ questionId, correctChoice, isCorrect, explanation })),
  });
}
