'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, EyeOff, Search, ShieldCheck } from 'lucide-react';

type ClaimableModel = { id: string; name: string; username: string | null; imageUrl: string | null; location: string | null };
type Props = { models: ClaimableModel[] };

type FormState = {
  email: string; phone: string; birthDate: string; gender: string; nationality: string; city: string;
  heightCm: string; chest: string; waist: string; hips: string; shoeSize: string; instagramUrl: string;
  password: string; confirmPassword: string;
};

const initialForm: FormState = { email: '', phone: '', birthDate: '', gender: '', nationality: 'Gabonaise', city: '', heightCm: '', chest: '', waist: '', hips: '', shoeSize: '', instagramUrl: '', password: '', confirmPassword: '' };
const input = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-[15px] text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10';
const label = 'mb-2 block text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/60';

function passwordValid(value: string) {
  return value.length >= 12 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

export default function ModelSignupForm({ models }: Props) {
  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<FormState>(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [completeEmail, setCompleteEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const selected = models.find((model) => model.id === selectedId) || null;
  const filtered = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('fr');
    if (!needle) return models;
    return models.filter((model) => `${model.name} ${model.username || ''} ${model.location || ''}`.toLocaleLowerCase('fr').includes(needle));
  }, [models, search]);

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const next = () => {
    setError('');
    if (step === 1 && !selected) return setError('Sélectionnez votre profil mannequin dans la liste de l’agence.');
    if (step === 2 && (!form.email || !form.phone || !form.birthDate || !form.gender || !form.city)) return setError('Complétez les coordonnées et informations personnelles obligatoires.');
    setStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return setError('Profil mannequin requis.');
    if (!passwordValid(form.password)) return setError('Le mot de passe doit contenir au moins 12 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
    if (form.password !== form.confirmPassword) return setError('Les deux mots de passe ne correspondent pas.');
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/auth/model-signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: selected.id, ...form }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Inscription impossible.');
      setCompleteEmail(result.email || form.email);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Inscription impossible.');
    } finally { setBusy(false); }
  };

  if (completeEmail) {
    return <div className="mx-auto max-w-2xl rounded-[2rem] border border-emerald-200 bg-white p-7 text-center shadow-[0_22px_65px_rgba(91,46,37,.08)] sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700"><Check size={28} /></div>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[.14em] text-emerald-700">Inscription enregistrée</p>
      <h2 className="mt-3 font-playfair text-4xl font-bold">Confirmez votre adresse e-mail</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-pm-ink/60">Supabase Auth a envoyé un lien de confirmation à <strong>{completeEmail}</strong>. Ouvrez ce message et confirmez votre adresse pour terminer l’activation de votre compte mannequin.</p>
      <p className="mt-4 rounded-xl bg-pm-peach px-4 py-3 text-sm leading-6 text-pm-wine">Si votre ancien dossier ne contient pas assez d’éléments pour vérifier automatiquement votre identité, le compte restera en validation agence après la confirmation de l’e-mail.</p>
      <Link href="/login" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-pm-ink px-6 text-xs font-extrabold uppercase tracking-[.1em] text-white">Retour à la connexion</Link>
    </div>;
  }

  return <form onSubmit={submit} className="mx-auto w-full max-w-6xl">
    <div className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-pm-ink/10 bg-white px-5 py-4">
      {[['1','Mon profil'],['2','Mes informations'],['3','Sécurité']].map(([number, title], index) => <div key={number} className={`flex items-center gap-2 ${step >= index + 1 ? 'text-pm-wine' : 'text-pm-ink/30'}`}><span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${step >= index + 1 ? 'bg-pm-peach' : 'bg-pm-ivory'}`}>{number}</span><span className="hidden text-xs font-extrabold uppercase tracking-[.08em] sm:inline">{title}</span></div>)}
    </div>

    {step === 1 && <section aria-labelledby="claim-profile-title">
      <div className="max-w-2xl"><p className="editorial-kicker text-pm-coral">Étape 1</p><h2 id="claim-profile-title" className="mt-3 font-playfair text-4xl font-bold sm:text-5xl">Retrouvez votre profil PMM</h2><p className="mt-4 text-sm leading-7 text-pm-ink/60">Seuls les mannequins présents dans la base de l’agence et n’ayant pas encore de compte peuvent être sélectionnés.</p></div>
      <label className="relative mt-7 block max-w-xl"><span className="sr-only">Rechercher un profil</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pm-ink/35" size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher votre nom ou identifiant PMM…" className={`${input} pl-11`} /></label>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((model) => {
        const active = selectedId === model.id;
        return <button key={model.id} type="button" aria-pressed={active} onClick={() => setSelectedId(model.id)} className={`overflow-hidden rounded-[1.5rem] border bg-white text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pm-coral ${active ? 'border-pm-coral ring-4 ring-pm-coral/10' : 'border-pm-ink/10 hover:border-pm-coral/40'}`}>
          <div className="relative aspect-[4/3] bg-pm-peach"><Image src={model.imageUrl || '/logo.svg'} alt="" fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover" /></div>
          <div className="p-4"><div className="flex items-start justify-between gap-2"><div><p className="font-playfair text-xl font-bold">{model.name}</p><p className="mt-1 text-xs font-semibold text-pm-ink/45">{model.username || 'Identifiant à compléter'}</p></div>{active && <span className="grid h-7 w-7 place-items-center rounded-full bg-pm-coral text-white"><Check size={14}/></span>}</div>{model.location && <p className="mt-3 text-xs text-pm-ink/45">{model.location}</p>}</div>
        </button>;
      })}</div>
      {!filtered.length && <p className="mt-8 rounded-2xl bg-white p-6 text-center text-sm text-pm-ink/50">Aucun profil disponible ne correspond à cette recherche.</p>}
    </section>}

    {step === 2 && selected && <section aria-labelledby="claim-data-title">
      <p className="editorial-kicker text-pm-coral">Étape 2 · {selected.name}</p><h2 id="claim-data-title" className="mt-3 font-playfair text-4xl font-bold sm:text-5xl">Mettez vos informations à jour</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-pm-ink/60">Ces données serviront à compléter votre fiche agence. Les anciennes données disponibles sont utilisées uniquement pour sécuriser le rattachement du compte.</p>
      <div className="mt-8 grid gap-5 rounded-[2rem] border border-pm-ink/10 bg-white p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
        <div><label className={label}>Adresse e-mail *</label><input type="email" autoComplete="email" required value={form.email} onChange={(e)=>update('email',e.target.value)} className={input}/></div>
        <div><label className={label}>Téléphone *</label><input type="tel" autoComplete="tel" required value={form.phone} onChange={(e)=>update('phone',e.target.value)} className={input}/></div>
        <div><label className={label}>Date de naissance *</label><input type="date" autoComplete="bday" required value={form.birthDate} onChange={(e)=>update('birthDate',e.target.value)} className={input}/></div>
        <div><label className={label}>Genre *</label><select required value={form.gender} onChange={(e)=>update('gender',e.target.value)} className={input}><option value="">Sélectionner…</option><option>Femme</option><option>Homme</option><option>Autre</option></select></div>
        <div><label className={label}>Nationalité</label><input autoComplete="country-name" value={form.nationality} onChange={(e)=>update('nationality',e.target.value)} className={input}/></div>
        <div><label className={label}>Ville / localisation *</label><input autoComplete="address-level2" required value={form.city} onChange={(e)=>update('city',e.target.value)} className={input}/></div>
        <div><label className={label}>Taille (cm)</label><input type="number" min="130" max="220" inputMode="decimal" value={form.heightCm} onChange={(e)=>update('heightCm',e.target.value)} className={input}/></div>
        <div><label className={label}>Poitrine (cm)</label><input type="number" min="50" max="160" inputMode="decimal" value={form.chest} onChange={(e)=>update('chest',e.target.value)} className={input}/></div>
        <div><label className={label}>Taille / waist (cm)</label><input type="number" min="40" max="160" inputMode="decimal" value={form.waist} onChange={(e)=>update('waist',e.target.value)} className={input}/></div>
        <div><label className={label}>Hanches (cm)</label><input type="number" min="50" max="180" inputMode="decimal" value={form.hips} onChange={(e)=>update('hips',e.target.value)} className={input}/></div>
        <div><label className={label}>Pointure</label><select value={form.shoeSize} onChange={(e)=>update('shoeSize',e.target.value)} className={input}><option value="">Sélectionner…</option>{Array.from({length:17},(_,i)=>32+i).map(size=><option key={size}>{size}</option>)}</select></div>
        <div><label className={label}>Instagram</label><input type="url" inputMode="url" placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={(e)=>update('instagramUrl',e.target.value)} className={input}/></div>
      </div>
    </section>}

    {step === 3 && selected && <section aria-labelledby="claim-security-title">
      <p className="editorial-kicker text-pm-coral">Étape 3 · {selected.name}</p><h2 id="claim-security-title" className="mt-3 font-playfair text-4xl font-bold sm:text-5xl">Créez votre accès sécurisé</h2>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
        <div className="rounded-[2rem] border border-pm-ink/10 bg-white p-5 sm:p-7">
          <div><label className={label}>Mot de passe *</label><div className="relative"><input type={showPassword?'text':'password'} autoComplete="new-password" required value={form.password} onChange={(e)=>update('password',e.target.value)} className={`${input} pr-12`}/><button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Masquer le mot de passe':'Afficher le mot de passe'} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-pm-ink/45">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></div>
          <div className="mt-5"><label className={label}>Confirmer le mot de passe *</label><input type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={(e)=>update('confirmPassword',e.target.value)} className={input}/></div>
          <p className={`mt-4 text-sm ${passwordValid(form.password) ? 'text-emerald-700' : 'text-pm-ink/50'}`}>12 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.</p>
        </div>
        <aside className="rounded-[2rem] bg-pm-ink p-6 text-white"><ShieldCheck className="text-pm-gold-light" size={30}/><h3 className="mt-5 font-playfair text-3xl font-bold">Confirmation par e-mail</h3><p className="mt-4 text-sm leading-7 text-white/65">Après l’inscription, Supabase Auth enverra le lien de confirmation à votre adresse. Votre mot de passe reste géré par le système d’authentification et n’est jamais stocké dans votre fiche mannequin.</p></aside>
      </div>
    </section>}

    {error && <p role="alert" className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><div>{step > 1 ? <button type="button" disabled={busy} onClick={()=>{setStep(step-1);setError('');}} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-pm-ink/15 bg-white px-5 text-xs font-extrabold uppercase tracking-[.08em]"><ChevronLeft size={15}/> Retour</button> : <Link href="/login" className="inline-flex min-h-11 items-center px-4 text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/50">Déjà inscrit ? Connexion</Link>}</div>{step < 3 ? <button type="button" onClick={next} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pm-ink px-7 text-xs font-extrabold uppercase tracking-[.1em] text-white">Continuer <ChevronRight size={15}/></button> : <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-pm-wine px-8 text-xs font-extrabold uppercase tracking-[.1em] text-white disabled:opacity-50">{busy?'Création du compte…':'Créer mon compte mannequin'}</button>}</div>
  </form>;
}
