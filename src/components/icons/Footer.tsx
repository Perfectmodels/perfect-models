'use client';

import React from 'react';
import Link from 'next/link';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YoutubeIcon } from './SocialIcons';

const fallbackNav = [
  { path: '/agence', label: 'Agence' },
  { path: '/mannequins', label: 'Talents' },
  { path: '/services', label: 'Expertises' },
  { path: '/fashion-day', label: 'Fashion Day' },
  { path: '/magazine', label: 'Journal' },
];

type RuntimeData = {
  navLinks?: Array<{ path: string; label: string; inFooter?: boolean; footerLabel?: string }>;
  socialLinks?: Record<string, string>;
  contactInfo?: { email?: string; phone?: string; address?: string };
};

const Footer: React.FC<{ runtimeData?: RuntimeData | null }> = ({ runtimeData }) => {
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

  return (
    <footer className="overflow-hidden border-t border-white/10 bg-[#08080a] text-pm-ivory">
      <div className="mx-auto max-w-[1700px] px-5 pb-9 pt-20 sm:px-8 sm:pt-28 lg:px-12 xl:px-16">
        <div className="grid gap-12 border-b border-white/10 pb-16 lg:grid-cols-[1.3fr_.7fr] lg:items-end lg:pb-20">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[.44em] text-pm-gold-light sm:text-[9px]">Perfect Models Management · Libreville</p>
            <h2 className="mt-7 max-w-5xl font-playfair text-[clamp(4rem,8vw,8.2rem)] font-semibold leading-[.82] tracking-[-.06em]">Un talent.<br /><em className="font-normal text-white/36">Une vision.</em></h2>
          </div>
          <div className="grid gap-3 lg:pb-2">
            <Link href="/contact?subject=booking" className="pmm-button pmm-button--light">Booker un talent <span>↗</span></Link>
            <Link href="/casting-formulaire" className="pmm-button pmm-button--ghost">Rejoindre l’agence</Link>
          </div>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.15fr_.75fr_1.1fr] lg:py-20">
          <div>
            <Link href="/" className="inline-flex items-center gap-4">
              <span className="h-14 w-14 overflow-hidden border border-white/15 bg-white"><img src="/logopmm.jpg" alt="" className="h-full w-full object-cover" /></span>
              <span>
                <span className="block font-playfair text-2xl font-semibold tracking-[-.02em]">Perfect Models</span>
                <span className="mt-1.5 block text-[8px] font-black uppercase tracking-[.32em] text-white/32">Management · Gabon</span>
              </span>
            </Link>
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/38">Agence de management, casting, formation et production dédiée au développement des talents et de l’image de mode au Gabon.</p>
          </div>

          <div>
            <p className="mb-6 text-[8px] font-black uppercase tracking-[.38em] text-pm-gold">Explorer</p>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-1">
              {navLinks.slice(0, 7).map((link) => <Link key={link.path} href={link.path} className="font-playfair text-xl text-white/58 transition duration-300 hover:translate-x-1 hover:text-pm-ivory">{link.footerLabel || link.label}</Link>)}
            </nav>
          </div>

          <div>
            <p className="mb-6 text-[8px] font-black uppercase tracking-[.38em] text-pm-gold">Contact</p>
            <div className="space-y-3 text-sm leading-6 text-white/42">
              {contact?.address && <p>{contact.address}</p>}
              {contact?.phone && <a href={`tel:${contact.phone}`} className="block transition hover:text-pm-gold-light">{contact.phone}</a>}
              {contact?.email && <a href={`mailto:${contact.email}`} className="block break-all transition hover:text-pm-gold-light">{contact.email}</a>}
              {!contact?.address && <p>Libreville, Gabon</p>}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {socials.map(([label, href, Icon]) => href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center border border-white/12 text-white/34 transition duration-300 hover:border-pm-gold hover:bg-pm-gold hover:text-pm-dark"><Icon className="h-4 w-4" /></a> : null)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-7 text-[8px] font-black uppercase tracking-[.23em] text-white/22 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Perfect Models Management</p>
          <div className="flex flex-wrap gap-6"><Link href="/privacy-policy" className="transition hover:text-pm-gold">Confidentialité</Link><Link href="/terms-of-use" className="transition hover:text-pm-gold">Conditions</Link><Link href="/login" className="text-pm-gold/65 transition hover:text-pm-gold">Espace privé</Link></div>
        </div>

        <p aria-hidden="true" className="pointer-events-none -mb-[3.5vw] mt-12 whitespace-nowrap text-center font-playfair text-[15vw] font-semibold leading-[.72] tracking-[-.075em] text-white/[.025]">PERFECT</p>
      </div>
    </footer>
  );
};

export default Footer;
