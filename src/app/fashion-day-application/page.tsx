import FashionDayApplicationForm from '@/components/forms/FashionDayApplicationForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({ title: 'Candidature Perfect Fashion Day', description: 'Formulaire de candidature et de participation au Perfect Fashion Day.', path: '/fashion-day-application', noIndex: true });

export default function Page() {
  return <main className="min-h-screen bg-pm-dark px-5 py-16 text-pm-off-white sm:px-8 lg:px-10"><div className="mx-auto max-w-4xl"><p className="text-[9px] font-black uppercase tracking-[.35em] text-pm-gold">Perfect Fashion Day</p><h1 className="mt-4 font-playfair text-5xl font-black italic sm:text-7xl">Candidature</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">Créateurs, mannequins, artistes, partenaires et médias peuvent soumettre leur demande directement dans le système Fashion Day.</p><div className="mt-10"><FashionDayApplicationForm /></div></div></main>;
}
