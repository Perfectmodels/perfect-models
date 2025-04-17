import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Calendar, ListTodo, User, Users, Home, Phone, Info } from 'lucide-react';
import Logo from './Logo';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import EventsList from '../models/EventsList';
import ServicesList from '../models/ServicesList';
import { Event, Service } from '@/types/modelTypes';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

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

  const toggleCollapsible = (name: string) => {
    setOpenCollapsibles(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Function to close the mobile menu
  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-model-black py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  ACCUEIL
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/women" className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  FEMMES
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/men" className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  HOMMES
                </Link>
              </NavigationMenuItem>

              {/* Services Sheet Trigger */}
              <NavigationMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                      <ListTodo className="h-4 w-4" />
                      SERVICES
                    </button>
                  </SheetTrigger>
                  <SheetContent className="w-[350px] sm:w-[450px]" side="right">
                    <SheetHeader>
                      <SheetTitle className="text-center text-2xl font-playfair">Nos Services</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[80vh] px-1 py-4">
                      <ServicesList services={services} />
                    </ScrollArea>
                    <SheetFooter className="pt-2">
                      <div className="w-24 h-0.5 bg-model-gold mx-auto mb-2"></div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </NavigationMenuItem>
              
              {/* Events Sheet Trigger */}
              <NavigationMenuItem>
                <Sheet>
                  <SheetTrigger asChild>
                    <button className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      ÉVÉNEMENTS
                    </button>
                  </SheetTrigger>
                  <SheetContent className="w-[350px] sm:w-[450px]" side="right">
                    <SheetHeader>
                      <SheetTitle className="text-center text-2xl font-playfair">Nos Événements</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[80vh] px-1 py-4">
                      <EventsList events={events} />
                    </ScrollArea>
                    <SheetFooter className="pt-2">
                      <div className="w-24 h-0.5 bg-model-gold mx-auto mb-2"></div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/casting" className="text-model-white text-sm tracking-wider hover-gold">
                  CASTING
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/about" className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  À PROPOS
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/contact" className="text-model-white text-sm tracking-wider hover-gold flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  CONTACT
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="text-model-white" size={24} /> : <Menu className="text-model-white" size={24} />}
        </button>
      </div>

      {/* Mobile Menu Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[80vw] max-w-sm pt-16">
          <SheetHeader>
            <SheetTitle className="text-center text-2xl font-playfair">
              <Logo className="justify-center" />
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-full py-4">
            <div className="flex flex-col space-y-4 px-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-lg" 
                onClick={closeMobileMenu}
              >
                <Home size={18} />
                ACCUEIL
              </Link>
              
              <Link 
                to="/women" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-lg" 
                onClick={closeMobileMenu}
              >
                <Users size={18} />
                FEMMES
              </Link>
              
              <Link 
                to="/men" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-lg" 
                onClick={closeMobileMenu}
              >
                <User size={18} />
                HOMMES
              </Link>
              
              {/* Mobile Collapsible Services */}
              <Collapsible 
                open={openCollapsibles.services} 
                onOpenChange={() => toggleCollapsible('services')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-accent text-lg">
                  <div className="flex items-center gap-2">
                    <ListTodo size={18} />
                    SERVICES
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pr-2 py-2 space-y-3">
                  <ServicesList services={services} />
                </CollapsibleContent>
              </Collapsible>
              
              {/* Mobile Collapsible Events */}
              <Collapsible 
                open={openCollapsibles.events} 
                onOpenChange={() => toggleCollapsible('events')}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-md hover:bg-accent text-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    ÉVÉNEMENTS
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pr-2 py-2 space-y-3">
                  <EventsList events={events} />
                </CollapsibleContent>
              </Collapsible>
              
              <Link 
                to="/casting" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-lg" 
                onClick={closeMobileMenu}
              >
                CASTING
              </Link>
              
              <Link 
                to="/about" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-lg" 
                onClick={closeMobileMenu}
              >
                <Info size={18} />
                À PROPOS
              </Link>
              
              <Link 
                to="/contact" 
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-lg" 
                onClick={closeMobileMenu}
              >
                <Phone size={18} />
                CONTACT
              </Link>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
