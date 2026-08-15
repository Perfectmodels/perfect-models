'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, MapPin, CalendarDays, Images } from 'lucide-react';
import { useDataStore, type GalleryAlbum } from '@/hooks/useDataStore';

const categories = ['Tous', 'Collaborations', 'Shooting', 'Défilés', 'Événements', 'Backstage', 'Autres'];

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export default function GalleryPage() {
  const { data, isInitialized } = useDataStore();
  const [category, setCategory] = useState('Tous');
  const [selected, setSelected] = useState<GalleryAlbum | null>(null);
  const [index, setIndex] = useState(0);

  const albums = useMemo(() => {
    const list = (data?.galleryAlbums || []).filter((album) => album.published !== false);
    return [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || String(b.date || b.createdAt).localeCompare(String(a.date || a.createdAt)));
  }, [data?.galleryAlbums]);

  const filtered = category === 'Tous' ? albums : albums.filter((album) => album.category === category);

  const open = (album: GalleryAlbum) => {
    setSelected(album);
    setIndex(0);
  };

  const move = (direction: number) => {
    if (!selected) return;
    const total = selected.images?.length || 0;
    if (!total) return;
    setIndex((current) => (current + direction + total) % total);
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-6 pb-16 pt-28 md:px-10 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,.18),transparent_38%),linear-gradient(135deg,#080808,#111)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Perfect Models Management</p>
          <h1 className="max-w-4xl font-serif text-5xl font-semibold tracking-tight md:text-7xl">Galerie</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
            Les collaborations, shootings, défilés et moments forts qui racontent l&apos;histoire de l&apos;agence et de ses talents.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-sm transition ${category === item ? 'border-[#D4AF37] bg-[#D4AF37] text-black' : 'border-white/10 bg-white/[.03] text-white/65 hover:border-white/25 hover:text-white'}`}>
              {item}
            </button>
          ))}
        </div>

        {!isInitialized ? (
          <div className="py-24 text-center text-white/50">Chargement de la galerie…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[.03] px-6 py-24 text-center text-white/55">
            Aucun album publié dans cette catégorie pour le moment.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((album) => (
              <button key={album.id} onClick={() => open(album)} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] text-left transition hover:-translate-y-1 hover:border-[#D4AF37]/50">
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                  {album.coverImage ? <Image src={album.coverImage} alt={album.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" unoptimized /> : <div className="flex h-full items-center justify-center text-white/30"><Images size={48} /></div>}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-5 pt-20">
                    <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black">{album.category}</span>
                    <h2 className="mt-3 font-serif text-2xl font-semibold">{album.title}</h2>
                  </div>
                </div>
                <div className="space-y-2 p-5 text-sm text-white/55">
                  {album.date && <div className="flex items-center gap-2"><CalendarDays size={15} />{formatDate(album.date)}</div>}
                  {album.location && <div className="flex items-center gap-2"><MapPin size={15} />{album.location}</div>}
                  <div className="flex items-center gap-2 text-white/40"><Images size={15} />{album.images?.length || 0} photo{(album.images?.length || 0) > 1 ? 's' : ''}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={selected.title}>
          <button onClick={() => setSelected(null)} className="absolute right-5 top-5 rounded-full border border-white/15 bg-white/10 p-3 text-white" aria-label="Fermer"><X size={22} /></button>
          <div className="w-full max-w-6xl">
            <div className="relative mx-auto aspect-[16/10] max-h-[75vh] overflow-hidden rounded-2xl bg-black">
              {selected.images?.length ? <Image src={selected.images[index]} alt={`${selected.title} — photo ${index + 1}`} fill className="object-contain" sizes="100vw" unoptimized /> : <div className="flex h-full items-center justify-center text-white/30">Album sans image</div>}
              {selected.images && selected.images.length > 1 && <>
                <button onClick={() => move(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3" aria-label="Photo précédente"><ChevronLeft /></button>
                <button onClick={() => move(1)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3" aria-label="Photo suivante"><ChevronRight /></button>
              </>}
            </div>
            <div className="mt-5 flex items-end justify-between gap-5">
              <div><p className="text-xs uppercase tracking-[.25em] text-[#D4AF37]">{selected.category}</p><h2 className="mt-1 font-serif text-3xl font-semibold">{selected.title}</h2>{selected.description && <p className="mt-2 max-w-2xl text-white/55">{selected.description}</p>}</div>
              <p className="shrink-0 text-sm text-white/40">{index + 1} / {selected.images?.length || 0}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
