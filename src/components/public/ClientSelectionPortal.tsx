'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Check, Heart, Loader2, X } from 'lucide-react';

type Talent = { itemId: string; modelId: string; name: string; imageUrl: string | null; location: string | null; gender: string | null; heightCm: number | null; chestCm: number | null; waistCm: number | null; hipsCm: number | null; shoeSize: string | null; categories: string[]; decision: string; comment: string };
const decisions = [
  { value: 'favorite', label: 'Favori', icon: Heart },
  { value: 'shortlist', label: 'Shortlist', icon: Check },
  { value: 'rejected', label: 'Refuser', icon: X },
] as const;

export default function ClientSelectionPortal({ token, initialTalents }: { token: string; initialTalents: Talent[] }) {
  const [talents,setTalents] = useState(initialTalents); const [busy,setBusy] = useState(''); const [error,setError] = useState('');
  const update = async (talent: Talent, decision: string, comment = talent.comment) => {
    setBusy(talent.itemId); setError('');
    try {
      const response = await fetch(`/api/selections/${encodeURIComponent(token)}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ itemId:talent.itemId, decision, comment }) });
      const result = await response.json().catch(()=>({})); if(!response.ok) throw new Error(result.error || 'Mise à jour impossible.');
      setTalents((rows)=>rows.map((row)=>row.itemId===talent.itemId?{...row,decision,comment}:row));
    } catch(cause) { setError(cause instanceof Error ? cause.message : 'Mise à jour impossible.'); } finally { setBusy(''); }
  };
  return <div>{error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{talents.map((talent)=><article key={talent.itemId} className="overflow-hidden rounded-[1.7rem] border border-pm-ink/10 bg-white shadow-[0_20px_55px_rgba(70,40,35,.08)]"><div className="relative aspect-[4/5] bg-pm-peach"><Image src={talent.imageUrl || '/logo.svg'} alt={talent.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover"/><span className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-[9px] font-black uppercase ${talent.decision==='favorite'?'bg-rose-600 text-white':talent.decision==='shortlist'?'bg-emerald-600 text-white':talent.decision==='rejected'?'bg-stone-800 text-white':'bg-white/90 text-pm-ink'}`}>{talent.decision==='pending'?'À décider':talent.decision}</span></div><div className="p-5"><h2 className="font-playfair text-2xl font-bold">{talent.name}</h2><p className="mt-1 text-xs text-pm-ink/45">{[talent.gender,talent.location].filter(Boolean).join(' · ')}</p><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-pm-ink/60"><span>Taille <b>{talent.heightCm ? `${talent.heightCm} cm` : '—'}</b></span><span>Pointure <b>{talent.shoeSize || '—'}</b></span><span>Poitrine <b>{talent.chestCm || '—'}</b></span><span>Taille <b>{talent.waistCm || '—'}</b></span><span>Hanches <b>{talent.hipsCm || '—'}</b></span></div><div className="mt-4 flex flex-wrap gap-1.5">{talent.categories.slice(0,4).map((category)=><span key={category} className="rounded-full bg-pm-peach px-2.5 py-1 text-[9px] font-bold text-pm-wine">{category}</span>)}</div><div className="mt-5 grid grid-cols-3 gap-2">{decisions.map(({value,label,icon:Icon})=><button key={value} type="button" disabled={busy===talent.itemId} onClick={()=>void update(talent,value)} className={`inline-flex min-h-10 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-[9px] font-black uppercase ${talent.decision===value?'border-pm-wine bg-pm-wine text-white':'border-pm-ink/10 bg-pm-ivory text-pm-ink/60'}`}>{busy===talent.itemId?<Loader2 size={14} className="animate-spin"/>:<Icon size={14}/>} {label}</button>)}</div><label className="mt-4 block"><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.08em] text-pm-ink/45">Commentaire</span><textarea defaultValue={talent.comment} onBlur={(event)=>{const value=event.currentTarget.value.trim();if(value!==talent.comment) void update(talent,talent.decision,value);}} rows={3} maxLength={800} className="w-full resize-y rounded-xl border border-pm-ink/10 bg-pm-ivory p-3 text-sm outline-none focus:border-pm-coral" placeholder="Votre retour sur ce profil…"/></label><Link href={`/mannequins/${talent.modelId}`} target="_blank" className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-pm-ink/10 text-xs font-bold">Voir le profil complet</Link></div></article>)}</div></div>;
}
