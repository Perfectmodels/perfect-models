
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, TikTok } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-model-black text-model-white py-12">
      <div className="container mx-auto px-6">
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
              <SocialLink href="https://www.tiktok.com/@perfectmodels.ga" icon={<TikTok size={18} />} />
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

        <div className="border-t border-dark-gray mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-medium-gray text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Perfect Models Management. Tous droits réservés.
          </p>
          <div className="flex space-x-4 text-sm text-medium-gray">
            <Link to="/privacy" className="hover-gold">Politique de Confidentialité</Link>
            <Link to="/terms" className="hover-gold">Conditions d'Utilisation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }: { href: string; icon: React.ReactNode }) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-full bg-dark-gray flex items-center justify-center hover:bg-model-gold transition-colors duration-300"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, label }: { to: string; label: string }) => (
  <li>
    <Link to={to} className="text-light-gray hover-gold">
      {label}
    </Link>
  </li>
);

export default Footer;
