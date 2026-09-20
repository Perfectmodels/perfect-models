'use client';

import { useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, LockKeyhole, ShieldCheck, ShieldOff, UserCheck } from 'lucide-react';
import { formatDate, formatStatus, statusTone } from '@/lib/admin-formatters';

type Account = {
  uid:string;
  email:string;
  name:string;
  identifier:string;
  role:string;
  isActive:boolean;
  mustChangePassword:boolean;
  updatedAt?:string|null;
}|null;

export default function TalentAccessPanel({ account:initialAccount, model, canManage, recoveryRequests }: {
  account:Account;
  model:{authUserId?:string|null;claimStatus?:string|null;email?:string|null;username?:string|null};
  canManage:boolean;
  recoveryRequests:Array<Record<string,unknown>>;
}) {
  const [account,setAccount]=useState(initialAccount);
  const [busy,setBusy]=useState('');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');

  async function update(patch:{isActive?:boolean;mustChangePassword?:boolean}) {
    if(!account||!canManage)return;
    setBusy(Object.keys(patch)[0]||'save'); setError(''); setNotice('');
    try {
      const response=await fetch('/api/admin/users',{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:account.uid,role:account.role,isActive:patch.isActive??account.isActive,mustChangePassword:patch.mustChangePassword??account.mustChangePassword,adminPermissions:{}})});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(payload.error||'Mise à jour impossible.');
      if(payload.user)setAccount(payload.user);
      setNotice('Les accès du talent ont été mis à jour.');
    } catch(cause){setError(cause instanceof Error?cause.message:'Mise à jour impossible.');}
    finally{setBusy('');}
  }

  return <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
    <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="control-kicker">Accès au compte</p><h2 className="mt-1 font-playfair text-3xl font-semibold">Identité numérique du talent</h2><p className="mt-2 text-sm text-pm-ink/45">Rattachement Supabase, état du compte et identifiant agence dans la même fiche.</p></div><span className={`rounded-full px-3 py-2 text-[9px] font-black uppercase tracking-[.08em] ${statusTone(account?.isActive?'active':'inactive')}`}>{account?account.isActive?'Compte actif':'Compte suspendu':'Compte non rattaché'}</span></div>
      {(notice||error)&&<p className={`mt-5 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${error?'bg-rose-50 text-rose-900':'bg-emerald-50 text-emerald-900'}`}>{!error&&<CheckCircle2 size={15}/>} {error||notice}</p>}
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">{[
        ['Compte applicatif',account||model.authUserId?'Rattaché au talent':'Non rattaché'],
        ['E-mail de connexion',account?.email||model.email||'Non renseigné'],
        ['Identifiant agence',account?.identifier||model.username||'Non renseigné'],
        ['Rôle',account?.role==='student'?'Mannequin / étudiant':formatStatus(account?.role)],
        ['Réclamation de fiche',formatStatus(model.claimStatus)],
        ['Dernière mise à jour',formatDate(account?.updatedAt)],
      ].map(([label,value])=><div key={label} className="rounded-xl bg-pm-ivory p-4"><dt className="text-[9px] font-black uppercase tracking-[.08em] text-pm-ink/35">{label}</dt><dd className="mt-1 break-all text-sm font-semibold">{value}</dd></div>)}</dl>
      {!account&&<div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Cette fiche n’est pas encore liée à un compte actif. Le parcours d’inscription mannequin ou la validation d’une réclamation permettra d’effectuer le rattachement sans créer de doublon.</div>}
    </section>

    <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7"><p className="control-kicker">Sécurité</p><h2 className="mt-1 font-playfair text-3xl font-semibold">Contrôles d’accès</h2><div className="mt-6 grid gap-3"><AccessAction icon={account?.isActive?<ShieldOff/>:<UserCheck/>} title={account?.isActive?'Suspendre le compte':'Réactiver le compte'} text={account?.isActive?'Bloque l’accès applicatif sans supprimer la fiche ni l’historique.':'Rend de nouveau l’espace personnel accessible.'} disabled={!account||!canManage||Boolean(busy)} busy={busy==='isActive'} onClick={()=>void update({isActive:!account?.isActive})}/><AccessAction icon={account?.mustChangePassword?<ShieldCheck/>:<KeyRound/>} title={account?.mustChangePassword?'Exigence déjà active':'Exiger un nouveau mot de passe'} text={account?.mustChangePassword?'Le talent devra modifier son mot de passe au prochain parcours de sécurité.':'Active l’indicateur de renouvellement du mot de passe.'} disabled={!account||!canManage||Boolean(busy)||account.mustChangePassword} busy={busy==='mustChangePassword'} onClick={()=>void update({mustChangePassword:true})}/></div>{!canManage&&<p className="mt-4 rounded-xl bg-pm-ivory p-3 text-xs leading-5 text-pm-ink/50">La gestion de sécurité est réservée au rôle Administrateur. Les managers conservent une vue en lecture seule.</p>}</section>

    <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-7 xl:col-span-2"><div className="flex items-center gap-3"><LockKeyhole className="text-pm-coral"/><div><p className="control-kicker">Récupération & incidents</p><h2 className="font-playfair text-2xl font-semibold">Historique des demandes d’accès</h2></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{recoveryRequests.length?recoveryRequests.map((request)=><article key={String(request.id)} className="rounded-xl bg-pm-ivory p-4"><div className="flex items-start justify-between gap-3"><b className="text-sm">{String(request.email||request.identifier||'Demande d’accès')}</b><span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase ${statusTone(request.status)}`}>{formatStatus(request.status)}</span></div><p className="mt-2 text-xs text-pm-ink/45">{formatDate(request.created_at,true)}</p></article>):<p className="text-sm text-pm-ink/40">Aucune demande de récupération liée à ce talent.</p>}</div></section>
  </div>;
}

function AccessAction({icon,title,text,disabled,busy,onClick}:{icon:React.ReactNode;title:string;text:string;disabled:boolean;busy:boolean;onClick:()=>void}) {
  return <button type="button" disabled={disabled} onClick={onClick} className="flex items-center gap-4 rounded-2xl border border-pm-ink/[.08] bg-pm-ivory p-4 text-left transition hover:border-pm-coral/25 disabled:cursor-not-allowed disabled:opacity-45"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-pm-wine">{busy?<Loader2 size={18} className="animate-spin"/>:icon}</span><span><b className="block text-sm">{title}</b><span className="mt-1 block text-xs leading-5 text-pm-ink/45">{text}</span></span></button>;
}
