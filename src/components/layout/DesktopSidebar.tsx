
import { Link } from 'react-router-dom';
import { Calendar, Home, Image, Info, ListTodo, Phone, User, Users } from 'lucide-react';
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import EventsList from '../models/EventsList';
import ServicesList from '../models/ServicesList';
import { events, services } from './navigation/NavbarData';
import { ThemeSwitcher } from './ThemeSwitcher';

import {
  SidebarMenu,
  SidebarMenuItem, 
  SidebarMenuButton,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarTrigger
} from '@/components/ui/sidebar';

const DesktopSidebar = () => {
  const [openServicesDrawer, setOpenServicesDrawer] = useState(false);
  const [openEventsDrawer, setOpenEventsDrawer] = useState(false);
  
  return (
    <div className="hidden md:block">
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-model-gold">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Accueil">
                    <Link to="/" className="flex items-center gap-2">
                      <Home size={20} />
                      <span>ACCUEIL</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Femmes">
                    <Link to="/women" className="flex items-center gap-2">
                      <Users size={20} />
                      <span>FEMMES</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Hommes">
                    <Link to="/men" className="flex items-center gap-2">
                      <User size={20} />
                      <span>HOMMES</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Gallery - New item */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Galerie">
                    <Link to="/gallery" className="flex items-center gap-2">
                      <Image size={20} />
                      <span>GALERIE</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel className="text-model-gold">Découvrir</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Drawer open={openServicesDrawer} onOpenChange={setOpenServicesDrawer}>
                    <DrawerTrigger asChild>
                      <SidebarMenuButton tooltip="Services">
                        <ListTodo size={20} />
                        <span>SERVICES</span>
                      </SidebarMenuButton>
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
                
                <SidebarMenuItem>
                  <Drawer open={openEventsDrawer} onOpenChange={setOpenEventsDrawer}>
                    <DrawerTrigger asChild>
                      <SidebarMenuButton tooltip="Événements">
                        <Calendar size={20} />
                        <span>ÉVÉNEMENTS</span>
                      </SidebarMenuButton>
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
                  <SidebarMenuButton asChild tooltip="À propos">
                    <Link to="/about" className="flex items-center gap-2">
                      <Info size={20} />
                      <span>À PROPOS</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Contact">
                    <Link to="/contact" className="flex items-center gap-2">
                      <Phone size={20} />
                      <span>CONTACT</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="px-4 py-3">
          <div className="px-2">
            <SidebarGroupLabel className="text-model-gold mb-2">Appearance</SidebarGroupLabel>
            <ThemeSwitcher />
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default DesktopSidebar;
