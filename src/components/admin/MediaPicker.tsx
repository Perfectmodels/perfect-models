'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, PhotoIcon, VideoCameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  resourceType?: 'image' | 'video' | 'auto';
  title?: string;
}

type MediaRow = {
  id: string;
  url: string;
  mime_type?: string | null;
  category?: string | null;
  alt_text?: string | null;
  file_name?: string | null;
  metadata?: Record<string, unknown> | null;
};

const CATEGORIES = ['Tout', 'Défilés', 'Shootings Photo', 'Campagnes Publicitaires', 'Fashion Day', 'Collaborations', 'Entraînements', 'Backstage', 'Lookbook', 'Événements', 'Presse & Médias', 'Autres'];

export default function MediaPicker({ isOpen, onClose, onSelect, multiple = false, resourceType = 'auto', title = 'Bibliothèque de médias' }: MediaPickerProps) {
  const [gallery, setGallery] = useState<MediaRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setIsLoading(true);
    fetch('/api/admin/resources/gallery', { cache: 'no-store', credentials: 'include' })
      .then(async response => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || 'Chargement de la médiathèque impossible.');
        return Array.isArray(payload?.data) ? payload.data : [];
      })
      .then(rows => { if (active) setGallery(rows); })
      .catch(() => { if (active) setGallery([]); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [isOpen]);

  const filtered = useMemo(() => gallery.filter(item => {
    const category = item.category || 'Autres';
    const mime = String(item.mime_type || 'image').toLowerCase();
    const mediaType = mime.startsWith('video') ? 'video' : 'image';
    const caption = String(item.alt_text || item.file_name || item.metadata?.caption || '');
    return (activeCategory === 'Tout' || category === activeCategory)
      && (resourceType === 'auto' || mediaType === resourceType)
      && (!search || caption.toLowerCase().includes(search.toLowerCase()));
  }), [activeCategory, gallery, resourceType, search]);

  if (!isOpen) return null;

  const toggleSelection = (item: MediaRow) => {
    if (!multiple) { onSelect([item.url]); onClose(); return; }
    setSelected(previous => {
      const next = new Set(previous);
      if (next.has(item.url)) next.delete(item.url); else next.add(item.url);
      return next;
    });
  };

  const confirm = () => { onSelect(Array.from(selected)); onClose(); };

  return <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={onClose}>
    <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-pm-gold/20 bg-[#0d0d0d] shadow-2xl" onClick={event => event.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-white/5 bg-pm-dark/50 px-6 py-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-pm-gold/10"><PhotoIcon className="h-5 w-5 text-pm-gold"/></div><div><h2 className="font-playfair text-base font-black text-white">{title}</h2><p className="text-[10px] uppercase tracking-widest text-white/30">{multiple ? `${selected.size} média(s) sélectionné(s)` : 'Sélectionner un média'}</p></div></div><button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-white/30 hover:bg-white/5 hover:text-white"><XMarkIcon className="h-5 w-5"/></button></div>
      <div className="flex flex-col items-center justify-between gap-4 border-b border-white/5 bg-black/20 px-6 py-4 md:flex-row"><div className="flex w-full items-center gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">{CATEGORIES.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${activeCategory === category ? 'border-pm-gold bg-pm-gold text-pm-dark' : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white'}`}>{category}</button>)}</div><div className="relative w-full md:w-64"><MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20"/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher..." className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-pm-gold/50"/></div></div>
      <div className="flex-1 overflow-y-auto p-6">{isLoading ? <div className="grid min-h-72 place-items-center text-sm text-white/35">Chargement depuis Supabase…</div> : filtered.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-white/20"><PhotoIcon className="h-16 w-16"/><p className="text-sm font-black uppercase tracking-widest">Aucun média trouvé</p></div> : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{filtered.map(item => {
        const isVideo = String(item.mime_type || '').toLowerCase().startsWith('video');
        const caption = String(item.alt_text || item.file_name || item.metadata?.caption || '');
        const thumbnail = String(item.metadata?.thumbnailUrl || item.metadata?.thumbnail_url || '');
        return <button type="button" key={item.id} onClick={() => toggleSelection(item)} className={`group relative aspect-square overflow-hidden rounded-xl border-2 text-left transition ${selected.has(item.url) ? 'scale-[0.98] border-pm-gold' : 'border-transparent hover:border-white/20'}`}>{isVideo ? <div className="h-full w-full bg-pm-dark">{thumbnail ? <img src={thumbnail} alt="" className="h-full w-full object-cover"/> : <div className="grid h-full w-full place-items-center"><VideoCameraIcon className="h-8 w-8 text-white/20"/></div>}<div className="absolute inset-0 grid place-items-center"><VideoCameraIcon className="h-6 w-6 text-white"/></div></div> : <img src={item.url} alt={caption} className="h-full w-full object-cover"/>}{selected.has(item.url) && <CheckCircleIcon className="absolute right-2 top-2 h-6 w-6 fill-pm-dark text-pm-gold"/>}{caption && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2"><p className="truncate text-[10px] text-white">{caption}</p></div>}</button>;
      })}</div>}</div>
      {multiple && <div className="flex items-center justify-between border-t border-white/5 bg-pm-dark/50 px-6 py-4"><p className="text-[10px] font-black uppercase tracking-widest text-white/30">{selected.size} élément(s)</p><div className="flex gap-3"><button onClick={() => setSelected(new Set())} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white">Tout désélectionner</button><button onClick={confirm} disabled={!selected.size} className="rounded-full bg-pm-gold px-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-pm-dark disabled:opacity-30">Confirmer</button></div></div>}
    </div>
  </div>;
}
