import CastingApplicationForm from '@/components/forms/CastingApplicationForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Candidature casting PMM',
  description: 'Déposez votre candidature pour rejoindre Perfect Models Management.',
  path: '/casting-formulaire',
  noIndex: true,
});

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="border-b border-white/10 px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="editorial-kicker text-pm-gold">Candidature mannequin</p>
            <h1 className="mt-5 max-w-4xl font-playfair text-[clamp(3.4rem,8vw,7rem)] font-black italic leading-[.86] tracking-[-.045em]">Présentez-nous votre profil.</h1>
          </div>
          <div className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-sm leading-7 text-white/55">Prévoyez quelques minutes pour compléter votre dossier. Utilisez des informations exactes et des photos récentes, sans filtre excessif.</p>
            <p className="mt-4 text-[9px] font-bold uppercase tracking-[.22em] text-white/30">Les champs marqués d’un * sont obligatoires.</p>
          </div>
        </div>
      </section>
      <section className="px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-20">
        <CastingApplicationForm />
      </section>
    </main>
  );
}
