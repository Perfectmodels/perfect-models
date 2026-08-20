import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ModelPortfolio from '@/components/models/ModelPortfolio';
import { getPublicModels, getModelById } from '@/lib/public-content';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, SITE_URL } from '@/lib/seo';

type PageProps = { params: Promise<{ id: string }> };
export const revalidate = 3600;

export async function generateStaticParams() {
  const models = await getPublicModels();
  return models.map((model) => ({ id: model.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const model = await getModelById(id);
  const path = `/mannequins/${id}`;
  if (!model) return buildPageMetadata({ title: 'Profil mannequin PMM', description: 'Profil mannequin de Perfect Models Management.', path, noIndex: true });
  return buildPageMetadata({
    title: `${model.name} — mannequin professionnel au Gabon`,
    description: model.experience || `Découvrez le profil de ${model.name}, mannequin Perfect Models Management à ${model.location || 'Libreville'}, Gabon.`,
    path,
    keywords: [model.name, ...(model.categories || []), `${model.gender === 'Homme' ? 'mannequin homme' : 'mannequin femme'} Gabon`],
    image: model.imageUrl,
    type: 'profile',
    category: 'Mannequins',
  });
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const model = await getModelById(id);
  if (!model) {
    return <main className="min-h-screen bg-pm-dark px-5 pb-24 pt-36 text-center text-white"><h1 className="font-playfair text-5xl font-bold">Profil introuvable</h1><Link href="/mannequins" className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest text-pm-gold">← Voir nos mannequins</Link></main>;
  }

  const models = await getPublicModels();
  const similar = models.filter((candidate) => candidate.id !== model.id && (candidate.gender === model.gender || candidate.categories?.some((cat) => model.categories?.includes(cat)))).slice(0, 4);
  const portfolio = [model.imageUrl, ...(model.portfolioImages || [])].filter(Boolean).filter((src, index, arr) => arr.indexOf(src) === index);
  const path = `/mannequins/${id}`;
  const schema = [
    { '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': `${absoluteUrl(path)}#profile`, url: absoluteUrl(path), name: `${model.name} — Perfect Models Management`, inLanguage: 'fr-GA', mainEntity: { '@type': 'Person', '@id': `${absoluteUrl(path)}#person`, name: model.name, image: absoluteUrl(model.imageUrl), jobTitle: 'Mannequin professionnel', gender: model.gender, homeLocation: { '@type': 'Place', name: model.location || 'Libreville, Gabon' }, knowsAbout: model.categories || [], description: model.experience || model.journey, worksFor: { '@id': `${SITE_URL}/#organization` } } },
    breadcrumbJsonLd([{ name: 'Accueil', path: '/' }, { name: 'Mannequins', path: '/mannequins' }, { name: model.name, path }]),
  ];

  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <JsonLd data={schema} />
      <section className="border-b border-white/10 bg-black px-5 pb-12 pt-28 sm:px-8 lg:px-10 lg:pb-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="overflow-hidden bg-white/5"><img src={model.imageUrl} alt={model.name} className="aspect-[3/4] w-full object-cover" /></div>
          <div className="pb-2">
            <Link href="/mannequins" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35 hover:text-pm-gold">← Tous les mannequins</Link>
            <p className="mt-10 text-[10px] font-black uppercase tracking-[0.45em] text-pm-gold">Perfect Models Management · {model.level || 'Talent'}</p>
            <h1 className="mt-3 font-playfair text-6xl font-black italic leading-none sm:text-8xl">{model.name}</h1>
            <p className="mt-5 text-sm uppercase tracking-[0.22em] text-white/40">{model.gender} · {model.location || 'Libreville, Gabon'}</p>
            <div className="mt-8 flex flex-wrap gap-2">{(model.categories || []).map((cat) => <span key={cat} className="border border-pm-gold/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-pm-gold">{cat}</span>)}</div>
            <a href={`/contact?subject=Booking%20mannequin%20${encodeURIComponent(model.name)}`} className="mt-9 inline-flex rounded-full bg-pm-gold px-7 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-black">Demander un booking</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">À propos</p><h2 className="mt-3 font-playfair text-4xl font-bold">Le parcours</h2><p className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-white/55">{model.journey || model.experience || 'Profil en cours de mise à jour.'}</p></div>
          <div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">Book</p><h2 className="mt-3 font-playfair text-4xl font-bold">Mensurations</h2><div className="mt-6 grid grid-cols-2 border-t border-white/10">{[['Taille', model.height], ['Poitrine', model.measurements?.chest], ['Taille', model.measurements?.waist], ['Hanches', model.measurements?.hips], ['Pointure', model.measurements?.shoeSize]].map(([label, value]) => <div key={label} className="border-b border-white/10 py-4"><p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p><p className="mt-1 text-sm text-white">{value || '—'}</p></div>)}</div></div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-black/30 px-5 py-16 sm:px-8 lg:px-10 lg:py-24"><div className="mx-auto max-w-7xl"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">Portfolio</p><h2 className="mt-3 font-playfair text-5xl font-bold">En images</h2><div className="mt-10"><ModelPortfolio name={model.name} images={portfolio} /></div></div></section>

      {model.distinctions?.length ? <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">Carrière</p><h2 className="mt-3 font-playfair text-4xl font-bold">Distinctions & expériences</h2><div className="mt-8 grid gap-4 md:grid-cols-2">{model.distinctions.map((item) => <div key={item.name} className="border border-white/10 p-6"><h3 className="font-playfair text-xl font-bold">{item.name}</h3><p className="mt-2 text-sm text-white/45">{item.titles.join(' · ')}</p></div>)}</div></section> : null}

      <section className="border-t border-white/10 px-5 py-16 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl"><div className="flex items-end justify-between gap-6"><div><p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">Découvrir</p><h2 className="mt-3 font-playfair text-4xl font-bold">Autres talents</h2></div><Link href="/mannequins" className="hidden text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-pm-gold sm:block">Tous les profils →</Link></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{similar.map((item) => <Link key={item.id} href={`/mannequins/${item.id}`} className="group"><div className="aspect-[3/4] overflow-hidden bg-white/5"><img src={item.imageUrl} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><p className="mt-3 font-playfair text-lg font-bold">{item.name}</p><p className="text-[9px] font-black uppercase tracking-widest text-pm-gold">{item.categories?.[0] || 'Model'}</p></Link>)}</div></div></section>
    </main>
  );
}
