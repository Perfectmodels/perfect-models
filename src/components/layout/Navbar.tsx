
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import DesktopNavigation from './navigation/DesktopNavigation';
import MobileNavigation from './navigation/MobileNavigation';
import { events, services } from './navigation/NavbarData';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState<string | null>(null);
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({
    services: false,
    events: false
  });

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

  const toggleCollapsible = (name: string) => {
    setOpenCollapsibles(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-model-black py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <DesktopNavigation events={events} services={services} />

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="text-model-white" size={24} /> : <Menu className="text-model-white" size={24} />}
        </button>
      </div>

      {/* Mobile Menu Sheet */}
      <MobileNavigation 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        events={events}
        services={services}
        openCollapsibles={openCollapsibles}
        toggleCollapsible={toggleCollapsible}
      />
    </nav>
  );
};

export default Navbar;
