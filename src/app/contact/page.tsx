import ContactForm from '@/components/forms/ContactForm';
import { getPublicAppState } from '@/lib/public-app-state';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.contact);
export const revalidate = 60;

export default async function Page() {
  const data = await getPublicAppState();
  const contact = (data.contactInfo || {}) as { email?: string; phone?: string; address?: string };
  const social = (data.socialLinks || {}) as Record<string, string>;

  return (
    <main className="min-h-screen bg-pm-dark text-pm-off-white">
      <section className="border-b border-white/10 bg-black px-5 pb-16 pt-16 sm:px-8 lg:px-10 lg:pb-20">
        <div className="mx-auto max-w-7xl"><p className="text-[9px] font-black uppercase tracking-[.38em] text-pm-gold">Perfect Models Management</p><h1 className="mt-4 font-playfair text-6xl font-black italic sm:text-8xl">Contact</h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/45">Booking, partenariat, production, presse ou candidature : écrivez directement à l’équipe.</p></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.75fr_1.25fr] lg:px-10 lg:py-24">
        <aside className="space-y-8">
          <div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-gold">Coordonnées</p><div className="mt-5 space-y-3 text-sm leading-7 text-white/50">{contact.address && <p>{contact.address}</p>}{contact.email && <a className="block hover:text-pm-gold" href={`mailto:${contact.email}`}>{contact.email}</a>}{contact.phone && <a className="block hover:text-pm-gold" href={`tel:${contact.phone}`}>{contact.phone}</a>}</div></div>
          <div><p className="text-[9px] font-black uppercase tracking-[.28em] text-pm-gold">Réseaux</p><div className="mt-5 flex flex-wrap gap-3">{Object.entries(social).filter(([,url])=>url).map(([name,url]) => <a key={name} href={url} target="_blank" rel="noreferrer" className="border border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-white/45 hover:border-pm-gold/50 hover:text-pm-gold">{name}</a>)}</div></div>
        </aside>
        <div><ContactForm /></div>
      </section>
    </main>
  );
}
