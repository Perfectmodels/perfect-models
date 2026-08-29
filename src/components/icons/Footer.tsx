'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YoutubeIcon } from './SocialIcons';

type NavLink = { path: string; label: string; inFooter?: boolean; footerLabel?: string };
type RuntimeData = { navLinks?: NavLink[]; socialLinks?: Record<string, string>; contactInfo?: { email?: string; phone?: string; address?: string } };

const fallbackNav: NavLink[] = [
  { path: '/agence', label: 'Agence' },
  { path: '/mannequins', label: 'Talents' },
  { path: '/services', label: 'Expertises' },
  { path: '/fashion-day', label: 'Fashion Day' },
  { path: '/blog', label: 'Journal' },
];

export default function Footer({ runtimeData }: { runtimeData?: RuntimeData | null }) {
  const configured = (runtimeData?.navLinks || []).filter((link) => link.inFooter);
  const navLinks = configured.length ? configured : fallbackNav;
  const socialLinks = runtimeData?.socialLinks;
  const contact = runtimeData?.contactInfo;
  const socials = [
    ['Instagram', socialLinks?.instagram, InstagramIcon], ['Facebook', socialLinks?.facebook, FacebookIcon],
    ['TikTok', socialLinks?.tiktok, TikTokIcon], ['YouTube', socialLinks?.youtube, YoutubeIcon], ['WhatsApp', socialLinks?.whatsapp, WhatsAppIcon],
  ] as const;

  return <footer className="overflow-hidden bg-pm-ink text-white">
    <section className="brand-gradient">
      <div className="mx-auto grid max-w-[1700px] gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[1.3fr_.7fr] lg:items-end lg:px-12 xl:px-16">
        <div><p className="text-[9px] font-black uppercase tracking-[.3em] text-white/70">Perfect Models Management · Libreville</p><h2 className="mt-5 font-playfair text-[clamp(3.6rem,7vw,7.2rem)] font-semibold leading-[.82] tracking-[-.055em]">Un talent. Une vision.<br /><em className="font-normal text-pm-gold-light">Une présence.</em></h2></div>
        <div className="grid gap-3"><Link href="/contact?subject=booking" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-extrabold text-pm-ink">Booker un talent ↗</Link><Link href="/casting-formulaire" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/10 px-6 py-3 text-sm font-bold">Rejoindre l’agence</Link></div>
      </div>
    </section>

    <div className="mx-auto max-w-[1700px] px-5 pb-9 sm:px-8 lg:px-12 xl:px-16">
      <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_.7fr_1fr] lg:py-20">
        <div>
          <Link href="/" className="inline-flex items-center gap-4"><span className="relative h-16 w-16 overflow-hidden rounded-[1.2rem] border border-white/15 bg-white"><Image src="/logopmm.jpg" alt="" fill sizes="64px" className="object-cover" /></span><span><span className="block font-playfair text-3xl font-semibold tracking-[-.02em]">Perfect Models</span><span className="mt-1.5 block text-[8px] font-black uppercase tracking-[.28em] text-pm-gold-light">Management · Gabon</span></span></Link>
          <p className="mt-7 max-w-sm text-sm leading-7 text-white/58">Agence de management, casting, formation et production dédiée au développement des talents et de l’image de mode au Gabon.</p>
          <div className="mt-7 grid max-w-sm grid-cols-3 gap-2"><div className="rounded-2xl bg-pm-wine p-3"><p className="text-[8px] font-black uppercase tracking-[.16em] text-pm-gold-light">Talent</p></div><div className="rounded-2xl bg-pm-coral p-3"><p className="text-[8px] font-black uppercase tracking-[.16em]">Image</p></div><div className="rounded-2xl bg-pm-teal p-3"><p className="text-[8px] font-black uppercase tracking-[.16em]">Culture</p></div></div>
        </div>

        <div><p className="mb-6 text-[8px] font-black uppercase tracking-[.34em] text-pm-gold-light">Explorer</p><nav className="grid gap-3">{navLinks.slice(0, 7).map((link) => <Link key={link.path} href={link.path} className="flex items-center justify-between border-b border-white/10 pb-3 font-playfair text-xl text-white/72 transition hover:border-pm-coral hover:text-pm-gold-light"><span>{link.footerLabel || link.label}</span><span className="text-sm">↗</span></Link>)}</nav></div>

        <div><p className="mb-6 text-[8px] font-black uppercase tracking-[.34em] text-pm-gold-light">Contact</p><div className="rounded-[1.6rem] bg-white/[.055] p-6"><div className="space-y-3 text-sm leading-6 text-white/65">{contact?.address ? <p>{contact.address}</p> : <p>Libreville, Gabon</p>}{contact?.phone && <a href={`tel:${contact.phone}`} className="block transition hover:text-pm-gold-light">{contact.phone}</a>}{contact?.email && <a href={`mailto:${contact.email}`} className="block break-all transition hover:text-pm-gold-light">{contact.email}</a>}</div><div className="mt-7 flex flex-wrap gap-2">{socials.map(([label, href, Icon], index) => href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`grid h-11 w-11 place-items-center rounded-full transition ${index % 3 === 0 ? 'bg-pm-coral' : index % 3 === 1 ? 'bg-pm-wine' : 'bg-pm-teal'}`}><Icon className="h-4 w-4" /></a> : null)}</div></div></div>
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 pt-7 text-[8px] font-black uppercase tracking-[.2em] text-white/38 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Perfect Models Management</p><div className="flex flex-wrap gap-6"><Link href="/privacy-policy" className="hover:text-pm-gold-light">Confidentialité</Link><Link href="/terms-of-use" className="hover:text-pm-gold-light">Conditions</Link><Link href="/login" className="text-pm-gold-light/70 hover:text-pm-gold-light">Espace privé</Link></div></div>
      <p aria-hidden="true" className="pointer-events-none -mb-[3.5vw] mt-12 whitespace-nowrap text-center font-playfair text-[15vw] font-semibold leading-[.72] tracking-[-.075em] text-white/[.035]">PERFECT</p>
    </div>
  </footer>;
}
