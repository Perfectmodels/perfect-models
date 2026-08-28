'use client';

import { useState } from 'react';

const field = 'w-full border-0 border-b border-black/20 bg-transparent px-0 py-3 text-sm text-pm-ink outline-none transition placeholder:text-black/30 focus:border-pm-wine';
const label = 'mb-1 block text-[8px] font-black uppercase tracking-[.24em] text-black/40';

export default function FashionDayApplicationForm() {
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
      <div className="border-y border-pm-wine/25 py-14 text-center sm:py-20">
        <p className="editorial-kicker text-pm-wine">Demande reçue</p>
        <h2 className="mx-auto mt-5 max-w-2xl font-playfair text-4xl font-black italic sm:text-6xl">Merci de vouloir faire partie de Perfect Fashion Day.</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-black/50">Notre équipe examinera votre proposition et vous recontactera si une collaboration correspond à la programmation de l’édition.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
      <div>
        <p className="editorial-kicker text-pm-wine">Votre proposition</p>
        <h2 className="mt-4 font-playfair text-4xl font-black italic sm:text-5xl">Présentez votre univers en quelques lignes.</h2>
        <p className="mt-5 text-sm leading-7 text-black/50">Soyez précis sur votre rôle, votre projet et la forme de collaboration souhaitée.</p>
      </div>
      <div className="space-y-7 border-t border-black/15 pt-7 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
        <div><label className={label}>Nom / marque *</label><input className={field} required value={form.name} onChange={(e) => update('name', e.target.value)} /></div>
        <div className="grid gap-7 sm:grid-cols-2">
          <div><label className={label}>Email *</label><input className={field} required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div><label className={label}>Téléphone</label><input className={field} inputMode="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
        </div>
        <div><label className={label}>Je souhaite participer en tant que</label><select className={field} value={form.applicationType} onChange={(e) => update('applicationType', e.target.value)}><option>Créateur / Styliste</option><option>Mannequin</option><option>Artiste</option><option>Partenaire</option><option>Presse / Média</option><option>Autre</option></select></div>
        <div><label className={label}>Projet / proposition</label><textarea className={`${field} min-h-40 resize-y`} placeholder="Décrivez votre projet, vos références et la collaboration envisagée…" value={form.message} onChange={(e) => update('message', e.target.value)} /></div>
        {error && <p className="border-l-2 border-red-500 bg-red-500/[.06] px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="pmm-button border-pm-wine bg-pm-wine text-white hover:bg-pm-dark disabled:opacity-50">{busy ? 'Envoi en cours…' : 'Envoyer ma proposition'}</button>
      </div>
    </form>
  );
}
