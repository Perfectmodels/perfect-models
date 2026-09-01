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
    ['Instagram', socialLinks?.instagram, InstagramIcon],
    ['Facebook', socialLinks?.facebook, FacebookIcon],
    ['TikTok', socialLinks?.tiktok, TikTokIcon],
    ['YouTube', socialLinks?.youtube, YoutubeIcon],
    ['WhatsApp', socialLinks?.whatsapp, WhatsAppIcon],
  ] as const;

  return <footer className="overflow-hidden bg-black text-white">
    <div className="african-trim h-2 w-full" aria-hidden="true" />
    <section className="border-b border-white/12">
      <div className="mx-auto grid max-w-[1700px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.3fr_.7fr] lg:items-end lg:px-12 xl:px-16">
        <div><p className="text-[9px] font-black uppercase tracking-[.32em] text-pm-gold-light">Perfect Models Management · Libreville</p><h2 className="mt-5 font-playfair text-[clamp(3.8rem,7vw,7.4rem)] font-semibold leading-[.82] tracking-[-.055em]">Un talent.<br />Une présence.</h2></div>
        <div className="grid gap-3"><Link href="/contact?subject=booking" className="inline-flex min-h-12 items-center justify-center bg-pm-gold px-6 py-3 text-sm font-extrabold text-black">Booker un talent ↗</Link><Link href="/inscription/mannequin" className="inline-flex min-h-12 items-center justify-center border border-pm-gold/55 px-6 py-3 text-sm font-bold text-pm-gold-light">Inscription mannequin</Link><Link href="/casting-formulaire" className="inline-flex min-h-12 items-center justify-center border border-white/25 px-6 py-3 text-sm font-bold">Candidater</Link></div>
      </div>
    </section>

    <div className="mx-auto max-w-[1700px] px-5 pb-9 sm:px-8 lg:px-12 xl:px-16">
      <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_.7fr_1fr] lg:py-20">
        <div>
          <Link href="/" className="inline-flex items-center gap-4"><span className="relative h-16 w-16 overflow-hidden border border-white/20 bg-white"><Image src="/logopmm.jpg" alt="" fill sizes="64px" className="object-cover" /></span><span><span className="block font-playfair text-3xl font-semibold tracking-[-.02em]">Perfect Models</span><span className="mt-1.5 block text-[8px] font-black uppercase tracking-[.28em] text-pm-gold-light">Management · Gabon</span></span></Link>
          <p className="mt-7 max-w-sm text-sm leading-7 text-white/55">Agence de management, casting, formation et production dédiée au développement des talents et de l’image de mode au Gabon.</p>
          <div className="mt-8 flex gap-6 border-y border-white/10 py-4 text-[8px] font-black uppercase tracking-[.2em] text-white/45"><span>Talent</span><span className="text-pm-gold-light">Image</span><span>Culture</span></div>
        </div>
        <div><p className="mb-6 text-[8px] font-black uppercase tracking-[.34em] text-pm-gold-light">Explorer</p><nav className="grid">{navLinks.slice(0, 7).map((link) => <Link key={link.path} href={link.path} className="flex items-center justify-between border-b border-white/10 py-3 font-playfair text-xl text-white/72 transition hover:border-pm-gold hover:text-pm-gold-light"><span>{link.footerLabel || link.label}</span><span className="text-sm">↗</span></Link>)}</nav></div>
        <div><p className="mb-6 text-[8px] font-black uppercase tracking-[.34em] text-pm-gold-light">Contact</p><div className="border border-white/12 p-6"><div className="space-y-3 text-sm leading-6 text-white/65">{contact?.address ? <p>{contact.address}</p> : <p>Libreville, Gabon</p>}{contact?.phone && <a href={`tel:${contact.phone}`} className="block transition hover:text-pm-gold-light">{contact.phone}</a>}{contact?.email && <a href={`mailto:${contact.email}`} className="block break-all transition hover:text-pm-gold-light">{contact.email}</a>}</div><div className="mt-7 flex flex-wrap gap-2">{socials.map(([label, href, Icon]) => href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center border border-white/20 text-white transition hover:border-pm-gold hover:bg-pm-gold hover:text-black"><Icon className="h-4 w-4" /></a> : null)}</div></div></div>
      </div>
      <div className="flex flex-col gap-4 border-t border-white/10 pt-7 text-[8px] font-black uppercase tracking-[.2em] text-white/38 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Perfect Models Management</p><div className="flex flex-wrap gap-6"><Link href="/privacy-policy" className="hover:text-pm-gold-light">Confidentialité</Link><Link href="/terms-of-use" className="hover:text-pm-gold-light">Conditions</Link><Link href="/login" className="text-pm-gold-light/70 hover:text-pm-gold-light">Espace privé</Link></div></div>
    </div>
  </footer>;
}
