import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';
import { selectPublicRows } from '@/lib/public-content';

export const metadata = buildPageMetadata(MARKETING_PAGES.gallery);
export const revalidate = 60;

export default async function Page() {
  const items = await selectPublicRows('media_library?select=id,url,file_name,category,alt_text,created_at&url=not.is.null&order=created_at.desc&limit=120');
  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="border-b border-black/10 px-5 py-16 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div>
            <p className="editorial-kicker text-pm-wine">Perfect Models Management · Archives visuelles</p>
            <h1 className="mt-5 font-playfair text-[clamp(4rem,10vw,8.5rem)] font-black italic leading-[.82] tracking-[-.055em]">Galerie</h1>
          </div>
          <p className="border-t border-black/15 pt-6 text-sm leading-7 text-black/50 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">Backstages, éditoriaux, défilés, castings et instants d’agence : une sélection des images qui construisent l’univers PMM.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 sm:py-8 lg:px-8 lg:py-12">
        {items.length ? (
          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3 xl:columns-4">
            {items.map((item) => (
              <figure key={String(item.id)} className="group relative mb-3 break-inside-avoid overflow-hidden bg-black/5">
                <img src={String(item.url)} alt={String(item.alt_text || item.file_name || 'Perfect Models Management')} loading="lazy" className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.02]" />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/85 via-black/35 to-transparent px-4 pb-4 pt-14 text-[8px] font-black uppercase tracking-[.22em] text-white transition duration-300 group-hover:translate-y-0 sm:text-[9px]">
                  {String(item.category || 'PMM')}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl border-y border-black/15 py-16 text-center sm:py-24">
            <p className="editorial-kicker text-pm-wine">Galerie en préparation</p>
            <h2 className="mt-4 font-playfair text-4xl font-black italic sm:text-5xl">De nouvelles images arrivent bientôt.</h2>
          </div>
        )}
      </section>
    </main>
  );
}
