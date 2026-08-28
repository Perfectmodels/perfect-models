'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
  partners?: Array<string | { name?: string; type?: string }>;
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
  } catch {
    return '';
  }
}

function SectionMark({ index, label, light = false }: { index: string; label: string; light?: boolean }) {
  return <div className={`flex items-center gap-4 text-[8px] font-black uppercase tracking-[.36em] sm:text-[9px] ${light ? 'text-pm-gold-light' : 'text-pm-wine'}`}><span>{index}</span><span className={`h-px w-10 ${light ? 'bg-pm-gold-light/35' : 'bg-pm-wine/35'}`} /><span>{label}</span></div>;
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

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/96 p-4" onClick={close}>
      <button className="absolute right-5 top-5 grid h-11 w-11 place-items-center border border-white/20 text-white" onClick={close} aria-label="Fermer"><XMarkIcon className="h-5 w-5" /></button>
      <div className="relative w-full max-w-6xl" onClick={event => event.stopPropagation()}>
        <img src={images[index]} alt={`${title} — ${index + 1}`} className="mx-auto max-h-[82vh] max-w-full object-contain" />
        {images.length > 1 && <>
          <button className="absolute left-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-black/70 text-white" onClick={() => setIndex(value => (value - 1 + images.length) % images.length)} aria-label="Image précédente"><ChevronLeftIcon className="h-6 w-6" /></button>
          <button className="absolute right-0 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center bg-black/70 text-white" onClick={() => setIndex(value => (value + 1) % images.length)} aria-label="Image suivante"><ChevronRightIcon className="h-6 w-6" /></button>
        </>}
        <p className="mt-4 text-center text-[8px] font-black uppercase tracking-[.24em] text-white/40">{index + 1} / {images.length}</p>
      </div>
    </div>
  );
}

function People({ title, people, edition, index }: { title: string; people: Person[]; edition: number; index: string }) {
  const [lightbox, setLightbox] = useState<{ images: string[]; title: string; initial: number } | null>(null);
  if (!people.length) return null;

  return (
    <section className="bg-pm-ivory px-5 py-20 text-pm-ink sm:px-8 sm:py-24 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1550px]">
        <div className="grid gap-8 border-b border-pm-ink/15 pb-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end">
          <SectionMark index={index} label={`Édition ${edition}`} />
          <h2 className="font-playfair text-5xl font-semibold tracking-[-.04em] sm:text-7xl">{title}</h2>
        </div>
        <div className="mt-10 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person, personIndex) => {
            const images = (person.images || []).filter(Boolean);
            return (
              <article id={slugify(person.name || String(personIndex))} key={`${person.name}-${personIndex}`} className={`${personIndex % 3 === 1 ? 'lg:pt-10' : ''}`}>
                {images[0] ? (
                  <button className="group block w-full overflow-hidden bg-pm-sand text-left" onClick={() => setLightbox({ images, title: person.name || title, initial: 0 })}>
                    <img src={images[0]} alt={person.name || ''} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
                  </button>
                ) : (
                  <div className="grid aspect-[4/5] place-items-center bg-pm-sand font-playfair text-7xl text-pm-ink/12">{person.name?.[0] || 'P'}</div>
                )}
                <div className="mt-4 border-t border-pm-ink/15 pt-4">
                  <p className="text-[8px] font-black uppercase tracking-[.22em] text-pm-wine">{String(personIndex + 1).padStart(2, '0')} · Perfect Fashion Day</p>
                  <h3 className="mt-2 font-playfair text-2xl font-semibold sm:text-3xl">{person.name}</h3>
                  {person.description && <p className="mt-3 text-sm leading-7 text-pm-ink/50">{person.description}</p>}
                  {images.length > 1 && <button onClick={() => setLightbox({ images, title: person.name || title, initial: 0 })} className="mt-5 border-b border-pm-ink pb-1 text-[8px] font-black uppercase tracking-[.22em] transition hover:text-pm-wine">Voir {images.length} images ↗</button>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {lightbox && <Lightbox {...lightbox} close={() => setLightbox(null)} />}
    </section>
  );
}

export default function FashionDayClient({ events }: { events: Edition[] }) {
  const ordered = useMemo(() => [...events].sort((a, b) => b.edition - a.edition), [events]);
  const [selected, setSelected] = useState<number | null>(null);
  const [galleryLightbox, setGalleryLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (!ordered.length) return;
    const requested = Number(new URLSearchParams(window.location.search).get('edition'));
    const initial = Number.isFinite(requested) && ordered.some(event => event.edition === requested) ? requested : ordered[0].edition;
    setSelected(current => current && ordered.some(event => event.edition === current) ? current : initial);
  }, [ordered]);

  if (!ordered.length) return (
    <main className="min-h-screen bg-pm-dark px-6 py-32 text-center text-pm-ivory">
      <p className="text-[8px] font-black uppercase tracking-[.4em] text-pm-gold">Perfect Models Management</p>
      <h1 className="mt-5 font-playfair text-6xl font-semibold">Perfect Fashion Day</h1>
      <p className="mt-5 text-white/40">Les prochaines éditions seront publiées ici.</p>
    </main>
  );

  const event = ordered.find(item => item.edition === selected) || ordered[0];
  const cover = event.coverImageUrl || event.galleryImages?.[0] || event.stylists?.[0]?.images?.[0] || '';
  const embed = youtubeEmbed(event.announcementVideoEmbedUrl || event.announcementVideoUrl);
  const gallery = (event.galleryImages || []).filter(Boolean);
  const choose = (edition: number) => {
    setSelected(edition);
    setGalleryLightbox(null);
    const url = new URL(window.location.href);
    url.searchParams.set('edition', String(edition));
    url.hash = '';
    window.history.replaceState({}, '', url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-pm-ivory text-pm-ink">
      <section className="relative isolate min-h-[calc(100svh-78px)] overflow-hidden bg-pm-dark text-pm-ivory">
        {cover ? <img src={cover} alt={`Perfect Fashion Day édition ${event.edition}`} className="absolute inset-0 -z-30 h-full w-full object-cover" /> : <div className="absolute inset-0 -z-30 bg-gradient-to-br from-pm-dark via-black to-pm-wine" />}
        <div className="absolute inset-0 -z-20 bg-gradient-to-r from-black/92 via-black/48 to-black/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-transparent to-black/15" />
        <div aria-hidden="true" className="absolute -bottom-[2vw] -right-[2vw] -z-10 select-none font-playfair text-[26vw] font-semibold leading-none tracking-[-.08em] text-white/[.035]">PFD</div>

        <div className="mx-auto flex min-h-[calc(100svh-78px)] max-w-[1550px] flex-col justify-between px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-[8px] font-black uppercase tracking-[.4em] text-pm-gold-light sm:text-[9px]">Perfect Fashion Day · Édition {String(event.edition).padStart(2, '0')}</p>
            <ShareButton title={`Perfect Fashion Day — ${event.theme || `Édition ${event.edition}`}`} text={event.description} />
          </div>

          <div className="max-w-5xl py-16">
            <p className="text-[8px] font-black uppercase tracking-[.34em] text-white/45">La scène signature de Perfect Models Management</p>
            <h1 className="mt-5 font-playfair text-[clamp(4.2rem,9vw,9.2rem)] font-semibold leading-[.78] tracking-[-.065em]">{event.theme || 'Perfect Fashion Day'}</h1>
            {event.description && <p className="mt-8 max-w-2xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">{event.description}</p>}
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 text-[9px] font-black uppercase tracking-[.2em] text-white/65">
              <span className="inline-flex items-center gap-2"><CalendarDaysIcon className="h-4 w-4 text-pm-gold-light" />{formatDate(event.date)}</span>
              <span className="inline-flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-pm-gold-light" />{event.location || 'Lieu à confirmer'}</span>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-5 border-t border-white/15 pt-5 text-[8px] font-black uppercase tracking-[.22em] text-white/35"><span>Édition {event.edition}</span><span className="text-right">Mode · Talents · Culture</span></div>
        </div>
      </section>

      <section className="border-b border-pm-ink/15 bg-pm-sand px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1550px]">
          <p className="mb-5 text-[8px] font-black uppercase tracking-[.34em] text-pm-wine">Explorer les éditions</p>
          <div className="flex gap-0 overflow-x-auto border-y border-pm-ink/15 no-scrollbar">
            {ordered.map((item) => (
              <button key={item.edition} onClick={() => choose(item.edition)} className={`min-w-[210px] flex-1 border-r border-pm-ink/15 px-4 py-5 text-left transition sm:min-w-[250px] ${item.edition === event.edition ? 'bg-pm-wine text-pm-ivory' : 'bg-transparent hover:bg-pm-ivory/60'}`}>
                <p className={`text-[8px] font-black uppercase tracking-[.24em] ${item.edition === event.edition ? 'text-pm-gold-light' : 'text-pm-wine'}`}>Édition {String(item.edition).padStart(2, '0')}</p>
                <p className="mt-2 truncate font-playfair text-2xl font-semibold">{item.theme || 'Perfect Fashion Day'}</p>
                <p className={`mt-3 text-[8px] font-black uppercase tracking-[.18em] ${item.edition === event.edition ? 'text-white/45' : 'text-pm-ink/38'}`}>{formatDate(item.date)}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-14 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <SectionMark index="01" label="L’édition" />
            <h2 className="mt-8 max-w-4xl font-playfair text-5xl font-semibold leading-[.92] tracking-[-.045em] sm:text-7xl">Une édition.<br /><em className="font-normal text-pm-wine">Une identité.</em></h2>
            {event.description && <p className="mt-8 max-w-3xl text-base leading-8 text-pm-ink/58">{event.description}</p>}
          </div>
          <aside className="border-t border-pm-ink/15">
            <div className="flex items-end justify-between gap-6 border-b border-pm-ink/15 py-5"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/38">Date</span><span className="font-playfair text-2xl text-right">{formatDate(event.date)}</span></div>
            <div className="flex items-end justify-between gap-6 border-b border-pm-ink/15 py-5"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/38">Lieu</span><span className="font-playfair text-2xl text-right">{event.location || 'À confirmer'}</span></div>
            <div className="flex items-end justify-between gap-6 border-b border-pm-ink/15 py-5"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/38">Promoteur</span><span className="font-playfair text-2xl text-right">{event.promoter || 'Perfect Models Management'}</span></div>
            {event.mc && <div className="flex items-end justify-between gap-6 border-b border-pm-ink/15 py-5"><span className="text-[8px] font-black uppercase tracking-[.2em] text-pm-ink/38">Maître de cérémonie</span><span className="font-playfair text-2xl text-right">{event.mc}</span></div>}
          </aside>
        </div>
      </section>

      {(embed || event.announcementVideoUrl) && (
        <section className="bg-pm-ink px-5 py-20 text-pm-ivory sm:px-8 sm:py-28 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[1550px]">
            <div className="grid gap-8 border-b border-white/12 pb-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end"><SectionMark index="02" label="Film officiel" light /><h2 className="font-playfair text-5xl font-semibold tracking-[-.04em] sm:text-7xl">L’édition en mouvement.</h2></div>
            <div className="mt-10 aspect-video overflow-hidden border border-white/10 bg-black">{embed ? <iframe src={embed} title={`Spot édition ${event.edition}`} className="h-full w-full" allowFullScreen /> : <video src={event.announcementVideoUrl} controls className="h-full w-full object-contain" />}</div>
          </div>
        </section>
      )}

      <People title="Stylistes & Créateurs" people={event.stylists || []} edition={event.edition} index={embed || event.announcementVideoUrl ? '03' : '02'} />
      <People title="Artistes" people={event.artists || []} edition={event.edition} index={embed || event.announcementVideoUrl ? '04' : '03'} />

      {event.featuredModels?.length ? (
        <section className="bg-pm-wine px-5 py-20 text-pm-ivory sm:px-8 sm:py-24 lg:px-12 xl:px-16">
          <div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.55fr_1.45fr]">
            <div><SectionMark index="05" label="Talents" light /><p className="mt-8 max-w-sm text-sm leading-7 text-white/55">Les mannequins mis en lumière lors de cette édition.</p></div>
            <div className="divide-y divide-white/20 border-t border-white/20">{event.featuredModels.map((name, index) => <div key={`${name}-${index}`} className="flex items-center justify-between gap-6 py-5"><span className="font-playfair text-3xl font-semibold sm:text-4xl">{name}</span><span className="font-playfair text-2xl italic text-pm-gold-light">{String(index + 1).padStart(2, '0')}</span></div>)}</div>
          </div>
        </section>
      ) : null}

      {gallery.length > 0 && (
        <section className="bg-pm-sand px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
          <div className="mx-auto max-w-[1550px]">
            <div className="grid gap-8 border-b border-pm-ink/15 pb-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end"><SectionMark index="06" label="Galerie" /><h2 className="font-playfair text-5xl font-semibold tracking-[-.04em] sm:text-7xl">Les images de l’édition.</h2></div>
            <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {gallery.map((src, index) => (
                <button key={`${src}-${index}`} onClick={() => setGalleryLightbox(index)} className={`group overflow-hidden bg-pm-ink/10 ${index % 7 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <img src={src} alt={`Perfect Fashion Day édition ${event.edition} — ${index + 1}`} className="h-full min-h-[220px] w-full object-cover transition duration-700 group-hover:scale-[1.025] md:min-h-[280px]" />
                </button>
              ))}
            </div>
          </div>
          {galleryLightbox !== null && <Lightbox images={gallery} title={`Perfect Fashion Day — Édition ${event.edition}`} initial={galleryLightbox} close={() => setGalleryLightbox(null)} />}
        </section>
      )}

      <section className="bg-pm-dark px-5 py-20 text-pm-ivory sm:px-8 sm:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.55fr_1.45fr] lg:items-end">
          <div><p className="text-[8px] font-black uppercase tracking-[.38em] text-pm-gold-light">Perfect Fashion Day</p><p className="mt-7 max-w-sm text-sm leading-7 text-white/45">Créateur, artiste, marque, média ou partenaire : prenez part aux prochaines éditions.</p></div>
          <div><h2 className="font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Entrez dans<br /><em className="font-normal text-pm-gold-light">la prochaine édition.</em></h2><div className="mt-8 flex flex-wrap gap-3"><Link href="/fashion-day-application" className="pmm-button pmm-button--light">Candidater ↗</Link><Link href="/contact?subject=Perfect%20Fashion%20Day" className="pmm-button pmm-button--ghost">Devenir partenaire</Link></div></div>
        </div>
      </section>
    </main>
  );
}
