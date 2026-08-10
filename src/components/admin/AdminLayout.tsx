import React, { useState, useCallback } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
    HomeIcon, UsersIcon, PhotoIcon, NewspaperIcon, CalendarDaysIcon, Cog6ToothIcon, ClipboardDocumentListIcon,
    KeyIcon, PresentationChartLineIcon,
    BuildingStorefrontIcon, SparklesIcon, ChatBubbleLeftRightIcon, BriefcaseIcon,
    ClipboardDocumentCheckIcon, CurrencyDollarIcon, CalendarIcon, PaintBrushIcon,
    Bars3Icon, XMarkIcon,
    BookOpenIcon,
    PaperAirplaneIcon,
    BellIcon,
    BellSlashIcon,
    AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { useToast } from '../ui/Toast';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, onClick }) => (
    <NavLink
        to={to}
        end={to === '/admin'}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                isActive
                    ? 'bg-pm-gold text-pm-dark shadow-xl shadow-pm-gold/10'
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
            }`
        }
    >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="truncate">{label}</span>
    </NavLink>
);

const navSections = [
    {
        title: 'Principal',
        links: [
            { to: '/admin', icon: HomeIcon, label: 'Tableau de Bord' },
            { to: '/admin/models', icon: UsersIcon, label: 'Mannequins' },
            { to: '/admin/media-library', icon: PhotoIcon, label: 'Médiathèque' },
            { to: '/admin/magazine', icon: NewspaperIcon, label: 'Magazine' },
            { to: '/admin/bookings', icon: BriefcaseIcon, label: 'Réservations' },
            { to: '/admin/messages', icon: ChatBubbleLeftRightIcon, label: 'Messages' },
            { to: '/admin/comments', icon: ClipboardDocumentListIcon, label: 'Commentaires' },
            { to: '/admin/news', icon: NewspaperIcon, label: 'Actualités' },
            { to: '/admin/agency', icon: BuildingStorefrontIcon, label: 'Agence' },
        ]
    },
    {
        title: 'Recrutement',
        links: [
            { to: '/admin/casting-applications', icon: ClipboardDocumentListIcon, label: 'Candidatures' },
            { to: '/admin/casting-results', icon: ClipboardDocumentCheckIcon, label: 'Notation' },
            { to: '/admin/fashion-day-applications', icon: SparklesIcon, label: 'Candidatures PFD' },
            { to: '/admin/fashion-day-events', icon: CalendarDaysIcon, label: 'Événements PFD' },
            { to: '/admin/recovery-requests', icon: KeyIcon, label: 'Récupérations' },
        ]
    },
    {
        title: 'Opérations',
        links: [
            { to: '/formation', icon: AcademicCapIcon, label: 'Formation Avancée' },
            { to: '/admin/classroom-progress', icon: PresentationChartLineIcon, label: 'Progression' },
            { to: '/admin/model-access', icon: KeyIcon, label: 'Accès Modèles' },
            { to: '/admin/absences', icon: CalendarIcon, label: 'Présences'},
            { to: '/admin/payments', icon: CurrencyDollarIcon, label: 'Finances' },
            { to: '/admin/artistic-direction', icon: PaintBrushIcon, label: 'Direction Artistique' },
        ]
    },
    {
        title: 'Système',
        links: [
            { to: '/admin/mailing', icon: PaperAirplaneIcon, label: 'Mailing' },
            { to: '/admin/settings', icon: Cog6ToothIcon, label: 'Configuration' },
        ]
    }
];

const Sidebar: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => (
    <nav className="flex flex-col gap-y-10">
        {navSections.map(section => (
            <div key={section.title}>
                <h3 className="px-4 text-[9px] font-black uppercase text-pm-gold/40 tracking-[0.4em] mb-4">{section.title}</h3>
                <div className="space-y-1">
                    {section.links.map(link => <NavItem key={link.to} {...link} onClick={onLinkClick} />)}
                </div>
            </div>
        ))}
    </nav>
);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { info } = useToast();

    const handleNotification = useCallback((n: { title: string; body: string }) => {
        info(`${n.title} — ${n.body}`);
    }, [info]);

    const { permission, isLoading, subscribe } = usePushNotifications(handleNotification);

    const handleBellClick = async () => {
        if (permission === 'granted') return;
        await subscribe();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-pm-off-white flex">
            {/* Sidebar for Desktop */}
            <aside className="hidden lg:flex lg:flex-col lg:w-72 fixed top-0 left-0 h-full bg-pm-dark border-r border-white/5 p-8 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 mb-16 px-4">
                    <div className="w-9 h-9 rounded-lg bg-pm-gold/10 border border-pm-gold/30 flex items-center justify-center shrink-0">
                        <span className="text-pm-gold font-playfair font-black text-[10px]">PMM</span>
                    </div>
                    <div>
                        <h1 className="font-playfair text-sm font-black text-white italic leading-none">Admin Panel</h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-pm-gold/40 mt-0.5">Perfect Models</p>
                    </div>
                </div>
                <Sidebar />
            </aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)} 
                            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-pm-dark border-r border-white/5 p-8 overflow-y-auto lg:hidden"
                        >
                            <div className="flex items-center justify-between mb-16 px-4">
                                <h1 className="font-playfair text-xl font-black italic">Admin Panel</h1>
                                <button onClick={() => setSidebarOpen(false)} className="text-white/40 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                            </div>
                            <Sidebar onLinkClick={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex flex-col flex-1 lg:pl-72 min-w-0">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-pm-dark/60 backdrop-blur-xl px-4 sm:px-6 lg:px-10">
                    <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-pm-off-white/80 shrink-0">
                            <Bars3Icon className="w-6 h-6" />
                        </button>
                        <div className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-pm-gold truncate">
                            {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Tableau de Bord'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <button
                            onClick={handleBellClick}
                            disabled={isLoading || permission === 'denied'}
                            title={
                                permission === 'granted' ? 'Notifications activées'
                                : permission === 'denied' ? 'Notifications bloquées (modifier dans le navigateur)'
                                : 'Activer les notifications push'
                            }
                            className={`p-2 rounded-full transition-all duration-300 ${
                                permission === 'granted'
                                    ? 'text-pm-gold'
                                    : permission === 'denied'
                                    ? 'text-white/20 cursor-not-allowed'
                                    : 'text-white/40 hover:text-pm-gold hover:bg-pm-gold/10'
                            }`}
                        >
                            {isLoading
                                ? <span className="loading loading-spinner loading-sm text-pm-gold" />
                                : permission === 'granted'
                                ? <BellIcon className="w-5 h-5" />
                                : <BellSlashIcon className="w-5 h-5" />
                            }
                        </button>
                        <Link to="/" className="hidden sm:block text-[9px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-pm-gold transition-colors whitespace-nowrap">Site Public</Link>
                        <div className="w-8 h-8 rounded-full bg-pm-gold/20 border border-pm-gold/40 flex items-center justify-center text-pm-gold text-[10px] font-bold shrink-0">AD</div>
                    </div>
                </header>
                <main className="p-4 sm:p-6 lg:p-10 xl:p-16 min-w-0 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
