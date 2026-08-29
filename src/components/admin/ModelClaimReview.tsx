'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck, UserX } from 'lucide-react';

type Claim = { id: string; name: string; username: string | null; image_url: string | null; claim_status: string | null; raw_data: Record<string, any> | null };

export default function ModelClaimReview({ initialClaims }: { initialClaims: Claim[] }) {
  const [claims, setClaims] = useState(initialClaims);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const act = async (modelId: string, action: 'approve' | 'release') => {
    setBusy(`${action}:${modelId}`); setNotice(''); setError('');
    try {
      const response = await fetch('/api/admin/model-claims', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ modelId, action }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Action impossible.');
      setClaims((current) => current.filter((claim) => claim.id !== modelId));
      setNotice(action === 'approve' ? 'Le compte mannequin est maintenant rattaché et actif.' : 'La revendication a été refusée et le profil est de nouveau disponible.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Action impossible.'); }
    finally { setBusy(''); }
  };

  return <section className="mb-7 rounded-[2rem] border border-pm-ink/10 bg-white p-6 shadow-[0_18px_55px_rgba(91,46,37,.06)] sm:p-8">
    <div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pm-peach text-pm-wine"><ShieldCheck size={22}/></div><div><p className="text-xs font-extrabold uppercase tracking-[.12em] text-pm-coral">Revendications de profils</p><h2 className="mt-2 font-playfair text-3xl font-bold">Validations agence</h2><p className="mt-2 text-sm leading-6 text-pm-ink/55">Ces mannequins ont confirmé leur adresse e-mail mais leur ancien dossier ne permettait pas une vérification automatique suffisamment forte.</p></div></div>
    {notice && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
    <div className="mt-6 grid gap-3">{claims.length ? claims.map((claim) => { const pending = (claim.raw_data?.pendingClaim || {}) as Record<string, any>; return <article key={claim.id} className="grid gap-4 rounded-2xl border border-pm-ink/10 bg-pm-ivory p-4 lg:grid-cols-[1fr_auto] lg:items-center"><div><h3 className="font-playfair text-2xl font-bold">{claim.name}</h3><p className="mt-1 text-xs font-semibold text-pm-ink/45">{claim.username || claim.id}</p><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-pm-ink/60"><span>{pending.email || 'E-mail non renseigné'}</span><span>{pending.phone || 'Téléphone non renseigné'}</span><span>{pending.birthDate || 'Date de naissance non renseignée'}</span><span>{pending.city || 'Ville non renseignée'}</span></div></div><div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(busy)} onClick={()=>void act(claim.id,'approve')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-700 px-5 text-xs font-extrabold uppercase tracking-[.08em] text-white disabled:opacity-50">{busy===`approve:${claim.id}`?<Loader2 size={15} className="animate-spin"/>:<CheckCircle2 size={15}/>} Valider</button><button type="button" disabled={Boolean(busy)} onClick={()=>void act(claim.id,'release')} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold uppercase tracking-[.08em] text-red-700 disabled:opacity-50">{busy===`release:${claim.id}`?<Loader2 size={15} className="animate-spin"/>:<UserX size={15}/>} Refuser & libérer</button></div></article>; }) : <p className="rounded-2xl bg-pm-ivory p-5 text-sm text-pm-ink/50">Aucune revendication n’attend actuellement une validation manuelle.</p>}</div>
  </section>;
}
