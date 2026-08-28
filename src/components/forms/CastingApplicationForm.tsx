'use client';

import { useMemo, useState } from 'react';
import ImgBBUploader from '@/components/ImgBBUploader';

const input = 'w-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-pm-gold/60';
const label = 'mb-2 block text-[9px] font-black uppercase tracking-[.22em] text-white/40';

const EMPTY = {
  firstName: '', lastName: '', birthDate: '', gender: 'Femme', nationality: 'Gabonaise', city: 'Libreville',
  email: '', phone: '', height: '', weight: '', chest: '', waist: '', hips: '', shoeSize: '', eyeColor: '', hairColor: '',
  experience: 'none', instagram: '', portfolioLink: '', motivation: '', photoPortraitUrl: '', photoFullBodyUrl: '', photoProfileUrl: '',
};

export default function CastingApplicationForm() {
  const [form, setForm] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const age = useMemo(() => {
    if (!form.birthDate) return null;
    const born = new Date(`${form.birthDate}T00:00:00`); if (Number.isNaN(born.getTime())) return null;
    const now = new Date(); let years = now.getFullYear() - born.getFullYear();
    if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) years--;
    return years;
  }, [form.birthDate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (!consent) return setError('Le consentement est requis pour soumettre votre candidature.');
    if (age !== null && (age < 14 || age > 80)) return setError('La candidature est réservée aux personnes âgées de 14 à 80 ans.');
    if (!form.photoPortraitUrl && !form.photoFullBodyUrl && !form.photoProfileUrl) return setError('Ajoutez au moins une photo récente.');
    setBusy(true);
    try {
      const response = await fetch('/api/intake/casting', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, consentAccepted: true }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Candidature impossible.');
      setDone(true); setForm(EMPTY); setConsent(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Candidature impossible.'); }
    finally { setBusy(false); }
  };

  if (done) return <div className="mx-auto max-w-3xl border border-pm-gold/30 bg-pm-gold/[.05] p-8 text-center"><p className="text-[9px] font-black uppercase tracking-[.3em] text-pm-gold">Candidature enregistrée</p><h2 className="mt-4 font-playfair text-4xl font-bold">Votre dossier est maintenant dans Supabase.</h2><p className="mt-4 text-sm leading-7 text-white/45">L’équipe Perfect Models Management pourra l’examiner depuis le nouveau back-office.</p></div>;

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl space-y-10">
      <section><h2 className="font-playfair text-3xl font-bold">Informations personnelles</h2><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div><label className={label}>Prénom *</label><input className={input} required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} /></div>
        <div><label className={label}>Nom *</label><input className={input} required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} /></div>
        <div><label className={label}>Date de naissance *</label><input className={input} required type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} /></div>
        <div><label className={label}>Genre</label><select className={input} value={form.gender} onChange={(e) => update('gender', e.target.value)}><option>Femme</option><option>Homme</option></select></div>
        <div><label className={label}>Nationalité *</label><input className={input} required value={form.nationality} onChange={(e) => update('nationality', e.target.value)} /></div>
        <div><label className={label}>Ville *</label><input className={input} required value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
        <div><label className={label}>Email *</label><input className={input} required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
        <div><label className={label}>Téléphone *</label><input className={input} required value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
        <div><label className={label}>Instagram</label><input className={input} value={form.instagram} onChange={(e) => update('instagram', e.target.value)} /></div>
      </div></section>

      <section><h2 className="font-playfair text-3xl font-bold">Mensurations</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[['height','Taille (cm) *'],['weight','Poids (kg)'],['chest','Poitrine (cm)'],['waist','Taille (cm)'],['hips','Hanches (cm)'],['shoeSize','Pointure']].map(([key,title]) => <div key={key}><label className={label}>{title}</label><input className={input} required={key==='height'} inputMode="decimal" value={form[key as keyof typeof form]} onChange={(e) => update(key as keyof typeof form, e.target.value)} /></div>)}
        <div><label className={label}>Couleur des yeux</label><input className={input} value={form.eyeColor} onChange={(e) => update('eyeColor', e.target.value)} /></div>
        <div><label className={label}>Couleur des cheveux</label><input className={input} value={form.hairColor} onChange={(e) => update('hairColor', e.target.value)} /></div>
      </div></section>

      <section><h2 className="font-playfair text-3xl font-bold">Expérience</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><div><label className={label}>Niveau</label><select className={input} value={form.experience} onChange={(e) => update('experience', e.target.value)}><option value="none">Aucune expérience</option><option value="beginner">Débutant</option><option value="intermediate">Intermédiaire</option><option value="professional">Professionnel</option></select></div><div><label className={label}>Portfolio</label><input className={input} placeholder="https://…" value={form.portfolioLink} onChange={(e) => update('portfolioLink', e.target.value)} /></div></div><textarea className={`${input} mt-4 min-h-32`} placeholder="Motivation / expérience complémentaire" value={form.motivation} onChange={(e) => update('motivation', e.target.value)} /></section>

      <section><h2 className="font-playfair text-3xl font-bold">Photos</h2><p className="mt-2 text-sm text-white/40">Les fichiers sont envoyés côté serveur vers ImgBB ; seules les URL résultantes sont enregistrées dans Supabase.</p><div className="mt-5 grid gap-5 md:grid-cols-3"><ImgBBUploader publicMode label="Portrait" scope="casting-portrait" value={form.photoPortraitUrl} onChange={(url) => update('photoPortraitUrl', url)} /><ImgBBUploader publicMode label="Plein pied" scope="casting-full-body" value={form.photoFullBodyUrl} onChange={(url) => update('photoFullBodyUrl', url)} /><ImgBBUploader publicMode label="Profil" scope="casting-profile" value={form.photoProfileUrl} onChange={(url) => update('photoProfileUrl', url)} /></div></section>

      <label className="flex items-start gap-3 border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/55"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" /><span>J’accepte que Perfect Models Management traite ces informations et photos dans le cadre de ma candidature au casting.</span></label>
      {error && <p className="border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}
      <button disabled={busy} className="w-full bg-pm-gold px-6 py-4 text-xs font-black uppercase tracking-[.2em] text-black disabled:opacity-50 sm:w-auto">{busy ? 'Enregistrement…' : 'Soumettre ma candidature'}</button>
    </form>
  );
}
