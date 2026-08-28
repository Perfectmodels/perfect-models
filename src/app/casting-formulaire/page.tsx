import CastingApplicationForm from '@/components/forms/CastingApplicationForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Formulaire de candidature casting PMM',
  description: 'Formulaire de candidature au casting Perfect Models Management.',
  path: '/casting-formulaire',
  noIndex: true,
});

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-dark px-5 py-12 text-pm-off-white sm:px-8 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-5xl border-b border-white/10 pb-10"><p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Candidature · Supabase sécurisé</p><h1 className="mt-4 font-playfair text-5xl font-black italic sm:text-7xl">Rejoindre PMM</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">Complétez votre profil et ajoutez vos photos. La candidature est enregistrée directement dans le système de casting de l’agence.</p></div>
      <div className="mx-auto max-w-5xl pt-12"><CastingApplicationForm /></div>
    </main>
  );
}
