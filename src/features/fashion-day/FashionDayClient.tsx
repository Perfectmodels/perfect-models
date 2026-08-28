'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDaysIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ShareButton from '@/components/ShareButton';

type Person = { name?: string; description?: string; images?: string[] };
type Edition = {
  edition: number;
  date?: string;
  theme?: string;
  location?: string;
  description?: string;
  promoter?: string;
  mc?: string;
  coverImageUrl?: string;
  galleryImages?: string[];
  stylists?: Person[];
  artists?: Person[];
  featuredModels?: string[];
  partners?: string[];
  announcementVideoEmbedUrl?: string;
  announcementVideoUrl?: string;
};

const formatDate = (value?: string) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date à confirmer';
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function youtubeEmbed(value?: string) {
  if (!value) return '';
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
    else if (host.includes('youtube.com')) id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1) || '';
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : '';
  } catch { return ''; }
}

function Lightbox({ images, title, initial, close }: { images: string[]; title: string; initial: number; close: () => void }) {
  const [index, setIndex] = useState(initial);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') setIndex(value => (value - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setIndex(value => (value + 1) % images.length);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [close, images.length]);
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4" onClick={close}><button className="absolute right-5 top-5 rounded-full border border-white/20 p-3" onClick={close}><XMarkIcon className="h-5 w-5"/></button><div className="relative w-full max-w-6xl" onClick={event => event.stopPropagation()}><img src={images[index]} alt={`${title} — ${index + 1}`} className="mx-auto max-h-[82vh] max-w-full rounded-2xl object-contain"/>{images.length > 1 && <><button className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3" onClick={() => setIndex(value => (value - 1 + images.length) % images.length)}><ChevronLeftIcon className="h-6 w-6"/></button><button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3" onClick={() => setIndex(value => (value + 1) % images.length)}><ChevronRightIcon className="h-6 w-6"/></button></>}<p className="mt-3 text-center text-xs text-white/50">{index + 1} / {images.length}</p></div></div>;
}

function People({ title, people, edition }: { title: string; people: Person[]; edition: number }) {
  const [lightbox, setLightbox] = useState<{ images: string[]; title: string; initial: number } | null>(null);
  if (!people.length) return null;
  return <section className="border-t border-white/10 py-16"><div className="mx-auto max-w-7xl px-5 md:px-10"><p className="text-[10px] font-black uppercase tracking-[.35em] text-pm-gold">Édition {edition}</p><h2 className="mt-2 font-playfair text-4xl font-black">{title}</h2><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{people.map((person, index) => { const images = (person.images || []).filter(Boolean); return <article id={slugify(person.name || String(index))} key={`${person.name}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">{images[0] ? <button className="block w-full overflow-hidden" onClick={() => setLightbox({ images, title: person.name || title, initial: 0 })}><img src={images[0]} alt={person.name || ''} className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"/></button> : <div className="grid aspect-[4/3] place-items-center bg-white/[.02] font-playfair text-5xl text-white/15">{person.name?.[0] || 'P'}</div>}<div className="p-5"><h3 className="font-playfair text-2xl font-bold">{person.name}</h3>{person.description && <p className="mt-2 text-sm leading-6 text-white/50">{person.description}</p>}{images.length > 1 && <div className="mt-4 grid grid-cols-4 gap-2">{images.slice(0, 4).map((src, imageIndex) => <button key={src} onClick={() => setLightbox({ images, title: person.name || title, initial: imageIndex })}><img src={src} alt="" className="aspect-square w-full rounded-lg object-cover"/></button>)}</div>}</div></article>; })}</div></div>{lightbox && <Lightbox {...lightbox} close={() => setLightbox(null)}/>}</section>;
}

export default function FashionDayClient({ events }: { events: Edition[] }) {
  const ordered = useMemo(() => [...events].sort((a, b) => b.edition - a.edition), [events]);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    if (!ordered.length) return;
    const requested = Number(new URLSearchParams(window.location.search).get('edition'));
    const initial = Number.isFinite(requested) && ordered.some(event => event.edition === requested) ? requested : ordered[0].edition;
    setSelected(current => current && ordered.some(event => event.edition === current) ? current : initial);
  }, [ordered]);
  if (!ordered.length) return <main className="min-h-screen bg-pm-dark px-6 py-32 text-center text-white"><h1 className="font-playfair text-5xl font-black text-pm-gold">Perfect Fashion Day</h1><p className="mt-4 text-white/40">Les prochaines éditions seront publiées ici.</p></main>;

  const event = ordered.find(item => item.edition === selected) || ordered[0];
  const cover = event.coverImageUrl || event.galleryImages?.[0] || event.stylists?.[0]?.images?.[0] || '';
  const embed = youtubeEmbed(event.announcementVideoEmbedUrl);
  const choose = (edition: number) => {
    setSelected(edition);
    const url = new URL(window.location.href);
    url.searchParams.set('edition', String(edition));
    url.hash = '';
    window.history.replaceState({}, '', url);
  };

  return <main className="min-h-screen overflow-hidden bg-pm-dark text-pm-off-white">
    <section className="relative min-h-[82vh] overflow-hidden">{cover ? <img src={cover} alt={`Perfect Fashion Day édition ${event.edition}`} className="absolute inset-0 h-full w-full object-cover"/> : <div className="absolute inset-0 bg-gradient-to-br from-pm-dark via-black to-pm-wine/30"/>}<div className="absolute inset-0 bg-gradient-to-t from-pm-dark via-black/45 to-black/10"/><div className="relative z-10 mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-5 pb-14 pt-32 md:px-10"><div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-black uppercase tracking-[.45em] text-pm-gold">Perfect Fashion Day · Édition {String(event.edition).padStart(2, '0')}</p><ShareButton title={`Perfect Fashion Day — ${event.theme || `Édition ${event.edition}`}`} text={event.description} /></div><h1 className="mt-4 max-w-5xl font-playfair text-5xl font-black italic leading-[.95] md:text-7xl lg:text-8xl">{event.theme || 'Perfect Fashion Day'}</h1><div className="mt-8 flex flex-wrap gap-5 text-sm text-white/70"><span className="inline-flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5 text-pm-gold"/>{formatDate(event.date)}</span><span className="inline-flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-pm-gold"/>{event.location || 'Lieu à confirmer'}</span></div></div></section>
    <section className="border-b border-white/5 bg-black/40 py-6"><div className="mx-auto max-w-7xl px-5 md:px-10"><p className="mb-4 text-[9px] font-black uppercase tracking-[.35em] text-white/30">Choisir une édition</p><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{ordered.map(item => { const image = item.coverImageUrl || item.galleryImages?.[0] || ''; return <button key={item.edition} onClick={() => choose(item.edition)} className={`overflow-hidden rounded-xl border text-left ${item.edition === event.edition ? 'border-pm-gold' : 'border-white/10'}`}>{image && <img src={image} alt="" className="aspect-[16/10] w-full object-cover"/>}<div className="p-3"><p className="text-[9px] font-black uppercase tracking-widest text-pm-gold">Édition {item.edition}</p><p className="truncate font-playfair font-bold">{item.theme}</p></div></button>; })}</div></div></section>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-10 lg:grid-cols-[1.4fr_.6fr]"><div><p className="text-[10px] font-black uppercase tracking-[.4em] text-pm-gold/60">L’édition</p><h2 className="mt-2 font-playfair text-4xl font-black md:text-6xl">« {event.theme || 'Perfect Fashion Day'} »</h2>{event.description && <p className="mt-6 max-w-3xl text-base leading-8 text-white/50 md:text-lg">{event.description}</p>}</div><div className="space-y-3 rounded-2xl border border-white/10 bg-white/[.03] p-6 text-sm"><p><span className="text-white/35">Promoteur</span><br/>{event.promoter || 'Perfect Models Management'}</p>{event.mc && <p><span className="text-white/35">Maître de cérémonie</span><br/>{event.mc}</p>}{event.featuredModels?.length ? <p><span className="text-white/35">Mannequins vedettes</span><br/>{event.featuredModels.join(' · ')}</p> : null}</div></section>
    {(embed || event.announcementVideoUrl) && <section className="mx-auto max-w-5xl px-5 pb-16 md:px-10">{embed ? <div className="aspect-video overflow-hidden rounded-2xl border border-pm-gold/20"><iframe src={embed} title={`Spot édition ${event.edition}`} className="h-full w-full" allowFullScreen/></div> : <video src={event.announcementVideoUrl} controls className="aspect-video w-full rounded-2xl bg-black object-contain"/>}</section>}
    <People title="Stylistes & Créateurs" people={event.stylists || []} edition={event.edition}/>
    <People title="Artistes" people={event.artists || []} edition={event.edition}/>
    {event.galleryImages?.length ? <section className="border-t border-white/10 py-16"><div className="mx-auto max-w-7xl px-5 md:px-10"><h2 className="font-playfair text-4xl font-black">Galerie de l’édition</h2><div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{event.galleryImages.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`Édition ${event.edition} — ${index + 1}`} className="aspect-square w-full rounded-xl object-cover"/>)}</div></div></section> : null}
  </main>;
}
