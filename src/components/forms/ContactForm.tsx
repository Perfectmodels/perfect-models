'use client';

import { useState } from 'react';

const field = 'w-full border-b border-white/16 bg-transparent px-0 py-4 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/28 focus:border-pm-gold';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/intake/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Envoi impossible.');
      setDone(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  };

  if (done) return (
    <div className="border-y border-pm-gold/30 py-10">
      <p className="text-[8px] font-black uppercase tracking-[.32em] text-pm-gold-light">Message reçu</p>
      <h2 className="mt-4 font-playfair text-4xl font-semibold">Merci. Notre équipe reviendra vers vous.</h2>
      <button type="button" onClick={() => setDone(false)} className="mt-7 border-b border-pm-gold pb-2 text-[8px] font-black uppercase tracking-[.24em] text-pm-gold-light">Envoyer un autre message</button>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="grid gap-x-7 sm:grid-cols-2"><input className={field} required placeholder="Nom complet *" value={form.name} onChange={(e) => update('name', e.target.value)} /><input className={field} required type="email" placeholder="Email *" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
      <div className="grid gap-x-7 sm:grid-cols-2"><input className={field} placeholder="Téléphone" value={form.phone} onChange={(e) => update('phone', e.target.value)} /><input className={field} placeholder="Objet" value={form.subject} onChange={(e) => update('subject', e.target.value)} /></div>
      <textarea className={`${field} min-h-40 resize-y pt-6`} required placeholder="Votre message *" value={form.message} onChange={(e) => update('message', e.target.value)} />
      {error && <p className="pt-3 text-sm text-red-300">{error}</p>}
      <div className="pt-7"><button disabled={busy} className="pmm-button pmm-button--light disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Envoi…' : 'Envoyer le message'} <span aria-hidden="true">↗</span></button></div>
    </form>
  );
}
