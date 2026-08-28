import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { getServiceBySlug } from '@/lib/public-content';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/lib/seo';

type PageProps = { params: Promise<{ slug: string }> };
export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  const path = `/services/${slug}`;

  if (!service) {
    return buildPageMetadata({
      title: 'Service Perfect Models Management',
      description: 'Service professionnel de Perfect Models Management à Libreville, Gabon.',
      path,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: service.title,
    description: service.description,
    path,
    keywords: [service.title, service.category, 'service mode Gabon', 'Perfect Models Management'],
    category: service.category,
  });
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const path = `/services/${slug}`;
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${absoluteUrl(path)}#service`,
      name: service.title,
      description: service.description,
      url: absoluteUrl(path),
      category: service.category,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'Gabon' },
      availableChannel: { '@type': 'ServiceChannel', serviceUrl: absoluteUrl(path) },
    },
    breadcrumbJsonLd([
      { name: 'Accueil', path: '/' },
      { name: 'Services', path: '/services' },
      { name: service.title, path },
    ]),
  ];

  const points = service.details?.points || [];

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <JsonLd data={schema} />

      <section className="relative isolate overflow-hidden bg-pm-dark px-5 pb-20 pt-24 text-pm-ivory sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-28 xl:px-16">
        <div aria-hidden="true" className="absolute -right-[4vw] bottom-[-4vw] -z-10 font-playfair text-[28vw] font-semibold leading-none tracking-[-.08em] text-white/[.025]">PMM</div>
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.55fr_1.45fr] lg:items-end">
          <div>
            <Link href="/services" className="inline-flex items-center gap-3 text-[8px] font-black uppercase tracking-[.3em] text-pm-gold-light transition hover:text-white">← Toutes les expertises</Link>
            <p className="mt-10 max-w-sm text-sm leading-7 text-white/45">{service.category}</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.36em] text-white/35 sm:text-[9px]">Expertise PMM</p>
            <h1 className="mt-5 max-w-5xl font-playfair text-[clamp(4rem,8vw,8.5rem)] font-semibold leading-[.8] tracking-[-.06em]">{service.title}</h1>
            <p className="mt-8 max-w-3xl text-base leading-8 text-white/58 sm:text-lg">{service.description}</p>
          </div>
        </div>
      </section>

      <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.55fr_1.45fr]">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.36em] text-pm-wine">Notre approche</p>
            <p className="mt-8 max-w-sm text-sm leading-7 text-pm-ink/52">Chaque prestation est cadrée selon votre objectif, votre calendrier et le niveau d’accompagnement attendu.</p>
          </div>
          <div>
            <h2 className="font-playfair text-4xl font-semibold tracking-[-.035em] sm:text-6xl">{service.details?.title || 'Une prestation structurée, professionnelle et sur mesure.'}</h2>
            {points.length > 0 ? (
              <div className="mt-12 border-t border-pm-ink/15">
                {points.map((point, index) => (
                  <div key={`${index}-${point}`} className="grid gap-4 border-b border-pm-ink/15 py-7 sm:grid-cols-[4rem_1fr] sm:items-start">
                    <span className="font-playfair text-2xl italic text-pm-gold-deep">{String(index + 1).padStart(2, '0')}</span>
                    <p className="max-w-3xl text-base leading-8 text-pm-ink/68">{point}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-10 max-w-3xl text-base leading-8 text-pm-ink/58">Contactez l’agence pour recevoir le périmètre précis, les modalités et les conditions de cette prestation.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-pm-sand px-5 py-20 sm:px-8 sm:py-24 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.55fr_1.45fr] lg:items-end">
          <div><p className="text-[8px] font-black uppercase tracking-[.38em] text-pm-wine">Demande de prestation</p><p className="mt-7 max-w-sm text-sm leading-7 text-pm-ink/52">Expliquez-nous le contexte, les délais et le résultat attendu. Notre équipe vous orientera vers la meilleure formule.</p></div>
          <div><h2 className="font-playfair text-5xl font-semibold leading-[.9] tracking-[-.045em] sm:text-7xl">Votre projet mérite<br /><em className="font-normal text-pm-wine">le bon casting.</em></h2><div className="mt-8 flex flex-wrap gap-3"><Link href={`/contact?subject=${encodeURIComponent(service.title)}`} className="pmm-button border-pm-ink bg-pm-ink text-pm-ivory hover:border-pm-wine hover:bg-pm-wine">Demander ce service ↗</Link><Link href="/services" className="pmm-button border-pm-ink/25 text-pm-ink hover:border-pm-wine hover:text-pm-wine">Voir les autres services</Link></div></div>
        </div>
      </section>
    </main>
  );
}
