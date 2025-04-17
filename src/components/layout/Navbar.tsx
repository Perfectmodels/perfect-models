
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Calendar, ListTodo } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Function to scroll to the section when clicked
  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-model-black py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="font-playfair text-model-white text-2xl md:text-3xl font-bold tracking-wider">
          PERFECT MODELS
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/women" label="FEMMES" />
          <NavLink to="/men" label="HOMMES" />
          <NavItemWithIcon 
            label="SERVICES" 
            icon={<ListTodo className="h-4 w-4" />} 
            onClick={() => scrollToSection('services-section')} 
          />
          <NavItemWithIcon 
            label="ÉVÉNEMENTS" 
            icon={<Calendar className="h-4 w-4" />} 
            onClick={() => scrollToSection('events-section')} 
          />
          <NavLink to="/casting" label="CASTING" />
          <NavLink to="/about" label="À PROPOS" />
          <NavLink to="/contact" label="CONTACT" />
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="text-model-white" size={24} /> : <Menu className="text-model-white" size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-model-black absolute top-full left-0 w-full animate-fade-in">
          <div className="container mx-auto px-6 py-4 flex flex-col space-y-4">
            <MobileNavLink to="/women" label="FEMMES" onClick={() => setIsOpen(false)} />
            <MobileNavLink to="/men" label="HOMMES" onClick={() => setIsOpen(false)} />
            <MobileNavItemWithIcon 
              label="SERVICES" 
              icon={<ListTodo className="h-4 w-4" />} 
              onClick={() => scrollToSection('services-section')} 
            />
            <MobileNavItemWithIcon 
              label="ÉVÉNEMENTS" 
              icon={<Calendar className="h-4 w-4" />} 
              onClick={() => scrollToSection('events-section')} 
            />
            <MobileNavLink to="/casting" label="CASTING" onClick={() => setIsOpen(false)} />
            <MobileNavLink to="/about" label="À PROPOS" onClick={() => setIsOpen(false)} />
            <MobileNavLink to="/contact" label="CONTACT" onClick={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, label }: { to: string; label: string }) => (
  <Link to={to} className="text-model-white text-sm tracking-wider hover-gold">
    {label}
  </Link>
);

const NavItemWithIcon = ({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5"
  >
    {icon}
    {label}
  </button>
);

const MobileNavLink = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => (
  <Link to={to} className="text-model-white text-lg tracking-wider py-2 hover-gold" onClick={onClick}>
    {label}
  </Link>
);

const MobileNavItemWithIcon = ({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="text-model-white text-lg tracking-wider py-2 hover-gold flex items-center gap-2"
  >
    {icon}
    {label}
  </button>
);

export default Navbar;
