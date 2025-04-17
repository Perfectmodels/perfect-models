
import { useState, useEffect } from 'react';
import Logo from './Logo';
import { SidebarProvider } from "@/components/ui/sidebar";
import MobileSidebar from './MobileSidebar';
import DesktopSidebar from './DesktopSidebar';
import MobileMenuToggle from './MobileMenuToggle';

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
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Logo />
        <MobileMenuToggle isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      <SidebarProvider>
        <MobileSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <DesktopSidebar />
      </SidebarProvider>
    </nav>
  );
};

export default Navbar;
