import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import CountdownTimer from '../components/CountdownTimer';
import Loading from '../components/Loading';
import { useData } from '../contexts/DataContext';

const CASTING_DATE = '2026-08-22T15:00:00+01:00';
const CASTING_LOCATION = 'Complexe Eli (ancien Sobraga), Libreville';

const INFO = [
  { icon: CalendarDaysIcon, label: 'Date', value: 'Samedi 22 août 2026' },
  { icon: CalendarDaysIcon, label: 'Heure', value: '15h00' },
  { icon: MapPinIcon, label: 'Lieu', value: CASTING_LOCATION },
  { icon: IdentificationIcon, label: 'Document', value: "Pièce d'identité" },
];

const DRESS_CODE = [
  'T-shirt blanc ou noir, sans gros motif',
  'Jean simple et ajusté',
  'Talons pour les candidates concernées',
  'Coiffure simple et visage naturel',
];

const EVALUATION = [
  'Présence et confiance devant le jury',
  'Posture, démarche et coordination',
  'Photogénie et capacité à prendre la direction',
  'Motivation, ponctualité et discipline',
];

const PROCESS = [
  ['01', 'Candidature', 'Remplissez le formulaire en ligne avec vos informations, mensurations et photos.'],
  ['02', 'Pré-sélection', "L'équipe PMM examine les profils reçus et prépare la liste des candidats à rencontrer."],
  ['03', 'Casting physique', 'Présentation devant le jury, marche, posture et prise de vue rapide.'],
  ['04', 'Résultats', 'Les candidats retenus sont contactés avec les prochaines étapes d’intégration.'],
];

const Casting: React.FC = () => {
  const { data, isInitialized } = useData();

  if (!isInitialized || !data) return <Loading />;

  const upcoming = new Date(CASTING_DATE).getTime() > Date.now();

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Casting Perfect Models Management 2026',
    startDate: CASTING_DATE,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: upcoming ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCompleted',
    location: {
      '@type': 'Place',
      name: 'Complexe Eli (ancien Sobraga)',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Libreville',
        addressCountry: 'GA',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'Perfect Models Management',
      url: 'https://perfectmodels.online',
    },
  };

  return (
    <div className="bg-pm-dark text-pm-off-white overflow-x-hidden">
      <SEO
        title="Casting PMM — 22 août 2026"
        description="Casting Perfect Models Management à Libreville le 22 août 2026 à 15h00. Consultez les informations pratiques et déposez votre candidature en ligne."
        image={data.siteImages.castingBg}
        type="event"
        schema={eventSchema}
      />

      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.3 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${data.siteImages.castingBg}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-pm-dark/55 to-pm-dark" />

        <div className="relative z-10 max-w-5xl mx-auto px-5 text-center">
          <span className="section-label">Casting officiel 2026</span>
          <h1 className="mt-4 text-5xl sm:text-7xl lg:text-8xl font-playfair font-black italic leading-[0.95] text-white">
            Votre présence peut<br /><span className="gold-gradient-text">ouvrir une carrière.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-white/55 leading-relaxed">
            Perfect Models Management rencontre de nouveaux profils pour renforcer son roster et préparer ses prochaines productions mode, campagnes et défilés.
          </p>

          {upcoming ? (
            <>
              <div className="mt-8 flex justify-center"><CountdownTimer targetDate={CASTING_DATE} /></div>
              <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/casting-formulaire" className="btn-premium">Déposer ma candidature</Link>
                <a href="#informations" className="btn-premium bg-transparent text-white border-white/25">Voir les informations</a>
              </div>
            </>
          ) : (
            <div className="mt-8 inline-flex px-5 py-3 border border-pm-gold/30 text-pm-gold text-xs uppercase tracking-widest font-black">
              Session terminée — les candidatures spontanées restent ouvertes
            </div>
          )}
        </div>
      </section>

      <section id="informations" className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5">
          {INFO.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-pm-dark p-6 sm:p-8">
              <Icon className="w-6 h-6 text-pm-gold" />
              <p className="mt-5 text-[9px] uppercase tracking-[0.3em] font-black text-white/30">{label}</p>
              <p className="mt-2 font-playfair font-bold text-lg text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#070707] border-y border-white/5">
        <div className="page-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <span className="section-label">Préparation</span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-playfair font-black italic text-white">Comment venir au casting</h2>
            <p className="mt-5 text-white/45 leading-relaxed">
              L'objectif est de voir votre silhouette, votre démarche et votre présence de la manière la plus naturelle possible. Évitez les tenues et accessoires qui masquent votre profil.
            </p>
            <div className="mt-7 space-y-4">
              {DRESS_CODE.map(item => (
                <div key={item} className="flex gap-3 items-start text-white/65">
                  <CheckCircleIcon className="w-5 h-5 text-pm-gold shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-pm-gold/20 bg-pm-gold/[0.03] p-7 sm:p-9">
            <UserGroupIcon className="w-8 h-8 text-pm-gold" />
            <h3 className="mt-5 text-3xl font-playfair font-black text-white">Ce que nous observons</h3>
            <div className="mt-6 space-y-4">
              {EVALUATION.map(item => (
                <div key={item} className="flex gap-3 items-start text-white/55">
                  <span className="text-pm-gold">—</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container">
        <span className="section-label">Parcours candidat</span>
        <h2 className="mt-3 text-4xl sm:text-5xl font-playfair font-black italic text-white">Le processus en quatre étapes</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {PROCESS.map(([number, title, description]) => (
            <div key={number} className="bg-pm-dark p-7 sm:p-8 min-h-64">
              <span className="text-4xl font-playfair font-black text-pm-gold/20">{number}</span>
              <h3 className="mt-6 text-2xl font-playfair font-black text-white">{title}</h3>
              <p className="mt-4 text-sm text-white/40 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-pm-gold text-pm-dark">
        <div className="page-container text-center">
          <span className="text-[10px] uppercase tracking-[0.35em] font-black opacity-55">Candidature en ligne</span>
          <h2 className="mt-3 text-4xl sm:text-6xl font-playfair font-black italic">Prêt à présenter votre profil ?</h2>
          <p className="mt-4 max-w-2xl mx-auto opacity-70">Préparez vos informations personnelles, vos mensurations et au moins une photo récente avant de commencer.</p>
          <Link to="/casting-formulaire" className="mt-8 inline-flex items-center gap-3 bg-pm-dark text-pm-gold px-8 py-4 text-xs uppercase tracking-widest font-black">
            Commencer ma candidature <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Casting;
