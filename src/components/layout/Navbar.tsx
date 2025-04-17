
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Calendar, ListTodo } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { ScrollArea } from '@/components/ui/scroll-area';
import TabContent from '@/components/common/TabContent';
import EventsList from '../models/EventsList';
import ServicesList from '../models/ServicesList';
import { Event, Service } from '@/types/modelTypes';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

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

  // Events data
  const events: Event[] = [
    {
      id: "1",
      name: "CLOFAS 241",
      description: "Un événement majeur de la mode gabonaise mettant en valeur les créateurs locaux.",
      location: "Libreville, Gabon"
    },
    {
      id: "2",
      name: "Fashion Showchou/Awards de la mode Gabonaise",
      description: "Cérémonie de récompense célébrant les talents de la mode au Gabon.",
      location: "Libreville, Gabon"
    },
    {
      id: "3",
      name: "Perfect Fashion Day",
      description: "Une journée dédiée à la mode avec des défilés et des présentations.",
      location: "Libreville, Gabon"
    },
    {
      id: "4",
      name: "K'elle Pour Elle",
      description: "Événement de mode centré sur les créations féminines.",
      location: "Libreville, Gabon"
    },
    {
      id: "5",
      name: "FEMOGA",
      description: "Festival de la Mode Gabonaise réunissant les acteurs du secteur.",
      location: "Libreville, Gabon"
    },
    {
      id: "6",
      name: "La semaine de la Mode (UCREATE)",
      description: "Une semaine entière dédiée à la mode et à la création au Gabon.",
      location: "Libreville, Gabon"
    },
    {
      id: "7",
      name: "Gala Femmes actives du Gabon",
      description: "Un événement célébrant les femmes entreprenantes dans le domaine de la mode.",
      location: "Libreville, Gabon"
    },
    {
      id: "8",
      name: "Edele A",
      description: "Présentation de collections de mode contemporaine gabonaise.",
      location: "Libreville, Gabon"
    },
    {
      id: "9",
      name: "La Nuit du Textile Africain à Bamako",
      description: "Célébration des textiles africains avec participation gabonaise.",
      location: "Bamako, Mali"
    }
  ];

  // Services data
  const services: Service[] = [
    {
      id: "1",
      name: "Défilés de mode",
      description: "Organisation et participation à des défilés de mode locaux et internationaux."
    },
    {
      id: "2",
      name: "Shootings photo",
      description: "Services de mannequins pour des séances photo professionnelles."
    },
    {
      id: "3",
      name: "Événements VIP",
      description: "Présence de mannequins lors d'événements exclusifs et lancements."
    },
    {
      id: "4",
      name: "Campagnes publicitaires",
      description: "Mannequins pour vos campagnes marketing et publicitaires."
    },
    {
      id: "5",
      name: "Formation de mannequins",
      description: "Cours et ateliers pour devenir mannequin professionnel."
    },
    {
      id: "6",
      name: "Organisation d'événements de mode",
      description: "Conception et réalisation complète de vos événements de mode."
    }
  ];

  // Function to scroll to the section when clicked
  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to open drawer with specific content
  const openDrawer = (drawerType: string) => {
    setActiveDrawer(drawerType);
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
          
          {/* Services Drawer Trigger */}
          <Drawer onOpenChange={() => openDrawer('services')}>
            <DrawerTrigger asChild>
              <button className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                <ListTodo className="h-4 w-4" />
                SERVICES
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <DrawerHeader>
                <DrawerTitle className="text-center text-2xl font-playfair">Nos Services</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="h-full px-6 py-4">
                <ServicesList services={services} />
              </ScrollArea>
              <DrawerFooter className="pt-2">
                <div className="w-24 h-0.5 bg-model-gold mx-auto mb-2"></div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          
          {/* Events Drawer Trigger */}
          <Drawer onOpenChange={() => openDrawer('events')}>
            <DrawerTrigger asChild>
              <button className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                ÉVÉNEMENTS
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <DrawerHeader>
                <DrawerTitle className="text-center text-2xl font-playfair">Nos Événements</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="h-full px-6 py-4">
                <EventsList events={events} />
              </ScrollArea>
              <DrawerFooter className="pt-2">
                <div className="w-24 h-0.5 bg-model-gold mx-auto mb-2"></div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
          
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
            
            {/* Mobile Services Drawer Trigger */}
            <Drawer onOpenChange={() => openDrawer('services')}>
              <DrawerTrigger asChild>
                <button className="text-model-white text-lg tracking-wider py-2 hover-gold flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  SERVICES
                </button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh]">
                <DrawerHeader>
                  <DrawerTitle className="text-center text-2xl font-playfair">Nos Services</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="h-full px-6 py-4">
                  <ServicesList services={services} />
                </ScrollArea>
                <DrawerFooter className="pt-2">
                  <div className="w-24 h-0.5 bg-model-gold mx-auto mb-2"></div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            
            {/* Mobile Events Drawer Trigger */}
            <Drawer onOpenChange={() => openDrawer('events')}>
              <DrawerTrigger asChild>
                <button className="text-model-white text-lg tracking-wider py-2 hover-gold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  ÉVÉNEMENTS
                </button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh]">
                <DrawerHeader>
                  <DrawerTitle className="text-center text-2xl font-playfair">Nos Événements</DrawerTitle>
                </DrawerHeader>
                <ScrollArea className="h-full px-6 py-4">
                  <EventsList events={events} />
                </ScrollArea>
                <DrawerFooter className="pt-2">
                  <div className="w-24 h-0.5 bg-model-gold mx-auto mb-2"></div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            
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

const MobileNavLink = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => (
  <Link to={to} className="text-model-white text-lg tracking-wider py-2 hover-gold" onClick={onClick}>
    {label}
  </Link>
);

export default Navbar;
