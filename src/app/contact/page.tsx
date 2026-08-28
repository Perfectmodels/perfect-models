import ContactForm from '@/components/forms/ContactForm';
import { getPublicAppState } from '@/lib/public-app-state';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.contact);
export const revalidate = 60;

const socialLabel = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

export default async function Page() {
  const data = await getPublicAppState();
  const contact = (data.contactInfo || {}) as { email?: string; phone?: string; address?: string };
  const social = (data.socialLinks || {}) as Record<string, string>;

  return (
    <main className="min-h-screen bg-pm-ivory text-pm-ink">
      <section className="relative isolate overflow-hidden bg-pm-dark px-5 pb-20 pt-24 text-pm-ivory sm:px-8 sm:pb-24 sm:pt-28 lg:px-12 lg:pb-28 xl:px-16">
        <div aria-hidden="true" className="absolute -right-[4vw] top-1/2 -z-10 -translate-y-1/2 font-playfair text-[28vw] font-semibold leading-none tracking-[-.08em] text-white/[.025]">HELLO</div>
        <div className="mx-auto grid max-w-[1550px] gap-12 lg:grid-cols-[.52fr_1.48fr] lg:items-end">
          <div><p className="text-[8px] font-black uppercase tracking-[.4em] text-pm-gold-light sm:text-[9px]">Perfect Models Management</p><p className="mt-8 max-w-sm text-sm leading-7 text-white/45">Booking, production, presse, partenariat ou candidature : adressez votre demande directement à l’équipe.</p></div>
          <div><p className="text-[8px] font-black uppercase tracking-[.34em] text-white/35 sm:text-[9px]">Contact</p><h1 className="mt-5 max-w-5xl font-playfair text-[clamp(4.2rem,9vw,9.3rem)] font-semibold leading-[.78] tracking-[-.065em]">Parlons de votre<br /><em className="font-normal text-pm-gold-light">prochaine image.</em></h1></div>
        </div>
      </section>

      <section className="bg-pm-ivory px-5 py-20 sm:px-8 sm:py-28 lg:px-12 xl:px-16">
        <div className="mx-auto grid max-w-[1550px] gap-14 lg:grid-cols-[.65fr_1.35fr]">
          <aside>
            <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-[.36em] text-pm-wine sm:text-[9px]"><span>01</span><span className="h-px w-10 bg-pm-wine/35" /><span>Coordonnées</span></div>
            <div className="mt-10 border-t border-pm-ink/15">
              <div className="border-b border-pm-ink/15 py-5"><p className="text-[8px] font-black uppercase tracking-[.22em] text-pm-ink/35">Localisation</p><p className="mt-2 font-playfair text-2xl">{contact.address || 'Libreville, Gabon'}</p></div>
              {contact.email && <div className="border-b border-pm-ink/15 py-5"><p className="text-[8px] font-black uppercase tracking-[.22em] text-pm-ink/35">Email</p><a className="mt-2 block break-all font-playfair text-2xl transition hover:text-pm-wine" href={`mailto:${contact.email}`}>{contact.email}</a></div>}
              {contact.phone && <div className="border-b border-pm-ink/15 py-5"><p className="text-[8px] font-black uppercase tracking-[.22em] text-pm-ink/35">Téléphone</p><a className="mt-2 block font-playfair text-2xl transition hover:text-pm-wine" href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
            </div>

            {Object.values(social).some(Boolean) && <div className="mt-12"><p className="text-[8px] font-black uppercase tracking-[.3em] text-pm-wine">Suivre PMM</p><div className="mt-5 flex flex-wrap gap-2">{Object.entries(social).filter(([, url]) => url).map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer" className="border border-pm-ink/15 px-4 py-3 text-[8px] font-black uppercase tracking-[.2em] transition hover:border-pm-wine hover:bg-pm-wine hover:text-white">{socialLabel(name)} ↗</a>)}</div></div>}
          </aside>

          <div className="bg-pm-ink p-6 text-pm-ivory sm:p-9 lg:p-12">
            <div className="mb-10 border-b border-white/12 pb-7"><p className="text-[8px] font-black uppercase tracking-[.34em] text-pm-gold-light">02 · Votre demande</p><h2 className="mt-4 font-playfair text-4xl font-semibold sm:text-5xl">Écrivez à l’agence.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-white/42">Décrivez le contexte, les besoins et les délais. Nous reviendrons vers vous avec la bonne orientation.</p></div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
