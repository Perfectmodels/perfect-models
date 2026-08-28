import FashionDayApplicationForm from '@/components/forms/FashionDayApplicationForm';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Candidature Perfect Fashion Day',
  description: 'Créateurs, mannequins, artistes, partenaires et médias peuvent proposer leur participation au Perfect Fashion Day.',
  path: '/fashion-day-application',
  noIndex: true,
});

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="border-b border-black/10 px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="editorial-kicker text-pm-wine">Perfect Fashion Day · Participation</p>
            <h1 className="mt-5 max-w-4xl font-playfair text-[clamp(3.5rem,8vw,7.4rem)] font-black italic leading-[.84] tracking-[-.05em]">Faites partie de la prochaine édition.</h1>
          </div>
          <div className="border-t border-black/15 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-sm leading-7 text-black/55">Créateurs, mannequins, artistes, partenaires, médias et professionnels de la mode peuvent proposer une collaboration ou une participation.</p>
          </div>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl"><FashionDayApplicationForm /></div>
      </section>
    </main>
  );
}
