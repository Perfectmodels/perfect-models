'use client';

import { useState } from 'react';

const field = 'w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-pm-gold/60';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/intake/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Envoi impossible.');
      setDone(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally { setBusy(false); }
  };

  if (done) return <div className="border border-pm-gold/30 bg-pm-gold/[.05] p-8"><p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-gold">Message reçu</p><h2 className="mt-3 font-playfair text-3xl font-bold">Notre équipe vous répondra rapidement.</h2><button type="button" onClick={() => setDone(false)} className="mt-6 text-xs font-bold uppercase tracking-wider text-pm-gold">Envoyer un autre message</button></div>;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><input className={field} required placeholder="Nom complet" value={form.name} onChange={(e) => update('name', e.target.value)} /><input className={field} required type="email" placeholder="Email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><input className={field} placeholder="Téléphone" value={form.phone} onChange={(e) => update('phone', e.target.value)} /><input className={field} placeholder="Objet" value={form.subject} onChange={(e) => update('subject', e.target.value)} /></div>
      <textarea className={`${field} min-h-48 resize-y`} required placeholder="Votre message" value={form.message} onChange={(e) => update('message', e.target.value)} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} className="bg-pm-gold px-6 py-3 text-xs font-black uppercase tracking-[.18em] text-black disabled:opacity-50">{busy ? 'Envoi…' : 'Envoyer le message'}</button>
    </form>
  );
}
