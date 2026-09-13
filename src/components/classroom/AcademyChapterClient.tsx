'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Question = {
  id: string;
  question_type: string;
  prompt: string;
  choices: Record<string, string>;
  difficulty: number;
  position: number;
};

type Progress = {
  read_percent?: number;
  active_seconds?: number;
  status?: string;
  best_score?: number | null;
  attempts_count?: number;
};

type ReviewItem = { questionId: string; correctChoice: string | null; isCorrect: boolean; explanation: string };

type Props = {
  chapterId: string;
  questions: Question[];
  initialProgress?: Progress | null;
  minimumReadPercent: number;
  minimumReadSeconds: number;
  passScore: number;
  supervision?: boolean;
};

export default function AcademyChapterClient({
  chapterId,
  questions,
  initialProgress,
  minimumReadPercent,
  minimumReadSeconds,
  passScore,
  supervision = false,
}: Props) {
  const [readPercent, setReadPercent] = useState(Number(initialProgress?.read_percent || 0));
  const [activeSeconds, setActiveSeconds] = useState(Number(initialProgress?.active_seconds || 0));
  const [status, setStatus] = useState(String(initialProgress?.status || 'not_started'));
  const [attempts, setAttempts] = useState(Number(initialProgress?.attempts_count || 0));
  const [bestScore, setBestScore] = useState<number | null>(initialProgress?.best_score == null ? null : Number(initialProgress.best_score));
  const [quizActive, setQuizActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remaining, setRemaining] = useState(20);
  const [answers, setAnswers] = useState<Record<string, { choice: string | null; responseMs: number }>>({});
  const [incidents, setIncidents] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; attemptsRemaining: number; review: ReviewItem[] } | null>(null);
  const [error, setError] = useState('');
  const questionStartedAt = useRef(Date.now());
  const lastSaved = useRef({ readPercent, activeSeconds });

  const unlocked = supervision || status === 'passed' || (readPercent >= minimumReadPercent && activeSeconds >= minimumReadSeconds);
  const current = questions[questionIndex];
  const reviewMap = useMemo(() => new Map((result?.review || []).map((item) => [item.questionId, item])), [result]);

  const persistProgress = useCallback(async (nextRead: number, nextSeconds: number) => {
    if (supervision) return;
    if (nextRead <= lastSaved.current.readPercent && nextSeconds <= lastSaved.current.activeSeconds) return;
    lastSaved.current = { readPercent: nextRead, activeSeconds: nextSeconds };
    try {
      const response = await fetch('/api/academy/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, readPercent: nextRead, activeSeconds: nextSeconds }),
      });
      const data = await response.json();
      if (response.ok) setStatus(String(data.status || status));
    } catch {
      // The next activity tick will retry; reading is not interrupted by a network hiccup.
    }
  }, [chapterId, status, supervision]);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const available = Math.max(1, root.scrollHeight - window.innerHeight);
      const value = Math.max(0, Math.min(100, Math.round((window.scrollY / available) * 100)));
      setReadPercent((previous) => Math.max(previous, value));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (quizActive || status === 'passed') return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setActiveSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [quizActive, status]);

  useEffect(() => {
    if (supervision) return;
    if (activeSeconds % 15 === 0 || readPercent >= minimumReadPercent) {
      void persistProgress(readPercent, activeSeconds);
    }
  }, [activeSeconds, readPercent, minimumReadPercent, persistProgress, supervision]);

  const submitQuiz = useCallback(async (forcedIncidents?: number) => {
    if (submitting || !quizActive) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = questions.map((question) => ({
        questionId: question.id,
        choice: answers[question.id]?.choice ?? null,
        responseMs: answers[question.id]?.responseMs ?? 0,
      }));
      const response = await fetch('/api/academy/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, answers: payload, incidentCount: forcedIncidents ?? incidents }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Impossible de corriger le quiz.');
      setResult({ score: Number(data.score), passed: Boolean(data.passed), attemptsRemaining: Number(data.attemptsRemaining), review: data.review || [] });
      setAttempts(Number(data.attemptNumber));
      setBestScore((value) => Math.max(Number(value || 0), Number(data.score || 0)));
      if (data.passed) setStatus('passed');
      setQuizActive(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur pendant la correction.');
    } finally {
      setSubmitting(false);
    }
  }, [answers, chapterId, incidents, questions, quizActive, submitting]);

  useEffect(() => {
    if (!quizActive) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') setIncidents((value) => Math.min(3, value + 1));
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [quizActive]);

  useEffect(() => {
    if (quizActive && incidents >= 3) void submitQuiz(3);
  }, [incidents, quizActive, submitQuiz]);

  const advance = useCallback(() => {
    if (!current) return;
    if (!answers[current.id]) {
      setAnswers((value) => ({ ...value, [current.id]: { choice: null, responseMs: 20000 } }));
    }
    if (questionIndex >= questions.length - 1) {
      window.setTimeout(() => void submitQuiz(), 0);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setRemaining(20);
    questionStartedAt.current = Date.now();
  }, [answers, current, questionIndex, questions.length, submitQuiz]);

  useEffect(() => {
    if (!quizActive || !current || submitting) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          window.setTimeout(advance, 0);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [advance, current, quizActive, submitting]);

  const choose = (choice: string) => {
    if (!current) return;
    setAnswers((value) => ({ ...value, [current.id]: { choice, responseMs: Math.min(20000, Date.now() - questionStartedAt.current) } }));
  };

  const startQuiz = () => {
    if (!unlocked || attempts >= 3 || !questions.length) return;
    setAnswers({});
    setIncidents(0);
    setQuestionIndex(0);
    setRemaining(20);
    setResult(null);
    setError('');
    questionStartedAt.current = Date.now();
    setQuizActive(true);
  };

  return (
    <section className="rounded-[2rem] bg-pm-ink p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-gold-light">Validation du chapitre</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Test de raisonnement & maîtrise</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">30 questions · 20 secondes par question · 3 tentatives maximum · validation à {passScore}%.</p></div>
        <div className="grid grid-cols-2 gap-2 text-center"><Metric value={`${readPercent}%`} label="Lecture" /><Metric value={`${activeSeconds}s`} label="Temps actif" /></div>
      </div>

      {!quizActive && !result && (
        <div className="mt-7 rounded-[1.5rem] bg-white/[.06] p-5">
          <p className="text-sm leading-6 text-white/65">{unlocked ? 'Le quiz est disponible.' : `Continuez le chapitre : ${minimumReadPercent}% de lecture et ${minimumReadSeconds} secondes actives sont nécessaires.`}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={startQuiz} disabled={!unlocked || attempts >= 3} className="rounded-full bg-pm-coral px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] disabled:cursor-not-allowed disabled:opacity-35">Commencer le quiz</button><span className="text-[9px] font-black uppercase tracking-[.14em] text-white/40">Tentatives {attempts}/3{bestScore != null ? ` · meilleur score ${Math.round(bestScore)}%` : ''}</span></div>
        </div>
      )}

      {quizActive && current && (
        <div className="mt-7 rounded-[1.6rem] bg-white p-6 text-pm-ink">
          <div className="flex items-center justify-between gap-4"><span className="text-[9px] font-black uppercase tracking-[.16em] text-pm-coral">Question {questionIndex + 1}/{questions.length} · {current.question_type}</span><span className={`font-playfair text-3xl font-semibold ${remaining <= 5 ? 'text-pm-coral' : 'text-pm-wine'}`}>{remaining}s</span></div>
          <h3 className="mt-6 text-lg font-semibold leading-7">{current.prompt}</h3>
          <div className="mt-6 grid gap-3">{Object.entries(current.choices || {}).map(([choice, label]) => <button key={choice} type="button" onClick={() => choose(choice)} className={`rounded-[1.2rem] border p-4 text-left text-sm leading-6 transition ${answers[current.id]?.choice === choice ? 'border-pm-coral bg-pm-peach' : 'border-pm-ink/10 bg-pm-paper hover:border-pm-coral/40'}`}><strong className="mr-3 text-pm-coral">{choice}</strong>{label}</button>)}</div>
          <div className="mt-6 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[.13em] text-pm-ink/35">Incidents {incidents}/3</span><button type="button" onClick={advance} disabled={submitting} className="rounded-full bg-pm-wine px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] text-white">{questionIndex === questions.length - 1 ? 'Terminer' : 'Question suivante'}</button></div>
        </div>
      )}

      {result && (
        <div className="mt-7 rounded-[1.6rem] bg-white p-6 text-pm-ink">
          <p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-coral">Résultat</p><div className="mt-3 flex flex-wrap items-end gap-5"><p className="font-playfair text-6xl font-semibold">{Math.round(result.score)}%</p><p className={`mb-2 text-sm font-bold ${result.passed ? 'text-pm-teal' : 'text-pm-coral'}`}>{result.passed ? 'Chapitre validé' : `À retravailler · ${result.attemptsRemaining} tentative(s) restante(s)`}</p></div>
          <div className="mt-6 space-y-3">{questions.map((question) => { const review = reviewMap.get(question.id); if (!review) return null; return <div key={question.id} className={`rounded-[1.1rem] p-4 ${review.isCorrect ? 'bg-pm-sage' : 'bg-pm-peach'}`}><p className="text-xs font-bold">Question {question.position} · {review.isCorrect ? 'Correct' : `Réponse attendue : ${review.correctChoice || '—'}`}</p><p className="mt-2 text-xs leading-5 text-pm-ink/60">{review.explanation}</p></div>; })}</div>
          {!result.passed && result.attemptsRemaining > 0 && <button type="button" onClick={startQuiz} className="mt-6 rounded-full bg-pm-coral px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] text-white">Nouvelle tentative</button>}
        </div>
      )}

      {error && <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="min-w-24 rounded-[1.2rem] bg-white/10 px-4 py-3"><p className="font-playfair text-2xl font-semibold">{value}</p><p className="mt-1 text-[7px] font-black uppercase tracking-[.15em] text-white/45">{label}</p></div>;
}
