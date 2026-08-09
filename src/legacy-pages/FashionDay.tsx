import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon, MapPinIcon, XMarkIcon, UserGroupIcon,
  ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, PlayIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import { useData } from '../contexts/DataContext';
import { FashionDayEvent, Stylist, Artist } from '../types';

// ── Mini-carrousel dépliable ─────────────────────────────────────────────────

interface PersonCarouselProps {
  person: Stylist | Artist;
  onImageClick: (img: string) => void;
}

const PersonCarousel: React.FC<PersonCarouselProps> = ({ person, onImageClick }) => {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const images = person.images ?? [];
  const hasImages = images.length > 0;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i + 1) % images.length);
  };

  return (
    <div className="border border-white/5 hover:border-pm-gold/20 transition-colors duration-300">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-4 text-left group"
      >
        {hasImages ? (
          <div className="w-14 h-14 flex-shrink-0 overflow-hidden bg-pm-gray">
            <img
              src={images[0]}
              alt={person.name}
              className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
        ) : (
          <div className="w-14 h-14 flex-shrink-0 bg-white/5 flex items-center justify-center">
            <span className="text-white/20 text-xl font-playfair">{person.name[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-playfair font-bold text-white group-hover:text-pm-gold transition-colors truncate">
            {person.name}
          </p>
          {person.description && (
            <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{person.description}</p>
          )}
          {hasImages && (
            <p className="text-[10px] text-pm-gold/50 mt-1 uppercase tracking-widest">
              {images.length} photo{images.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && hasImages && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {person.description && (
                <p className="text-sm text-white/50 mb-4 leading-relaxed">{person.description}</p>
              )}
              <div className="relative aspect-[4/3] bg-pm-gray overflow-hidden mb-2">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={idx}
                    src={images[idx]}
                    alt={`${person.name} ${idx + 1}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={() => onImageClick(images[idx])}
                  />
                </AnimatePresence>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-pm-gold/80 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-pm-gold/80 flex items-center justify-center transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4 text-white" />
                    </button>
                    <span className="absolute bottom-2 right-3 text-[10px] text-white/50 bg-black/50 px-2 py-0.5">
                      {idx + 1} / {images.length}
                    </span>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={`flex-shrink-0 w-12 h-12 overflow-hidden transition-all duration-200 ${
                        i === idx ? 'ring-1 ring-pm-gold' : 'opacity-40 hover:opacity-70'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Marquee en boucle infinie ────────────────────────────────────────────────

const MarqueeTrack: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => (
  <div
    className="relative overflow-hidden"
    style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
  >
    <div
      className="flex w-max"
      style={{
        animation: `marquee-loop ${duration}s linear infinite`,
      }}
    >
      {/* Groupe 1 */}
      <div className="flex items-center">{children}</div>
      {/* Groupe 2 — copie exacte pour la boucle seamless */}
      <div className="flex items-center" aria-hidden>{children}</div>
    </div>
    <style>{`
      @keyframes marquee-loop {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `}</style>
  </div>
);



const VideoIntro: React.FC<{ url?: string; embedUrl?: string }> = ({ url, embedUrl }) => {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggle = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  if (embedUrl) {
    const youtubeMatch = embedUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    const tiktokMatch = embedUrl.match(/tiktok\.com\/(@[^/]+\/video\/\d+)/);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return (
        <div className="aspect-video overflow-hidden rounded-xl border border-pm-gold/20 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`} 
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }

    if (tiktokMatch) {
      const embedUrlValue = `https://www.tiktok.com/embed/${tiktokMatch[1]}`;
      return (
        <div className="aspect-[9/16] max-h-[720px] overflow-hidden rounded-xl border border-pm-gold/20 bg-black">
          <iframe
            src={embedUrlValue}
            title="TikTok video"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }

  if (!url) return null;

  return (
    <div
      className="relative aspect-video bg-black overflow-hidden group cursor-pointer"
      onClick={toggle}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
        playsInline
      />
      <AnimatePresence>
        {!playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40"
          >
            <div className="w-16 h-16 rounded-full bg-pm-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayIcon className="w-7 h-7 text-pm-dark ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── InfoBlock ────────────────────────────────────────────────────────────────

const InfoBlock: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-4">
    <div className="w-10 h-10 rounded-full border border-pm-gold/20 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-pm-gold" />
    </div>
    <div>
      <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/30 block mb-1">{label}</span>
      <span className="font-playfair font-bold text-white leading-snug">{value}</span>
    </div>
  </div>
);

// ── Page principale ──────────────────────────────────────────────────────────

const FashionDay: React.FC = () => {
  const { data, isInitialized } = useData();

  const fashionDayEvents = useMemo(() => {
    if (!data?.fashionDayEvents) return [];
    const unique = new Map<number, FashionDayEvent>();
    data.fashionDayEvents.forEach(e => {
      if (!unique.has(e.edition)) unique.set(e.edition, e);
    });
    return Array.from(unique.values()).sort((a, b) => b.edition - a.edition);
  }, [data?.fashionDayEvents]);

  const [selectedEdition, setSelectedEdition] = useState<FashionDayEvent | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (fashionDayEvents.length > 0 && !selectedEdition) {
      setSelectedEdition(fashionDayEvents[0]);
    }
  }, [fashionDayEvents]);

  if (!isInitialized || !data) {
    return <Loading />;
  }

  const heroBg =
    selectedEdition?.stylists?.[0]?.images?.[0] || data.siteImages.fashionDayBg;

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white overflow-x-hidden">
      <SEO
        title="Perfect Fashion Day"
        description="L'événement mode majeur au Gabon — Perfect Fashion Day."
        image={data.siteImages.fashionDayBg}
      />

      {/* ── HERO ── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroBg}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroBg}')` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-pm-dark via-pm-dark/40 to-transparent" />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-20 pb-12 sm:pb-16">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-label">
            Runway • Culture • Art
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl sm:text-7xl md:text-[12rem] font-playfair font-black italic leading-none mt-2 mb-8 sm:mb-10"
          >
            PFD
          </motion.h1>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            {fashionDayEvents.map(event => (
              <button
                key={event.edition}
                onClick={() => setSelectedEdition(event)}
                className={`relative px-4 sm:px-6 py-2.5 sm:py-3 text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] border transition-all duration-500 ${
                  selectedEdition?.edition === event.edition
                    ? 'bg-pm-gold text-pm-dark border-pm-gold'
                    : 'bg-transparent text-white/50 border-white/10 hover:border-white/40 hover:text-white'
                }`}
              >
                Édition {String(event.edition).padStart(2, '0')}
                {selectedEdition?.edition === event.edition && (
                  <span className="hidden sm:inline ml-3 text-pm-dark/60 italic font-normal normal-case tracking-normal">
                    {event.theme}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTENU PAR ÉDITION ── */}
      <AnimatePresence mode="wait">
        {selectedEdition && (
          <motion.div
            key={selectedEdition.edition}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'circOut' }}
          >
            {/* 1. INFO ÉDITION */}
            <section className="page-container grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-16 border-b border-white/5 pb-16 sm:pb-24">
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div>
                  <span className="section-label">
                    Édition {String(selectedEdition.edition).padStart(2, '0')}
                  </span>
                  <h2 className="text-4xl sm:text-5xl md:text-7xl font-playfair font-black italic mt-2 leading-tight">
                    "{selectedEdition.theme}"
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-white/50 font-light leading-relaxed max-w-2xl">
                  {selectedEdition.description}
                </p>
              </div>
              <div className="space-y-6 sm:space-y-8 lg:pt-16">
                <InfoBlock
                  icon={CalendarDaysIcon}
                  label="Date"
                  value={new Date(selectedEdition.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                />
                <InfoBlock
                  icon={MapPinIcon}
                  label="Lieu"
                  value={selectedEdition.location || 'À confirmer'}
                />
                {selectedEdition.promoter && (
                  <InfoBlock icon={UserGroupIcon} label="Promoteur" value={selectedEdition.promoter} />
                )}
              </div>
            </section>

            {/* 2. VIDÉO D'INTRO */}
            {(selectedEdition.announcementVideoUrl || selectedEdition.announcementVideoEmbedUrl) && (
              <section className="bg-[#050505] py-12 sm:py-20">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-20">
                  <div className="mb-8 sm:mb-10">
                    <span className="section-label">Teaser</span>
                    <h3 className="text-3xl sm:text-4xl font-playfair font-black">Le Spot de l'Édition</h3>
                  </div>
                  <VideoIntro url={selectedEdition.announcementVideoUrl} embedUrl={selectedEdition.announcementVideoEmbedUrl} />
                </div>
              </section>
            )}

            {/* 3. ARTISTES */}
            {selectedEdition.artists && selectedEdition.artists.length > 0 && (
              <section className="page-container py-12 sm:py-20 border-b border-white/5">
                <div className="mb-8 sm:mb-12">
                  <span className="section-label">Performances</span>
                  <h3 className="text-4xl sm:text-5xl font-playfair font-black">Les Artistes</h3>
                  <p className="text-white/30 text-sm mt-3">
                    {selectedEdition.artists.length} artiste
                    {selectedEdition.artists.length > 1 ? 's' : ''} — cliquez pour voir les photos
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  {selectedEdition.artists.map((artist, idx) => (
                    <PersonCarousel key={idx} person={artist} onImageClick={setSelectedImage} />
                  ))}
                </div>
              </section>
            )}

            {/* 4. STYLISTES */}
            {selectedEdition.stylists && selectedEdition.stylists.length > 0 && (
              <section className="bg-[#080808] py-12 sm:py-20">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-20">
                  <div className="mb-8 sm:mb-12">
                    <span className="section-label">Showcase</span>
                    <h3 className="text-4xl sm:text-5xl font-playfair font-black">Les Créateurs</h3>
                    <p className="text-white/30 text-sm mt-3">
                      {selectedEdition.stylists.length} styliste
                      {selectedEdition.stylists.length > 1 ? 's' : ''} — cliquez pour déplier le carrousel
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                    {selectedEdition.stylists.map((stylist, idx) => (
                      <PersonCarousel key={idx} person={stylist} onImageClick={setSelectedImage} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 5. MANNEQUINS VEDETTES */}
            {selectedEdition.featuredModels && selectedEdition.featuredModels.length > 0 && (
              <section className="py-10 sm:py-14 border-y border-white/5 overflow-hidden">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-20 mb-6 sm:mb-8">
                  <span className="section-label">On the Runway</span>
                  <h3 className="text-2xl sm:text-3xl font-playfair font-black">Les Mannequins Vedettes</h3>
                </div>
                <MarqueeTrack duration={Math.max(20, selectedEdition.featuredModels.length * 4)}>
                  {selectedEdition.featuredModels.map((name, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 border border-pm-gold/20 text-white/70 font-playfair text-sm italic hover:border-pm-gold hover:text-pm-gold transition-colors cursor-default flex-shrink-0 mx-1 sm:mx-1.5"
                    >
                      {name}
                    </span>
                  ))}
                </MarqueeTrack>
              </section>
            )}

            {/* 6. PARTENAIRES */}
            {selectedEdition.partners && selectedEdition.partners.length > 0 && (
              <section className="py-10 sm:py-14 border-b border-white/5 bg-[#080808] overflow-hidden">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-20 mb-6 sm:mb-8">
                  <span className="section-label">They Believe in Us</span>
                  <h3 className="text-2xl sm:text-3xl font-playfair font-black">Partenaires</h3>
                </div>
                <MarqueeTrack duration={Math.max(20, selectedEdition.partners.length * 5)}>
                  {selectedEdition.partners.map((p, i) => (
                    <span
                      key={i}
                      className="inline-flex flex-col flex-shrink-0 px-4 sm:px-5 py-2 border border-pm-gold/15 hover:border-pm-gold/40 transition-colors cursor-default mx-1.5 sm:mx-2"
                    >
                      {p.type && (
                        <span className="text-[9px] uppercase tracking-[0.4em] font-black text-pm-gold/40">
                          {p.type}
                        </span>
                      )}
                      <span className="text-sm font-playfair font-bold text-white/70">
                        {p.name}
                      </span>
                    </span>
                  ))}
                </MarqueeTrack>
              </section>
            )}

            {/* 7. CTA si édition à venir */}
            {new Date(selectedEdition.date) > new Date() && (
              <section className="relative py-24 sm:py-40 overflow-hidden bg-pm-gold text-pm-dark">
                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-8 sm:space-y-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-50">
                    {new Date(selectedEdition.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <h3 className="text-4xl sm:text-5xl md:text-8xl font-playfair font-black italic leading-tight">
                    Incarnez la Révélation.
                  </h3>
                  <p className="text-lg sm:text-xl font-light max-w-xl mx-auto opacity-70 italic">
                    "{selectedEdition.theme}" — rejoignez l'aventure.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
                    <Link
                      to="/fashion-day-application"
                      className="px-8 sm:px-12 py-4 sm:py-5 bg-pm-dark text-pm-gold font-black uppercase tracking-widest text-sm hover:bg-white hover:text-pm-dark transition-all"
                    >
                      Candidature Talent
                    </Link>
                    <Link
                      to="/contact"
                      className="px-8 sm:px-12 py-4 sm:py-5 border-2 border-pm-dark font-black uppercase tracking-widest text-sm hover:bg-pm-dark hover:text-pm-gold transition-all"
                    >
                      Devenir Partenaire
                    </Link>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-10 text-[15rem] sm:text-[30rem] font-playfair font-black opacity-[0.04] select-none pointer-events-none leading-none">
                  {selectedEdition.edition}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
              <XMarkIcon className="w-10 h-10" />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedImage}
              className="max-w-full max-h-[88vh] object-contain shadow-2xl"
              alt="Vue agrandie"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FashionDay;
