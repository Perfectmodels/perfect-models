'use client';

import { useState } from 'react';

const field = 'w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-pm-gold/60';

export default function FashionDayApplicationForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', applicationType: 'Créateur / Styliste', message: '' });
  const [busy, setBusy] = useState(false); const [done, setDone] = useState(false); const [error, setError] = useState('');
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/intake/fashion-day', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Candidature impossible.');
      setDone(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Candidature impossible.'); }
    finally { setBusy(false); }
  };
  if (done) return <div className="border border-pm-gold/30 bg-pm-gold/[.05] p-8 text-center"><p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-gold">Candidature enregistrée</p><h2 className="mt-4 font-playfair text-4xl font-bold">Votre dossier Fashion Day est bien reçu.</h2></div>;
  return <form onSubmit={submit} className="space-y-4"><input className={field} required placeholder="Nom / marque" value={form.name} onChange={(e)=>update('name',e.target.value)} /><div className="grid gap-4 sm:grid-cols-2"><input className={field} required type="email" placeholder="Email" value={form.email} onChange={(e)=>update('email',e.target.value)} /><input className={field} placeholder="Téléphone" value={form.phone} onChange={(e)=>update('phone',e.target.value)} /></div><select className={field} value={form.applicationType} onChange={(e)=>update('applicationType',e.target.value)}><option>Créateur / Styliste</option><option>Mannequin</option><option>Artiste</option><option>Partenaire</option><option>Presse / Média</option><option>Autre</option></select><textarea className={`${field} min-h-40`} placeholder="Présentez votre projet ou votre demande" value={form.message} onChange={(e)=>update('message',e.target.value)} />{error && <p className="text-sm text-red-300">{error}</p>}<button disabled={busy} className="bg-pm-gold px-6 py-4 text-[10px] font-black uppercase tracking-[.2em] text-black disabled:opacity-50">{busy?'Enregistrement…':'Envoyer la candidature'}</button></form>;
}
