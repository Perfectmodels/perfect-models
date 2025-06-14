
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { TikTokIcon } from '../icons/TikTokIcon';
import { useFooterData } from '@/hooks/useFooterData';

const Footer = () => {
  const { data: footerData, isLoading } = useFooterData();

  const contact = footerData?.contact;
  const socialMedia = footerData?.socialMedia || [];
  
  // Grouper les liens par section
  const linksBySection = footerData?.footerLinks?.reduce((acc, link) => {
    if (!acc[link.section_name]) {
      acc[link.section_name] = [];
    }
    acc[link.section_name].push(link);
    return acc;
  }, {} as Record<string, typeof footerData.footerLinks>) || {};

  const quickLinks = linksBySection['LIENS RAPIDES'] || [];
  const services = linksBySection['SERVICES'] || [];
  const legal = linksBySection['LÉGAL'] || [];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Facebook':
        return <Facebook size={18} />;
      case 'Instagram':
        return <Instagram size={18} />;
      case 'Youtube':
        return <Youtube size={18} />;
      case 'TikTok':
        return <TikTokIcon size={18} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <footer className="bg-model-black text-model-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">Chargement...</div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-model-black text-model-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Agency Info */}
          <div>
            <h3 className="font-playfair text-xl mb-4">PERFECT MODELS</h3>
            <p className="text-light-gray text-sm mb-4">
              Agence de mannequins professionnels pour la haute couture, la publicité et les défilés.
            </p>
            <div className="flex space-x-4">
              {socialMedia.map((social, index) => (
                <SocialLink 
                  key={index}
                  href={social.url} 
                  icon={getIcon(social.icon_name || social.platform)} 
                />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-playfair text-xl mb-4">LIENS RAPIDES</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <FooterLink 
                  key={index}
                  to={link.link_url} 
                  label={link.link_text} 
                />
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-playfair text-xl mb-4">CONTACTEZ-NOUS</h3>
            {contact && (
              <address className="not-italic text-light-gray">
                <p className="mb-2">{contact.address}, {contact.country}</p>
                <p className="mb-2">{contact.email}</p>
                <p>{contact.phone}</p>
              </address>
            )}
          </div>

          {/* Services */}
          <div>
            <h3 className="font-playfair text-xl mb-4">SERVICES</h3>
            <ul className="space-y-2">
              {services.map((link, index) => (
                <FooterLink 
                  key={index}
                  to={link.link_url} 
                  label={link.link_text} 
                />
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-gray mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-medium-gray text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Perfect Models Management. Tous droits réservés.
          </p>
          <div className="flex space-x-4 text-sm text-medium-gray">
            {legal.map((link, index) => (
              <Link key={index} to={link.link_url} className="hover-gold">
                {link.link_text}
              </Link>
            ))}
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
