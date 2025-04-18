
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { ThemeSwitcher } from './ThemeSwitcher';

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
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-model-black py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-model-white hover:text-model-gold transition-colors">ACCUEIL</Link>
            <Link to="/women" className="text-model-white hover:text-model-gold transition-colors">FEMMES</Link>
            <Link to="/men" className="text-model-white hover:text-model-gold transition-colors">HOMMES</Link>
            <Link to="/gallery" className="text-model-white hover:text-model-gold transition-colors">GALERIE</Link>
            <Link to="/about" className="text-model-white hover:text-model-gold transition-colors">À PROPOS</Link>
            <Link to="/contact" className="text-model-white hover:text-model-gold transition-colors">CONTACT</Link>
            <ThemeSwitcher />
          </div>

          {/* Mobile Navigation Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-model-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-model-black py-4">
            <div className="container mx-auto px-6 flex flex-col space-y-4">
              <Link to="/" className="text-model-white hover:text-model-gold transition-colors" onClick={() => setIsOpen(false)}>ACCUEIL</Link>
              <Link to="/women" className="text-model-white hover:text-model-gold transition-colors" onClick={() => setIsOpen(false)}>FEMMES</Link>
              <Link to="/men" className="text-model-white hover:text-model-gold transition-colors" onClick={() => setIsOpen(false)}>HOMMES</Link>
              <Link to="/gallery" className="text-model-white hover:text-model-gold transition-colors" onClick={() => setIsOpen(false)}>GALERIE</Link>
              <Link to="/about" className="text-model-white hover:text-model-gold transition-colors" onClick={() => setIsOpen(false)}>À PROPOS</Link>
              <Link to="/contact" className="text-model-white hover:text-model-gold transition-colors" onClick={() => setIsOpen(false)}>CONTACT</Link>
              <div className="pt-2">
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
