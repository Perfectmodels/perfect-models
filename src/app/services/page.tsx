import Image from 'next/image';
import Link from 'next/link';
import VisualMasthead from '@/components/public/VisualMasthead';
import { getFashionDayEvents, getPublicModels, getPublicServices } from '@/lib/public-content';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.services);
export const revalidate = 3600;

const categoryOrder = ['Services Mannequinat', 'Services Mode et Stylisme', 'Services Événementiels'];
const colors = ['bg-pm-peach', 'bg-pm-mint', 'bg-pm-lilac', 'bg-pm-sky', 'bg-pm-gold-light/70', 'bg-pm-coral-soft/65'];

export default async function Page() {
  const [services, models, events] = await Promise.all([getPublicServices(), getPublicModels(), getFashionDayEvents()]);
  const groups = categoryOrder.map((category) => ({ category, items: services.filter((service) => service.category === category) })).filter((group) => group.items.length > 0);
  const images = Array.from(new Set([
    ...models.slice(0, 8).flatMap((model) => [model.imageUrl, ...(model.portfolioImages || []).slice(0, 1)]),
    ...events.slice(0, 3).flatMap((event) => [event.coverImageUrl, ...(event.galleryImages || []).slice(0, 1)]),
  ].filter(Boolean))) as string[];

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <VisualMasthead
        eyebrow="Expertises · Perfect Models Management"
        title="Des services pensés"
        accent="pour l’image et la présence."
        description="De la détection de talents à la production d’image, nos expertises accompagnent mannequins, marques, créateurs et événements dans une logique professionnelle complète."
        images={images}
        tone="gold"
        primary={{ label: 'Explorer les expertises', href: '#expertises' }}
        secondary={{ label: 'Présenter un projet', href: '/contact' }}
        meta={[`${services.length} services`, 'Talent management', 'Production', 'Événementiel']}
      />

      {images.length > 2 && <section className="bg-pm-ink px-5 py-7 sm:px-8 lg:px-12 xl:px-16"><div className="mx-auto grid max-w-[1550px] grid-cols-2 gap-3 md:grid-cols-5">{images.slice(0, 5).map((image, index) => <div key={image} className={`relative overflow-hidden rounded-[1.4rem] ${index === 0 || index === 4 ? 'aspect-[3/4]' : 'aspect-square'}`}><Image src={image} alt="Expertises Perfect Models Management" fill sizes="(max-width:768px) 50vw, 20vw" className="object-cover" /></div>)}</div></section>}

      <section id="expertises" className="soft-section px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="relative mx-auto max-w-[1550px]">
          {groups.length > 0 ? <div className="space-y-20 lg:space-y-28">{groups.map((group, groupIndex) => (
            <section key={group.category}>
              <div className="grid gap-6 lg:grid-cols-[.6fr_1.4fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.26em] text-pm-rose">0{groupIndex + 1} · Catégorie</p><p className="mt-4 max-w-sm text-sm leading-7 text-pm-ink/50">Des prestations organisées comme de véritables parcours de service, de la demande à la livraison.</p></div><h2 className="font-playfair text-4xl font-semibold tracking-[-.04em] sm:text-6xl">{group.category}</h2></div>
              <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{group.items.map((service, index) => <Link key={service.slug} href={`/services/${service.slug}`} className={`group color-card min-h-72 ${colors[(groupIndex * 2 + index) % colors.length]}`}><div className="flex h-full flex-col justify-between"><div className="flex items-center justify-between"><span className="font-playfair text-3xl italic text-pm-wine">{String(index + 1).padStart(2, '0')}</span><span className="grid h-10 w-10 place-items-center rounded-full bg-white/50 text-pm-wine transition group-hover:bg-pm-wine group-hover:text-white">↗</span></div><div className="mt-14"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine/60">{group.category}</p><h3 className="mt-3 font-playfair text-3xl font-semibold leading-[.95]">{service.title}</h3><p className="mt-4 text-sm leading-7 text-pm-ink/56">{service.description}</p></div></div></Link>)}</div>
            </section>
          ))}</div> : <div className="rounded-[2rem] bg-pm-peach py-16 text-center"><p className="font-playfair text-4xl text-pm-ink/60">Nos expertises seront bientôt publiées.</p></div>}
        </div>
      </section>

      <section className="bg-pm-wine px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12 xl:px-16"><div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.65fr_1.35fr] lg:items-end"><div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-gold-light">Projet sur mesure</p><p className="mt-5 max-w-sm text-sm leading-7 text-white/62">Vous ne trouvez pas exactement le service recherché ? Présentez-nous le contexte, les délais et le résultat attendu.</p></div><div><h2 className="font-playfair text-5xl font-semibold leading-[.9] sm:text-7xl">Construisons une réponse <em className="font-normal text-pm-peach">à votre image.</em></h2><div className="mt-8"><Link href="/contact" className="inline-flex min-h-12 items-center rounded-full bg-pm-gold-light px-6 py-3 text-sm font-extrabold text-pm-ink">Contacter l’agence ↗</Link></div></div></div></section>
    </main>
  );
}
