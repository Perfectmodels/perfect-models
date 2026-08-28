import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';
import { selectPublicRows } from '@/lib/public-content';

export const metadata = buildPageMetadata(MARKETING_PAGES.gallery);
export const revalidate = 60;

export default async function Page() {
  const items = await selectPublicRows('media_library?select=id,url,file_name,category,alt_text,created_at&url=not.is.null&order=created_at.desc&limit=120');
  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="border-b border-white/10 bg-black px-5 py-20 sm:px-8 lg:px-10"><div className="mx-auto max-w-7xl"><p className="text-[9px] font-black uppercase tracking-[.38em] text-pm-gold">Perfect Models Management</p><h1 className="mt-4 font-playfair text-6xl font-black italic sm:text-8xl">Galerie</h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/45">Une sélection issue directement de la médiathèque Supabase de l’agence.</p></div></section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        {items.length ? <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">{items.map((item) => <figure key={String(item.id)} className="mb-4 break-inside-avoid overflow-hidden border border-white/10 bg-black/20"><img src={String(item.url)} alt={String(item.alt_text || item.file_name || 'Perfect Models Management')} loading="lazy" className="h-auto w-full object-cover" /><figcaption className="p-3 text-[9px] uppercase tracking-[.18em] text-white/35">{String(item.category || 'Médiathèque')}</figcaption></figure>)}</div> : <div className="border border-white/10 p-16 text-center text-sm text-white/40">Aucun média public disponible pour le moment.</div>}
      </section>
    </main>
  );
}
