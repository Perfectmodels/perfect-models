'use client';

import { useId, useMemo, useState } from 'react';
import ImgBBUploader from '@/components/ImgBBUploader';

const field = 'min-h-12 w-full rounded-xl border border-white/18 bg-white/[.055] px-4 py-3 text-[15px] text-white outline-none transition placeholder:text-white/30 focus-visible:border-pm-gold focus-visible:ring-4 focus-visible:ring-pm-gold/12';
const label = 'mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-white/65';
const sectionClass = 'border-t border-white/12 pt-8 sm:pt-10';

const EMPTY = {
  firstName: '', lastName: '', birthDate: '', gender: 'Femme', nationality: 'Gabonaise', city: 'Libreville',
  email: '', phone: '', height: '', weight: '', chest: '', waist: '', hips: '', shoeSize: '', eyeColor: '', hairColor: '',
  experience: 'none', instagram: '', portfolioLink: '', motivation: '', photoPortraitUrl: '', photoFullBodyUrl: '', photoProfileUrl: '',
};

const NATIONALITIES = ['Gabonaise', 'Camerounaise', 'Congolaise', 'Équato-guinéenne', 'Béninoise', 'Togolaise', 'Ivoirienne', 'Sénégalaise', 'Nigériane', 'Française'];
const GABON_CITIES = ['Libreville', 'Akanda', 'Owendo', 'Ntoum', 'Port-Gentil', 'Franceville', 'Oyem', 'Moanda', 'Mouila', 'Lambaréné', 'Tchibanga', 'Makokou', 'Koulamoutou'];
const EYE_COLORS = ['Noirs', 'Marron foncé', 'Marron', 'Noisette', 'Verts', 'Bleus', 'Gris', 'Autre'];
const HAIR_COLORS = ['Noirs', 'Brun foncé', 'Bruns', 'Châtains', 'Blonds', 'Roux', 'Colorés', 'Rasés', 'Autre'];

function SectionTitle({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="mb-7 grid gap-3 sm:grid-cols-[90px_1fr] sm:gap-6">
      <span className="font-playfair text-3xl italic text-pm-gold/55" aria-hidden="true">{index}</span>
      <div>
        <h2 className="font-playfair text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{description}</p>
      </div>
    </div>
  );
}

export default function CastingApplicationForm() {
  const baseId = useId();
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
      <div className="mx-auto max-w-4xl border-y border-pm-gold/30 py-14 text-center sm:py-20" role="status" aria-live="polite">
        <p className="editorial-kicker text-pm-gold">Candidature reçue</p>
        <h2 className="mx-auto mt-5 max-w-2xl font-playfair text-4xl font-black italic leading-tight sm:text-6xl">Merci. Votre profil est entre les mains de notre équipe.</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/60">Si votre profil correspond à une recherche en cours, Perfect Models Management vous contactera directement.</p>
        <button type="button" onClick={() => setDone(false)} className="mt-7 min-h-11 rounded-full border border-pm-gold/40 px-5 text-sm font-extrabold text-pm-gold-light">Envoyer une autre candidature</button>
      </div>
    );
  }

  const id = (name: string) => `${baseId}-${name}`;

  return (
    <form onSubmit={submit} className="mx-auto max-w-7xl space-y-12 sm:space-y-16" aria-describedby={error ? id('error') : undefined}>
      <section className={sectionClass} aria-labelledby={id('identity-title')}>
        <div id={id('identity-title')}><SectionTitle index="01" title="Identité" description="Les informations essentielles pour vous contacter et situer votre profil." /></div>
        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <div><label htmlFor={id('firstName')} className={label}>Prénom <span aria-hidden="true">*</span></label><input id={id('firstName')} name="firstName" className={field} required autoComplete="given-name" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} /></div>
          <div><label htmlFor={id('lastName')} className={label}>Nom <span aria-hidden="true">*</span></label><input id={id('lastName')} name="lastName" className={field} required autoComplete="family-name" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} /></div>
          <div><label htmlFor={id('birthDate')} className={label}>Date de naissance <span aria-hidden="true">*</span></label><input id={id('birthDate')} name="birthDate" className={field} required type="date" autoComplete="bday" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} /><p className="mt-2 text-xs text-white/45" aria-live="polite">{age === null ? 'Votre âge sera calculé automatiquement.' : `${age} ans`}</p></div>
          <div><label htmlFor={id('gender')} className={label}>Genre</label><select id={id('gender')} name="gender" className={field} value={form.gender} onChange={(e) => update('gender', e.target.value)}><option className="text-pm-ink">Femme</option><option className="text-pm-ink">Homme</option><option className="text-pm-ink">Autre</option></select></div>
          <div><label htmlFor={id('nationality')} className={label}>Nationalité <span aria-hidden="true">*</span></label><input id={id('nationality')} name="nationality" className={field} required list={id('nationalities')} autoComplete="country-name" value={form.nationality} onChange={(e) => update('nationality', e.target.value)} /><datalist id={id('nationalities')}>{NATIONALITIES.map((value) => <option key={value} value={value} />)}</datalist></div>
          <div><label htmlFor={id('city')} className={label}>Ville <span aria-hidden="true">*</span></label><input id={id('city')} name="city" className={field} required list={id('cities')} autoComplete="address-level2" value={form.city} onChange={(e) => update('city', e.target.value)} /><datalist id={id('cities')}>{GABON_CITIES.map((value) => <option key={value} value={value} />)}</datalist></div>
          <div><label htmlFor={id('email')} className={label}>E-mail <span aria-hidden="true">*</span></label><input id={id('email')} name="email" className={field} required type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} /></div>
          <div><label htmlFor={id('phone')} className={label}>Téléphone <span aria-hidden="true">*</span></label><input id={id('phone')} name="phone" className={field} required type="tel" inputMode="tel" autoComplete="tel" placeholder="+241 …" value={form.phone} onChange={(e) => update('phone', e.target.value)} /></div>
          <div><label htmlFor={id('instagram')} className={label}>Instagram</label><input id={id('instagram')} name="instagram" className={field} autoComplete="off" placeholder="@votrecompte" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} /></div>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby={id('measure-title')}>
        <div id={id('measure-title')}><SectionTitle index="02" title="Mensurations" description="Utilisez les champs numériques : les unités sont déjà définies et les valeurs pourront être vérifiées lors d’un casting physique." /></div>
        <div className="grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <div><label htmlFor={id('height')} className={label}>Hauteur (cm) <span aria-hidden="true">*</span></label><input id={id('height')} name="height" className={field} required type="number" inputMode="decimal" min="120" max="230" step="0.1" value={form.height} onChange={(e) => update('height', e.target.value)} /></div>
          <div><label htmlFor={id('weight')} className={label}>Poids (kg)</label><input id={id('weight')} name="weight" className={field} type="number" inputMode="decimal" min="30" max="200" step="0.1" value={form.weight} onChange={(e) => update('weight', e.target.value)} /></div>
          <div><label htmlFor={id('chest')} className={label}>Poitrine (cm)</label><input id={id('chest')} name="chest" className={field} type="number" inputMode="decimal" min="40" max="180" step="0.1" value={form.chest} onChange={(e) => update('chest', e.target.value)} /></div>
          <div><label htmlFor={id('waist')} className={label}>Tour de taille (cm)</label><input id={id('waist')} name="waist" className={field} type="number" inputMode="decimal" min="40" max="180" step="0.1" value={form.waist} onChange={(e) => update('waist', e.target.value)} /></div>
          <div><label htmlFor={id('hips')} className={label}>Hanches (cm)</label><input id={id('hips')} name="hips" className={field} type="number" inputMode="decimal" min="40" max="190" step="0.1" value={form.hips} onChange={(e) => update('hips', e.target.value)} /></div>
          <div><label htmlFor={id('shoeSize')} className={label}>Pointure</label><select id={id('shoeSize')} name="shoeSize" className={field} value={form.shoeSize} onChange={(e) => update('shoeSize', e.target.value)}><option value="" className="text-pm-ink">Sélectionner</option>{Array.from({ length: 19 }, (_, index) => 34 + index * 0.5).map((size) => <option key={size} value={size} className="text-pm-ink">{size}</option>)}</select></div>
          <div><label htmlFor={id('eyeColor')} className={label}>Couleur des yeux</label><select id={id('eyeColor')} name="eyeColor" className={field} value={form.eyeColor} onChange={(e) => update('eyeColor', e.target.value)}><option value="" className="text-pm-ink">Sélectionner</option>{EYE_COLORS.map((value) => <option key={value} value={value} className="text-pm-ink">{value}</option>)}</select></div>
          <div><label htmlFor={id('hairColor')} className={label}>Couleur des cheveux</label><select id={id('hairColor')} name="hairColor" className={field} value={form.hairColor} onChange={(e) => update('hairColor', e.target.value)}><option value="" className="text-pm-ink">Sélectionner</option>{HAIR_COLORS.map((value) => <option key={value} value={value} className="text-pm-ink">{value}</option>)}</select></div>
        </div>
      </section>

      <section className={sectionClass} aria-labelledby={id('journey-title')}>
        <div id={id('journey-title')}><SectionTitle index="03" title="Parcours" description="Quelques éléments pour comprendre votre expérience, votre univers et votre motivation." /></div>
        <div className="grid gap-7 md:grid-cols-2">
          <div><label htmlFor={id('experience')} className={label}>Niveau</label><select id={id('experience')} name="experience" className={field} value={form.experience} onChange={(e) => update('experience', e.target.value)}><option value="none" className="text-pm-ink">Aucune expérience</option><option value="beginner" className="text-pm-ink">Débutant</option><option value="intermediate" className="text-pm-ink">Intermédiaire</option><option value="professional" className="text-pm-ink">Professionnel</option></select></div>
          <div><label htmlFor={id('portfolioLink')} className={label}>Portfolio</label><input id={id('portfolioLink')} name="portfolioLink" className={field} type="url" inputMode="url" placeholder="https://…" value={form.portfolioLink} onChange={(e) => update('portfolioLink', e.target.value)} /></div>
        </div>
        <div className="mt-7"><label htmlFor={id('motivation')} className={label}>Motivation / expérience complémentaire</label><textarea id={id('motivation')} name="motivation" className={`${field} min-h-36 resize-y`} maxLength={2000} value={form.motivation} onChange={(e) => update('motivation', e.target.value)} /><p className="mt-2 text-right text-xs text-white/40">{form.motivation.length}/2000</p></div>
      </section>

      <section className={sectionClass} aria-labelledby={id('photos-title')}>
        <div id={id('photos-title')}><SectionTitle index="04" title="Photos" description="Privilégiez la lumière naturelle, une tenue simple et une image récente. Aucun book professionnel n’est obligatoire." /></div>
        <div className="grid gap-5 md:grid-cols-3">
          <ImgBBUploader publicMode allowUrl={false} label="Portrait" scope="casting-portrait" value={form.photoPortraitUrl} onChange={(url) => update('photoPortraitUrl', url)} />
          <ImgBBUploader publicMode allowUrl={false} label="Plein pied" scope="casting-full-body" value={form.photoFullBodyUrl} onChange={(url) => update('photoFullBodyUrl', url)} />
          <ImgBBUploader publicMode allowUrl={false} label="Profil" scope="casting-profile" value={form.photoProfileUrl} onChange={(url) => update('photoProfileUrl', url)} />
        </div>
      </section>

      <section className="border-t border-white/12 pt-8">
        <label htmlFor={id('consent')} className="flex cursor-pointer items-start gap-4 rounded-xl p-3 text-sm leading-7 text-white/65 transition hover:bg-white/[.04]">
          <input id={id('consent')} name="consent" type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1.5 h-5 w-5 shrink-0 accent-pm-gold" />
          <span>J’accepte que Perfect Models Management utilise ces informations et photos exclusivement dans le cadre de l’étude et du suivi de ma candidature.</span>
        </label>
        <div aria-live="assertive">{error && <p id={id('error')} role="alert" className="mt-6 rounded-xl border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">{error}</p>}</div>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-white/45">En envoyant votre dossier, vous certifiez que les informations transmises sont exactes.</p>
          <button disabled={busy} className="pmm-button min-h-12 border-pm-gold bg-pm-gold text-black hover:bg-pm-gold-light disabled:cursor-wait disabled:opacity-50">{busy ? 'Envoi en cours…' : 'Envoyer mon dossier'}</button>
        </div>
      </section>
    </form>
  );
}
