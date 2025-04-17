
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ListTodo, User, Users, Home, Phone, Info } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';
import EventsList from '../../models/EventsList';
import ServicesList from '../../models/ServicesList';
import { Event, Service } from '@/types/modelTypes';

interface DesktopNavigationProps {
  events: Event[];
  services: Service[];
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ events, services }) => {
  return (
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
  );
};

export default DesktopNavigation;
