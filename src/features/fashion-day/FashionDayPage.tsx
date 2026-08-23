'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDaysIcon, MapPinIcon, PlayIcon, UserGroupIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import SEO from '@/components/SEO';
import Loading from '@/components/Loading';
import ShareButton from '@/components/ShareButton';
import { useData } from '@/contexts/DataContext';
import type { FashionDayEvent } from '@/types';

type FashionDayEdition = FashionDayEvent & { coverImageUrl?: string };
type PersonItem = { name: string; description: string; images: string[] };

const formatDate = (value: string) => {
  if (!value) return 'Date à confirmer';
  return new Date(`${value}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
};

const slugify = (value: string) => value
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const shareUrl = (edition: number, kind?: string, name?: string) => {
  if (typeof window === 'undefined') return `/fashion-day?edition=${edition}${kind && name ? `#${kind}-${slugify(name)}` : ''}`;
  const url = new URL('/fashion-day', window.location.origin);
  url.searchParams.set('edition', String(edition));
  if (kind && name) url.hash = `${kind}-${slugify(name)}`;
  return url.toString();
};

const youtubeId = (value?: string) => {
  if (!value) return '';
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery) return fromQuery;
      const parts = url.pathname.split('/').filter(Boolean);
      if (['shorts', 'embed', 'live'].includes(parts[0])) return parts[1] || '';
    }
  } catch { return ''; }
  return '';
};

function EditionVideo({ event, cover }: { event: FashionDayEdition; cover: string }) {
  const id = youtubeId(event.announcementVideoEmbedUrl);
  if (id) return <div className="aspect-video overflow-hidden rounded-2xl border border-pm-gold/20 bg-black shadow-2xl"><iframe src={`https://www.youtube-nocookie.com/embed/${id}`} title={`Spot Perfect Fashion Day édition ${event.edition}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
  if (event.announcementVideoUrl) return <video src={event.announcementVideoUrl} controls playsInline preload="metadata" poster={cover} className="aspect-video w-full rounded-2xl border border-pm-gold/20 bg-black object-contain shadow-2xl" />;
  return null;
}

function PassageLightbox({ item, initialIndex, onClose }: { item: PersonItem; initialIndex: number; onClose: () => void }) {
  const images = item.images ?? [];
  const [index, setIndex] = useState(Math.min(initialIndex, Math.max(images.length - 1, 0)));
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && images.length > 1) setIndex((current) => (current - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight' && images.length > 1) setIndex((current) => (current + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = previousOverflow; };
  }, [images.length, onClose]);
  if (!images.length) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label={`Galerie ${item.name}`} onClick={onClose}>
    <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/60 p-3 text-white hover:border-pm-gold hover:text-pm-gold"><XMarkIcon className="h-6 w-6" /></button>
    <div className="relative flex h-full w-full max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
      <img src={images[index]} alt={`${item.name} — photo ${index + 1}`} className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain" />
      {images.length > 1 && <><button type="button" onClick={() => setIndex((current) => (current - 1 + images.length) % images.length)} aria-label="Photo précédente" className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-white hover:border-pm-gold hover:text-pm-gold"><ChevronLeftIcon className="h-6 w-6" /></button><button type="button" onClick={() => setIndex((current) => (current + 1) % images.length)} aria-label="Photo suivante" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/70 p-3 text-white hover:border-pm-gold hover:text-pm-gold"><ChevronRightIcon className="h-6 w-6" /></button></>}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white/70">{item.name} · {index + 1}/{images.length}</div>
    </div>
  </div>;
}

function PeopleSection({ title, eyebrow, items, edition, kind, galleries = false }: { title: string; eyebrow: string; items: PersonItem[]; edition: number; kind: 'styliste' | 'artiste'; galleries?: boolean }) {
  const [lightbox, setLightbox] = useState<{ item: PersonItem; index: number } | null>(null);
  if (!items.length) return null;
  return <section className="border-t border-white/5 py-16 sm:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold/60">{eyebrow}</p>
      <h3 className="mt-2 font-playfair text-4xl font-black sm:text-5xl">{title}</h3>
      {galleries && <p className="mt-3 max-w-2xl text-sm leading-7 text-white/35">Chaque créateur possède sa galerie dédiée aux photos de son passage.</p>}
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => <article id={`${kind}-${slugify(item.name)}`} key={`${item.name}-${index}`} className="scroll-mt-24 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {item.images?.[0] ? <button type="button" className="group relative block w-full" onClick={() => galleries && setLightbox({ item, index: 0 })} aria-label={galleries ? `Voir la galerie de ${item.name}` : item.name}><img src={item.images[0]} alt={item.name} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.02]" />{galleries && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-10 text-left text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Voir le passage · {item.images.length} photo{item.images.length > 1 ? 's' : ''}</span>}</button> : <div className="flex aspect-[4/3] items-center justify-center bg-white/[0.03] font-playfair text-5xl text-white/10">{item.name?.[0] || 'P'}</div>}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3"><h4 className="font-playfair text-2xl font-bold text-white">{item.name}</h4><ShareButton title={`${item.name} — Perfect Fashion Day édition ${edition}`} text={`Découvrez ${item.name} au Perfect Fashion Day.`} url={shareUrl(edition, kind, item.name)} className="shrink-0" /></div>
            {item.description && <p className="mt-2 text-sm leading-relaxed text-white/45">{item.description}</p>}
            {galleries && item.images.length > 1 && <div className="mt-4 grid grid-cols-4 gap-2">{item.images.slice(0, 4).map((url, imageIndex) => <button key={`${url}-${imageIndex}`} type="button" onClick={() => setLightbox({ item, index: imageIndex })} className="overflow-hidden rounded-lg"><img src={url} alt={`${item.name} — ${imageIndex + 1}`} className="aspect-square h-full w-full object-cover transition hover:scale-105" /></button>)}</div>}
            {!galleries && item.images?.length > 1 && <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{item.images.slice(1).map((url, imageIndex) => <img key={`${url}-${imageIndex}`} src={url} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />)}</div>}
          </div>
        </article>)}
      </div>
    </div>
    {lightbox && <PassageLightbox item={lightbox.item} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />}
  </section>;
}

export default function FashionDayPage() {
  const { data, isInitialized } = useData();
  const events = useMemo(() => ((data?.fashionDayEvents ?? []) as FashionDayEdition[]).slice().sort((a, b) => b.edition - a.edition), [data?.fashionDayEvents]);
  const [selectedEdition, setSelectedEdition] = useState<number | null>(null);

  useEffect(() => {
    if (!events.length) return;
    const requested = typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('edition')) : NaN;
    const target = Number.isFinite(requested) && events.some((event) => event.edition === requested) ? requested : events[0].edition;
    if (selectedEdition === null || !events.some((event) => event.edition === selectedEdition)) setSelectedEdition(target);
  }, [events, selectedEdition]);

  const selectEdition = (edition: number) => {
    setSelectedEdition(edition);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('edition', String(edition));
      url.hash = '';
      window.history.replaceState({}, '', url);
    }
  };

  if (!isInitialized || !data) return <Loading />;
  if (!events.length) return <main className="min-h-screen bg-pm-dark px-6 py-32 text-center text-white"><SEO title="Perfect Fashion Day" description="Les éditions Perfect Fashion Day de Perfect Models Management." /><h1 className="font-playfair text-5xl font-black text-pm-gold">Perfect Fashion Day</h1><p className="mt-4 text-white/40">Les prochaines éditions seront publiées ici.</p></main>;

  const event = events.find((item) => item.edition === selectedEdition) || events[0];
  const cover = event.coverImageUrl || event.galleryImages?.[0] || event.stylists?.[0]?.images?.[0] || data.siteImages.fashionDayBg;
  const hasVideo = Boolean(youtubeId(event.announcementVideoEmbedUrl) || event.announcementVideoUrl);
  const upcoming = event.date ? new Date(`${event.date}T23:59:59`).getTime() > Date.now() : false;

  return <main className="min-h-screen overflow-hidden bg-pm-dark text-pm-off-white">
    <SEO title={`Perfect Fashion Day — Édition ${event.edition}`} description={event.description || `Perfect Fashion Day, édition ${event.edition} — ${event.theme}.`} image={cover} />
    <section className="relative min-h-[88vh] overflow-hidden"><img key={cover} src={cover} alt={`Cover Perfect Fashion Day édition ${event.edition}`} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-pm-dark via-black/35 to-black/15" /><div className="relative z-10 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-12 pt-32 sm:px-6 lg:px-10"><div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-black uppercase tracking-[0.48em] text-pm-gold">Perfect Fashion Day · Édition {String(event.edition).padStart(2, '0')}</p><ShareButton title={`Perfect Fashion Day — Édition ${event.edition} : ${event.theme}`} text={event.description} url={shareUrl(event.edition)} /></div><h1 className="mt-3 max-w-5xl font-playfair text-5xl font-black italic leading-[0.95] text-white sm:text-7xl lg:text-8xl">{event.theme}</h1><div className="mt-8 flex flex-wrap gap-5 text-sm text-white/70"><span className="inline-flex items-center gap-2"><CalendarDaysIcon className="h-5 w-5 text-pm-gold" />{formatDate(event.date)}</span><span className="inline-flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-pm-gold" />{event.location || 'Lieu à confirmer'}</span></div></div></section>
    <section className="border-b border-white/5 bg-black/40 py-6"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"><p className="mb-4 text-[9px] font-black uppercase tracking-[0.35em] text-white/30">Choisir une édition</p><div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{events.map((item) => { const itemCover = item.coverImageUrl || item.galleryImages?.[0] || data.siteImages.fashionDayBg; const active = item.edition === event.edition; return <button key={item.edition} type="button" onClick={() => selectEdition(item.edition)} className={`group relative overflow-hidden rounded-xl border text-left transition ${active ? 'border-pm-gold' : 'border-white/10 hover:border-white/30'}`}><img src={itemCover} alt={`Cover édition ${item.edition}`} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-3"><span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-pm-gold' : 'text-white/60'}`}>Édition {String(item.edition).padStart(2, '0')}</span><p className="truncate font-playfair text-sm font-bold text-white">{item.theme}</p></div></button>; })}</div></div></section>
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.4fr_0.6fr] lg:px-10"><div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold/60">L’édition</p><h2 className="mt-2 font-playfair text-4xl font-black sm:text-6xl">« {event.theme} »</h2><p className="mt-6 max-w-3xl text-base font-light leading-8 text-white/50 sm:text-lg">{event.description}</p></div><div className="space-y-5 border-l border-pm-gold/20 pl-6">{event.promoter && <div><span className="text-[9px] uppercase tracking-[0.35em] text-white/25">Promoteur</span><p className="mt-1 font-playfair text-xl font-bold">{event.promoter}</p></div>}{event.mc && <div><span className="text-[9px] uppercase tracking-[0.35em] text-white/25">Maître de cérémonie</span><p className="mt-1 font-playfair text-xl font-bold">{event.mc}</p></div>}<div><span className="text-[9px] uppercase tracking-[0.35em] text-white/25">Participants</span><p className="mt-1 inline-flex items-center gap-2 font-playfair text-xl font-bold"><UserGroupIcon className="h-5 w-5 text-pm-gold" />{(event.featuredModels?.length ?? 0) + (event.stylists?.length ?? 0) + (event.artists?.length ?? 0)}</p></div></div></section>
    {hasVideo && <section className="border-y border-white/5 bg-[#050505] py-16 sm:py-24"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold/60">Spot officiel</p><h3 className="mt-2 font-playfair text-4xl font-black sm:text-5xl">La vidéo de l’édition</h3></div><PlayIcon className="hidden h-10 w-10 text-pm-gold/30 sm:block" /></div><EditionVideo event={event} cover={cover} /></div></section>}
    {(event.galleryImages?.length ?? 0) > 0 && <section className="py-16 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold/60">Moments forts</p><h3 className="mt-2 font-playfair text-4xl font-black sm:text-5xl">Galerie de l’édition</h3><div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{(event.galleryImages ?? []).map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Perfect Fashion Day édition ${event.edition} — ${index + 1}`} className="aspect-square w-full rounded-xl object-cover" />)}</div></div></section>}
    <PeopleSection title="Les Créateurs" eyebrow="Showcase" items={event.stylists ?? []} edition={event.edition} kind="styliste" galleries={event.edition === 2} />
    <PeopleSection title="Les Artistes" eyebrow="Performances" items={event.artists ?? []} edition={event.edition} kind="artiste" />
    {(event.featuredModels?.length ?? 0) > 0 && <section className="border-t border-white/5 bg-black/30 py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold/60">On the runway</p><h3 className="mt-2 font-playfair text-3xl font-black">Mannequins vedettes</h3><div className="mt-6 flex flex-wrap gap-2">{(event.featuredModels ?? []).map((name) => <div id={`mannequin-${slugify(name)}`} key={name} className="inline-flex scroll-mt-24 items-center gap-1.5 rounded-full border border-pm-gold/20 px-4 py-1.5 text-sm text-white/70"><span>{name}</span><ShareButton title={`${name} — Perfect Fashion Day édition ${event.edition}`} url={shareUrl(event.edition, 'mannequin', name)} label="" className="border-0 bg-transparent !px-1.5 !py-1" /></div>)}</div></div></section>}
    {(event.partners?.length ?? 0) > 0 && <section className="border-t border-white/5 py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold/60">Partenaires</p><div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{(event.partners ?? []).map((partner, index) => <div id={`partenaire-${slugify(partner.name)}`} key={`${partner.name}-${index}`} className="scroll-mt-24 rounded-xl border border-white/10 p-4"><div className="flex items-start justify-between gap-2"><div><span className="text-[9px] uppercase tracking-[0.3em] text-pm-gold/50">{partner.type || 'Partenaire'}</span><p className="mt-1 font-playfair text-lg font-bold">{partner.name}</p></div><ShareButton title={`${partner.name} — partenaire Perfect Fashion Day édition ${event.edition}`} url={shareUrl(event.edition, 'partenaire', partner.name)} label="" className="shrink-0 !px-2" /></div></div>)}</div></div></section>}
    {upcoming && <section className="bg-pm-gold py-20 text-pm-dark sm:py-28"><div className="mx-auto max-w-4xl px-4 text-center sm:px-6"><p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">{formatDate(event.date)}</p><h3 className="mt-4 font-playfair text-5xl font-black italic sm:text-7xl">Rejoignez l’édition {event.edition}.</h3><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/fashion-day-application" className="bg-pm-dark px-8 py-4 text-sm font-black uppercase tracking-widest text-pm-gold">Candidature talent</Link><Link href="/contact" className="border-2 border-pm-dark px-8 py-4 text-sm font-black uppercase tracking-widest">Devenir partenaire</Link></div></div></section>}
  </main>;
}
