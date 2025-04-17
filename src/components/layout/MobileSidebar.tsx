
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Home, Image, Info, ListTodo, Phone, User, Users } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import Logo from './Logo';
import EventsList from '../models/EventsList';
import ServicesList from '../models/ServicesList';
import { events, services } from './navigation/NavbarData';
import { MobileThemeSwitcher } from './ThemeSwitcher';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const [openServicesDrawer, setOpenServicesDrawer] = useState(false);
  const [openEventsDrawer, setOpenEventsDrawer] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="md:hidden w-[85vw] max-w-sm pt-16 bg-model-black">
        <div className="flex flex-col h-full py-4 text-model-white">
          <div className="flex items-center justify-between mb-8 px-4">
            <Logo className="mx-auto" />
            <MobileThemeSwitcher />
          </div>
          <ScrollArea className="h-full px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg">
                    <Home size={20} />
                    <span>ACCUEIL</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/women" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg">
                    <Users size={20} />
                    <span>FEMMES</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/men" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg">
                    <User size={20} />
                    <span>HOMMES</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Gallery - New item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/gallery" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg">
                    <Image size={20} />
                    <span>GALERIE</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Services */}
              <SidebarMenuItem>
                <Drawer open={openServicesDrawer} onOpenChange={setOpenServicesDrawer}>
                  <DrawerTrigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-lg">
                      <div className="flex items-center gap-2">
                        <ListTodo size={20} />
                        <span>SERVICES</span>
                      </div>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-model-black text-model-white">
                    <div className="p-4 max-h-[80vh]">
                      <h3 className="text-center text-2xl font-playfair mb-4">Nos Services</h3>
                      <ScrollArea className="h-[60vh]">
                        <ServicesList services={services} />
                      </ScrollArea>
                    </div>
                  </DrawerContent>
                </Drawer>
              </SidebarMenuItem>
              
              {/* Events */}
              <SidebarMenuItem>
                <Drawer open={openEventsDrawer} onOpenChange={setOpenEventsDrawer}>
                  <DrawerTrigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-md text-lg">
                      <div className="flex items-center gap-2">
                        <Calendar size={20} />
                        <span>ÉVÉNEMENTS</span>
                      </div>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-model-black text-model-white">
                    <div className="p-4 max-h-[80vh]">
                      <h3 className="text-center text-2xl font-playfair mb-4">Nos Événements</h3>
                      <ScrollArea className="h-[60vh]">
                        <EventsList events={events} />
                      </ScrollArea>
                    </div>
                  </DrawerContent>
                </Drawer>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/about" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg">
                    <Info size={20} />
                    <span>À PROPOS</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/contact" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-lg">
                    <Phone size={20} />
                    <span>CONTACT</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
