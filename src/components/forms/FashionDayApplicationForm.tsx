'use client';

import { useId, useState } from 'react';

const field = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white/80 px-4 py-3 text-[15px] text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus-visible:border-pm-wine focus-visible:ring-4 focus-visible:ring-pm-wine/10';
const label = 'mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/65';

const APPLICATION_TYPES = ['Créateur / Styliste', 'Mannequin', 'Artiste', 'Partenaire', 'Presse / Média', 'Photographe / Vidéaste', 'Beauté / Make-up', 'Autre'];

export default function FashionDayApplicationForm() {
  const baseId = useId();
  const [form, setForm] = useState({ name: '', email: '', phone: '', applicationType: 'Créateur / Styliste', message: '' });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/intake/fashion-day', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Candidature impossible.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Candidature impossible.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="border-y border-pm-wine/25 py-14 text-center sm:py-20" role="status" aria-live="polite">
        <p className="editorial-kicker text-pm-wine">Demande reçue</p>
        <h2 className="mx-auto mt-5 max-w-2xl font-playfair text-4xl font-black italic sm:text-6xl">Merci de vouloir faire partie de Perfect Fashion Day.</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-pm-ink/60">Notre équipe examinera votre proposition et vous recontactera si une collaboration correspond à la programmation de l’édition.</p>
        <button type="button" onClick={() => { setDone(false); setForm({ name: '', email: '', phone: '', applicationType: 'Créateur / Styliste', message: '' }); }} className="mt-7 min-h-11 rounded-full border border-pm-wine/25 px-5 text-sm font-extrabold text-pm-wine">Envoyer une autre proposition</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-16" aria-describedby={error ? `${baseId}-error` : undefined}>
      <div>
        <p className="editorial-kicker text-pm-wine">Votre proposition</p>
        <h2 className="mt-4 font-playfair text-4xl font-black italic sm:text-5xl">Présentez votre univers en quelques lignes.</h2>
        <p className="mt-5 text-sm leading-7 text-pm-ink/60">Soyez précis sur votre rôle, votre projet et la forme de collaboration souhaitée.</p>
      </div>
      <div className="space-y-6 border-t border-pm-ink/15 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
        <div><label htmlFor={`${baseId}-name`} className={label}>Nom / marque <span aria-hidden="true">*</span></label><input id={`${baseId}-name`} name="name" className={field} required autoComplete="organization" value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div><label htmlFor={`${baseId}-email`} className={label}>E-mail <span aria-hidden="true">*</span></label><input id={`${baseId}-email`} name="email" className={field} required type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div><label htmlFor={`${baseId}-phone`} className={label}>Téléphone</label><input id={`${baseId}-phone`} name="phone" className={field} type="tel" inputMode="tel" autoComplete="tel" placeholder="+241 …" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
        </div>
        <div><label htmlFor={`${baseId}-type`} className={label}>Je souhaite participer en tant que</label><select id={`${baseId}-type`} name="applicationType" className={field} value={form.applicationType} onChange={(e) => update('applicationType', e.target.value)}>{APPLICATION_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></div>
        <div><label htmlFor={`${baseId}-message`} className={label}>Projet / proposition</label><textarea id={`${baseId}-message`} name="message" className={`${field} min-h-40 resize-y`} placeholder="Décrivez votre projet, vos références et la collaboration envisagée…" value={form.message} onChange={(e) => update('message', e.target.value)} /></div>
        <div aria-live="assertive">{error && <p id={`${baseId}-error`} role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}</div>
        <button disabled={busy} className="pmm-button min-h-12 border-pm-wine bg-pm-wine text-white hover:bg-pm-dark disabled:opacity-50">{busy ? 'Envoi en cours…' : 'Envoyer ma proposition'}</button>
      </div>
    </form>
  );
}
