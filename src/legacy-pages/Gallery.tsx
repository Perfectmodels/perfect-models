import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon, PlayIcon, PhotoIcon,
  ChevronLeftIcon, ChevronRightIcon, FunnelIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { GalleryAlbum, GalleryCategory, GalleryItem } from '../types';
import { useFirebaseCollection } from '../hooks/useFirebaseCollection';

const CAT_LIST: GalleryCategory[] = [
  'Défilés', 'Shootings Photo', 'Campagnes Publicitaires', 'Fashion Day',
  'Collaborations', 'Entraînements', 'Backstage', 'Lookbook',
  'Événements', 'Presse & Médias', 'Autres',
];

// ── Carrousel d'albums pour une catégorie ────────────────────────────────────
const CategoryRow: React.FC<{
  category: GalleryCategory;
  albums: GalleryAlbum[];
  items: GalleryItem[];
  onSelectAlbum: (album: GalleryAlbum) => void;
  onOpenOrphan: (item: GalleryItem, items: GalleryItem[]) => void;
}> = ({ category, albums, items, onSelectAlbum, onOpenOrphan }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') =>
    trackRef.current?.scrollBy({ left: dir === 'right' ? 340 : -340, behavior: 'smooth' });

  // Items sans album dans cette catégorie
  const orphans = items.filter(i => i.category === category && !i.albumId);
  // Albums de cette catégorie
  const catAlbums = albums.filter(a => a.category === category);
  // Compter les items par album
  const countFor = (albumId: string) => items.filter(i => i.albumId === albumId).length;
  // Cover d'un album = coverUrl de l'album, sinon premier item de l'album
  const coverFor = (album: GalleryAlbum) => {
    if (album.coverUrl) return { mediaType: 'image' as const, url: album.coverUrl, thumbnailUrl: undefined };
    return items.find(i => i.albumId === album.id);
  };

  const total = catAlbums.length + orphans.length;
  if (total === 0) return null;

  return (
    <div className="mb-16">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 bg-pm-gold rounded-full" />
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-white">{category}</h2>
          <span className="text-[10px] font-black text-pm-gold/40 uppercase tracking-widest">
            {catAlbums.length > 0 ? `${catAlbums.length} album${catAlbums.length > 1 ? 's' : ''}` : `${orphans.length} média${orphans.length > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} aria-label="Précédent"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-pm-gold/20 border border-white/10 hover:border-pm-gold/40 flex items-center justify-center transition-all">
            <ChevronLeftIcon className="w-4 h-4 text-white/60" />
          </button>
          <button onClick={() => scroll('right')} aria-label="Suivant"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-pm-gold/20 border border-white/10 hover:border-pm-gold/40 flex items-center justify-center transition-all">
            <ChevronRightIcon className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Track */}
      <div ref={trackRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 snap-x snap-mandatory">

        {/* Cartes d'albums */}
        {catAlbums.map(album => {
          const cover = coverFor(album);
          const count = countFor(album.id);
          return (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              onClick={() => onSelectAlbum(album)}
              className="flex-shrink-0 w-56 sm:w-64 snap-start cursor-pointer group"
            >
              {/* Thumbnail empilé (effet album) */}
              <div className="relative h-44 mb-3">
                {/* Ombre arrière */}
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl bg-white/5 border border-white/5" />
                <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl bg-white/5 border border-white/5" />
                {/* Carte principale */}
                <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 group-hover:border-pm-gold/40 transition-all duration-300 bg-black/60">
                  {cover ? (
                    cover.mediaType === 'video' && cover.thumbnailUrl
                      ? <img src={cover.thumbnailUrl} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      : cover.mediaType === 'image'
                        ? <img src={cover.url} alt={album.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center"><PhotoIcon className="w-10 h-10 text-white/10" /></div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><PhotoIcon className="w-10 h-10 text-white/10" /></div>
                  )}
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-pm-gold/0 group-hover:bg-pm-gold/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-black uppercase tracking-widest text-white bg-black/60 px-3 py-1.5 rounded-full">
                      Voir l'album
                    </span>
                  </div>
                  {/* Badge count */}
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-pm-gold text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-pm-gold/20">
                    {count} média{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <p className="text-sm font-bold text-white group-hover:text-pm-gold transition-colors truncate px-1">{album.name}</p>
              {album.description && (
                <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1 px-1">{album.description}</p>
              )}
            </motion.div>
          );
        })}

        {/* Items orphelins (sans album) */}
        {orphans.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            onClick={() => onOpenOrphan(item, orphans)}
            className="flex-shrink-0 w-56 sm:w-64 snap-start cursor-pointer group"
          >
            <div className="relative h-44 mb-3 rounded-xl overflow-hidden border border-white/10 group-hover:border-pm-gold/40 transition-all duration-300 bg-black/40">
              {item.mediaType === 'video' ? (
                <>
                  {item.thumbnailUrl
                    ? <img src={item.thumbnailUrl} alt={item.caption ?? ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center bg-white/5"><PlayIcon className="w-10 h-10 text-white/20" /></div>}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-pm-gold/90 flex items-center justify-center">
                      <PlayIcon className="w-4 h-4 text-pm-dark ml-0.5" />
                    </div>
                  </div>
                </>
              ) : (
                <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              )}
            </div>
            {item.caption && (
              <p className="text-[11px] text-white/40 truncate px-1">{item.caption}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ── Vue détail d'un album ─────────────────────────────────────────────────────
const AlbumDetail: React.FC<{
  album: GalleryAlbum;
  items: GalleryItem[];
  onBack: () => void;
  onOpen: (item: GalleryItem, items: GalleryItem[]) => void;
}> = ({ album, items, onBack, onOpen }) => (
  <div>
    <button onClick={onBack}
      className="flex items-center gap-2 text-pm-gold/70 hover:text-pm-gold text-xs font-black uppercase tracking-widest mb-8 transition-colors">
      <ArrowLeftIcon className="w-4 h-4" /> Retour aux albums
    </button>
    <div className="mb-8">
      <h2 className="text-2xl font-playfair font-black text-white mb-1">{album.name}</h2>
      {album.description && <p className="text-white/40 text-sm">{album.description}</p>}
      <p className="text-[10px] font-black uppercase tracking-widest text-pm-gold/40 mt-2">
        {items.length} média{items.length !== 1 ? 's' : ''} · {album.category}
      </p>
    </div>
    {items.length === 0 ? (
      <div className="text-center py-24">
        <PhotoIcon className="w-12 h-12 text-white/10 mx-auto mb-3" />
        <p className="text-white/20 text-sm uppercase tracking-widest">Album vide</p>
      </div>
    ) : (
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {items.map(item => (
          <div key={item.id}
            onClick={() => onOpen(item, items)}
            className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-xl border border-white/5 hover:border-pm-gold/30 transition-all">
            {item.mediaType === 'video' ? (
              <div className="relative bg-black/40">
                {item.thumbnailUrl
                  ? <img src={item.thumbnailUrl} alt={item.caption ?? ''} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  : <div className="w-full aspect-video bg-white/5 flex items-center justify-center"><PlayIcon className="w-8 h-8 text-white/20" /></div>}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-pm-gold/90 flex items-center justify-center">
                    <PlayIcon className="w-4 h-4 text-pm-dark ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <img src={item.url} alt={item.caption ?? ''} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            )}
            {item.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-xs line-clamp-2">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────
const Gallery: React.FC = () => {
  const { items: allItems, isLoading } = useFirebaseCollection<GalleryItem>('gallery', { orderBy: 'createdAt' });
  const { items: albums } = useFirebaseCollection<GalleryAlbum>('galleryAlbums', { orderBy: 'createdAt' });

  const [filterCat, setFilterCat] = useState<GalleryCategory | 'Tout'>('Tout');
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [lightboxItems, setLightboxItems] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Catégories actives (ont des items ou des albums)
  const activeCategories = useMemo(() => {
    const itemCats = new Set(allItems.map(i => i.category));
    const albumCats = new Set(albums.map(a => a.category));
    return CAT_LIST.filter(c => itemCats.has(c) || albumCats.has(c));
  }, [allItems, albums]);

  // Catégories à afficher selon le filtre
  const visibleCats = useMemo(() => {
    if (filterCat === 'Tout') return activeCategories;
    return activeCategories.filter(c => c === filterCat);
  }, [activeCategories, filterCat]);

  const openLightbox = (item: GalleryItem, items: GalleryItem[]) => {
    const idx = items.findIndex(i => i.id === item.id);
    setLightboxItems(items);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightbox(item);
  };

  const navLightbox = (dir: 'prev' | 'next') => {
    const newIdx = dir === 'next'
      ? (lightboxIndex + 1) % lightboxItems.length
      : (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
    setLightboxIndex(newIdx);
    setLightbox(lightboxItems[newIdx]);
  };

  // Items de l'album sélectionné
  const albumItems = useMemo(() =>
    selectedAlbum ? allItems.filter(i => i.albumId === selectedAlbum.id) : [],
    [allItems, selectedAlbum]
  );

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white">
      <SEO title="Galerie | Perfect Models Management" description="Découvrez nos prestations, collaborations et entraînements en images et vidéos." />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 text-center">
        <span className="section-label">Perfect Models Management</span>
        <h1 className="text-5xl md:text-7xl font-playfair font-black text-white mt-4 mb-4">
          Gale<span className="text-pm-gold">rie</span>
        </h1>
        <p className="text-white/40 text-sm tracking-widest uppercase max-w-md mx-auto">
          Nos moments, nos collaborations, notre univers
        </p>
      </section>

      {/* Filtre — masqué si on est dans un album */}
      {!selectedAlbum && (
        <div className="sticky top-[72px] z-30 bg-pm-dark/95 backdrop-blur-xl border-b border-white/5 py-3">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-3">
            <FunnelIcon className="w-4 h-4 text-pm-gold/50 shrink-0" />
            <div className="relative">
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value as GalleryCategory | 'Tout')}
                className="appearance-none bg-white/5 border border-white/10 hover:border-pm-gold/40 focus:border-pm-gold text-sm text-pm-off-white rounded-full px-5 py-2 pr-9 outline-none transition-colors cursor-pointer"
              >
                <option value="Tout">Toutes les catégories</option>
                {activeCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronRightIcon className="w-3.5 h-3.5 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
            {filterCat !== 'Tout' && (
              <button onClick={() => setFilterCat('Tout')}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-pm-gold/60 hover:text-pm-gold transition-colors">
                <XMarkIcon className="w-3.5 h-3.5" /> Effacer
              </button>
            )}
            <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-white/20">
              {allItems.length} média{allItems.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <span className="loading loading-ring loading-md text-pm-gold" />
          </div>
        ) : selectedAlbum ? (
          <AlbumDetail
            album={selectedAlbum}
            items={albumItems}
            onBack={() => setSelectedAlbum(null)}
            onOpen={openLightbox}
          />
        ) : visibleCats.length === 0 ? (
          <div className="text-center py-32">
            <PhotoIcon className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/20 text-sm uppercase tracking-widest">Aucun média pour le moment</p>
          </div>
        ) : (
          visibleCats.map(cat => (
            <CategoryRow
              key={cat}
              category={cat}
              albums={albums}
              items={allItems}
              onSelectAlbum={setSelectedAlbum}
              onOpenOrphan={openLightbox}
            />
          ))
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-10"
              onClick={() => setLightbox(null)} aria-label="Fermer">
              <XMarkIcon className="w-8 h-8" />
            </button>

            {lightboxItems.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-pm-gold/30 flex items-center justify-center transition-all z-10"
                onClick={e => { e.stopPropagation(); navLightbox('prev'); }} aria-label="Précédent">
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
            )}

            <motion.div
              key={lightbox.id}
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-3"
              onClick={e => e.stopPropagation()}
            >
              {lightbox.mediaType === 'video'
                ? <video src={lightbox.url} controls autoPlay className="max-h-[80vh] w-full rounded-xl object-contain" />
                : <img src={lightbox.url} alt={lightbox.caption ?? ''} className="max-h-[80vh] w-full object-contain rounded-xl" />}
              <div className="flex items-center gap-4 flex-wrap justify-center">
                {lightbox.caption && <p className="text-white/50 text-sm text-center">{lightbox.caption}</p>}
                <span className="text-[9px] font-black uppercase tracking-widest text-pm-gold/50">{lightbox.category}</span>
                {lightboxItems.length > 1 && (
                  <span className="text-[9px] text-white/20">{lightboxIndex + 1} / {lightboxItems.length}</span>
                )}
              </div>
            </motion.div>

            {lightboxItems.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-pm-gold/30 flex items-center justify-center transition-all z-10"
                onClick={e => { e.stopPropagation(); navLightbox('next'); }} aria-label="Suivant">
                <ChevronRightIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
