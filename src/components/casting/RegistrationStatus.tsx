'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistrationStatus({applicationId,current}:{applicationId:string;current:string}){
  const router=useRouter();const[status,setStatus]=useState(current||'Nouveau');const[busy,setBusy]=useState(false);const[error,setError]=useState('');
  const save=async()=>{setBusy(true);setError('');try{const r=await fetch(`/api/registration/casting/${encodeURIComponent(applicationId)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Mise à jour impossible');router.refresh()}catch(err){setError(err instanceof Error?err.message:'Mise à jour impossible')}finally{setBusy(false)}};
  return <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><select value={status} onChange={e=>setStatus(e.target.value)} className="border border-white/10 bg-black/30 px-3 py-2 text-xs"><option>Nouveau</option><option>Présent</option><option>Absent</option><option>Présélectionné</option><option>Accepté</option><option>Refusé</option></select><button onClick={()=>void save()} disabled={busy} className="bg-pm-gold px-3 py-2 text-[8px] font-black uppercase tracking-wider text-black">Mettre à jour</button>{error&&<span className="text-xs text-red-300">{error}</span>}</div>;
}
