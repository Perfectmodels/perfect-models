import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowLongRightIcon,
  CheckIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { useData } from '../contexts/DataContext';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import ModelCard from '../components/ModelCard';
import ModelCrossLinks from '../components/ModelCrossLinks';

const ModelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isInitialized } = useData();
  const [copied, setCopied] = useState(false);

  const model = useMemo(
    () => data?.models.find(item => item.id === id && item.isPublic !== false),
    [data?.models, id],
  );

  const similarModels = useMemo(() => {
    if (!model || !data?.models) return [];
    return data.models
      .filter(item => item.id !== model.id && item.isPublic === true && item.gender === model.gender)
      .filter(item => item.categories?.some(category => model.categories?.includes(category)))
      .slice(0, 4);
  }, [data?.models, model]);

  if (!isInitialized || !data) return <Loading />;

  if (!model) {
    return (
      <div className="min-h-screen bg-pm-dark flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-4xl font-playfair font-black text-white">Profil introuvable</h1>
          <Link to="/mannequins" className="mt-6 inline-flex text-pm-gold text-xs uppercase tracking-widest font-black">Retour au catalogue</Link>
        </div>
      </div>
    );
  }

  const canonical = `https://perfectmodels.online/mannequins/${model.id}`;
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: model.name,
    image: model.imageUrl,
    jobTitle: 'Mannequin',
    url: canonical,
    gender: model.gender,
    worksFor: {
      '@type': 'Organization',
      name: 'Perfect Models Management',
      url: 'https://perfectmodels.online',
    },
  };

  const handleShare = async () => {
    const shareData = {
      title: `${model.name} — Perfect Models Management`,
      text: `Découvrez le profil de ${model.name}, mannequin représenté par Perfect Models Management.`,
      url: canonical,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
      return;
    }

    await navigator.clipboard?.writeText(canonical).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const measurements = [
    ['Taille', model.height],
    ['Poitrine', model.measurements?.chest],
    ['Tour de taille', model.measurements?.waist],
    ['Hanches', model.measurements?.hips],
    ['Pointure', model.measurements?.shoeSize],
    ['Localisation', model.location],
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white">
      <SEO
        title={`${model.name} — Mannequin`}
        description={model.experience || `Profil professionnel de ${model.name}, mannequin représenté par Perfect Models Management à Libreville.`}
        image={model.imageUrl}
        type="profile"
        schema={personSchema}
      />

      <div className="page-container">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 sm:mb-14">
          <Link to="/mannequins" className="inline-flex items-center gap-2 text-pm-gold/70 hover:text-pm-gold text-xs uppercase tracking-widest font-black transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> Tous les talents
          </Link>
          <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 text-white/45 hover:text-white text-xs uppercase tracking-widest font-black transition-colors">
            {copied ? <CheckIcon className="w-4 h-4 text-pm-gold" /> : <ShareIcon className="w-4 h-4" />}
            {copied ? 'Lien copié' : 'Partager'}
          </button>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 sm:gap-16 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-24">
            <div className="aspect-[3/4] overflow-hidden bg-pm-gray border border-white/5">
              <img src={model.imageUrl} alt={model.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:pt-8">
            <span className="section-label">{model.level || 'Talent PMM'}</span>
            <h1 className="mt-3 text-5xl sm:text-7xl font-playfair font-black italic leading-none text-white">{model.name}</h1>
            <p className="mt-5 text-xs uppercase tracking-[0.28em] text-white/35">{model.gender} {model.location ? `• ${model.location}` : ''}</p>

            {model.categories?.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {model.categories.map(category => (
                  <span key={category} className="px-3 py-1.5 border border-pm-gold/20 text-[10px] uppercase tracking-widest font-black text-pm-gold/70">
                    {category}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/5 border border-white/5">
              {measurements.map(([label, value]) => (
                <div key={label} className="bg-pm-dark p-5 sm:p-6">
                  <span className="text-[9px] uppercase tracking-[0.25em] font-black text-white/30 block">{label}</span>
                  <span className="mt-2 block text-xl font-playfair font-bold text-white">{value}</span>
                </div>
              ))}
            </div>

            {model.experience && (
              <div className="mt-10">
                <h2 className="text-2xl font-playfair font-black text-white">Expérience</h2>
                <p className="mt-3 whitespace-pre-line text-white/50 leading-relaxed">{model.experience}</p>
              </div>
            )}

            {model.journey && (
              <div className="mt-8">
                <h2 className="text-2xl font-playfair font-black text-white">Parcours</h2>
                <p className="mt-3 whitespace-pre-line text-white/50 leading-relaxed">{model.journey}</p>
              </div>
            )}

            {model.distinctions && model.distinctions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-playfair font-black text-white">Distinctions</h2>
                <div className="mt-4 space-y-3">
                  {model.distinctions.map((distinction, index) => (
                    <div key={`${distinction.name}-${index}`} className="border-l border-pm-gold/40 pl-4">
                      <p className="font-bold text-pm-gold">{distinction.name}</p>
                      <p className="text-sm text-white/45 mt-1">{distinction.titles.join(' • ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 p-6 sm:p-8 bg-pm-gold text-pm-dark">
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Booking professionnel</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-playfair font-black italic">Vous souhaitez travailler avec {model.name} ?</h2>
              <p className="mt-3 text-sm opacity-70">Indiquez votre marque, le type de mission, les dates et le lieu. L'agence vous répondra avec les disponibilités et les conditions.</p>
              <Link
                to={`/contact?model=${encodeURIComponent(model.name)}`}
                className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-pm-dark text-pm-gold text-xs uppercase tracking-widest font-black"
              >
                Demander un booking <ArrowLongRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {model.portfolioImages && model.portfolioImages.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <span className="section-label">Portfolio</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-playfair font-black italic text-white">Sélection d'images</h2>
            <div className="mt-8 columns-1 sm:columns-2 lg:columns-3 gap-3 space-y-3">
              {model.portfolioImages.map((image, index) => (
                <img key={image} src={image} alt={`${model.name} — portfolio ${index + 1}`} loading="lazy" className="w-full break-inside-avoid object-cover bg-black" />
              ))}
            </div>
          </section>
        )}

        <ModelCrossLinks model={model} />

        {similarModels.length > 0 && (
          <section className="mt-20 sm:mt-28">
            <span className="section-label">Profils similaires</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-playfair font-black italic text-white">Autres talents à découvrir</h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarModels.map(item => <ModelCard key={item.id} model={item} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ModelDetail;
