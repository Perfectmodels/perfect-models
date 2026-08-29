import type { Metadata } from 'next';
import Link from 'next/link';
import ModelsDirectory from '@/components/models/ModelsDirectory';
import VisualMasthead from '@/components/public/VisualMasthead';
import { getPublicModels } from '@/lib/public-content';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const revalidate = 3600;
export const metadata: Metadata = buildPageMetadata(MARKETING_PAGES.models);

export default async function Page() {
  const models = await getPublicModels();
  const images = models.flatMap((model) => [model.imageUrl, ...(model.portfolioImages || [])]).filter(Boolean).slice(0, 5) as string[];

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <VisualMasthead
        eyebrow="Roster officiel · Perfect Models Management"
        title="Les talents"
        accent="que nous représentons."
        description="Runway, éditorial, commercial et image : découvrez les profils officiellement publiés par l’agence, avec une expérience pensée comme un véritable book collectif."
        images={images}
        tone="coral"
        primary={{ label: 'Explorer le roster', href: '#roster' }}
        secondary={{ label: 'Candidater à PMM', href: '/casting-formulaire' }}
        meta={[`${models.length} talents publiés`, 'Libreville · Gabon', 'Booking professionnel']}
      />

      <div id="roster"><ModelsDirectory models={models} /></div>

      <section className="bg-pm-teal px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-end">
          <div><p className="text-[9px] font-black uppercase tracking-[.26em] text-pm-peach">Casting PMM</p><p className="mt-5 max-w-sm text-sm leading-7 text-white/66">L’agence recherche des personnalités, pas seulement des mensurations. Présentez un dossier complet et laissez notre équipe évaluer votre potentiel.</p></div>
          <div><h2 className="font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Vous avez une présence<br /><em className="font-normal text-pm-gold-light">à faire découvrir ?</em></h2><div className="mt-8 flex flex-wrap gap-3"><Link href="/casting-formulaire" className="inline-flex min-h-12 items-center rounded-full bg-pm-gold-light px-6 py-3 text-sm font-extrabold text-pm-ink">Candidater au casting ↗</Link><Link href="/contact" className="inline-flex min-h-12 items-center rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold">Parler à l’agence</Link></div></div>
        </div>
      </section>
    </main>
  );
}
