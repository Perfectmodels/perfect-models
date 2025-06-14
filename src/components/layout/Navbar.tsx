import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${isScrolled ? 'bg-model-black/95 shadow-lg py-2' : 'bg-model-black py-4'}`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">ACCUEIL</NavLink>
            <NavLink to="/models">NOS MANNEQUINS</NavLink>
            <NavLink to="/mannequin-order">COMMANDE</NavLink>
            <NavLink to="/casting">CASTING</NavLink>
            <NavLink to="/about">À PROPOS</NavLink>
            <NavLink to="/contact">CONTACT</NavLink>
          </div>

          {/* Mobile Navigation Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-model-white hover:text-model-gold transition-colors"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-model-black/95 backdrop-blur-sm py-4 shadow-lg">
            <div className="container mx-auto px-6 flex flex-col space-y-4">
              <MobileNavLink to="/" onClick={() => setIsOpen(false)}>ACCUEIL</MobileNavLink>
              <MobileNavLink to="/models" onClick={() => setIsOpen(false)}>NOS MANNEQUINS</MobileNavLink>
              <MobileNavLink to="/mannequin-order" onClick={() => setIsOpen(false)}>COMMANDE</MobileNavLink>
              <MobileNavLink to="/casting" onClick={() => setIsOpen(false)}>CASTING</MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>À PROPOS</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>CONTACT</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-model-white hover:text-model-gold transition-colors duration-300 text-sm font-medium tracking-wider"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ 
  to, 
  children, 
  onClick 
}: { 
  to: string; 
  children: React.ReactNode; 
  onClick: () => void 
}) => (
  <Link 
    to={to} 
    className="text-model-white hover:text-model-gold transition-colors duration-300 text-base font-medium tracking-wider"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Navbar;
