import Link from 'next/link';
import { getPublicServices } from '@/lib/public-content';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.services);
export const revalidate = 3600;

const categoryOrder = ['Services Mannequinat', 'Services Mode et Stylisme', 'Services Événementiels'];

export default async function Page() {
  const services = await getPublicServices();
  const groups = categoryOrder
    .map((category) => ({ category, items: services.filter((service) => service.category === category) }))
    .filter((group) => group.items.length > 0);

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="relative isolate overflow-hidden bg-pm-dark px-5 pb-20 pt-24 text-pm-ivory sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-28 xl:px-16">
        <div aria-hidden="true" className="absolute -right-[6vw] top-1/2 -z-10 -translate-y-1/2 font-playfair text-[27vw] font-semibold leading-none tracking-[-.08em] text-white/[.025]">SERVICES</div>
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.4em] text-pm-gold-light sm:text-[9px]">Expertises PMM</p>
            <p className="mt-8 max-w-sm text-sm leading-7 text-white/45">De la détection de talents à la production d’image, nos services accompagnent mannequins, marques, créateurs et événements.</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.34em] text-white/35 sm:text-[9px]">Savoir-faire</p>
            <h1 className="mt-5 max-w-5xl font-playfair text-[clamp(4.2rem,9vw,9rem)] font-semibold leading-[.79] tracking-[-.065em]">Des services pensés<br /><em className="font-normal text-pm-gold-light">pour l’image et la présence.</em></h1>
          </div>
        </div>
      </section>

      <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1550px]">
          {groups.length > 0 ? (
            <div className="space-y-20 lg:space-y-28">
              {groups.map((group, groupIndex) => (
                <section key={group.category}>
                  <div className="grid gap-8 border-b border-pm-ink/15 pb-7 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
                    <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[.34em] text-pm-wine sm:text-[9px]"><span>0{groupIndex + 1}</span><span className="h-px w-10 bg-pm-wine/35" /><span>Catégorie</span></div>
                    <h2 className="font-playfair text-4xl font-semibold tracking-[-.035em] sm:text-6xl">{group.category}</h2>
                  </div>

                  <div className="divide-y divide-pm-ink/15">
                    {group.items.map((service, index) => (
                      <Link key={service.slug} href={`/services/${service.slug}`} className="group grid gap-4 py-7 transition hover:bg-pm-sand/35 sm:grid-cols-[4rem_1.1fr_1.6fr_auto] sm:items-center sm:px-4 lg:py-8">
                        <span className="font-playfair text-2xl italic text-pm-gold-deep">{String(index + 1).padStart(2, '0')}</span>
                        <h3 className="font-playfair text-2xl font-semibold sm:text-3xl">{service.title}</h3>
                        <p className="max-w-2xl text-sm leading-7 text-pm-ink/52">{service.description}</p>
                        <span className="text-xl text-pm-wine transition duration-300 group-hover:translate-x-1">↗</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="border-y border-pm-ink/15 py-16 text-center"><p className="font-playfair text-4xl text-pm-ink/60">Nos expertises seront bientôt publiées.</p></div>
          )}
        </div>
      </section>

      <section className="bg-pm-wine px-5 py-20 text-pm-ivory sm:px-8 sm:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.58fr_1.42fr] lg:items-end">
          <div><p className="text-[8px] font-black uppercase tracking-[.38em] text-pm-gold-light">Projet sur mesure</p><p className="mt-7 max-w-sm text-sm leading-7 text-white/55">Vous ne trouvez pas exactement le service recherché ? Présentez-nous votre besoin.</p></div>
          <div><h2 className="font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Construisons une réponse<br /><em className="font-normal text-pm-gold-light">à votre image.</em></h2><div className="mt-8"><Link href="/contact" className="pmm-button pmm-button--light">Contacter l’agence ↗</Link></div></div>
        </div>
      </section>
    </main>
  );
}
