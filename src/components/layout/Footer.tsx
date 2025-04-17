
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, ChevronLeft, ChevronRight } from 'lucide-react';
import { TikTokIcon } from '../icons/TikTokIcon';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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

        {/* Partners Carousel */}
        <div className="mt-12 pt-8 border-t border-dark-gray">
          <h3 className="font-playfair text-xl mb-6 text-center">NOS PARTENAIRES</h3>
          <PartnersCarousel />
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

// Partners carousel component
const PartnersCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  // Partner list with names and placeholder logos
  const partners = [
    { name: 'Darain Visual', logo: '/placeholder.svg' },
    { name: 'Legrand Product\'s', logo: '/placeholder.svg' },
    { name: 'Amplitude Libreville', logo: '/placeholder.svg' },
    { name: 'Symbiose Concept Store', logo: '/placeholder.svg' },
    { name: 'Edele A', logo: '/placeholder.svg' },
    { name: 'NR Pictures', logo: '/placeholder.svg' },
    { name: 'Indi Hair', logo: '/placeholder.svg' },
    { name: 'Le Wap - Restaurant Bar Lounge', logo: '/placeholder.svg' },
    { name: 'Yarden Hotel Appart', logo: '/placeholder.svg' },
    { name: 'Graphik Studio', logo: '/placeholder.svg' },
    { name: 'Lady Riaba', logo: '/placeholder.svg' },
    { name: 'Madam Luc', logo: '/placeholder.svg' },
    { name: 'Sabo Fashion', logo: '/placeholder.svg' },
    { name: 'Ecole de Mode de Nzeng Ayong', logo: '/placeholder.svg' },
    { name: 'VitriClean', logo: '/placeholder.svg' },
    { name: 'Beitch Faro', logo: '/placeholder.svg' },
  ];
  
  const itemsPerSlide = 5;
  const totalSlides = Math.ceil(partners.length / itemsPerSlide);
  
  // Autoplay functionality
  useEffect(() => {
    let interval: number | undefined = undefined;
    
    if (autoplay) {
      interval = window.setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 3000);
    }
    
    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [autoplay, totalSlides]);
  
  // Navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setAutoplay(false);
    // Resume autoplay after 5 seconds of user inactivity
    setTimeout(() => setAutoplay(true), 5000);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setAutoplay(false);
    // Resume autoplay after 5 seconds of user inactivity
    setTimeout(() => setAutoplay(true), 5000);
  };

  return (
    <div className="relative">
      {/* Navigation buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-model-black/80 p-1 rounded-full hover:bg-model-gold transition-colors duration-300"
        aria-label="Précédent"
      >
        <ChevronLeft size={24} />
      </button>
      
      {/* Carousel container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="min-w-full flex justify-center items-center gap-4 md:gap-8">
              {partners
                .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                .map((partner, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="bg-white/10 rounded-md p-2 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                      <img 
                        src={partner.logo} 
                        alt={`${partner.name} logo`} 
                        className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                      />
                    </div>
                    <p className="mt-2 text-xs text-center text-light-gray">{partner.name}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-model-black/80 p-1 rounded-full hover:bg-model-gold transition-colors duration-300"
        aria-label="Suivant"
      >
        <ChevronRight size={24} />
      </button>
      
      {/* Slide indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setAutoplay(false);
              setTimeout(() => setAutoplay(true), 5000);
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentSlide === index ? "bg-model-gold w-4" : "bg-gray-500"
            )}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Footer;
