import type { Metadata } from 'next';
import ModelsDirectory from '@/components/models/ModelsDirectory';
import { getPublicModels } from '@/lib/public-content';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const revalidate = 3600;
export const metadata: Metadata = buildPageMetadata(MARKETING_PAGES.models);

export default async function Page() {
  const models = await getPublicModels();
  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="border-b border-white/10 bg-black px-5 pb-16 pt-28 sm:px-8 lg:px-10 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-black uppercase tracking-[0.45em] text-pm-gold">Perfect Models Management · Libreville, Gabon</p>
          <h1 className="mt-4 max-w-5xl font-playfair text-6xl font-black italic leading-[0.9] sm:text-8xl">Nos mannequins</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/45 sm:text-lg">Découvrez les talents de Perfect Models Management : runway, éditorial, commercial et campagnes.</p>
        </div>
      </section>
      <ModelsDirectory models={models} />
      <section className="border-t border-white/10 bg-black px-5 py-16 text-center sm:px-8 lg:px-10">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">Casting ouvert</p>
        <h2 className="mt-3 font-playfair text-4xl font-bold">Vous avez le profil ?</h2>
        <a href="/casting" className="mt-6 inline-flex rounded-full bg-pm-gold px-7 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-black">Candidater au casting</a>
      </section>
    </main>
  );
}
