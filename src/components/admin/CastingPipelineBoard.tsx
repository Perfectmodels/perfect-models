'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type Item = { id: string; modelId: string; name: string; imageUrl: string | null; stage: string; score: number | null };
const stages = [
  ['invited','Invités'], ['confirmed','Confirmés'], ['attended','Casting effectué'], ['shortlist','Shortlist'], ['callback','Callback'], ['selected','Sélectionnés'], ['booked','Bookés'],
] as const;

export default function CastingPipelineBoard({ castingId, initialItems }: { castingId: string; initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const move = async (item: Item, stage: string) => {
    setBusy(item.id);
    setError('');
    try {
      const response = await fetch(`/api/admin/castings/${encodeURIComponent(castingId)}/talents`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ talentId: item.id, stage }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Mise à jour impossible.');
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, stage } : entry));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible.');
    } finally {
      setBusy('');
    }
  };

  return <div className="min-w-0">
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {stages.map(([key,label]) => {
        const rows = items.filter((item) => item.stage === key);
        return <section key={key} className="min-w-0 rounded-2xl bg-pm-ink/[.035] p-3">
          <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
            <h3 className="min-w-0 break-words text-[10px] font-black uppercase tracking-[.12em] text-pm-wine">{label}</h3>
            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold">{rows.length}</span>
          </div>
          <div className="space-y-3">
            {rows.map((item) => <article key={item.id} className="min-w-0 rounded-xl border border-pm-ink/10 bg-white p-3 shadow-sm">
              <div className="flex min-w-0 gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-pm-peach"><Image src={item.imageUrl || '/logo.svg'} alt="" fill sizes="48px" className="object-cover"/></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.name}</p><p className="mt-1 text-[10px] text-pm-ink/45">Match {item.score == null ? '—' : `${item.score}%`}</p></div>
              </div>
              <select aria-label={`Étape de ${item.name}`} value={item.stage} disabled={busy === item.id} onChange={(event) => void move(item,event.target.value)} className="mt-3 min-h-10 w-full min-w-0 rounded-lg border border-pm-ink/10 bg-pm-ivory px-2 text-xs font-semibold">
                {stages.map(([value,text]) => <option key={value} value={value}>{text}</option>)}
                <option value="rejected">Refusé</option><option value="declined">Décliné</option>
              </select>
              {busy === item.id && <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-pm-ink/45"><Loader2 size={11} className="animate-spin"/>Enregistrement…</p>}
            </article>)}
            {!rows.length && <p className="py-6 text-center text-xs text-pm-ink/35">Vide</p>}
          </div>
        </section>;
      })}
    </div>
  </div>;
}
