'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, Loader2, Plus, Sparkles } from 'lucide-react';

type Candidate = { id: string; name: string; imageUrl: string | null; gender: string | null; age: number | null; heightCm: number | null; location: string | null; categories: string[]; hairColor: string | null; eyeColor: string | null; score: number; unavailable: boolean; reasons: string[]; alreadyAdded: boolean };

export default function CastingMatchingBoard({ castingId, candidates }: { castingId: string; candidates: Candidate[] }) {
  const [added, setAdded] = useState(() => new Set(candidates.filter((candidate) => candidate.alreadyAdded).map((candidate) => candidate.id)));
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const invite = async (candidate: Candidate) => {
    setBusy(candidate.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/castings/${encodeURIComponent(castingId)}/talents`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modelId: candidate.id, matchScore: candidate.score }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Ajout impossible.');
      setAdded((current) => new Set([...current, candidate.id]));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ajout impossible.');
    } finally {
      setBusy('');
    }
  };

  return <div className="min-w-0 space-y-4">
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
    <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {candidates.map((candidate) => <article key={candidate.id} className={`min-w-0 overflow-hidden rounded-[1.7rem] border bg-white ${candidate.unavailable ? 'border-amber-200' : 'border-pm-ink/10'}`}>
        <div className="grid min-w-0 sm:grid-cols-[7rem_minmax(0,1fr)]">
          <div className="relative aspect-[16/9] min-w-0 bg-pm-peach sm:aspect-auto sm:min-h-44"><Image src={candidate.imageUrl || '/logo.svg'} alt={candidate.name} fill sizes="(max-width:640px) 100vw, 112px" className="object-cover"/></div>
          <div className="min-w-0 p-4">
            <div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.12em] text-pm-coral">Match</p><p className="mt-1 font-playfair text-4xl font-semibold">{candidate.score}%</p></div><Sparkles size={18} className="shrink-0 text-pm-gold"/></div>
            <h3 className="mt-3 break-words font-playfair text-xl font-bold">{candidate.name}</h3>
            <p className="mt-1 break-words text-xs leading-5 text-pm-ink/45">{[candidate.gender, candidate.age ? `${candidate.age} ans` : '', candidate.heightCm ? `${candidate.heightCm} cm` : '', candidate.location].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <div className="min-w-0 border-t border-pm-ink/[.07] p-4">
          <div className="flex min-w-0 flex-wrap gap-1.5">{candidate.reasons.slice(0,4).map((reason) => <span key={reason} className="max-w-full break-words rounded-full bg-pm-peach px-2.5 py-1 text-[9px] font-bold text-pm-wine">{reason}</span>)}</div>
          {candidate.unavailable && <p className="mt-3 break-words rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Conflit de disponibilité détecté.</p>}
          <button type="button" disabled={added.has(candidate.id) || Boolean(busy)} onClick={() => void invite(candidate)} className="mt-4 inline-flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-full bg-pm-ink px-4 text-center text-xs font-black uppercase tracking-[.08em] text-white disabled:bg-emerald-700 disabled:opacity-100">{busy === candidate.id ? <Loader2 size={15} className="animate-spin"/> : added.has(candidate.id) ? <Check size={15}/> : <Plus size={15}/>} {added.has(candidate.id) ? 'Ajouté au casting' : 'Inviter ce talent'}</button>
        </div>
      </article>)}
    </div>
  </div>;
}
