
import { useState, useEffect, forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import Logo from './Logo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${isScrolled ? 'bg-model-black/95 shadow-lg py-2' : 'bg-model-black py-4'}`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/">ACCUEIL</NavLink>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-model-white hover:text-model-gold data-[state=open]:text-model-gold p-0 focus:bg-transparent focus:text-model-gold text-sm font-medium tracking-wider">
                    NOS MANNEQUINS
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[250px] lg:w-[300px] bg-model-black/95 text-model-white border-none">
                      <ListItem to="/women" title="Femmes">
                        Découvrez nos mannequins femmes.
                      </ListItem>
                      <ListItem to="/men" title="Hommes">
                        Découvrez nos mannequins hommes.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavLink to="/casting">CASTING</NavLink>
            <NavLink to="/about">À PROPOS</NavLink>
            <NavLink to="/contact">CONTACT</NavLink>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full text-model-white hover:bg-model-gold/20 hover:text-model-gold focus-visible:ring-0 focus-visible:ring-offset-0">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-model-black text-model-white border-model-gold/20" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Mon Compte</p>
                      <p className="text-xs leading-none text-gray-400">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-model-gold/20" />
                  <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer focus:bg-model-gold/20 focus:text-model-gold">
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavLink to="/auth">CONNEXION</NavLink>
            )}

            <Link 
              to="/mannequin-order"
              className="px-4 py-2 bg-model-gold text-black rounded-md hover:bg-opacity-90 transition-colors duration-300 text-sm font-medium"
            >
              COMMANDER
            </Link>
          </div>

          {/* Mobile Navigation Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-model-white hover:text-model-gold transition-colors"
            aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-model-black/95 backdrop-blur-sm py-4 shadow-lg">
            <div className="container mx-auto px-6 flex flex-col space-y-4">
              <MobileNavLink to="/" onClick={() => setIsOpen(false)}>ACCUEIL</MobileNavLink>
              {session ? (
                <>
                  <p className="text-model-white/50 px-3">{session.user.email}</p>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-model-white hover:text-model-gold transition-colors duration-300 text-base font-medium tracking-wider">
                    DÉCONNEXION
                  </button>
                </>
              ) : (
                <MobileNavLink to="/auth" onClick={() => setIsOpen(false)}>CONNEXION</MobileNavLink>
              )}
              <MobileNavLink to="/women" onClick={() => setIsOpen(false)}>FEMMES</MobileNavLink>
              <MobileNavLink to="/men" onClick={() => setIsOpen(false)}>HOMMES</MobileNavLink>
              <MobileNavLink to="/mannequin-order" onClick={() => setIsOpen(false)}>COMMANDER</MobileNavLink>
              <MobileNavLink to="/casting" onClick={() => setIsOpen(false)}>CASTING</MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>À PROPOS</MobileNavLink>
              <MobileNavLink to="/contact" onClick={() => setIsOpen(false)}>CONTACT</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link 
    to={to} 
    className="text-model-white hover:text-model-gold transition-colors duration-300 text-sm font-medium tracking-wider"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ 
  to, 
  children, 
  onClick 
}: { 
  to: string; 
  children: React.ReactNode; 
  onClick: () => void 
}) => (
  <Link 
    to={to} 
    className="text-model-white hover:text-model-gold transition-colors duration-300 text-base font-medium tracking-wider"
    onClick={onClick}
  >
    {children}
  </Link>
);

const ListItem = forwardRef<
  ElementRef<typeof Link>,
  ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, to, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-model-gold/20 focus:bg-model-gold/20",
            className
          )}
          {...props}
        >
          <div className="text-sm font-semibold leading-none text-model-white group-hover:text-model-gold">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-400">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"


export default Navbar;
