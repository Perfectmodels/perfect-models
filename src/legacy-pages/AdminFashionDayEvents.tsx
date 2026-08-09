import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon, TrashIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon,
  PencilIcon, CheckIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { FashionDayEvent, Stylist, Artist } from '../types';
import { uploadToImgbb } from '../utils/imgbbService';
import ImgBBUploader from '../components/ImgBBUploader';
import { useToast } from '../components/ui/Toast';

// ── Helpers ──────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block">{label}</label>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
);

// ── Person editor (Styliste / Artiste) ────────────────────────────────────────

interface PersonEditorProps<T extends Stylist | Artist> {
  title: string;
  items: T[];
  onChange: (items: T[]) => void;
  emptyItem: T;
  imgbbApiKey?: string;
}

function PersonEditor<T extends Stylist | Artist>({ title, items, onChange, emptyItem, imgbbApiKey }: PersonEditorProps<T>) {
  const [open, setOpen] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const { success, error } = useToast();
  const showToast = (message: string, isSuccess: boolean) => isSuccess ? success(message) : error(message);

  const update = (i: number, patch: Partial<T>) => {
    const next = items.map((it, idx) => idx === i ? { ...it, ...patch } : it);
    onChange(next);
  };

  const handleImageUpload = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!imgbbApiKey?.trim()) {
      showToast('Configurez d’abord la clé ImgBB dans les paramètres admin.', false);
      return;
    }

    setUploadingIndex(i);
    try {
      const url = await uploadToImgbb(file, imgbbApiKey);
      update(i, { images: [...(items[i]?.images ?? []), url] } as Partial<T>);
      showToast('Photo ajoutée', true);
    } catch (error: any) {
      showToast(error?.message || 'Échec de l’upload de la photo', false);
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-pm-gold uppercase tracking-widest">{title} ({items.length})</h4>
        <button type="button" onClick={() => { onChange([...items, { ...emptyItem }]); setOpen(items.length); }}
          className="flex items-center gap-1 text-xs text-pm-gold/70 hover:text-pm-gold border border-pm-gold/30 px-2 py-1 rounded">
          <PlusIcon className="w-3 h-3" /> Ajouter
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-pm-dark/60 border border-pm-gold/10 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
              <span className="text-sm font-semibold">{item.name || `${title} ${i + 1}`}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={e => { e.stopPropagation(); onChange(items.filter((_, idx) => idx !== i)); }}
                  className="text-red-400/60 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                {open === i ? <ChevronUpIcon className="w-4 h-4 text-pm-gold/40" /> : <ChevronDownIcon className="w-4 h-4 text-pm-gold/40" />}
              </div>
            </div>
            {open === i && (
              <div className="px-3 pb-3 space-y-3 border-t border-pm-gold/10">
                <Field label="Nom">
                  <Input value={item.name} onChange={e => update(i, { name: e.target.value } as Partial<T>)} placeholder="Nom complet" />
                </Field>
                <Field label="Description">
                  <Textarea value={item.description} onChange={e => update(i, { description: e.target.value } as Partial<T>)} rows={2} placeholder="Courte biographie..." />
                </Field>
                <Field label="Photos du passage">
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 text-[11px] text-pm-gold/80 cursor-pointer">
                      <PlusIcon className="w-4 h-4" />
                      {uploadingIndex === i ? 'Upload en cours…' : 'Ajouter une photo depuis ImgBB'}
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(i, e)} />
                    </label>
                    {(item.images ?? []).length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {(item.images ?? []).map((img, idx) => (
                          <div key={idx} className="relative aspect-square overflow-hidden rounded border border-pm-gold/20">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => update(i, { images: (item.images ?? []).filter((_, imageIndex) => imageIndex !== idx) } as Partial<T>)}
                              className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white/70 hover:text-red-400"
                            >
                              <XMarkIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-pm-off-white/30 italic">Aucun(e) {title.toLowerCase()} ajouté(e).</p>}
      </div>
    </div>
  );
}

// ── Partners editor ───────────────────────────────────────────────────────────

const PartnersEditor: React.FC<{
  partners: { type: string; name: string }[];
  onChange: (p: { type: string; name: string }[]) => void;
}> = ({ partners, onChange }) => {
  const [type, setType] = useState('');
  const [name, setName] = useState('');

  const add = () => {
    if (!name.trim()) return;
    onChange([...partners, { type: type.trim(), name: name.trim() }]);
    setType(''); setName('');
  };

  return (
    <div>
      <h4 className="text-sm font-bold text-pm-gold uppercase tracking-widest mb-3">Partenaires ({partners.length})</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {partners.map((p, i) => (
          <span key={i} className="flex items-center gap-1 bg-pm-dark border border-pm-gold/20 rounded-full px-3 py-1 text-xs">
            {p.type && <span className="text-pm-gold/60">{p.type} —</span>} {p.name}
            <button type="button" onClick={() => onChange(partners.filter((_, ii) => ii !== i))} className="text-red-400/60 hover:text-red-400 ml-1">
              <XMarkIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        {partners.length === 0 && <p className="text-xs text-pm-off-white/30 italic">Aucun partenaire.</p>}
      </div>
      <div className="flex gap-2">
        <input value={type} onChange={e => setType(e.target.value)} placeholder="Type (ex: Sponsor)"
          className="w-28 bg-pm-dark border border-pm-gold/20 rounded px-2 py-1 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold" />
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="Nom du partenaire"
          className="flex-1 bg-pm-dark border border-pm-gold/20 rounded px-2 py-1 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold" />
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs bg-pm-gold text-pm-dark px-3 py-1 rounded font-bold hover:bg-pm-gold/80">
          <PlusIcon className="w-3 h-3" /> Ajouter
        </button>
      </div>
    </div>
  );
};

// ── Models list editor ────────────────────────────────────────────────────────

const FeaturedModelsEditor: React.FC<{
  featured: string[];
  allModels: { id: string; name: string }[];
  onChange: (m: string[]) => void;
}> = ({ featured, allModels, onChange }) => {
  const [selected, setSelected] = useState('');

  const add = () => {
    if (!selected || featured.includes(selected)) return;
    onChange([...featured, selected]);
    setSelected('');
  };

  return (
    <div>
      <h4 className="text-sm font-bold text-pm-gold uppercase tracking-widest mb-3">Mannequins Vedettes ({featured.length})</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {featured.map((name, i) => (
          <span key={i} className="flex items-center gap-1 bg-pm-dark border border-pm-gold/20 rounded-full px-3 py-1 text-xs">
            {name}
            <button type="button" onClick={() => onChange(featured.filter((_, ii) => ii !== i))} className="text-red-400/60 hover:text-red-400 ml-1">
              <XMarkIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
        {featured.length === 0 && <p className="text-xs text-pm-off-white/30 italic">Aucun mannequin vedette.</p>}
      </div>
      <div className="flex gap-2">
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="flex-1 bg-pm-dark border border-pm-gold/20 rounded px-2 py-1 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold">
          <option value="">Sélectionner un mannequin...</option>
          {allModels.filter(m => !featured.includes(m.name)).map(m => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        <button type="button" onClick={add} className="flex items-center gap-1 text-xs bg-pm-gold text-pm-dark px-3 py-1 rounded font-bold hover:bg-pm-gold/80">
          <PlusIcon className="w-3 h-3" /> Ajouter
        </button>
      </div>
    </div>
  );
};

// ── Event editor (inline) ─────────────────────────────────────────────────────

const EventEditor: React.FC<{
  event: FashionDayEvent;
  allModels: { id: string; name: string }[];
  onSave: (ev: FashionDayEvent) => void;
  onCancel: () => void;
}> = ({ event, allModels, onSave, onCancel }) => {
  const [ev, setEv] = useState<FashionDayEvent>(JSON.parse(JSON.stringify(event)));
  const [uploadingImage, setUploadingImage] = useState(false);
  const { data } = useData();
  const { success, error } = useToast();
  const showToast = (message: string, isSuccess: boolean) => isSuccess ? success(message) : error(message);

  const set = (patch: Partial<FashionDayEvent>) => setEv(prev => ({ ...prev, ...patch }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data?.apiKeys?.imgbbApiKey) {
      showToast('Configurez d’abord la clé ImgBB dans les paramètres admin.', false);
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadToImgbb(file, data.apiKeys.imgbbApiKey);
      set({ galleryImages: [...(ev.galleryImages ?? []), url] });
      showToast('Image ajoutée à la galerie', true);
    } catch (error: any) {
      showToast(error?.message || 'Échec de l’upload image', false);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  return (
    <div className="border-t border-pm-gold/20 p-5 space-y-6 bg-black/20">
      {/* Infos générales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Thème *">
          <Input value={ev.theme} onChange={e => set({ theme: e.target.value })} placeholder="Thème de l'édition" />
        </Field>
        <Field label="Date *">
          <Input type="date" value={ev.date} onChange={e => set({ date: e.target.value })} />
        </Field>
        <Field label="Lieu">
          <Input value={ev.location ?? ''} onChange={e => set({ location: e.target.value })} placeholder="Lieu de l'événement" />
        </Field>
        <Field label="Maître de Cérémonie">
          <Input value={ev.mc ?? ''} onChange={e => set({ mc: e.target.value })} placeholder="Nom du MC" />
        </Field>
        <Field label="Promoteur">
          <Input value={ev.promoter ?? ''} onChange={e => set({ promoter: e.target.value })} placeholder="Nom du promoteur" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea value={ev.description} onChange={e => set({ description: e.target.value })} rows={3} placeholder="Description de l'édition..." />
          </Field>
        </div>
      </div>

      <hr className="border-pm-gold/10" />

      {/* Vidéo spot d'annonce */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-pm-gold uppercase tracking-widest">Spot d'Annonce (Vidéo)</h4>
        <Field label="Lien YouTube ou TikTok">
          <Input
            value={ev.announcementVideoEmbedUrl ?? ''}
            onChange={e => set({ announcementVideoEmbedUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... ou https://www.tiktok.com/..."
          />
        </Field>
        <Field label="URL directe de la vidéo (optionnelle)">
          <Input
            value={ev.announcementVideoUrl ?? ''}
            onChange={e => set({ announcementVideoUrl: e.target.value })}
            placeholder="https://...mp4"
          />
        </Field>
        <p className="text-[10px] text-pm-off-white/40">Les vidéos peuvent être intégrées depuis YouTube ou TikTok. L’URL directe reste optionnelle pour les fichiers hébergés.</p>
      </div>

      <hr className="border-pm-gold/10" />

      {/* Galerie photos de l'édition */}
      <div>
        <h4 className="text-sm font-bold text-pm-gold uppercase tracking-widest mb-3">Galerie Photos de l'Édition</h4>
        <div className="flex flex-col gap-3">
          <label className="inline-flex items-center gap-2 text-[11px] text-pm-gold/80 cursor-pointer">
            <PlusIcon className="w-4 h-4" />
            {uploadingImage ? 'Upload en cours…' : 'Ajouter une photo depuis ImgBB'}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(ev.galleryImages ?? []).map((img, idx) => (
              <div key={idx} className="relative group aspect-square overflow-hidden rounded border border-pm-gold/20">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set({ galleryImages: (ev.galleryImages ?? []).filter((_, i) => i !== idx) })}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white/70 hover:text-red-400"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-pm-gold/10" />

      {/* Stylistes */}
      <PersonEditor<Stylist>
        title="Stylistes"
        items={ev.stylists ?? []}
        onChange={stylists => set({ stylists })}
        emptyItem={{ name: '', description: '', images: [] }}
        imgbbApiKey={data?.apiKeys?.imgbbApiKey || import.meta.env.VITE_IMGBB_API_KEY || ''}
      />

      <hr className="border-pm-gold/10" />

      {/* Artistes */}
      <PersonEditor<Artist>
        title="Artistes"
        items={ev.artists ?? []}
        onChange={artists => set({ artists })}
        emptyItem={{ name: '', description: '', images: [] }}
        imgbbApiKey={data?.apiKeys?.imgbbApiKey || import.meta.env.VITE_IMGBB_API_KEY || ''}
      />

      <hr className="border-pm-gold/10" />

      {/* Mannequins vedettes */}
      <FeaturedModelsEditor
        featured={ev.featuredModels ?? []}
        allModels={allModels}
        onChange={featuredModels => set({ featuredModels })}
      />

      <hr className="border-pm-gold/10" />

      {/* Partenaires */}
      <PartnersEditor
        partners={ev.partners ?? []}
        onChange={partners => set({ partners })}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => onSave(ev)}
          className="flex items-center gap-2 bg-pm-gold text-pm-dark px-5 py-2 rounded-full text-sm font-bold hover:bg-pm-gold/80">
          <CheckIcon className="w-4 h-4" /> Sauvegarder
        </button>
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 border border-pm-gold/30 text-pm-off-white/60 px-5 py-2 rounded-full text-sm hover:border-pm-gold/60">
          <XMarkIcon className="w-4 h-4" /> Annuler
        </button>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const EMPTY_EVENT: Omit<FashionDayEvent, 'edition'> = {
  date: '', theme: '', location: '', description: '',
  mc: '', promoter: '', stylists: [], artists: [], featuredModels: [], partners: [],
  announcementVideoUrl: '', galleryImages: [],
};

const AdminFashionDayEvents: React.FC = () => {
  const { data, saveData } = useData();
  const events = data?.fashionDayEvents ?? [];
  const models = data?.models ?? [];

  const [form, setForm] = useState(EMPTY_EVENT);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !form.theme.trim() || !form.date) return;
    const nextEdition = events.length > 0 ? Math.max(...events.map(ev => ev.edition)) + 1 : 1;
    const newEvent: FashionDayEvent = { ...form, edition: nextEdition };
    saveData({ ...data, fashionDayEvents: [...data.fashionDayEvents, newEvent] });
    setForm(EMPTY_EVENT);
    setShowForm(false);
  };

  const handleSaveEdit = (updated: FashionDayEvent) => {
    if (!data) return;
    saveData({ ...data, fashionDayEvents: data.fashionDayEvents.map(ev => ev.edition === updated.edition ? updated : ev) });
    setEditing(null);
  };

  const handleDelete = (edition: number) => {
    if (!data || !window.confirm('Supprimer cette édition ?')) return;
    saveData({ ...data, fashionDayEvents: data.fashionDayEvents.filter(ev => ev.edition !== edition) });
    if (expanded === edition) setExpanded(null);
    if (editing === edition) setEditing(null);
  };

  const sorted = [...events].sort((a, b) => b.edition - a.edition);

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Editions Fashion Day" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-playfair text-pm-gold">Éditions Fashion Day</h1>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full hover:bg-pm-gold/80">
            <PlusIcon className="w-4 h-4" /> Nouvelle Édition
          </button>
        </div>

        {/* Formulaire nouvelle édition */}
        {showForm && (
          <form onSubmit={handleAdd} className="bg-black border border-pm-gold/20 rounded-lg p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Thème *">
              <Input required value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))} placeholder="Thème de l'édition" />
            </Field>
            <Field label="Date *">
              <Input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </Field>
            <Field label="Lieu">
              <Input value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lieu" />
            </Field>
            <Field label="Maître de Cérémonie">
              <Input value={form.mc ?? ''} onChange={e => setForm(f => ({ ...f, mc: e.target.value }))} placeholder="Nom du MC" />
            </Field>
            <Field label="Promoteur">
              <Input value={form.promoter ?? ''} onChange={e => setForm(f => ({ ...f, promoter: e.target.value }))} placeholder="Nom du promoteur" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description">
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Description..." />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Spot d'Annonce (Vidéo)">
                <ImgBBUploader
                  value={form.announcementVideoUrl ?? ''}
                  onChange={url => setForm(f => ({ ...f, announcementVideoUrl: url }))}
                  resourceType="video"
                  folder="fashion-day/announcements"
                  allowUrl
                />
              </Field>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full">Créer l'édition</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-pm-gold/30 text-pm-off-white text-sm rounded-full">Annuler</button>
            </div>
          </form>
        )}

        {/* Liste des éditions */}
        <div className="space-y-4">
          {sorted.map(ev => (
            <div key={ev.edition} className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
              {/* Header de l'édition */}
              <div className="flex items-center justify-between p-4">
                <button className="flex items-center gap-4 flex-1 text-left" onClick={() => setExpanded(expanded === ev.edition ? null : ev.edition)}>
                  <span className="text-pm-gold font-black text-lg min-w-fit">Édition {ev.edition}</span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{ev.theme}</p>
                    <p className="text-xs text-pm-off-white/40">{ev.date}{ev.location ? ` — ${ev.location}` : ''}</p>
                  </div>
                </button>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <button onClick={() => { setEditing(editing === ev.edition ? null : ev.edition); setExpanded(ev.edition); }}
                    className="text-pm-gold/60 hover:text-pm-gold p-1" title="Modifier">
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ev.edition)} className="text-red-500/60 hover:text-red-500 p-1" title="Supprimer">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setExpanded(expanded === ev.edition ? null : ev.edition)} className="text-pm-gold/40 p-1">
                    {expanded === ev.edition ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Contenu expandé */}
              {expanded === ev.edition && (
                editing === ev.edition ? (
                  <EventEditor
                    event={ev}
                    allModels={models}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div className="border-t border-pm-gold/10 p-5 space-y-5">
                    {/* Infos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <InfoBlock label="MC" value={ev.mc} />
                      <InfoBlock label="Promoteur" value={ev.promoter} />
                      <InfoBlock label="Lieu" value={ev.location} />
                      <InfoBlock label="Date" value={ev.date} />
                      {ev.description && (
                        <div className="col-span-2 sm:col-span-4">
                          <span className="text-xs uppercase tracking-widest text-pm-off-white/40">Description</span>
                          <p className="mt-1 text-pm-off-white/70 text-sm">{ev.description}</p>
                        </div>
                      )}
                    </div>

                    {/* Vidéo spot d'annonce */}
                    {ev.announcementVideoUrl && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-pm-gold/60 mb-2">Spot d'Annonce</h4>
                        <video src={ev.announcementVideoUrl} controls className="w-full max-h-56 rounded border border-pm-gold/20 object-cover" />
                      </div>
                    )}

                    {/* Galerie photos */}
                    {(ev.galleryImages?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-pm-gold/60 mb-2">Galerie ({ev.galleryImages!.length} photos)</h4>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                          {ev.galleryImages!.map((img, i) => (
                            <img key={i} src={img} alt="" className="aspect-square w-full object-cover rounded border border-pm-gold/10" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stylistes */}
                    {(ev.stylists?.length ?? 0) > 0 && (
                      <PersonReadView title="Stylistes" items={ev.stylists!} />
                    )}

                    {/* Artistes */}
                    {(ev.artists?.length ?? 0) > 0 && (
                      <PersonReadView title="Artistes" items={ev.artists!} />
                    )}

                    {/* Mannequins vedettes */}
                    {(ev.featuredModels?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-pm-gold/60 mb-2">Mannequins Vedettes</h4>
                        <div className="flex flex-wrap gap-2">
                          {ev.featuredModels!.map((name, i) => (
                            <span key={i} className="bg-pm-dark border border-pm-gold/20 rounded-full px-3 py-1 text-xs">{name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Partenaires */}
                    {(ev.partners?.length ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-widest text-pm-gold/60 mb-2">Partenaires</h4>
                        <div className="flex flex-wrap gap-2">
                          {ev.partners!.map((p, i) => (
                            <span key={i} className="bg-pm-dark border border-pm-gold/20 rounded-full px-3 py-1 text-xs">
                              {p.type && <span className="text-pm-gold/50">{p.type} — </span>}{p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={() => setEditing(ev.edition)}
                      className="flex items-center gap-2 text-xs text-pm-gold/60 hover:text-pm-gold border border-pm-gold/20 px-3 py-1.5 rounded-full hover:border-pm-gold/50 transition-colors">
                      <PencilIcon className="w-3 h-3" /> Modifier cette édition
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
          {events.length === 0 && <p className="text-center p-8 text-pm-off-white/40">Aucune édition enregistrée.</p>}
        </div>
      </div>
    </div>
  );
};

// ── Read-only person view ─────────────────────────────────────────────────────

const InfoBlock: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <span className="text-xs uppercase tracking-widest text-pm-off-white/40 block">{label}</span>
    <p className="text-sm mt-0.5">{value || '—'}</p>
  </div>
);

const PersonReadView: React.FC<{ title: string; items: (Stylist | Artist)[] }> = ({ title, items }) => (
  <div>
    <h4 className="text-xs uppercase tracking-widest text-pm-gold/60 mb-3">{title}</h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="bg-pm-dark/60 border border-pm-gold/10 rounded-lg p-3">
          <p className="font-semibold text-sm mb-1">{item.name}</p>
          {item.description && <p className="text-xs text-pm-off-white/50 mb-2">{item.description}</p>}
          {(item.images?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.images!.map((img, ii) => (
                <img key={ii} src={img} alt="" className="w-16 h-16 object-cover rounded border border-pm-gold/10" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default AdminFashionDayEvents;
