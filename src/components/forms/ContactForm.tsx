'use client';

import { useId, useState } from 'react';

const field = 'min-h-12 w-full rounded-xl border border-white/20 bg-white/[.06] px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-white/35 hover:border-white/35 focus-visible:border-pm-gold focus-visible:ring-4 focus-visible:ring-pm-gold/15';
const label = 'mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-white/70';

export default function ContactForm() {
  const baseId = useId();
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
    <div className="border-y border-pm-gold/30 py-10" role="status" aria-live="polite">
      <p className="text-xs font-extrabold uppercase tracking-[.15em] text-pm-gold-light">Message reçu</p>
      <h2 className="mt-4 font-playfair text-4xl font-semibold">Merci. Notre équipe reviendra vers vous.</h2>
      <button type="button" onClick={() => setDone(false)} className="mt-7 min-h-11 border-b border-pm-gold px-2 pb-2 text-xs font-extrabold uppercase tracking-[.12em] text-pm-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-pm-gold">Envoyer un autre message</button>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5" aria-describedby={error ? `${baseId}-error` : undefined}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor={`${baseId}-name`} className={label}>Nom complet <span aria-hidden="true">*</span></label><input id={`${baseId}-name`} name="name" className={field} required autoComplete="name" placeholder="Ex. Jeanne Nguema" value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
        <div><label htmlFor={`${baseId}-email`} className={label}>E-mail <span aria-hidden="true">*</span></label><input id={`${baseId}-email`} name="email" className={field} required type="email" inputMode="email" autoComplete="email" placeholder="vous@exemple.com" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor={`${baseId}-phone`} className={label}>Téléphone</label><input id={`${baseId}-phone`} name="phone" className={field} type="tel" inputMode="tel" autoComplete="tel" placeholder="+241 …" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
        <div><label htmlFor={`${baseId}-subject`} className={label}>Objet</label><select id={`${baseId}-subject`} name="subject" className={field} value={form.subject} onChange={(e) => update('subject', e.target.value)}><option value="" className="text-pm-ink">Sélectionner un sujet</option><option className="text-pm-ink">Booking mannequin</option><option className="text-pm-ink">Partenariat</option><option className="text-pm-ink">Casting / candidature</option><option className="text-pm-ink">Formation</option><option className="text-pm-ink">Perfect Fashion Day</option><option className="text-pm-ink">Presse / média</option><option className="text-pm-ink">Autre demande</option></select></div>
      </div>
      <div><label htmlFor={`${baseId}-message`} className={label}>Votre message <span aria-hidden="true">*</span></label><textarea id={`${baseId}-message`} name="message" className={`${field} min-h-40 resize-y`} required placeholder="Décrivez votre demande…" value={form.message} onChange={(e) => update('message', e.target.value)} /></div>
      <div aria-live="assertive">{error && <p id={`${baseId}-error`} role="alert" className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">{error}</p>}</div>
      <div className="pt-2"><button disabled={busy} className="pmm-button pmm-button--light min-h-12 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Envoi…' : 'Envoyer le message'} <span aria-hidden="true">↗</span></button></div>
    </form>
  );
}
