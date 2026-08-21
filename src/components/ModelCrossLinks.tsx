import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, NewspaperIcon, PhotoIcon, CalendarIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Model, FashionDayEvent, Article, GalleryItem } from '../types';
import { useData } from '../contexts/DataContext';

interface ModelCrossLinksProps {
  model: Model;
}

export const ModelCrossLinks: React.FC<ModelCrossLinksProps> = ({ model }) => {
  const { data } = useData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 1. Fashion Day Events matching this model
  const matchingFashionDayEvents = useMemo(() => {
    if (!data?.fashionDayEvents) return [];
    return data.fashionDayEvents.filter(event => {
      const isFeatured = event.featuredModels?.some(
        m => m.toLowerCase().includes(model.name.toLowerCase()) || m === model.id
      );
      const isEditionExplicit = model.fashionDayEditions?.includes(event.edition);
      const isDescMentioned = event.description?.toLowerCase().includes(model.name.toLowerCase());
      return isFeatured || isEditionExplicit || isDescMentioned;
    });
  }, [data?.fashionDayEvents, model]);

  // 2. Articles matching this model
  const matchingArticles = useMemo(() => {
    if (!data?.articles) return [];
    const nameLower = model.name.toLowerCase();
    return data.articles.filter(article => {
      if (article.status !== 'published') return false;
      const titleMatch = article.title?.toLowerCase().includes(nameLower);
      const excerptMatch = article.excerpt?.toLowerCase().includes(nameLower);
      const tagMatch = article.tags?.some(t => t.toLowerCase().includes(nameLower));
      const contentMatch = article.content?.some(
        block => 'text' in block && block.text.toLowerCase().includes(nameLower)
      );
      return titleMatch || excerptMatch || tagMatch || contentMatch;
    });
  }, [data?.articles, model]);

  // 3. Gallery items matching this model
  const matchingGalleryItems = useMemo(() => {
    if (!data?.gallery) return [];
    const nameLower = model.name.toLowerCase();
    return data.gallery.filter(item => {
      const captionMatch = item.caption?.toLowerCase().includes(nameLower);
      const isTagged = model.taggedGalleryIds?.includes(item.id);
      return captionMatch || isTagged;
    });
  }, [data?.gallery, model]);

  // 4. Custom collaborations
  const collaborations = model.collaborations ?? [];

  const hasAnyCrossLinks =
    matchingFashionDayEvents.length > 0 ||
    matchingArticles.length > 0 ||
    matchingGalleryItems.length > 0 ||
    collaborations.length > 0;

  if (!hasAnyCrossLinks) return null;

  return (
    <div className="mt-20 sm:mt-28 space-y-16">
      {/* ── Fashion Day Participations ─────────────────────────── */}
      {matchingFashionDayEvents.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <SparklesIcon className="w-6 h-6 text-pm-gold shrink-0" />
            <div>
              <span className="section-label">Événements PMM</span>
              <h2 className="text-3xl sm:text-4xl font-playfair font-black italic text-white mt-1">
                Perfect Fashion Day
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchingFashionDayEvents.map(event => (
              <div
                key={event.edition}
                className="bg-black/40 border border-pm-gold/20 rounded-2xl p-6 hover:border-pm-gold/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="px-3 py-1 bg-pm-gold/10 border border-pm-gold/30 text-pm-gold text-[10px] font-black uppercase tracking-widest rounded-full">
                      Édition #{event.edition}
                    </span>
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {event.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-playfair font-bold text-white mb-2">
                    {event.theme}
                  </h3>

                  <p className="text-sm text-pm-off-white/60 line-clamp-3 mb-4">
                    {event.description}
                  </p>
                </div>

                {event.galleryImages && event.galleryImages.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                    {event.galleryImages.slice(0, 4).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Fashion Day #${event.edition}`}
                        onClick={() => setSelectedImage(img)}
                        className="w-16 h-16 object-cover rounded-lg border border-white/10 hover:border-pm-gold cursor-pointer transition-all shrink-0"
                      />
                    ))}
                  </div>
                )}

                <Link
                  to="/fashion-day"
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-pm-gold hover:underline"
                >
                  Voir l'événement <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Shootings & Galerie Photos ────────────────────────────── */}
      {matchingGalleryItems.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <PhotoIcon className="w-6 h-6 text-pm-gold shrink-0" />
            <div>
              <span className="section-label">Shooting & Galerie</span>
              <h2 className="text-3xl sm:text-4xl font-playfair font-black italic text-white mt-1">
                Collaborations Visuelles
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {matchingGalleryItems.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item.url)}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:border-pm-gold/50 transition-all"
              >
                <img
                  src={item.url}
                  alt={item.caption || model.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-pm-gold">
                    {item.category}
                  </span>
                  {item.caption && (
                    <p className="text-xs text-white line-clamp-2 mt-1">{item.caption}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Articles & Presse ────────────────────────────────────────── */}
      {matchingArticles.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <NewspaperIcon className="w-6 h-6 text-pm-gold shrink-0" />
            <div>
              <span className="section-label">Presse & Medias</span>
              <h2 className="text-3xl sm:text-4xl font-playfair font-black italic text-white mt-1">
                Publications & Couverture
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingArticles.map(article => (
              <Link
                key={article.slug}
                to={`/magazine/${article.slug}`}
                className="group bg-black/40 border border-white/10 rounded-2xl overflow-hidden hover:border-pm-gold/50 transition-all flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden bg-black">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-pm-gold">
                      {article.category}
                    </span>
                    <h3 className="text-lg font-playfair font-bold text-white mt-1 group-hover:text-pm-gold transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-pm-off-white/60 line-clamp-2 mt-2">
                      {article.excerpt}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-white/30 mt-4 block">
                    {article.date}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Collaborations de marque ──────────────────────────────── */}
      {collaborations.length > 0 && (
        <section>
          <span className="section-label">Partenariats</span>
          <h2 className="text-3xl sm:text-4xl font-playfair font-black italic text-white mt-3 mb-6">
            Collaborations Marques
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collaborations.map(collab => (
              <div
                key={collab.id}
                className="bg-black/40 border border-white/10 rounded-2xl p-5 hover:border-pm-gold/40 transition-all flex items-start gap-4"
              >
                {collab.imageUrl && (
                  <img
                    src={collab.imageUrl}
                    alt={collab.title}
                    className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                )}
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-pm-gold">
                    {collab.type || 'Collaboration'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{collab.title}</h3>
                  {collab.clientOrBrand && (
                    <p className="text-xs text-pm-off-white/60">{collab.clientOrBrand}</p>
                  )}
                  {collab.date && <p className="text-[10px] text-white/30 mt-1">{collab.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/60 hover:text-white p-2 rounded-full bg-white/10"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Visuel agrandi"
            className="max-w-full max-h-[90vh] object-contain rounded-xl border border-pm-gold/30 shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ModelCrossLinks;
