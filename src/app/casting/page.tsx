import Link from 'next/link';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.casting);

const steps = [
  ['01', 'Créer son dossier', 'Informations, mensurations, expérience et photos récentes : votre candidature doit refléter qui vous êtes aujourd’hui.'],
  ['02', 'Être sélectionné', 'Notre équipe étudie chaque profil selon son potentiel, sa présence, sa singularité et son adéquation avec les besoins de l’agence.'],
  ['03', 'Passer le casting', 'Les profils présélectionnés reçoivent une convocation avec les détails du casting physique et les consignes de préparation.'],
  ['04', 'Rejoindre l’agence', 'À l’issue du casting, les profils retenus sont accompagnés dans la construction de leur image, de leur book et de leurs opportunités.'],
];

const expectations = ['Photos récentes et naturelles', 'Mensurations exactes', 'Disponibilité et ponctualité', 'Motivation professionnelle'];

export default function Page() {
  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-black px-5 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-32">
        <div className="pointer-events-none absolute -right-12 top-10 font-playfair text-[30vw] font-black italic leading-none text-white/[.025] sm:text-[22vw]">CAST</div>
        <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.4fr_.6fr] lg:items-end">
          <div>
            <p className="editorial-kicker text-pm-gold">Casting mannequin · Libreville, Gabon</p>
            <h1 className="mt-6 max-w-5xl font-playfair text-[clamp(3.8rem,10vw,8.5rem)] font-black italic leading-[.82] tracking-[-.055em]">
              Casting mannequin <span className="text-pm-gold">au Gabon.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/55 sm:text-base sm:leading-8">
              Perfect Models Management reçoit les candidatures de nouveaux talents à Libreville et au Gabon pour ses prochaines productions, campagnes, shootings et défilés. Déposez votre dossier et présentez-nous votre univers.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/casting-formulaire" className="pmm-button border-pm-gold bg-pm-gold text-black hover:bg-pm-gold-light">Déposer ma candidature</Link>
              <Link href="/mannequins" className="pmm-button pmm-button--ghost">Découvrir nos talents</Link>
            </div>
          </div>

          <aside className="border-t border-white/15 pt-7 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
            <p className="editorial-kicker text-white/35">Ce que nous attendons</p>
            <div className="mt-6 space-y-4">
              {expectations.map((item, index) => (
                <div key={item} className="flex items-center gap-4 border-b border-white/10 pb-4 text-sm text-white/65">
                  <span className="font-playfair text-xl italic text-pm-gold/70">0{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-pm-ivory px-5 py-16 text-pm-ink sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="editorial-kicker text-pm-wine">Le parcours</p>
              <h2 className="mt-4 max-w-md font-playfair text-5xl font-black italic leading-[.92] sm:text-6xl">Du premier regard à la représentation.</h2>
            </div>
            <div className="grid border-t border-black/15 sm:grid-cols-2">
              {steps.map(([number, title, description]) => (
                <article key={number} className="border-b border-black/15 py-7 sm:border-l sm:px-7 sm:py-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-playfair text-2xl font-bold sm:text-3xl">{title}</h3>
                    <span className="text-[9px] font-black tracking-[.25em] text-pm-wine/45">{number}</span>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-black/55">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="editorial-kicker text-pm-gold">Votre prochaine étape</p>
            <h2 className="mt-4 max-w-3xl font-playfair text-4xl font-black italic leading-tight sm:text-6xl">Votre profil mérite une présentation à sa hauteur.</h2>
          </div>
          <Link href="/casting-formulaire" className="pmm-button border-pm-gold bg-pm-gold text-black hover:bg-pm-gold-light">Commencer</Link>
        </div>
      </section>
    </main>
  );
}
