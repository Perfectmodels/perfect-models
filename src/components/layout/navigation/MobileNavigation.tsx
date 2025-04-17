
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ListTodo, User, Users, Home, Phone, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import EventsList from '../../models/EventsList';
import ServicesList from '../../models/ServicesList';
import { Event, Service } from '@/types/modelTypes';
import Logo from '../Logo';

interface MobileNavigationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  events: Event[];
  services: Service[];
  openCollapsibles: Record<string, boolean>;
  toggleCollapsible: (name: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  isOpen, 
  setIsOpen, 
  events, 
  services, 
  openCollapsibles,
  toggleCollapsible
}) => {
  // Function to close the mobile menu
  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
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
  );
};

export default MobileNavigation;
