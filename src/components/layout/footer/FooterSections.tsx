
import React from 'react';
import FooterLink from './FooterLink';
import SocialLink from './SocialLink';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { TikTokIcon } from '../../icons/TikTokIcon';

const FooterSections = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {/* Agency Info */}
      <div>
        <h3 className="font-playfair text-xl mb-4">PERFECT MODELS</h3>
        <p className="text-light-gray text-sm mb-4">
          Agence de mannequins professionnels pour la haute couture, la publicité et les défilés.
        </p>
        <div className="flex space-x-4">
          <SocialLink href="https://www.facebook.com/perfectmodels.ga?locale=fr_FR" icon={<Facebook size={18} />} />
          <SocialLink href="https://www.instagram.com/perfectmodels.ga/" icon={<Instagram size={18} />} />
          <SocialLink href="https://www.youtube.com/@PMM241" icon={<Youtube size={18} />} />
          <SocialLink 
            href="https://www.tiktok.com/@perfectmodels.ga" 
            icon={<TikTokIcon size={18} />} 
          />
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-playfair text-xl mb-4">LIENS RAPIDES</h3>
        <ul className="space-y-2">
          <FooterLink to="/women" label="Femmes" />
          <FooterLink to="/men" label="Hommes" />
          <FooterLink to="/casting" label="Casting" />
          <FooterLink to="/about" label="À Propos" />
          <FooterLink to="/contact" label="Contact" />
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="font-playfair text-xl mb-4">CONTACTEZ-NOUS</h3>
        <address className="not-italic text-light-gray">
          <p className="mb-2">Libreville, Gabon</p>
          <p className="mb-2">Perfectmodels.ga@gmail.com</p>
          <p>+241 77 50 79 50</p>
        </address>
      </div>
    </div>
  );
};

export default FooterSections;
