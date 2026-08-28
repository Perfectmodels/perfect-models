import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, YoutubeIcon } from './SocialIcons';

const fallbackNav = [
  { path: '/agence', label: 'Agence' },
  { path: '/mannequins', label: 'Talents' },
  { path: '/services', label: 'Expertises' },
  { path: '/fashion-day', label: 'Fashion Day' },
  { path: '/magazine', label: 'Journal' },
];

const Footer: React.FC = () => {
  const { data } = useData();
  const configured = (data?.navLinks || []).filter((link) => link.inFooter);
  const navLinks = configured.length ? configured : fallbackNav;
  const socialLinks = data?.socialLinks;
  const contact = data?.contactInfo;
  const socials = [
    ['Instagram', socialLinks?.instagram, InstagramIcon],
    ['Facebook', socialLinks?.facebook, FacebookIcon],
    ['TikTok', socialLinks?.tiktok, TikTokIcon],
    ['YouTube', socialLinks?.youtube, YoutubeIcon],
    ['WhatsApp', socialLinks?.whatsapp, WhatsAppIcon],
  ] as const;

  return (
    <footer className="overflow-hidden border-t border-white/10 bg-pm-ink text-pm-ivory">
      <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="grid gap-14 border-b border-white/10 pb-16 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[.45em] text-pm-gold">Construisons la prochaine image</p>
            <h2 className="mt-7 max-w-5xl font-playfair text-6xl font-semibold leading-[.84] tracking-[-.055em] sm:text-8xl lg:text-[7.8rem]">Un talent.<br /><em className="font-normal text-white/38">Une vision.</em></h2>
          </div>
          <div className="flex flex-col gap-3 lg:pb-2">
            <Link to="/contact?subject=booking" className="pmm-button pmm-button--light">Booker un talent <span>↗</span></Link>
            <Link to="/casting-formulaire" className="pmm-button pmm-button--ghost">Rejoindre l’agence</Link>
          </div>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_1fr] lg:py-20">
          <div>
            <Link to="/" className="inline-flex items-center gap-4"><span className="grid h-14 w-14 place-items-center border border-pm-gold font-playfair text-2xl text-pm-gold">PM</span><span><span className="block font-playfair text-2xl">Perfect Models</span><span className="mt-1 block text-[8px] font-bold uppercase tracking-[.32em] text-white/35">Management · Libreville</span></span></Link>
            <p className="mt-7 max-w-sm text-sm leading-7 text-white/40">Agence de management, de casting et de production dédiée à l’émergence des talents et des images de mode au Gabon.</p>
          </div>

          <div>
            <p className="mb-6 text-[8px] font-black uppercase tracking-[.38em] text-pm-gold">Explorer</p>
            <nav className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-1">
              {navLinks.slice(0, 7).map((link) => <Link key={link.path} to={link.path} className="font-playfair text-xl text-white/60 transition hover:translate-x-1 hover:text-pm-ivory">{String(('footerLabel' in link && link.footerLabel) || link.label)}</Link>)}
            </nav>
          </div>

          <div>
            <p className="mb-6 text-[8px] font-black uppercase tracking-[.38em] text-pm-gold">Nous trouver</p>
            <div className="space-y-3 text-sm leading-6 text-white/45">
              {contact?.address && <p>{contact.address}</p>}
              {contact?.phone && <a href={`tel:${contact.phone}`} className="block transition hover:text-pm-gold">{contact.phone}</a>}
              {contact?.email && <a href={`mailto:${contact.email}`} className="block break-all transition hover:text-pm-gold">{contact.email}</a>}
              {!contact && <p>Libreville, Gabon</p>}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {socials.map(([label, href, Icon]) => href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center border border-white/12 text-white/35 transition hover:border-pm-gold hover:text-pm-gold"><Icon className="h-4 w-4" /></a> : null)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 pt-7 text-[8px] font-bold uppercase tracking-[.25em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Perfect Models Management</p>
          <div className="flex flex-wrap gap-6"><Link to="/privacy-policy" className="transition hover:text-pm-gold">Confidentialité</Link><Link to="/terms-of-use" className="transition hover:text-pm-gold">Conditions</Link><Link to="/login" className="text-pm-gold/70 transition hover:text-pm-gold">Espace privé</Link></div>
        </div>

        <p aria-hidden="true" className="pointer-events-none -mb-[3.7vw] mt-12 whitespace-nowrap text-center font-playfair text-[17vw] font-semibold leading-[.7] tracking-[-.08em] text-white/[.025]">PERFECT</p>
      </div>
    </footer>
  );
};

export default Footer;
