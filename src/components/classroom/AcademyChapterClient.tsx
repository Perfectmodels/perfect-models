'use client';

import Link from 'next/link';
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

type Answer = { choice: string | null; responseMs: number };
type ReviewItem = { questionId: string; correctChoice: string | null; isCorrect: boolean; explanation: string };

type Props = {
  chapterId: string;
  questions: Question[];
  initialProgress?: Progress | null;
  minimumReadPercent: number;
  minimumReadSeconds: number;
  passScore: number;
  supervision?: boolean;
  nextHref?: string | null;
};

export default function AcademyChapterClient({ chapterId, questions, initialProgress, minimumReadPercent, minimumReadSeconds, passScore, supervision = false, nextHref = null }: Props) {
  const [readPercent, setReadPercent] = useState(Number(initialProgress?.read_percent || 0));
  const [activeSeconds, setActiveSeconds] = useState(Number(initialProgress?.active_seconds || 0));
  const [status, setStatus] = useState(String(initialProgress?.status || 'not_started'));
  const [attempts, setAttempts] = useState(Number(initialProgress?.attempts_count || 0));
  const [bestScore, setBestScore] = useState<number | null>(initialProgress?.best_score == null ? null : Number(initialProgress.best_score));
  const [quizActive, setQuizActive] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [incidents, setIncidents] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean; attemptsRemaining: number; review: ReviewItem[] } | null>(null);
  const [error, setError] = useState('');
  const questionStartedAt = useRef(Date.now());
  const lastIncidentAt = useRef(0);
  const autoStarted = useRef(false);
  const lastSync = useRef({ readPercent: Number(initialProgress?.read_percent || 0), activeSeconds: Number(initialProgress?.active_seconds || 0) });

  const unlocked = supervision || status === 'passed' || (readPercent >= minimumReadPercent && activeSeconds >= minimumReadSeconds);
  const current = questions[questionIndex];
  const reviewMap = useMemo(() => new Map((result?.review || []).map((item) => [item.questionId, item])), [result]);

  const syncProgress = useCallback(async (force = false) => {
    if (supervision || status === 'passed') return;
    const changed = readPercent > lastSync.current.readPercent || activeSeconds > lastSync.current.activeSeconds;
    if (!changed && !force) return;
    try {
      const response = await fetch('/api/academy/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, readPercent, activeSeconds }),
      });
      const data = await response.json();
      if (response.ok) {
        lastSync.current = { readPercent: Number(data.readPercent || readPercent), activeSeconds: Number(data.activeSeconds || activeSeconds) };
        setStatus(String(data.status || status));
      }
    } catch {
      // La prochaine synchronisation réessaiera automatiquement.
    }
  }, [activeSeconds, chapterId, readPercent, status, supervision]);

  const startQuiz = useCallback(() => {
    if (!unlocked || attempts >= 3 || !questions.length || status === 'passed') return;
    setAnswers({});
    setIncidents(0);
    setQuestionIndex(0);
    setSecondsLeft(20);
    setResult(null);
    setError('');
    questionStartedAt.current = Date.now();
    setQuizActive(true);
  }, [attempts, questions.length, status, unlocked]);

  useEffect(() => {
    const updateReadPercent = () => {
      const root = document.documentElement;
      const scrollable = Math.max(1, root.scrollHeight - window.innerHeight);
      const percent = Math.max(0, Math.min(100, Math.round((window.scrollY / scrollable) * 100)));
      setReadPercent((value) => Math.max(value, percent));
    };
    updateReadPercent();
    window.addEventListener('scroll', updateReadPercent, { passive: true });
    return () => window.removeEventListener('scroll', updateReadPercent);
  }, []);

  useEffect(() => {
    if (quizActive || status === 'passed' || supervision) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && document.hasFocus()) setActiveSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [quizActive, status, supervision]);

  useEffect(() => {
    if (supervision || quizActive || status === 'passed') return;
    if (activeSeconds > 0 && activeSeconds % 15 === 0) void syncProgress();
  }, [activeSeconds, quizActive, status, supervision, syncProgress]);

  useEffect(() => {
    if (!supervision && status !== 'passed' && readPercent >= minimumReadPercent && activeSeconds >= minimumReadSeconds) {
      void syncProgress(true);
    }
  }, [activeSeconds, minimumReadPercent, minimumReadSeconds, readPercent, status, supervision, syncProgress]);

  useEffect(() => {
    if (supervision || quizActive || result || status === 'passed' || attempts >= 3 || !questions.length || !unlocked || autoStarted.current) return;
    autoStarted.current = true;
    void syncProgress(true).finally(() => {
      window.setTimeout(startQuiz, 250);
    });
  }, [attempts, questions.length, quizActive, result, startQuiz, status, supervision, syncProgress, unlocked]);

  const submitQuiz = useCallback(async (answerSet: Record<string, Answer>, forcedIncidents?: number) => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const payload = questions.map((question) => ({ questionId: question.id, choice: answerSet[question.id]?.choice ?? null, responseMs: answerSet[question.id]?.responseMs ?? 0 }));
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
  }, [chapterId, incidents, questions, submitting]);

  const advance = useCallback(() => {
    if (!current || submitting) return;
    const nextAnswers = answers[current.id]
      ? answers
      : { ...answers, [current.id]: { choice: null, responseMs: 20000 } };
    if (!answers[current.id]) setAnswers(nextAnswers);
    if (questionIndex >= questions.length - 1) {
      void submitQuiz(nextAnswers);
      return;
    }
    setQuestionIndex((value) => value + 1);
    setSecondsLeft(20);
    questionStartedAt.current = Date.now();
  }, [answers, current, questionIndex, questions.length, submitQuiz, submitting]);

  useEffect(() => {
    if (!quizActive || !current || submitting) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
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

  useEffect(() => {
    if (!quizActive) return;
    const recordIncident = () => {
      const now = Date.now();
      if (now - lastIncidentAt.current < 900) return;
      lastIncidentAt.current = now;
      setIncidents((value) => Math.min(3, value + 1));
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') recordIncident(); };
    const onBlur = () => recordIncident();
    const onRestrictedAction = (event: Event) => { event.preventDefault(); recordIncident(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', onRestrictedAction);
    document.addEventListener('paste', onRestrictedAction);
    document.addEventListener('contextmenu', onRestrictedAction);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onRestrictedAction);
      document.removeEventListener('paste', onRestrictedAction);
      document.removeEventListener('contextmenu', onRestrictedAction);
    };
  }, [quizActive]);

  useEffect(() => {
    if (quizActive && incidents >= 3 && !submitting) void submitQuiz(answers, 3);
  }, [answers, incidents, quizActive, submitQuiz, submitting]);

  const choose = (choice: string) => {
    if (!current || submitting) return;
    setAnswers((value) => ({ ...value, [current.id]: { choice, responseMs: Math.min(20000, Date.now() - questionStartedAt.current) } }));
  };

  return (
    <section className="rounded-[2rem] bg-pm-ink p-6 text-white sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-gold-light">Validation automatique du chapitre</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Test de raisonnement & maîtrise</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">La lecture seule ne valide jamais un chapitre. Dès que la lecture requise est atteinte, le quiz démarre automatiquement. 30 questions · 20 secondes par question · 3 tentatives · validation à {passScore}%.</p></div>
        <div className="grid grid-cols-2 gap-2 text-center"><Metric value={`${readPercent}%`} label="Lecture" /><Metric value={`${activeSeconds}s`} label="Temps actif" /></div>
      </div>

      {!quizActive && !result && status !== 'passed' && <div className="mt-7 rounded-[1.5rem] bg-white/[.06] p-5"><p className="text-sm leading-6 text-white/65">{unlocked ? 'Lecture terminée. Préparation du quiz…' : `Continuez la lecture : ${minimumReadPercent}% de lecture et ${minimumReadSeconds} secondes actives sont nécessaires.`}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-pm-gold-light" style={{ width: `${Math.min(100, readPercent)}%` }} /></div><p className="mt-3 text-[9px] font-black uppercase tracking-[.14em] text-white/40">Tentatives {attempts}/3{bestScore != null ? ` · meilleur score ${Math.round(bestScore)}%` : ''}</p></div>}

      {quizActive && current && <div className="mt-7 rounded-[1.6rem] bg-white p-6 text-pm-ink"><div className="mb-4 rounded-xl bg-pm-peach p-3 text-xs font-semibold text-pm-wine">Mode anti-fraude actif : changement d’onglet, perte de focus, copier/coller ou menu contextuel comptent comme incident. À 3 incidents, la tentative est soumise automatiquement.</div><div className="flex items-center justify-between gap-4"><span className="text-[9px] font-black uppercase tracking-[.16em] text-pm-coral">Question {questionIndex + 1}/{questions.length} · {current.question_type}</span><span className={`font-playfair text-3xl font-semibold ${secondsLeft <= 5 ? 'text-pm-coral' : 'text-pm-wine'}`}>{secondsLeft}s</span></div><h3 className="mt-6 text-lg font-semibold leading-7">{current.prompt}</h3><div className="mt-6 grid gap-3">{Object.entries(current.choices || {}).map(([choice, label]) => <button key={choice} type="button" onClick={() => choose(choice)} className={`rounded-[1.2rem] border p-4 text-left text-sm leading-6 transition ${answers[current.id]?.choice === choice ? 'border-pm-coral bg-pm-peach' : 'border-pm-ink/10 bg-pm-paper hover:border-pm-coral/40'}`}><strong className="mr-3 text-pm-coral">{choice}</strong>{label}</button>)}</div><div className="mt-6 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-[.13em] text-pm-ink/35">Incidents {incidents}/3</span><button type="button" onClick={advance} disabled={submitting} className="rounded-full bg-pm-wine px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] text-white">{questionIndex === questions.length - 1 ? 'Terminer' : 'Question suivante'}</button></div></div>}

      {result && <div className="mt-7 rounded-[1.6rem] bg-white p-6 text-pm-ink"><p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-coral">Résultat</p><div className="mt-3 flex flex-wrap items-end gap-5"><p className="font-playfair text-6xl font-semibold">{Math.round(result.score)}%</p><p className={`mb-2 text-sm font-bold ${result.passed ? 'text-pm-teal' : 'text-pm-coral'}`}>{result.passed ? 'Chapitre validé · chapitre suivant déverrouillé' : `Chapitre non validé · ${result.attemptsRemaining} tentative(s) restante(s)`}</p></div><div className="mt-6 space-y-3">{questions.map((question) => { const review = reviewMap.get(question.id); if (!review) return null; return <div key={question.id} className={`rounded-[1.1rem] p-4 ${review.isCorrect ? 'bg-pm-sage' : 'bg-pm-peach'}`}><p className="text-xs font-bold">Question {question.position} · {review.isCorrect ? 'Correct' : `Réponse attendue : ${review.correctChoice || '—'}`}</p><p className="mt-2 text-xs leading-5 text-pm-ink/60">{review.explanation}</p></div>; })}</div><div className="mt-6 flex flex-wrap gap-3">{result.passed && nextHref && <Link href={nextHref} className="rounded-full bg-pm-teal px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] text-white">Passer au chapitre suivant →</Link>}{!result.passed && result.attemptsRemaining > 0 && <button type="button" onClick={() => { autoStarted.current = true; startQuiz(); }} className="rounded-full bg-pm-coral px-5 py-3 text-[9px] font-black uppercase tracking-[.14em] text-white">Nouvelle tentative</button>}</div></div>}

      {status === 'passed' && !result && <div className="mt-7 rounded-[1.5rem] bg-pm-sage p-5 text-pm-teal"><p className="text-sm font-bold">Chapitre déjà validé par quiz.</p>{nextHref && <Link href={nextHref} className="mt-4 inline-flex text-xs font-black uppercase tracking-[.12em] underline underline-offset-4">Continuer →</Link>}</div>}
      {error && <p className="mt-4 rounded-xl bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="min-w-24 rounded-[1.2rem] bg-white/10 px-4 py-3"><p className="font-playfair text-2xl font-semibold">{value}</p><p className="mt-1 text-[7px] font-black uppercase tracking-[.15em] text-white/45">{label}</p></div>;
}
