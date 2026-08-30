import ContactForm from '@/components/forms/ContactForm';
import VisualMasthead from '@/components/public/VisualMasthead';
import { getPublicAppState } from '@/lib/public-app-state';
import { getPublicSiteImages, imageOverrides } from '@/lib/site-images';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.contact);
export const dynamic = 'force-dynamic';

const socialLabel = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

export default async function Page() {
  const [data, siteImages] = await Promise.all([getPublicAppState(), getPublicSiteImages()]);
  const contact = (data.contactInfo || {}) as { email?: string; phone?: string; address?: string };
  const social = (data.socialLinks || {}) as Record<string, string>;
  const legacy = [siteImages.hero, siteImages.about, siteImages.agencyHistory, siteImages.castingBg, siteImages.fashionDayBg].filter(Boolean);
  const images = imageOverrides(siteImages, ['contact.hero.primary', 'contact.hero.secondary', 'contact.hero.tertiary'], [legacy[0], legacy[1], legacy[2]]);

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <VisualMasthead
        eyebrow="Contact · Perfect Models Management"
        title="Parlons de votre"
        accent="prochaine image."
        description="Booking, production, presse, partenariat ou candidature : adressez votre demande directement à l’équipe avec le contexte, les délais et vos objectifs."
        images={images}
        tone="coral"
        primary={{ label: 'Écrire à l’agence', href: '#contact-form' }}
        secondary={{ label: 'Découvrir les talents', href: '/mannequins' }}
        meta={['Booking', 'Production', 'Partenariat', 'Presse']}
      />

      <section className="soft-section px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="relative mx-auto grid max-w-[1550px] gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <aside className="space-y-4">
            <div className="color-card bg-pm-gold-light/70"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine">Localisation</p><p className="mt-3 font-playfair text-3xl">{contact.address || 'Libreville, Gabon'}</p></div>
            {contact.email && <div className="color-card bg-pm-mint"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-teal">Email</p><a className="mt-3 block break-all font-playfair text-2xl transition hover:text-pm-wine" href={`mailto:${contact.email}`}>{contact.email}</a></div>}
            {contact.phone && <div className="color-card bg-pm-lilac"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine">Téléphone</p><a className="mt-3 block font-playfair text-3xl transition hover:text-pm-wine" href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
            {Object.values(social).some(Boolean) && <div className="color-card bg-pm-peach"><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-wine">Suivre PMM</p><div className="mt-5 flex flex-wrap gap-2">{Object.entries(social).filter(([, url]) => url).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer" className="rounded-full bg-white/70 px-4 py-2.5 text-[8px] font-black uppercase tracking-[.16em] text-pm-wine transition hover:bg-pm-wine hover:text-white">{socialLabel(name)} ↗</a>)}</div></div>}
          </aside>

          <div id="contact-form" className="overflow-hidden rounded-[2rem] bg-pm-wine p-6 text-white shadow-[0_28px_70px_rgba(125,31,77,.18)] sm:p-9 lg:p-12">
            <div className="mb-10 border-b border-white/12 pb-7"><div className="inline-flex rounded-full bg-pm-coral px-4 py-2 text-[8px] font-black uppercase tracking-[.2em]">Votre demande</div><h2 className="mt-5 font-playfair text-4xl font-semibold sm:text-6xl">Écrivez à l’agence.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">Décrivez le contexte, le besoin, les dates et les livrables attendus. L’équipe pourra ainsi vous orienter rapidement vers le bon service.</p></div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
