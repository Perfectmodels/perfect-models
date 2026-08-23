import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { FacebookIcon, InstagramIcon, YoutubeIcon, TikTokIcon, WhatsAppIcon } from '../icons/SocialIcons';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
    const { data } = useData();
    const navLinks = data?.navLinks || [];
    const socialLinks = data?.socialLinks;
    const contactInfo = data?.contactInfo;

    const footerLinks = navLinks.filter(link => link.inFooter);

    return (
        <footer className="relative bg-[#050505] overflow-hidden">

            {/* ── Decorative background word ── */}
            <div
                aria-hidden="true"
                className="pointer-events-none select-none absolute bottom-0 left-0 right-0 flex justify-center overflow-hidden"
            >
                <span className="font-playfair font-black text-[22vw] leading-none text-white/[0.025] whitespace-nowrap translate-y-[15%]">
                    ÉLITE
                </span>
            </div>

            {/* ── Top gold line ── */}
            <div className="h-px bg-gradient-to-r from-transparent via-pm-gold/60 to-transparent" />

            {/* ── Hero CTA block ── */}
            <div className="relative max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20 pt-8 sm:pt-12 pb-8 sm:pb-10">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-8 lg:gap-12">

                    {/* Left : brand statement */}
                    <div className="max-w-xl">
                        <span className="section-label">Perfect Models Management</span>
                        <h2 className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
                            L'excellence,<br />
                            <em className="text-pm-gold not-italic">au quotidien.</em>
                        </h2>
                    </div>

                    {/* Right : CTA buttons */}
                    <div className="flex flex-row sm:flex-row lg:flex-col gap-3 sm:gap-4 shrink-0 flex-wrap">
                        <Link to="/casting-formulaire" className="btn-premium text-pm-off-white group flex items-center justify-between gap-4 sm:gap-8">
                            <span>Devenir Mannequin</span>
                            <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                        <Link to="/contact" className="btn-premium text-pm-off-white group flex items-center justify-between gap-4 sm:gap-8">
                            <span>Nous Contacter</span>
                            <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20">
                <div className="h-px bg-white/5" />
            </div>

            {/* ── Nav grid ── */}
            <div className="relative max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20 py-12 sm:py-16 lg:py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 lg:gap-20">

                    {/* Navigation */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-pm-gold/50 mb-8">Navigation</p>
                        <ul className="space-y-3">
                            {footerLinks.map(link => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 hover:text-pm-gold transition-colors duration-300"
                                    >
                                        {link.footerLabel || link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Opportunités */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-pm-gold/50 mb-8">Opportunités</p>
                        <ul className="space-y-3">
                            {[
                                { to: '/casting-formulaire', label: 'Casting Mannequin' },
                                { to: '/fashion-day-application', label: 'Exposer au PFD' },
                                { to: '/contact', label: 'Presse & Partenariats' },
                                { to: '/services', label: 'Nos Services' },
                            ].map(item => (
                                <li key={item.to}>
                                    <Link
                                        to={item.to}
                                        className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/40 hover:text-pm-gold transition-colors duration-300"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2 md:col-span-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-pm-gold/50 mb-6 sm:mb-8">Contact</p>
                        {contactInfo && (
                            <div className="space-y-3 sm:space-y-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-white/40 leading-relaxed">
                                    {contactInfo.address}
                                </p>
                                <a
                                    href={`tel:${contactInfo.phone}`}
                                    className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/40 hover:text-pm-gold transition-colors duration-300"
                                >
                                    {contactInfo.phone}
                                </a>
                                <a
                                    href={`mailto:${contactInfo.email}`}
                                    className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/40 hover:text-pm-gold transition-colors duration-300 break-all"
                                >
                                    {contactInfo.email}
                                </a>
                            </div>
                        )}

                        {/* Socials */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 mt-8 sm:mt-10">
                            {socialLinks?.facebook && (
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook Perfect Models Management"
                                    className="w-10 h-10 sm:w-9 sm:h-9 border border-white/10 flex items-center justify-center text-white/30 hover:border-pm-gold hover:text-pm-gold transition-all duration-300">
                                    <FacebookIcon className="w-4 h-4" />
                                </a>
                            )}
                            {socialLinks?.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram Perfect Models Management"
                                    className="w-10 h-10 sm:w-9 sm:h-9 border border-white/10 flex items-center justify-center text-white/30 hover:border-pm-gold hover:text-pm-gold transition-all duration-300">
                                    <InstagramIcon className="w-4 h-4" />
                                </a>
                            )}
                            {socialLinks?.tiktok && (
                                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok Perfect Models Management"
                                    className="w-10 h-10 sm:w-9 sm:h-9 border border-white/10 flex items-center justify-center text-white/30 hover:border-pm-gold hover:text-pm-gold transition-all duration-300">
                                    <TikTokIcon className="w-4 h-4" />
                                </a>
                            )}
                            {socialLinks?.youtube && (
                                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube Perfect Models Management"
                                    className="w-10 h-10 sm:w-9 sm:h-9 border border-white/10 flex items-center justify-center text-white/30 hover:border-pm-gold hover:text-pm-gold transition-all duration-300">
                                    <YoutubeIcon className="w-4 h-4" />
                                </a>
                            )}
                            {socialLinks?.whatsapp && (
                                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Canal WhatsApp Perfect Models Management"
                                    className="w-10 h-10 sm:w-9 sm:h-9 border border-white/10 flex items-center justify-center text-white/30 hover:border-pm-gold hover:text-pm-gold transition-all duration-300">
                                    <WhatsAppIcon className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="border-t border-white/5">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
                        &copy; {new Date().getFullYear()} Perfect Models Management
                    </p>
                    <div className="flex items-center gap-5 sm:gap-8 text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                        <Link to="/terms-of-use" className="text-white/20 hover:text-pm-gold transition-colors">CGU</Link>
                        <Link to="/privacy-policy" className="text-white/20 hover:text-pm-gold transition-colors">Confidentialité</Link>
                        <Link to="/login" className="text-pm-gold/60 hover:text-pm-gold transition-colors">
                            Portail Admin
                        </Link>
                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;
