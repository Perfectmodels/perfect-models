
import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRightOnRectangleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import AnimatedHamburgerIcon from './AnimatedHamburgerIcon';

/**
 * Composant Fil d'Ariane (Breadcrumb)
 */
export const Breadcrumb: React.FC = () => {
    const location = useLocation();
    const params = useParams();
    const { data } = useData();

    const crumbs = useMemo(() => {
        const breadcrumbNameMap: { [key: string]: string } = {
            '/agence': 'Agence', '/mannequins': 'Nos Mannequins', '/fashion-day': 'PFD',
            '/magazine': 'Magazine', '/contact': 'Contact', '/services': 'Services',
            '/casting': 'Casting', '/casting-formulaire': 'Postuler',
            '/fashion-day-application': 'Candidature PFD', '/profil': 'Mon Profil',
            '/formations': 'Classroom', '/formations/forum': 'Forum',
        };

        const pathnames = location.pathname.split('/').filter(Boolean);
        let currentCrumbs: { label: string; path: string }[] = [];
        let currentPath = '';

        pathnames.forEach(segment => {
            currentPath += `/${segment}`;
            if (breadcrumbNameMap[currentPath]) {
                currentCrumbs.push({ label: breadcrumbNameMap[currentPath], path: currentPath });
            } else if (params.id && currentPath.startsWith('/mannequins/')) {
                const model = data?.models.find(m => m.id === params.id);
                if (model) currentCrumbs.push({ label: model.name, path: currentPath });
            } else if (params.slug && currentPath.startsWith('/magazine/')) {
                const article = data?.articles.find(a => a.slug === params.slug);
                if (article) currentCrumbs.push({ label: article.title, path: currentPath });
            }
        });
        return currentCrumbs;
    }, [location.pathname, params, data]);

    if (crumbs.length <= 1 || location.pathname.startsWith('/login') || location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="bg-black/20 border-b border-white/5 py-3 mb-8 print-hide">
            <div className="max-w-[1440px] mx-auto px-6 sm:px-12">
                <nav aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-white/40">
                        <li><Link to="/" className="hover:text-pm-gold transition-colors">Accueil</Link></li>
                        {crumbs.map((crumb, index) => (
                            <li key={crumb.path} className="flex items-center gap-2">
                                <ChevronRightIcon className="w-3 h-3 text-white/20" />
                                {index === crumbs.length - 1 ? (
                                    <span className="text-pm-gold">{crumb.label}</span>
                                ) : (
                                    <Link to={crumb.path} className="hover:text-pm-gold transition-colors">{crumb.label}</Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>
        </div>
    );
};

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data } = useData();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!user;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = data?.navLinks || [];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${
        isScrolled ? 'bg-pm-dark/80 backdrop-blur-xl py-4' : 'bg-transparent py-8'
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-6 sm:px-12 flex justify-between items-center">
        <Link to="/" className="z-50 group">
          <div className="flex items-center gap-3">
             <img src={data?.siteConfig.logo} alt="PMM" className="h-10 w-auto transition-transform duration-500 group-hover:scale-110" />
             <span className="hidden sm:block text-xs font-black tracking-[0.3em] text-pm-gold uppercase">Perfect Models</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-500 hover:text-pm-gold ${
                  isActive ? 'text-pm-gold' : 'text-white/60'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isLoggedIn ? (
             <button onClick={handleLogout} className="text-[10px] uppercase tracking-[0.3em] font-bold text-pm-gold flex items-center gap-2 hover:text-white transition-colors">
               <ArrowRightOnRectangleIcon className="w-4 h-4" />
               Sortie
             </button>
          ) : (
             <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 hover:text-pm-gold">Espace Pro</Link>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden lg:block">
           <Link to="/casting-formulaire" className="btn-premium">
              Rejoindre
           </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden z-50 text-pm-gold p-2">
          <AnimatedHamburgerIcon isOpen={isOpen} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-pm-dark z-40 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-y-0' : '-translate-y-full opacity-0'}`}>
          <div className="flex flex-col items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-4xl font-playfair font-black text-pm-off-white hover:text-pm-gold transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link to="/casting-formulaire" onClick={() => setIsOpen(false)} className="btn-premium mt-8 !px-12 !py-6 text-base">Postuler</Link>
            {isLoggedIn && <button onClick={handleLogout} className="text-sm font-bold text-pm-gold mt-4 uppercase tracking-widest">Se déconnecter</button>}
          </div>
      </div>
    </header>
  );
};

export default Header;
