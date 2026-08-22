'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeftIcon, PencilIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/DataContext';
import type { Artist, FashionDayEvent, Stylist } from '@/types';
import BlobMediaUploader from '@/components/admin/BlobMediaUploader';
import ImgBBUploader from '@/components/ImgBBUploader';
import ImgBBMultiUploader from '@/components/ImgBBMultiUploader';

type FashionDayEdition = FashionDayEvent & { coverImageUrl?: string };
type Person = Stylist | Artist;
type VideoMode = 'youtube' | 'blob' | 'none';

const inputClass = 'w-full rounded-lg border border-pm-gold/20 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-pm-gold/70';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-1.5">
    <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">{label}</span>
    {children}
  </label>
);

const blankEdition = (edition: number): FashionDayEdition => ({
  edition,
  date: '',
  theme: '',
  location: '',
  mc: '',
  promoter: '',
  description: '',
  coverImageUrl: '',
  announcementVideoUrl: '',
  announcementVideoEmbedUrl: '',
  galleryImages: [],
  stylists: [],
  artists: [],
  featuredModels: [],
  partners: [],
});

const cloneEdition = (event: FashionDayEdition): FashionDayEdition => JSON.parse(JSON.stringify(event));
const modeFor = (event: FashionDayEdition): VideoMode => event.announcementVideoEmbedUrl ? 'youtube' : event.announcementVideoUrl ? 'blob' : 'none';

function PeopleEditor({
  title,
  people,
  scope,
  onChange,
}: {
  title: string;
  people: Person[];
  scope: string;
  onChange: (people: Person[]) => void;
}) {
  const update = (index: number, patch: Partial<Person>) =>
    onChange(people.map((person, i) => (i === index ? { ...person, ...patch } : person)));

  return (
    <section className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-playfair text-xl font-bold text-pm-gold">{title}</h3>
        <button
          type="button"
          onClick={() => onChange([...people, { name: '', description: '', images: [] }])}
          className="inline-flex items-center gap-1.5 rounded-full border border-pm-gold/30 px-3 py-1.5 text-xs text-pm-gold hover:bg-pm-gold/10"
        >
          <PlusIcon className="h-3.5 w-3.5" /> Ajouter
        </button>
      </div>
      {people.length === 0 && <p className="text-xs text-white/30">Aucun élément pour cette édition.</p>}
      {people.map((person, index) => (
        <div key={index} className="space-y-3 rounded-lg border border-white/5 bg-black/30 p-3">
          <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
            <input className={inputClass} value={person.name} onChange={(e) => update(index, { name: e.target.value })} placeholder="Nom" />
            <input className={inputClass} value={person.description} onChange={(e) => update(index, { description: e.target.value })} placeholder="Description / biographie" />
            <button type="button" onClick={() => onChange(people.filter((_, i) => i !== index))} className="rounded-lg border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10" title="Supprimer">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          <ImgBBMultiUploader
            values={person.images ?? []}
            onChange={(images) => update(index, { images })}
            scope={`${scope}/${index}`}
          />
        </div>
      ))}
    </section>
  );
}

function GalleryEditor({ value, edition, onChange }: { value: string[]; edition: number; onChange: (urls: string[]) => void }) {
  return (
    <section className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <h3 className="font-playfair text-xl font-bold text-pm-gold">Galerie de l’édition</h3>
      <ImgBBMultiUploader
        values={value}
        onChange={onChange}
        scope={`fashion-day/editions/${edition}/gallery`}
      />
    </section>
  );
}

export default function AdminFashionDayEventsPage() {
  const router = useRouter();
  const { data, saveData, isInitialized } = useData();
  const [draft, setDraft] = useState<FashionDayEdition | null>(null);
  const [videoMode, setVideoMode] = useState<VideoMode>('none');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const events = useMemo(
    () => ((data?.fashionDayEvents ?? []) as FashionDayEdition[]).slice().sort((a, b) => b.edition - a.edition),
    [data?.fashionDayEvents],
  );

  const update = (patch: Partial<FashionDayEdition>) => setDraft((current) => (current ? { ...current, ...patch } : current));

  const beginCreate = () => {
    const nextEdition = events.length ? Math.max(...events.map((event) => event.edition)) + 1 : 1;
    setMessage('');
    setVideoMode('none');
    setDraft(blankEdition(nextEdition));
  };

  const beginEdit = (event: FashionDayEdition) => {
    setMessage('');
    setVideoMode(modeFor(event));
    setDraft(cloneEdition(event));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseVideoMode = (mode: VideoMode) => {
    setVideoMode(mode);
    if (mode === 'youtube') update({ announcementVideoUrl: '' });
    if (mode === 'blob') update({ announcementVideoEmbedUrl: '' });
    if (mode === 'none') update({ announcementVideoEmbedUrl: '', announcementVideoUrl: '' });
  };

  const save = async () => {
    if (!data || !draft) return;
    if (!draft.theme.trim() || !draft.date) {
      setMessage('Le thème et la date sont obligatoires.');
      return;
    }
    if (!draft.coverImageUrl?.trim()) {
      setMessage('Chaque édition doit avoir sa propre cover avant la sauvegarde.');
      return;
    }
    if (videoMode === 'youtube' && !draft.announcementVideoEmbedUrl?.trim()) {
      setMessage('Ajoutez le lien YouTube du spot ou choisissez « Aucun ».');
      return;
    }
    if (videoMode === 'blob' && !draft.announcementVideoUrl?.trim()) {
      setMessage('Téléversez le fichier vidéo du spot ou choisissez « Aucun ».');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const current = (data.fashionDayEvents ?? []) as FashionDayEdition[];
      const exists = current.some((event) => event.edition === draft.edition);
      const next = exists ? current.map((event) => (event.edition === draft.edition ? draft : event)) : [...current, draft];
      await saveData({ ...data, fashionDayEvents: next });
      setMessage(`Édition ${draft.edition} enregistrée.`);
      setDraft(null);
      setVideoMode('none');
    } catch (cause: any) {
      setMessage(cause?.message || 'La sauvegarde a échoué.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (edition: number) => {
    if (!data || !window.confirm(`Supprimer définitivement l’édition ${edition} ?`)) return;
    setSaving(true);
    try {
      await saveData({ ...data, fashionDayEvents: data.fashionDayEvents.filter((event) => event.edition !== edition) });
      if (draft?.edition === edition) setDraft(null);
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || !data) return <div className="min-h-screen bg-pm-dark p-10 text-white/50">Chargement des éditions…</div>;

  return (
    <main className="min-h-screen bg-pm-dark px-4 py-20 text-pm-off-white sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button onClick={() => router.push('/admin')} className="mb-4 inline-flex items-center gap-2 text-sm text-pm-gold/70 hover:text-pm-gold">
              <ArrowLeftIcon className="h-4 w-4" /> Tableau de bord
            </button>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/30">Perfect Models Management</p>
            <h1 className="mt-2 font-playfair text-4xl font-black text-pm-gold sm:text-5xl">Éditions Perfect Fashion Day</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">Chaque édition possède sa cover, son contenu et son spot vidéo indépendant.</p>
          </div>
          <button onClick={beginCreate} className="inline-flex items-center justify-center gap-2 rounded-full bg-pm-gold px-5 py-3 text-sm font-black text-pm-dark hover:bg-pm-gold/90">
            <PlusIcon className="h-4 w-4" /> Nouvelle édition
          </button>
        </div>

        {message && <div className="rounded-lg border border-pm-gold/20 bg-pm-gold/5 px-4 py-3 text-sm text-pm-gold">{message}</div>}

        {draft && (
          <section className="space-y-6 rounded-2xl border border-pm-gold/20 bg-black/60 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">Configuration</span>
                <h2 className="font-playfair text-2xl font-bold">Édition {draft.edition}</h2>
              </div>
              <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-white/10 p-2 text-white/50 hover:text-white"><XMarkIcon className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Thème *"><input className={inputClass} value={draft.theme} onChange={(e) => update({ theme: e.target.value })} /></Field>
                <Field label="Date *"><input type="date" className={inputClass} value={draft.date} onChange={(e) => update({ date: e.target.value })} /></Field>
                <Field label="Lieu"><input className={inputClass} value={draft.location ?? ''} onChange={(e) => update({ location: e.target.value })} /></Field>
                <Field label="Maître de cérémonie"><input className={inputClass} value={draft.mc ?? ''} onChange={(e) => update({ mc: e.target.value })} /></Field>
                <Field label="Promoteur"><input className={inputClass} value={draft.promoter ?? ''} onChange={(e) => update({ promoter: e.target.value })} /></Field>
                <div className="sm:col-span-2"><Field label="Description"><textarea className={`${inputClass} min-h-28`} value={draft.description} onChange={(e) => update({ description: e.target.value })} /></Field></div>
              </div>
              <ImgBBUploader
                label="Cover propre à cette édition *"
                scope={`fashion-day/editions/${draft.edition}/cover`}
                value={draft.coverImageUrl ?? ''}
                onChange={(coverImageUrl) => update({ coverImageUrl })}
                allowUrl={false}
              />
            </div>

            <section className="space-y-4 rounded-xl border border-pm-gold/10 bg-pm-gold/[0.03] p-4">
              <div>
                <h3 className="font-playfair text-xl font-bold text-pm-gold">Spot vidéo</h3>
                <p className="mt-1 text-xs text-white/35">Intégration YouTube ou fichier vidéo téléversé directement dans Vercel Blob.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['youtube', 'blob', 'none'] as VideoMode[]).map((mode) => (
                  <button key={mode} type="button" onClick={() => chooseVideoMode(mode)} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider ${videoMode === mode ? 'border-pm-gold bg-pm-gold text-pm-dark' : 'border-white/10 text-white/50'}`}>
                    {mode === 'youtube' ? 'YouTube' : mode === 'blob' ? 'Fichier vidéo' : 'Aucun'}
                  </button>
                ))}
              </div>
              {videoMode === 'youtube' && (
                <Field label="Lien YouTube"><input className={inputClass} value={draft.announcementVideoEmbedUrl ?? ''} onChange={(e) => update({ announcementVideoEmbedUrl: e.target.value, announcementVideoUrl: '' })} placeholder="https://www.youtube.com/watch?v=..." /></Field>
              )}
              {videoMode === 'blob' && (
                <BlobMediaUploader label="Fichier du spot" scope={`fashion-day/editions/${draft.edition}/spot`} value={draft.announcementVideoUrl ?? ''} onChange={(announcementVideoUrl) => update({ announcementVideoUrl, announcementVideoEmbedUrl: '' })} />
              )}
            </section>

            <GalleryEditor value={draft.galleryImages ?? []} edition={draft.edition} onChange={(galleryImages) => update({ galleryImages })} />

            <div className="grid gap-5 lg:grid-cols-2">
              <PeopleEditor title="Stylistes / Créateurs" people={draft.stylists ?? []} scope={`fashion-day/editions/${draft.edition}/stylists`} onChange={(stylists) => update({ stylists: stylists as Stylist[] })} />
              <PeopleEditor title="Artistes" people={draft.artists ?? []} scope={`fashion-day/editions/${draft.edition}/artists`} onChange={(artists) => update({ artists: artists as Artist[] })} />
            </div>

            <section className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <h3 className="font-playfair text-xl font-bold text-pm-gold">Mannequins vedettes</h3>
              <select className={inputClass} value="" onChange={(e) => { const name = e.target.value; if (name && !(draft.featuredModels ?? []).includes(name)) update({ featuredModels: [...(draft.featuredModels ?? []), name] }); }}>
                <option value="">Ajouter un mannequin…</option>
                {data.models.filter((model) => !(draft.featuredModels ?? []).includes(model.name)).map((model) => <option key={model.id} value={model.name}>{model.name}</option>)}
              </select>
              <div className="flex flex-wrap gap-2">
                {(draft.featuredModels ?? []).map((name) => <button key={name} type="button" onClick={() => update({ featuredModels: (draft.featuredModels ?? []).filter((item) => item !== name) })} className="rounded-full border border-pm-gold/20 px-3 py-1.5 text-xs text-white/70 hover:border-red-400/40 hover:text-red-300">{name} ×</button>)}
              </div>
            </section>

            <section className="space-y-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-playfair text-xl font-bold text-pm-gold">Partenaires</h3>
                <button type="button" onClick={() => update({ partners: [...(draft.partners ?? []), { type: '', name: '' }] })} className="text-xs text-pm-gold">+ Ajouter</button>
              </div>
              {(draft.partners ?? []).map((partner, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[0.7fr_1.3fr_auto]">
                  <input className={inputClass} value={partner.type} placeholder="Type" onChange={(e) => update({ partners: (draft.partners ?? []).map((item, i) => i === index ? { ...item, type: e.target.value } : item) })} />
                  <input className={inputClass} value={partner.name} placeholder="Nom" onChange={(e) => update({ partners: (draft.partners ?? []).map((item, i) => i === index ? { ...item, name: e.target.value } : item) })} />
                  <button type="button" onClick={() => update({ partners: (draft.partners ?? []).filter((_, i) => i !== index) })} className="rounded-lg border border-red-500/20 p-2 text-red-300"><TrashIcon className="h-4 w-4" /></button>
                </div>
              ))}
            </section>

            <div className="flex flex-wrap gap-3 border-t border-white/5 pt-5">
              <button type="button" disabled={saving} onClick={() => void save()} className="rounded-full bg-pm-gold px-6 py-3 text-sm font-black text-pm-dark disabled:opacity-50">{saving ? 'Sauvegarde…' : `Sauvegarder l’édition ${draft.edition}`}</button>
              <button type="button" onClick={() => { setDraft(null); setVideoMode('none'); }} className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/60">Annuler</button>
            </div>
          </section>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <article key={event.edition} className="overflow-hidden rounded-2xl border border-white/10 bg-black/50">
              <div className="relative aspect-[16/10] bg-white/5">
                <img src={event.coverImageUrl || data.siteImages.fashionDayBg} alt={`Cover édition ${event.edition}`} className="h-full w-full object-cover" />
                {!event.coverImageUrl && <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase text-black">Cover à définir</span>}
                <span className="absolute bottom-3 left-3 rounded-full bg-black/75 px-3 py-1 text-xs font-black text-pm-gold">Édition {String(event.edition).padStart(2, '0')}</span>
              </div>
              <div className="space-y-3 p-4">
                <div><h2 className="font-playfair text-2xl font-bold">{event.theme}</h2><p className="text-xs text-white/35">{event.date}{event.location ? ` · ${event.location}` : ''}</p></div>
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-white/40">
                  {event.announcementVideoEmbedUrl && <span className="rounded-full border border-white/10 px-2 py-1">YouTube</span>}
                  {event.announcementVideoUrl && <span className="rounded-full border border-white/10 px-2 py-1">Vidéo Blob</span>}
                  <span className="rounded-full border border-white/10 px-2 py-1">{event.galleryImages?.length ?? 0} photos</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => beginEdit(event)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-pm-gold/30 px-3 py-2 text-xs font-bold text-pm-gold hover:bg-pm-gold/10"><PencilIcon className="h-4 w-4" /> Modifier</button>
                  <button type="button" disabled={saving} onClick={() => void remove(event.edition)} className="rounded-lg border border-red-500/20 px-3 py-2 text-red-300 hover:bg-red-500/10"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          ))}
          {events.length === 0 && <p className="text-sm text-white/40">Aucune édition enregistrée.</p>}
        </section>
      </div>
    </main>
  );
}
