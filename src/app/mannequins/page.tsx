import type { Metadata } from 'next';
import Link from 'next/link';
import ModelsDirectory from '@/components/models/ModelsDirectory';
import { getPublicModels } from '@/lib/public-content';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const revalidate = 3600;
export const metadata: Metadata = buildPageMetadata(MARKETING_PAGES.models);

export default async function Page() {
  const models = await getPublicModels();

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="relative isolate overflow-hidden bg-pm-dark px-5 pb-20 pt-24 text-pm-ivory sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-28 xl:px-16">
        <div aria-hidden="true" className="absolute -right-[5vw] top-1/2 -z-10 -translate-y-1/2 font-playfair text-[30vw] font-semibold leading-none tracking-[-.08em] text-white/[.026]">TALENTS</div>
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.4em] text-pm-gold-light sm:text-[9px]">Perfect Models Management · Libreville</p>
            <p className="mt-8 max-w-sm text-sm leading-7 text-white/45">Runway, éditorial, commercial et image : découvrez les profils officiellement publiés par l’agence.</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.34em] text-white/35 sm:text-[9px]">Roster officiel</p>
            <h1 className="mt-5 max-w-5xl font-playfair text-[clamp(4.2rem,9vw,9.5rem)] font-semibold leading-[.78] tracking-[-.065em]">Les talents<br /><em className="font-normal text-pm-gold-light">que nous représentons.</em></h1>
          </div>
        </div>
      </section>

      <ModelsDirectory models={models} />

      <section className="bg-pm-sand px-5 py-20 text-pm-ink sm:px-8 sm:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.58fr_1.42fr] lg:items-end">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.38em] text-pm-wine">Casting PMM</p>
            <p className="mt-7 max-w-sm text-sm leading-7 text-pm-ink/52">Vous souhaitez intégrer l’agence ? Envoyez un dossier complet et laissez notre équipe étudier votre profil.</p>
          </div>
          <div>
            <h2 className="font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Vous avez une présence<br /><em className="font-normal text-pm-wine">à faire découvrir ?</em></h2>
            <div className="mt-8"><Link href="/casting-formulaire" className="pmm-button border-pm-ink bg-pm-ink text-pm-ivory hover:border-pm-wine hover:bg-pm-wine">Candidater au casting ↗</Link></div>
          </div>
        </div>
      </section>
    </main>
  );
}
