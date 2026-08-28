'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function NewThreadForm() {
  const router=useRouter(); const[title,setTitle]=useState(''); const[body,setBody]=useState(''); const[busy,setBusy]=useState(false); const[error,setError]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/forum/threads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,body})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Publication impossible');setTitle('');setBody('');router.refresh()}catch(err){setError(err instanceof Error?err.message:'Publication impossible')}finally{setBusy(false)}};
  return <form onSubmit={submit} className="border border-white/10 bg-black/20 p-5"><h2 className="font-playfair text-2xl font-bold">Nouvelle discussion</h2><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre" className="mt-4 w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-pm-gold/60"/><textarea required value={body} onChange={e=>setBody(e.target.value)} placeholder="Votre message" className="mt-3 min-h-32 w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-pm-gold/60"/>{error&&<p className="mt-3 text-sm text-red-300">{error}</p>}<button disabled={busy} className="mt-4 bg-pm-gold px-5 py-3 text-[9px] font-black uppercase tracking-wider text-black disabled:opacity-50">{busy?'Publication…':'Publier'}</button></form>;
}

export function ReplyForm({threadId}:{threadId:string}) {
  const router=useRouter(); const[body,setBody]=useState(''); const[busy,setBusy]=useState(false); const[error,setError]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{const r=await fetch(`/api/forum/threads/${encodeURIComponent(threadId)}/replies`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({body})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Réponse impossible');setBody('');router.refresh()}catch(err){setError(err instanceof Error?err.message:'Réponse impossible')}finally{setBusy(false)}};
  return <form onSubmit={submit} className="mt-8 border border-white/10 bg-black/20 p-5"><textarea required value={body} onChange={e=>setBody(e.target.value)} placeholder="Répondre à la discussion" className="min-h-28 w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-pm-gold/60"/>{error&&<p className="mt-3 text-sm text-red-300">{error}</p>}<button disabled={busy} className="mt-4 bg-pm-gold px-5 py-3 text-[9px] font-black uppercase tracking-wider text-black">Répondre</button></form>;
}
