
import { useState, useEffect, forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from '@/lib/utils';

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
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
      ${isScrolled ? 'bg-model-black/95 shadow-lg py-2' : 'bg-model-black py-4'}`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
                       <ListItem to="/models" title="Tous les mannequins">
                        Voir tous nos mannequins.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <NavLink to="/mannequin-order">COMMANDE</NavLink>
            <NavLink to="/casting">CASTING</NavLink>
            <NavLink to="/about">À PROPOS</NavLink>
            <NavLink to="/contact">CONTACT</NavLink>
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
              <MobileNavLink to="/women" onClick={() => setIsOpen(false)}>FEMMES</MobileNavLink>
              <MobileNavLink to="/men" onClick={() => setIsOpen(false)}>HOMMES</MobileNavLink>
              <MobileNavLink to="/models" onClick={() => setIsOpen(false)}>TOUS LES MANNEQUINS</MobileNavLink>
              <MobileNavLink to="/mannequin-order" onClick={() => setIsOpen(false)}>COMMANDE</MobileNavLink>
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
