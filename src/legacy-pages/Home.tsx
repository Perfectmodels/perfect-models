import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLongRightIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PhotoIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import ModelCard from '../components/ModelCard';
import ServiceCard from '../components/ServiceCard';
import CountdownTimer from '../components/CountdownTimer';
import Loading from '../components/Loading';
import { GalleryItem } from '../types';
import { useFirebaseCollection } from '../hooks/useFirebaseCollection';

const CASTING_DATE = '2026-08-22T15:00:00+01:00';
const CASTING_LOCATION = 'Complexe Eli (ancien Sobraga), Libreville';

const SectionHeader: React.FC<{ eyebrow: string; title: string; description?: string }> = ({ eyebrow, title, description }) => (
  <div className="mb-10 sm:mb-14">
    <span className="section-label">{eyebrow}</span>
    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-black italic mt-2 text-white">{title}</h2>
    {description && <p className="mt-4 max-w-2xl text-white/45 leading-relaxed">{description}</p>}
  </div>
);

const Home: React.FC = () => {
  const { data, isInitialized } = useData();
  const { items: galleryItems } = useFirebaseCollection<GalleryItem>('gallery', { orderBy: 'createdAt' });

  if (!isInitialized || !data) return <Loading />;

  const { agencyInfo, models, siteImages, agencyServices, fashionDayEvents, articles, contactInfo } = data;
  const publicModels = models.filter(model => model.isPublic).slice(0, 4);
  const featuredServices = agencyServices.filter(service => !service.isComingSoon).slice(0, 4);
  const nextEvent = [...fashionDayEvents]
    .filter(event => new Date(event.date).getTime() > Date.now())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const latestArticles = [...(articles || [])]
    .filter(article => article.status !== 'draft')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  const galleryPreview = galleryItems.filter(item => item.mediaType === 'image').slice(0, 6);
  const castingUpcoming = new Date(CASTING_DATE).getTime() > Date.now();

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Perfect Models Management',
    alternateName: 'PMM',
    url: 'https://perfectmodels.online',
    logo: 'https://perfectmodels.online/logo.svg',
    foundingDate: '2021',
    email: contactInfo?.email,
    telephone: contactInfo?.phone,
    address: { '@type': 'PostalAddress', addressLocality: 'Libreville', addressCountry: 'GA' },
  };

  return (
    <div className="bg-pm-dark overflow-x-hidden text-pm-off-white">
      <SEO
        title="Agence de Mannequins à Libreville, Gabon"
        description="Perfect Models Management accompagne les mannequins, marques et créateurs au Gabon : booking, casting, formation, production mode et événements."
        image={siteImages.hero}
        schema={organizationSchema}
      />

      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${siteImages.hero}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-pm-dark/45 to-pm-dark" />
        <div className="relative z-10 text-center px-5 sm:px-8 max-w-6xl mx-auto">
          <motion.span initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="section-label">Agence de mannequins • Libreville</motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.9 }}
            className="mt-5 text-5xl sm:text-7xl lg:text-[7rem] font-playfair font-black italic leading-[0.95] text-white"
          >
            Des talents gabonais.<br /><span className="gold-gradient-text">Une présence qui marque.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-7 max-w-2xl mx-auto text-base sm:text-lg text-white/60 leading-relaxed">
            Nous révélons, formons et représentons des profils capables de porter les ambitions des marques, créateurs et productions au Gabon et au-delà.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/mannequins" className="btn-premium">Découvrir nos talents</Link>
            <Link to="/contact?subject=booking" className="btn-premium bg-transparent text-white border-white/25">Booker un mannequin</Link>
          </motion.div>
        </div>

        {nextEvent && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/45 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-[1600px] mx-auto px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <TicketIcon className="w-7 h-7 text-pm-gold" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-pm-gold">Prochain événement</p>
                  <p className="text-sm text-white">Perfect Fashion Day — Édition {nextEvent.edition} · {nextEvent.theme}</p>
                </div>
              </div>
              <CountdownTimer targetDate={nextEvent.date} />
              <Link to="/fashion-day" className="text-xs uppercase tracking-widest font-black text-pm-gold hover:text-white transition-colors">Voir l'événement</Link>
            </div>
          </div>
        )}
      </section>

      <section className="page-container">
        <SectionHeader eyebrow="Notre sélection" title="Talents représentés" description="Des profils sélectionnés pour le runway, l'éditorial, la publicité, le e-commerce et les productions événementielles." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{publicModels.map(model => <ModelCard key={model.id} model={model} />)}</div>
        <div className="mt-10 text-center">
          <Link to="/mannequins" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-black text-pm-gold hover:text-white transition-colors">Voir tous les mannequins <ArrowLongRightIcon className="w-5 h-5" /></Link>
        </div>
      </section>

      <section className="bg-[#070707] border-y border-white/5">
        <div className="page-container">
          <SectionHeader eyebrow="Pour les marques et créateurs" title="Nos services" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7">{featuredServices.map(service => <ServiceCard key={service.slug} service={service} />)}</div>
          <div className="mt-10 text-center"><Link to="/services" className="btn-premium">Voir toutes les prestations</Link></div>
        </div>
      </section>

      <section className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative overflow-hidden border border-pm-gold/20 rounded-2xl bg-black">
            <img src={siteImages.castingBg} alt="Casting Perfect Models Management" className="w-full aspect-[4/3] object-cover opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          </div>
          <div>
            <span className="section-label">Casting PMM 2026</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-playfair font-black italic text-white">Le prochain visage peut être le vôtre.</h2>
            <p className="mt-5 text-white/55 leading-relaxed">
              {castingUpcoming ? "Les candidatures sont ouvertes pour notre casting du 22 août 2026. Préparez une présentation naturelle et professionnelle." : "Cette session de casting est terminée. Vous pouvez toutefois déposer votre profil pour les prochaines sélections."}
            </p>
            <div className="mt-7 grid gap-3 text-sm">
              <div className="flex items-center gap-3 text-white/70"><CalendarDaysIcon className="w-5 h-5 text-pm-gold" />22 août 2026 · 15h00</div>
              <div className="flex items-center gap-3 text-white/70"><MapPinIcon className="w-5 h-5 text-pm-gold" />{CASTING_LOCATION}</div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/casting" className="btn-premium bg-transparent text-white border-white/20">Informations casting</Link>
              <Link to="/casting-formulaire" className="btn-premium">Déposer ma candidature</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#070707] border-y border-white/5">
        <div className="page-container">
          <SectionHeader eyebrow="L'agence" title="Une structure, pas seulement un book." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <img src={siteImages.agencyHistory || siteImages.about} alt="Perfect Models Management" className="w-full aspect-[4/3] object-cover rounded-2xl border border-white/10" />
            <div>
              <p className="text-xl sm:text-2xl font-playfair italic text-white/80 leading-relaxed">{agencyInfo.about.p1}</p>
              <p className="mt-6 text-white/45 leading-relaxed">{agencyInfo.about.p2}</p>
              <Link to="/agence" className="mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-black text-pm-gold">Découvrir notre histoire <ArrowLongRightIcon className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </section>

      {latestArticles.length > 0 && (
        <section className="page-container">
          <SectionHeader eyebrow="Focus Model 241" title="Dernières publications" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestArticles.map(article => (
              <Link key={article.slug} to={`/magazine/${article.slug}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-black"><img src={article.imageUrl} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /></div>
                <p className="mt-5 text-[10px] uppercase tracking-[0.25em] font-black text-pm-gold">{article.category} · {new Date(article.date).toLocaleDateString('fr-FR')}</p>
                <h3 className="mt-2 text-2xl font-playfair font-bold text-white group-hover:text-pm-gold transition-colors">{article.title}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center"><Link to="/magazine" className="btn-premium bg-transparent text-white border-white/20">Voir le magazine</Link></div>
        </section>
      )}

      {galleryPreview.length > 0 && (
        <section className="bg-[#070707] border-y border-white/5">
          <div className="page-container">
            <SectionHeader eyebrow="Portfolio agence" title="Dans les coulisses" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {galleryPreview.map(item => (
                <div key={item.id} className="relative aspect-square overflow-hidden bg-black group">
                  <img src={item.thumbnailUrl || item.url} alt={item.caption || 'Galerie Perfect Models Management'} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  {item.caption && <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-xs text-white/70">{item.caption}</div>}
                </div>
              ))}
            </div>
            <div className="mt-10 text-center"><Link to="/galerie" className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] font-black text-pm-gold"><PhotoIcon className="w-5 h-5" /> Ouvrir la galerie</Link></div>
          </div>
        </section>
      )}

      <section className="page-container text-center">
        <span className="section-label">Un projet ?</span>
        <h2 className="mt-3 text-4xl sm:text-6xl font-playfair font-black italic text-white">Construisons une présence mémorable.</h2>
        <p className="mt-5 max-w-2xl mx-auto text-white/45">Booking, casting, défilé, campagne ou collaboration : présentez-nous votre besoin et notre équipe vous répondra avec une proposition adaptée.</p>
        <div className="mt-9 flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/contact" className="btn-premium">Parler à l'agence</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
