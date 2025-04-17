
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { events, services } from './navigation/NavbarData';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { 
  Calendar, 
  ListTodo, 
  User, 
  Users, 
  Home, 
  Phone, 
  Info,
  PanelLeft
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ScrollArea } from '@/components/ui/scroll-area';
import EventsList from '../models/EventsList';
import ServicesList from '../models/ServicesList';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openServicesDrawer, setOpenServicesDrawer] = useState(false);
  const [openEventsDrawer, setOpenEventsDrawer] = useState(false);

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

        {/* Mobile Menu Button */}
        <button className="flex md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle sidebar">
          {isOpen ? <X className="text-model-white" size={24} /> : <Menu className="text-model-white" size={24} />}
        </button>
      </div>

      {/* Sidebar for both mobile and desktop */}
      <SidebarProvider>
        {/* Mobile Sidebar */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="md:hidden w-[85vw] max-w-sm pt-16 bg-model-black">
            <div className="flex flex-col h-full py-4 text-model-white">
              <Logo className="mx-auto mb-8" />
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
                  
                  {/* Services */}
                  <SidebarMenuItem>
                    <Drawer>
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
                    <Drawer>
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
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar className="bg-model-black text-model-white">
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
          </Sidebar>
        </div>
      </SidebarProvider>
    </nav>
  );
};

export default Navbar;
