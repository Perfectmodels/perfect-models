'use client';

import { useState } from 'react';
import { Check, FileSignature, Loader2, Plus, Trash2, X } from 'lucide-react';

type Availability = { id:string; starts_at:string; ends_at:string; status:string; reason:string|null; source:string };
type CastingInvite = { id:string; castingId:string; title:string; startsAt:string|null; location:string|null; stage:string };
type Contract = { id:string; title:string; contract_type:string; status:string; document_url:string|null; expires_at:string|null; signed_at:string|null };

type Props = {
  modelName: string;
  initialAvailability: Availability[];
  initialCastings: CastingInvite[];
  initialContracts: Contract[];
};

export default function ModelAgencyPortal({ modelName, initialAvailability, initialCastings, initialContracts }: Props) {
  const [availability,setAvailability] = useState(initialAvailability);
  const [castings,setCastings] = useState(initialCastings);
  const [contracts,setContracts] = useState(initialContracts);
  const [busy,setBusy] = useState('');
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [form,setForm] = useState({ startsAt:'', endsAt:'', status:'unavailable', reason:'' });
  const [contractAction,setContractAction] = useState<Contract|null>(null);
  const [contractMode,setContractMode] = useState<'sign'|'decline'>('sign');
  const [signatureName,setSignatureName] = useState('');
  const [accepted,setAccepted] = useState(false);
  const [declineReason,setDeclineReason] = useState('');

  const addAvailability = async (event:React.FormEvent) => {
    event.preventDefault(); setBusy('availability'); setError(''); setNotice('');
    try {
      const response=await fetch('/api/model/availability',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const result=await response.json().catch(()=>({})); if(!response.ok) throw new Error(result.error||'Enregistrement impossible.');
      setAvailability((rows)=>[result.data,...rows]); setForm({startsAt:'',endsAt:'',status:'unavailable',reason:''}); setNotice('Disponibilité transmise à l’agence.');
    } catch(cause){setError(cause instanceof Error?cause.message:'Enregistrement impossible.');} finally{setBusy('');}
  };
  const removeAvailability = async (row:Availability) => {
    setBusy(row.id); setError(''); setNotice('');
    try {
      const response=await fetch(`/api/model/availability?id=${encodeURIComponent(row.id)}`,{method:'DELETE',credentials:'include'});
      const result=await response.json().catch(()=>({})); if(!response.ok) throw new Error(result.error||'Suppression impossible.');
      setAvailability((rows)=>rows.filter((item)=>item.id!==row.id));
    } catch(cause){setError(cause instanceof Error?cause.message:'Suppression impossible.');} finally{setBusy('');}
  };
  const respond = async (invite:CastingInvite,responseValue:'confirmed'|'declined') => {
    setBusy(invite.id); setError(''); setNotice('');
    try {
      const response=await fetch(`/api/model/castings/${encodeURIComponent(invite.id)}/respond`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({response:responseValue})});
      const result=await response.json().catch(()=>({})); if(!response.ok) throw new Error(result.error||'Réponse impossible.');
      setCastings((rows)=>rows.map((item)=>item.id===invite.id?{...item,stage:responseValue}:item)); setNotice(responseValue==='confirmed'?'Participation au casting confirmée.':'Invitation casting refusée.');
    } catch(cause){setError(cause instanceof Error?cause.message:'Réponse impossible.');} finally{setBusy('');}
  };
  const markContractViewed = async (contract:Contract) => {
    if (!['sent','viewed'].includes(contract.status)) return;
    try {
      const response = await fetch(`/api/model/contracts/${encodeURIComponent(contract.id)}/respond`,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'view'})});
      const result=await response.json().catch(()=>({}));
      if(response.ok) setContracts((rows)=>rows.map((item)=>item.id===contract.id?{...item,status:'viewed'}:item));
      else if(result.error) setError(result.error);
    } catch { /* la lecture du document reste possible même si le journal échoue */ }
  };
  const openContract = (contract:Contract, mode:'sign'|'decline'='sign') => {
    setError(''); setNotice(''); setContractAction(contract); setContractMode(mode); setSignatureName(''); setAccepted(false); setDeclineReason('');
    if (contract.document_url) window.open(contract.document_url,'_blank','noopener,noreferrer');
    void markContractViewed(contract);
  };
  const submitContractDecision = async () => {
    if(!contractAction) return;
    setBusy(`contract-${contractAction.id}`); setError(''); setNotice('');
    try {
      const response=await fetch(`/api/model/contracts/${encodeURIComponent(contractAction.id)}/respond`,{
        method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},
        body:JSON.stringify(contractMode==='sign'?{action:'sign',signatureName,acceptedTerms:accepted}:{action:'decline',reason:declineReason}),
      });
      const result=await response.json().catch(()=>({})); if(!response.ok) throw new Error(result.error||'Décision impossible.');
      const nextStatus=contractMode==='sign'?'signed':'cancelled';
      setContracts((rows)=>rows.map((item)=>item.id===contractAction.id?{...item,status:nextStatus,signed_at:contractMode==='sign'?(result.data?.signed_at||new Date().toISOString()):item.signed_at}:item));
      setNotice(contractMode==='sign'?'Contrat signé électroniquement. Une preuve de signature a été enregistrée.':'Refus transmis à l’agence.');
      setContractAction(null);
    } catch(cause){setError(cause instanceof Error?cause.message:'Décision impossible.');} finally{setBusy('');}
  };

  const field='min-h-11 w-full rounded-xl border border-pm-ink/15 bg-white px-3 text-sm outline-none focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10';
  return <div className="space-y-6">
    {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
    {notice&&<p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">{notice}</p>}

    <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-5 sm:p-6"><div><p className="editorial-kicker text-pm-coral">Mes disponibilités</p><h2 className="mt-2 font-playfair text-3xl font-bold">Informer l’agence</h2><p className="mt-2 text-sm leading-6 text-pm-ink/50">Ajoutez vos périodes d’indisponibilité, voyages ou disponibilités particulières. Elles sont prises en compte dans le matching casting.</p></div><form onSubmit={addAvailability} className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5"><label><span className="mb-1.5 block text-xs font-bold">Début</span><input required type="datetime-local" value={form.startsAt} onChange={(e)=>setForm({...form,startsAt:e.target.value})} className={field}/></label><label><span className="mb-1.5 block text-xs font-bold">Fin</span><input required type="datetime-local" min={form.startsAt||undefined} value={form.endsAt} onChange={(e)=>setForm({...form,endsAt:e.target.value})} className={field}/></label><label><span className="mb-1.5 block text-xs font-bold">Statut</span><select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})} className={field}><option value="unavailable">Indisponible</option><option value="travel">Voyage</option><option value="available">Disponible</option><option value="tentative">À confirmer</option></select></label><label><span className="mb-1.5 block text-xs font-bold">Précision</span><input value={form.reason} onChange={(e)=>setForm({...form,reason:e.target.value})} className={field} placeholder="Facultatif"/></label><button disabled={busy==='availability'} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-pm-ink px-5 text-xs font-black uppercase tracking-[.08em] text-white disabled:opacity-50">{busy==='availability'?<Loader2 size={15} className="animate-spin"/>:<Plus size={15}/>} Ajouter</button></form><div className="mt-5 grid gap-2">{availability.map((row)=><div key={row.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-pm-ivory p-3"><span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase text-pm-wine">{row.status}</span><span className="flex-1 text-sm"><b>{new Date(row.starts_at).toLocaleString('fr-FR')}</b> → {new Date(row.ends_at).toLocaleString('fr-FR')} {row.reason?`· ${row.reason}`:''}</span>{row.source==='model'&&<button type="button" disabled={busy===row.id} onClick={()=>void removeAvailability(row)} aria-label="Supprimer cette disponibilité" className="grid h-9 w-9 place-items-center rounded-full text-red-600 hover:bg-red-50">{busy===row.id?<Loader2 size={14} className="animate-spin"/>:<Trash2 size={14}/>}</button>}</div>)}{!availability.length&&<p className="rounded-xl bg-pm-ivory p-4 text-sm text-pm-ink/45">Aucune disponibilité particulière renseignée.</p>}</div></section>

    <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-5 sm:p-6"><p className="editorial-kicker text-pm-coral">Castings</p><h2 className="mt-2 font-playfair text-3xl font-bold">Mes invitations</h2><div className="mt-5 grid gap-3">{castings.map((invite)=><article key={invite.id} className="grid gap-4 rounded-2xl bg-pm-ivory p-4 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-playfair text-2xl font-bold">{invite.title}</h3><span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase text-pm-wine">{invite.stage}</span></div><p className="mt-2 text-sm text-pm-ink/50">{[invite.startsAt?new Date(invite.startsAt).toLocaleString('fr-FR'):'',invite.location].filter(Boolean).join(' · ')}</p></div>{['invited','confirmed','declined'].includes(invite.stage)&&<div className="flex gap-2"><button disabled={busy===invite.id} onClick={()=>void respond(invite,'confirmed')} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-700 px-4 text-xs font-black uppercase text-white"><Check size={14}/> Accepter</button><button disabled={busy===invite.id} onClick={()=>void respond(invite,'declined')} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-red-200 bg-white px-4 text-xs font-black uppercase text-red-700"><X size={14}/> Refuser</button></div>}</article>)}{!castings.length&&<p className="rounded-xl bg-pm-ivory p-4 text-sm text-pm-ink/45">Aucune invitation casting actuellement.</p>}</div></section>

    <section className="rounded-[1.7rem] border border-pm-ink/10 bg-white p-5 sm:p-6"><p className="editorial-kicker text-pm-coral">Contrats & documents</p><h2 className="mt-2 font-playfair text-3xl font-bold">Mes contrats</h2><p className="mt-2 text-sm leading-6 text-pm-ink/50">Les contrats envoyés par l’agence peuvent être lus puis acceptés électroniquement depuis cet espace.</p><div className="mt-5 grid gap-3">{contracts.map((contract)=><article key={contract.id} className="grid gap-4 rounded-2xl bg-pm-ivory p-4 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{contract.title}</h3><span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${contract.status==='signed'?'bg-emerald-100 text-emerald-800':contract.status==='cancelled'?'bg-red-100 text-red-700':'bg-white text-pm-wine'}`}>{contract.status}</span></div><p className="mt-1 text-xs text-pm-ink/45">{contract.contract_type}{contract.expires_at?` · expire ${new Date(contract.expires_at).toLocaleDateString('fr-FR')}`:''}{contract.signed_at?` · signé ${new Date(contract.signed_at).toLocaleDateString('fr-FR')}`:''}</p></div><div className="flex flex-wrap gap-2">{contract.document_url&&<a href={contract.document_url} target="_blank" rel="noreferrer" onClick={()=>void markContractViewed(contract)} className="inline-flex min-h-10 items-center rounded-full border border-pm-ink/10 bg-white px-4 text-xs font-bold">Lire le document</a>}{['sent','viewed'].includes(contract.status)&&<><button type="button" onClick={()=>openContract(contract,'sign')} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-pm-ink px-4 text-xs font-black uppercase text-white"><FileSignature size={14}/> Signer</button><button type="button" onClick={()=>openContract(contract,'decline')} className="inline-flex min-h-10 items-center rounded-full border border-red-200 bg-white px-4 text-xs font-black uppercase text-red-700">Refuser</button></>}</div></article>)}{!contracts.length&&<p className="rounded-xl bg-pm-ivory p-4 text-sm text-pm-ink/45">Aucun contrat disponible pour le moment.</p>}</div></section>

    {contractAction&&<div className="fixed inset-0 z-[80] grid place-items-center bg-pm-ink/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="contract-action-title" onMouseDown={()=>{if(!busy)setContractAction(null)}}><div className="w-full max-w-xl rounded-[1.7rem] bg-pm-paper p-6 shadow-2xl" onMouseDown={(event)=>event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="editorial-kicker text-pm-coral">Décision contractuelle</p><h2 id="contract-action-title" className="mt-2 font-playfair text-3xl font-bold">{contractMode==='sign'?'Signer électroniquement':'Refuser le contrat'}</h2><p className="mt-2 text-sm text-pm-ink/50">{contractAction.title}</p></div><button type="button" disabled={Boolean(busy)} onClick={()=>setContractAction(null)} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full bg-pm-peach"><X size={18}/></button></div>{contractMode==='sign'?<div className="mt-6 space-y-4"><p className="rounded-xl bg-pm-ivory p-4 text-sm leading-6 text-pm-ink/65">Après lecture du document, saisissez votre nom complet. Votre compte, la date, une empreinte de preuve et les informations techniques de la session seront associées à cette acceptation électronique.</p><label><span className="mb-2 block text-xs font-bold">Nom complet attendu : {modelName}</span><input value={signatureName} onChange={(e)=>setSignatureName(e.target.value)} className={field} autoComplete="name"/></label><label className="flex items-start gap-3 rounded-xl border border-pm-ink/10 bg-white p-4 text-sm leading-6"><input type="checkbox" checked={accepted} onChange={(e)=>setAccepted(e.target.checked)} className="mt-1 h-4 w-4"/><span>Je confirme avoir lu le document contractuel et accepter son contenu. Je demande l’enregistrement de mon acceptation électronique.</span></label></div>:<label className="mt-6 block"><span className="mb-2 block text-xs font-bold">Motif du refus (facultatif)</span><textarea value={declineReason} onChange={(e)=>setDeclineReason(e.target.value)} rows={5} maxLength={1000} className={`${field} resize-y py-3`}/></label>}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={Boolean(busy)} onClick={()=>setContractAction(null)} className="rounded-full border border-pm-ink/15 px-5 py-3 text-xs font-bold">Annuler</button><button type="button" disabled={Boolean(busy)||(contractMode==='sign'&&(!accepted||!signatureName.trim()))} onClick={()=>void submitContractDecision()} className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase text-white disabled:opacity-40 ${contractMode==='sign'?'bg-pm-ink':'bg-red-700'}`}>{busy?<Loader2 size={15} className="animate-spin"/>:contractMode==='sign'?<FileSignature size={15}/>:<X size={15}/>} {contractMode==='sign'?'Signer et enregistrer':'Confirmer le refus'}</button></div></div></div>}
  </div>;
}
