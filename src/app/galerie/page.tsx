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
      <section className="bg-[#11100f] px-5 py-12 text-[#f7f2e8] sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-20">
          <div className="relative mx-auto flex aspect-[.78] w-full max-w-[380px] flex-col justify-between overflow-hidden border border-[#d9bb85]/40 bg-[radial-gradient(circle_at_top_right,#3a3126_0%,#171512_43%,#0c0c0b_100%)] p-8 shadow-[18px_24px_50px_rgba(0,0,0,.4)] sm:p-10">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[.3em] text-[#d9bb85]"><span>PMM / Fashion Journal</span><span>01</span></div>
            <div>
              <span className="font-playfair text-[clamp(4rem,9vw,6rem)] font-black italic leading-[.8] tracking-[-.09em]">PERFECT<br />MODEL</span>
              <div className="mt-8 h-px w-14 bg-[#d9bb85]" />
              <p className="mt-6 text-[11px] font-bold uppercase leading-loose tracking-[.24em] text-[#d9bb85]">L’expression de la mode<br />L’attitude avant tout</p>
            </div>
            <span className="border-t border-[#d9bb85]/30 pt-4 text-[9px] uppercase tracking-[.28em] text-white/55">Édition 01 · Portfolio éditorial</span>
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.34em] text-[#d9bb85]">À la une · Notre magazine</p>
            <h2 className="mt-5 font-playfair text-[clamp(3.4rem,7vw,6rem)] font-black italic leading-[.93] tracking-[-.055em]">L’attitude<br />avant tout.</h2>
            <p className="mt-8 max-w-xl font-playfair text-2xl italic leading-8 text-[#eee3d1] sm:text-3xl">Un regard sur la mode qui dépasse le vêtement.</p>
            <p className="mt-5 max-w-xl text-sm leading-8 text-white/60">La première édition de PERFECT MODEL explore le regard, la silhouette, le collectif et cette attitude singulière qui transforme une présence en image de mode. Découvrez les huit chapitres de notre publication éditoriale.</p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <a href="/galerie/perfect-model-edition-01" className="inline-flex min-h-12 items-center justify-center bg-[#d9bb85] px-8 text-[11px] font-extrabold uppercase tracking-[.2em] text-[#14110e] transition hover:bg-[#f0d6a7]">Découvrir le magazine ↗</a>
              <span className="text-[10px] uppercase tracking-[.25em] text-white/40">Édition 01 · Mode / Image / Attitude</span>
            </div>
          </div>
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
