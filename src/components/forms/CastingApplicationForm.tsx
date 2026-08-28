'use client';

import { useMemo, useState } from 'react';
import ImgBBUploader from '@/components/ImgBBUploader';

const field = 'w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-pm-gold';
const label = 'mb-1 block text-[8px] font-black uppercase tracking-[.24em] text-white/35';
const sectionClass = 'border-t border-white/12 pt-8 sm:pt-10';

const EMPTY = {
  firstName: '', lastName: '', birthDate: '', gender: 'Femme', nationality: 'Gabonaise', city: 'Libreville',
  email: '', phone: '', height: '', weight: '', chest: '', waist: '', hips: '', shoeSize: '', eyeColor: '', hairColor: '',
  experience: 'none', instagram: '', portfolioLink: '', motivation: '', photoPortraitUrl: '', photoFullBodyUrl: '', photoProfileUrl: '',
};

function SectionTitle({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="mb-7 grid gap-3 sm:grid-cols-[90px_1fr] sm:gap-6">
      <span className="font-playfair text-3xl italic text-pm-gold/45">{index}</span>
      <div>
        <h2 className="font-playfair text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-xs leading-6 text-white/40 sm:text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function CastingApplicationForm() {
  const [form, setForm] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const age = useMemo(() => {
    if (!form.birthDate) return null;
    const born = new Date(`${form.birthDate}T00:00:00`);
    if (Number.isNaN(born.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - born.getFullYear();
    if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) years--;
    return years;
  }, [form.birthDate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!consent) return setError('Veuillez accepter le traitement de votre candidature avant l’envoi.');
    if (age !== null && (age < 14 || age > 80)) return setError('La candidature est réservée aux personnes âgées de 14 à 80 ans.');
    if (!form.photoPortraitUrl && !form.photoFullBodyUrl && !form.photoProfileUrl) return setError('Ajoutez au moins une photo récente.');
    setBusy(true);
    try {
      const response = await fetch('/api/intake/casting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consentAccepted: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Candidature impossible.');
      setDone(true);
      setForm(EMPTY);
      setConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Candidature impossible.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-4xl border-y border-pm-gold/30 py-14 text-center sm:py-20">
        <p className="editorial-kicker text-pm-gold">Candidature reçue</p>
        <h2 className="mx-auto mt-5 max-w-2xl font-playfair text-4xl font-black italic leading-tight sm:text-6xl">Merci. Votre profil est entre les mains de notre équipe.</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/45">Si votre profil correspond à une recherche en cours, Perfect Models Management vous contactera directement.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-7xl space-y-12 sm:space-y-16">
      <section className={sectionClass}>
        <SectionTitle index="01" title="Identité" description="Les informations essentielles pour vous contacter et situer votre profil." />
        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className={label}>Prénom *</label><input className={field} required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} /></div>
          <div><label className={label}>Nom *</label><input className={field} required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} /></div>
          <div><label className={label}>Date de naissance *</label><input className={field} required type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} /></div>
          <div><label className={label}>Genre</label><select className={field} value={form.gender} onChange={(e) => update('gender', e.target.value)}><option>Femme</option><option>Homme</option></select></div>
          <div><label className={label}>Nationalité *</label><input className={field} required value={form.nationality} onChange={(e) => update('nationality', e.target.value)} /></div>
          <div><label className={label}>Ville *</label><input className={field} required value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
          <div><label className={label}>Email *</label><input className={field} required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div><label className={label}>Téléphone *</label><input className={field} required inputMode="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
          <div><label className={label}>Instagram</label><input className={field} placeholder="@votrecompte" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} /></div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle index="02" title="Mensurations" description="Indiquez vos mensurations actuelles. Elles pourront être vérifiées lors d’un casting physique." />
        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {[['height','Hauteur (cm) *'],['weight','Poids (kg)'],['chest','Poitrine (cm)'],['waist','Tour de taille (cm)'],['hips','Hanches (cm)'],['shoeSize','Pointure']].map(([key,title]) => (
            <div key={key}><label className={label}>{title}</label><input className={field} required={key === 'height'} inputMode="decimal" value={form[key as keyof typeof form]} onChange={(e) => update(key as keyof typeof form, e.target.value)} /></div>
          ))}
          <div><label className={label}>Couleur des yeux</label><input className={field} value={form.eyeColor} onChange={(e) => update('eyeColor', e.target.value)} /></div>
          <div><label className={label}>Couleur des cheveux</label><input className={field} value={form.hairColor} onChange={(e) => update('hairColor', e.target.value)} /></div>
        </div>
      </section>

      <section className={sectionClass}>
        <SectionTitle index="03" title="Parcours" description="Quelques éléments pour comprendre votre expérience, votre univers et votre motivation." />
        <div className="grid gap-7 md:grid-cols-2">
          <div><label className={label}>Niveau</label><select className={field} value={form.experience} onChange={(e) => update('experience', e.target.value)}><option value="none">Aucune expérience</option><option value="beginner">Débutant</option><option value="intermediate">Intermédiaire</option><option value="professional">Professionnel</option></select></div>
          <div><label className={label}>Portfolio</label><input className={field} placeholder="https://…" value={form.portfolioLink} onChange={(e) => update('portfolioLink', e.target.value)} /></div>
        </div>
        <div className="mt-7"><label className={label}>Motivation / expérience complémentaire</label><textarea className={`${field} min-h-36 resize-y`} value={form.motivation} onChange={(e) => update('motivation', e.target.value)} /></div>
      </section>

      <section className={sectionClass}>
        <SectionTitle index="04" title="Photos" description="Privilégiez la lumière naturelle, une tenue simple et une image récente. Aucun book professionnel n’est obligatoire." />
        <div className="grid gap-5 md:grid-cols-3">
          <ImgBBUploader publicMode allowUrl={false} label="Portrait" scope="casting-portrait" value={form.photoPortraitUrl} onChange={(url) => update('photoPortraitUrl', url)} />
          <ImgBBUploader publicMode allowUrl={false} label="Plein pied" scope="casting-full-body" value={form.photoFullBodyUrl} onChange={(url) => update('photoFullBodyUrl', url)} />
          <ImgBBUploader publicMode allowUrl={false} label="Profil" scope="casting-profile" value={form.photoProfileUrl} onChange={(url) => update('photoProfileUrl', url)} />
        </div>
      </section>

      <section className="border-t border-white/12 pt-8">
        <label className="flex items-start gap-4 text-sm leading-7 text-white/55">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1.5 h-4 w-4 accent-pm-gold" />
          <span>J’accepte que Perfect Models Management utilise ces informations et photos exclusivement dans le cadre de l’étude et du suivi de ma candidature.</span>
        </label>
        {error && <p className="mt-6 border-l-2 border-red-400 bg-red-500/[.06] px-4 py-3 text-sm text-red-200">{error}</p>}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-white/30">En envoyant votre dossier, vous certifiez que les informations transmises sont exactes.</p>
          <button disabled={busy} className="pmm-button border-pm-gold bg-pm-gold text-black hover:bg-pm-gold-light disabled:cursor-wait disabled:opacity-50">{busy ? 'Envoi en cours…' : 'Envoyer mon dossier'}</button>
        </div>
      </section>
    </form>
  );
}
