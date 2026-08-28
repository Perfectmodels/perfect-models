'use client';

import { useState } from 'react';

export default function CourseProgressButton({ courseId, initialProgress }: { courseId: string; initialProgress: number }) {
  const [progress, setProgress] = useState(initialProgress);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const completed = progress >= 100;

  const complete = async () => {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/classroom/progress', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, progress: 100, percent: 100, completed: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Progression non enregistrée.');
      setProgress(100);
      setMessage('Cours terminé — votre progression est enregistrée.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Progression non enregistrée.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[1.7rem] bg-pm-ink p-5 text-white">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-gold-light">Votre progression</p><p className="mt-2 font-playfair text-4xl font-semibold">{progress}%</p></div>
        <span className="text-2xl" aria-hidden="true">{completed ? '✓' : '↗'}</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-pm-coral transition-all" style={{ width: `${progress}%` }} /></div>
      <button type="button" disabled={busy || completed} onClick={() => void complete()} className="mt-5 w-full rounded-full bg-pm-coral px-5 py-3 text-[9px] font-black uppercase tracking-[.16em] text-white transition hover:bg-pm-wine disabled:cursor-default disabled:bg-white/15 disabled:text-white/55">
        {busy ? 'Enregistrement…' : completed ? 'Cours terminé' : 'Marquer comme terminé'}
      </button>
      {message && <p className="mt-3 text-xs leading-5 text-white/65" role="status">{message}</p>}
    </div>
  );
}
