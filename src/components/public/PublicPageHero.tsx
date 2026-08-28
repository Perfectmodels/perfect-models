'use client';

import Link from 'next/link';

type HeroConfig = {
  kicker: string;
  title: string;
  accent: string;
  description: string;
  cta?: { label: string; href: string };
  tone: string;
};

const HEROES: Array<[RegExp, HeroConfig]> = [
  [/^\/agence\/?$/, { kicker: 'La Maison', title: 'Une agence construite pour', accent: 'faire grandir les talents.', description: 'Perfect Models Management associe management, formation, image et production depuis Libreville.', cta: { label: 'Découvrir nos talents', href: '/mannequins' }, tone: 'from-pm-peach via-pm-ivory to-pm-gold-light/45' }],
  [/^\/mannequins\/?$/, { kicker: 'Roster PMM', title: 'Des présences singulières,', accent: 'des trajectoires réelles.', description: 'Découvrez les mannequins actuellement visibles et validés par l’agence.', cta: { label: 'Rejoindre le roster', href: '/casting-formulaire' }, tone: 'from-pm-sage via-pm-ivory to-pm-peach' }],
  [/^\/services\/?$/, { kicker: 'Nos expertises', title: 'Du potentiel à la production,', accent: 'un accompagnement complet.', description: 'Casting, management, formation, direction artistique et production réunis dans une même maison.', cta: { label: 'Parler à l’agence', href: '/contact' }, tone: 'from-pm-gold-light/55 via-pm-ivory to-pm-sage' }],
  [/^\/casting\/?$|^\/casting-formulaire\/?$/, { kicker: 'Casting', title: 'Votre candidature commence', accent: 'par une présence.', description: 'Un parcours clair, accessible et structuré pour présenter votre profil à Perfect Models Management.', tone: 'from-pm-peach via-pm-ivory to-pm-coral-soft/50' }],
  [/^\/fashion-day\/?$|^\/fashion-day-application\/?$/, { kicker: 'Perfect Fashion Day', title: 'La scène où les talents', accent: 'rencontrent la création.', description: 'Le rendez-vous signature de l’agence autour des mannequins, créateurs et partenaires.', cta: { label: 'Voir les talents', href: '/mannequins' }, tone: 'from-pm-coral-soft/65 via-pm-ivory to-pm-gold-light/45' }],
  [/^\/formations\/?$|^\/formation\/?$/, { kicker: 'PMM Campus', title: 'La carrière se construit', accent: 'aussi par la formation.', description: 'Des contenus structurés pour renforcer la posture, la culture mode, l’image et la discipline professionnelle.', tone: 'from-pm-sage via-pm-ivory to-pm-gold-light/40' }],
  [/^\/blog\/?$|^\/magazine\/?$/, { kicker: 'Journal PMM', title: 'Actualités, coulisses', accent: 'et culture de la Maison.', description: 'Retrouvez les publications réelles de l’agence, ses talents, ses événements et ses projets.', tone: 'from-pm-gold-light/45 via-pm-ivory to-pm-peach' }],
  [/^\/galerie\/?$/, { kicker: 'Galerie', title: 'L’image comme archive', accent: 'de nos mouvements.', description: 'Une sélection visuelle des projets, talents, productions et rendez-vous de Perfect Models Management.', tone: 'from-pm-peach via-pm-ivory to-pm-sage' }],
  [/^\/contact\/?$/, { kicker: 'Contact', title: 'Une idée, un booking,', accent: 'une collaboration ?', description: 'Échangez avec l’équipe Perfect Models Management à propos d’un talent, d’un projet ou d’un partenariat.', tone: 'from-pm-sage via-pm-ivory to-pm-peach' }],
  [/^\/privacy\/?$|^\/terms\/?$/, { kicker: 'Informations légales', title: 'Transparence, protection', accent: 'et confiance.', description: 'Consultez les règles et engagements qui encadrent l’utilisation de la plateforme Perfect Models Management.', tone: 'from-pm-sand via-pm-ivory to-pm-peach/70' }],
];

export default function PublicPageHero({ pathname }: { pathname: string }) {
  if (pathname === '/') return null;
  const config = HEROES.find(([pattern]) => pattern.test(pathname))?.[1];
  if (!config) return null;

  return (
    <section className={`relative isolate overflow-hidden border-b border-pm-ink/10 bg-gradient-to-br ${config.tone}`} aria-labelledby="public-page-title">
      <div aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-white/45 blur-3xl motion-reduce:blur-2xl" />
      <div aria-hidden="true" className="absolute -bottom-32 left-[10%] h-72 w-72 rounded-full bg-pm-coral/10 blur-3xl motion-reduce:blur-2xl" />
      <div className="relative mx-auto max-w-[1500px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-pm-coral">{config.kicker}</p>
        <div className="mt-5 grid gap-7 lg:grid-cols-[1.15fr_.65fr] lg:items-end lg:gap-16">
          <h1 id="public-page-title" className="font-playfair text-[clamp(3.4rem,6.3vw,7.2rem)] font-semibold leading-[.88] tracking-[-.05em] text-pm-ink">{config.title}<br /><em className="font-normal text-pm-wine">{config.accent}</em></h1>
          <div>
            <p className="max-w-xl text-base leading-8 text-pm-ink/65">{config.description}</p>
            {config.cta && <Link href={config.cta.href} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-pm-ink px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-pm-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-pm-coral">{config.cta.label} <span className="ml-2" aria-hidden="true">↗</span></Link>}
          </div>
        </div>
      </div>
    </section>
  );
}
