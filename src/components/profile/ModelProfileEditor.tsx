'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Check, Crown, ImagePlus, Loader2, Save, Trash2, UserRoundPen } from 'lucide-react';
import ImgBBUploader from '@/components/ImgBBUploader';

type PortfolioImage = { id: string; url: string; position: number; caption: string | null };

type ModelForm = {
  name: string;
  email: string;
  username: string;
  phone: string;
  gender: string;
  birthDate: string;
  nationality: string;
  instagramUrl: string;
  location: string;
  heightCm: string;
  chestCm: string;
  waistCm: string;
  hipsCm: string;
  shoeSize: string;
  hairColor: string;
  eyeColor: string;
  categories: string;
  mobility: string;
  experience: string;
  journey: string;
  imageUrl: string;
  compCardUrl: string;
  compCardPublic: boolean;
};

type Props = {
  modelId: string;
  initialModel: ModelForm;
  initialPortfolio: PortfolioImage[];
};

const inputClass = 'min-h-12 w-full min-w-0 rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-sm text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10';
const labelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[.12em] text-pm-ink/55';

function list(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export default function ModelProfileEditor({ modelId, initialModel, initialPortfolio }: Props) {
  const [form, setForm] = useState(initialModel);
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [saving, setSaving] = useState(false);
  const [portfolioBusy, setPortfolioBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const portfolioCount = portfolio.length;
  const profileImageInPortfolio = useMemo(() => portfolio.some((item) => item.url === form.imageUrl), [portfolio, form.imageUrl]);

  function payload(next = form) {
    return {
      name: next.name,
      phone: next.phone,
      gender: next.gender,
      birthDate: next.birthDate,
      nationality: next.nationality,
      instagramUrl: next.instagramUrl,
      location: next.location,
      heightCm: next.heightCm,
      chestCm: next.chestCm,
      waistCm: next.waistCm,
      hipsCm: next.hipsCm,
      shoeSize: next.shoeSize,
      hairColor: next.hairColor,
      eyeColor: next.eyeColor,
      categories: list(next.categories),
      mobility: list(next.mobility),
      experience: next.experience,
      journey: next.journey,
      imageUrl: next.imageUrl,
      compCardUrl: next.compCardUrl,
      compCardPublic: next.compCardPublic,
    };
  }

  async function persist(next = form, successMessage = 'Vos informations ont été enregistrées.') {
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/model/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload(next)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Enregistrement impossible.');
      setNotice(successMessage);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await persist();
  }

  async function setUploadedProfileImage(url: string) {
    const next = { ...form, imageUrl: url };
    setForm(next);
    await persist(next, 'Votre nouvelle photo principale est enregistrée.');
  }

  async function setUploadedCompCard(url: string) {
    const next = { ...form, compCardUrl: url };
    setForm(next);
    await persist(next, 'Votre composite officiel est enregistré dans votre espace.');
  }

  async function toggleCompCardPublic(value: boolean) {
    const next = { ...form, compCardPublic: value };
    setForm(next);
    await persist(next, value ? 'Votre composite peut maintenant être partagé publiquement.' : 'Votre composite est désormais privé.');
  }

  async function addPortfolio(url: string) {
    setPortfolioBusy('adding'); setError(''); setNotice('');
    try {
      const response = await fetch('/api/model/portfolio', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Ajout impossible.');
      setPortfolio((current) => [...current, data.image].sort((a, b) => a.position - b.position));
      setNotice('Photo ajoutée à votre portfolio.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Ajout impossible.');
    } finally {
      setPortfolioBusy('');
    }
  }

  async function setCover(image: PortfolioImage) {
    setPortfolioBusy(image.id); setError(''); setNotice('');
    try {
      const response = await fetch('/api/model/portfolio', {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: image.id, action: 'cover' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Modification impossible.');
      setForm((current) => ({ ...current, imageUrl: image.url }));
      setNotice('Cette photo est maintenant votre photo principale.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Modification impossible.');
    } finally {
      setPortfolioBusy('');
    }
  }

  async function removePortfolio(image: PortfolioImage) {
    setPortfolioBusy(image.id); setError(''); setNotice('');
    try {
      const response = await fetch('/api/model/portfolio', {
        method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: image.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Suppression impossible.');
      setPortfolio((current) => current.filter((item) => item.id !== image.id));
      setNotice('Photo retirée de votre portfolio.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Suppression impossible.');
    } finally {
      setPortfolioBusy('');
    }
  }

  return (
    <div className="min-w-0 space-y-6">
      <section className="min-w-0 overflow-hidden rounded-[2rem] bg-pm-wine p-6 text-white sm:p-8">
        <div className="grid min-w-0 gap-7 xl:grid-cols-[1.25fr_.75fr] xl:items-end">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-gold-light">Autonomie du profil</p>
            <h1 className="mt-3 break-words font-playfair text-4xl font-semibold sm:text-5xl">Mes informations & médias</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Mettez à jour vos informations professionnelles, votre photo principale, votre portfolio et votre composite. Les modifications sont liées uniquement à votre fiche mannequin.</p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-3">
            <div className="min-w-0 rounded-2xl bg-white/10 p-4"><p className="font-playfair text-3xl font-semibold">{portfolioCount}</p><p className="mt-1 break-words text-[9px] font-black uppercase tracking-[.1em] text-white/45">Photos portfolio</p></div>
            <div className="min-w-0 rounded-2xl bg-pm-coral p-4"><p className="font-playfair text-3xl font-semibold">{form.compCardUrl ? '1' : '0'}</p><p className="mt-1 break-words text-[9px] font-black uppercase tracking-[.1em] text-white/65">Composite officiel</p></div>
          </div>
        </div>
      </section>

      <div aria-live="polite" className="min-w-0 space-y-3">
        {notice && <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"><Check size={18} className="mt-0.5 shrink-0"/><span className="min-w-0 break-words">{notice}</span></div>}
        {error && <div className="min-w-0 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900"><span className="break-words">{error}</span></div>}
      </div>

      <section className="grid min-w-0 gap-6 2xl:grid-cols-[1.25fr_.75fr]">
        <form onSubmit={submit} className="min-w-0 rounded-[2rem] border border-pm-ink/10 bg-white p-5 shadow-[0_18px_55px_rgba(37,24,32,.05)] sm:p-7">
          <div className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pm-peach text-pm-wine"><UserRoundPen size={19}/></span><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-coral">Fiche mannequin</p><h2 className="break-words font-playfair text-3xl font-semibold">Informations modifiables</h2></div></div>

          <div className="mt-7 grid min-w-0 gap-5 sm:grid-cols-2">
            <label className="min-w-0 sm:col-span-2"><span className={labelClass}>Nom affiché</span><input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className={inputClass} required /></label>
            <label className="min-w-0"><span className={labelClass}>Identifiant PMM</span><input value={form.username} className={`${inputClass} bg-pm-ivory text-pm-ink/45`} disabled /></label>
            <label className="min-w-0"><span className={labelClass}>E-mail de connexion</span><input value={form.email} className={`${inputClass} bg-pm-ivory text-pm-ink/45`} disabled /></label>
            <label className="min-w-0"><span className={labelClass}>Téléphone</span><input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} className={inputClass} inputMode="tel" /></label>
            <label className="min-w-0"><span className={labelClass}>Genre</span><select value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})} className={inputClass}><option value="">Non renseigné</option><option value="Femme">Femme</option><option value="Homme">Homme</option><option value="Autre">Autre</option></select></label>
            <label className="min-w-0"><span className={labelClass}>Date de naissance</span><input type="date" value={form.birthDate} onChange={(e)=>setForm({...form,birthDate:e.target.value})} className={inputClass} /></label>
            <label className="min-w-0"><span className={labelClass}>Nationalité</span><input value={form.nationality} onChange={(e)=>setForm({...form,nationality:e.target.value})} className={inputClass} /></label>
            <label className="min-w-0"><span className={labelClass}>Ville / localisation</span><input value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} className={inputClass} /></label>
            <label className="min-w-0"><span className={labelClass}>Instagram</span><input type="url" value={form.instagramUrl} onChange={(e)=>setForm({...form,instagramUrl:e.target.value})} placeholder="https://instagram.com/..." className={inputClass} /></label>
          </div>

          <div className="my-8 border-t border-pm-ink/10" />
          <h3 className="font-playfair text-2xl font-semibold">Mensurations & caractéristiques</h3>
          <div className="mt-5 grid min-w-0 grid-cols-2 gap-4 md:grid-cols-3">
            {[['heightCm','Taille (cm)'],['chestCm','Poitrine (cm)'],['waistCm','Tour de taille (cm)'],['hipsCm','Hanches (cm)']].map(([key,label]) => <label key={key} className="min-w-0"><span className={labelClass}>{label}</span><input type="number" step="0.1" value={form[key as keyof ModelForm] as string} onChange={(e)=>setForm({...form,[key]:e.target.value})} className={inputClass}/></label>)}
            <label className="min-w-0"><span className={labelClass}>Pointure</span><input value={form.shoeSize} onChange={(e)=>setForm({...form,shoeSize:e.target.value})} className={inputClass}/></label>
            <label className="min-w-0"><span className={labelClass}>Cheveux</span><input value={form.hairColor} onChange={(e)=>setForm({...form,hairColor:e.target.value})} className={inputClass}/></label>
            <label className="min-w-0"><span className={labelClass}>Yeux</span><input value={form.eyeColor} onChange={(e)=>setForm({...form,eyeColor:e.target.value})} className={inputClass}/></label>
          </div>

          <div className="my-8 border-t border-pm-ink/10" />
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <label className="min-w-0"><span className={labelClass}>Catégories</span><input value={form.categories} onChange={(e)=>setForm({...form,categories:e.target.value})} placeholder="Défilé, éditorial, commercial" className={inputClass}/><span className="mt-2 block text-[10px] leading-5 text-pm-ink/40">Séparez les catégories par des virgules.</span></label>
            <label className="min-w-0"><span className={labelClass}>Mobilité</span><input value={form.mobility} onChange={(e)=>setForm({...form,mobility:e.target.value})} placeholder="Libreville, Port-Gentil, International" className={inputClass}/><span className="mt-2 block text-[10px] leading-5 text-pm-ink/40">Séparez les zones par des virgules.</span></label>
            <label className="min-w-0 sm:col-span-2"><span className={labelClass}>Expérience</span><textarea rows={5} value={form.experience} onChange={(e)=>setForm({...form,experience:e.target.value})} className={`${inputClass} resize-y leading-6`}/></label>
            <label className="min-w-0 sm:col-span-2"><span className={labelClass}>Parcours / présentation</span><textarea rows={5} value={form.journey} onChange={(e)=>setForm({...form,journey:e.target.value})} className={`${inputClass} resize-y leading-6`}/></label>
          </div>

          <button type="submit" disabled={saving} className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-pm-ink px-6 text-xs font-black uppercase tracking-[.1em] text-white disabled:opacity-45 sm:w-auto">
            {saving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Enregistrer mes modifications
          </button>
          <p className="mt-4 text-[10px] leading-5 text-pm-ink/40">Votre identifiant, votre e-mail de connexion et les droits du compte restent sécurisés et ne sont pas modifiables depuis cette fiche.</p>
        </form>

        <div className="min-w-0 space-y-6">
          <section className="min-w-0 overflow-hidden rounded-[2rem] bg-pm-ink p-5 text-white sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-gold-light">Photo principale</p>
            <div className="mt-4 aspect-[4/5] w-full min-w-0 overflow-hidden rounded-[1.4rem] bg-white/8">{form.imageUrl ? <img src={form.imageUrl} alt="Photo principale" className="h-full w-full object-cover"/> : <div className="grid h-full place-items-center text-white/30"><ImagePlus size={44}/></div>}</div>
            <p className="mt-4 text-xs leading-5 text-white/50">Cette image apparaît en priorité sur votre fiche publique et votre espace professionnel.</p>
            <div className="mt-4"><ImgBBUploader value="" onChange={(url)=>void setUploadedProfileImage(url)} scope={`models/${modelId}/profile`} publicMode compact /></div>
            {profileImageInPortfolio && <p className="mt-3 flex items-center gap-2 text-[10px] font-bold text-pm-gold-light"><Check size={13}/>Cette photo est aussi dans votre portfolio.</p>}
          </section>

          <section className="min-w-0 overflow-hidden rounded-[2rem] border border-pm-ink/10 bg-white p-5 sm:p-6">
            <p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-coral">Composite officiel</p>
            <h2 className="mt-2 font-playfair text-3xl font-semibold">Mon composite</h2>
            <div className="mt-4 aspect-[3/4] w-full min-w-0 overflow-hidden rounded-[1.4rem] bg-pm-ivory">{form.compCardUrl ? <img src={form.compCardUrl} alt="Composite officiel" className="h-full w-full object-contain"/> : <div className="grid h-full place-items-center p-6 text-center text-sm text-pm-ink/35">Aucun composite image téléversé.</div>}</div>
            <div className="mt-4 rounded-xl bg-pm-wine p-4 text-white"><ImgBBUploader value="" onChange={(url)=>void setUploadedCompCard(url)} scope={`models/${modelId}/comp-card`} publicMode compact /></div>
            <label className="mt-4 flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-pm-ink/10 bg-pm-ivory p-4"><input type="checkbox" checked={form.compCardPublic} disabled={!form.compCardUrl || saving} onChange={(e)=>void toggleCompCardPublic(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-pm-wine"/><span className="min-w-0"><span className="block text-sm font-extrabold">Autoriser le partage public</span><span className="mt-1 block text-xs leading-5 text-pm-ink/45">Vous gardez la possibilité de rendre le composite privé à tout moment.</span></span></label>
          </section>
        </div>
      </section>

      <section className="min-w-0 rounded-[2rem] border border-pm-ink/10 bg-white p-5 shadow-[0_18px_55px_rgba(37,24,32,.05)] sm:p-7">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.18em] text-pm-coral">Portfolio personnel</p><h2 className="mt-2 break-words font-playfair text-3xl font-semibold sm:text-4xl">Mes photos</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-pm-ink/50">Ajoutez vos images vous-même. Vous pouvez retirer une photo ou la définir comme photo principale sans intervention de l’agence.</p></div>
          <div className="min-w-0 rounded-xl bg-pm-wine p-3 text-white"><ImgBBUploader value="" onChange={(url)=>void addPortfolio(url)} scope={`models/${modelId}/portfolio`} publicMode compact /></div>
        </div>

        {portfolioBusy === 'adding' && <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-pm-wine"><Loader2 size={16} className="animate-spin"/>Ajout au portfolio…</div>}

        {portfolio.length ? <div className="mt-6 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{portfolio.map((image) => {
          const busy = portfolioBusy === image.id;
          const cover = form.imageUrl === image.url;
          return <article key={image.id} className="group min-w-0 overflow-hidden rounded-[1.3rem] border border-pm-ink/10 bg-pm-ivory">
            <div className="relative aspect-[4/5] min-w-0 overflow-hidden"><img src={image.url} alt={image.caption || 'Photo du portfolio'} className="h-full w-full object-cover"/>{cover && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-pm-gold px-2.5 py-1 text-[8px] font-black uppercase tracking-[.08em] text-pm-ink"><Crown size={10}/>Principale</span>}</div>
            <div className="grid grid-cols-2 gap-2 p-2">
              <button type="button" disabled={busy || cover} onClick={()=>void setCover(image)} className="min-h-10 min-w-0 rounded-xl bg-white px-2 text-[9px] font-black uppercase tracking-[.06em] text-pm-wine disabled:opacity-35">Principale</button>
              <button type="button" disabled={busy} onClick={()=>void removePortfolio(image)} className="grid min-h-10 place-items-center rounded-xl bg-white text-red-600 disabled:opacity-35" aria-label="Retirer la photo">{busy ? <Loader2 size={15} className="animate-spin"/> : <Trash2 size={15}/>}</button>
            </div>
          </article>;
        })}</div> : <div className="mt-6 rounded-[1.5rem] bg-pm-ivory p-8 text-center text-sm text-pm-ink/45">Votre portfolio ne contient encore aucune photo. Utilisez « Téléverser » pour commencer.</div>}
      </section>
    </div>
  );
}
