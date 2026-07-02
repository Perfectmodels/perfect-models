import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import {
    UsersIcon, BookOpenIcon, NewspaperIcon, CalendarDaysIcon, Cog6ToothIcon, ClipboardDocumentListIcon,
    ArrowRightOnRectangleIcon, KeyIcon, AcademicCapIcon, ExclamationTriangleIcon, PresentationChartLineIcon,
    BuildingStorefrontIcon, SparklesIcon, ChatBubbleLeftRightIcon, BriefcaseIcon, EnvelopeIcon,
    ClipboardDocumentCheckIcon, CurrencyDollarIcon, CalendarIcon, PaintBrushIcon,
    SignalIcon, ArrowUpRightIcon, StarIcon, PlusIcon, PaperAirplaneIcon,
    Squares2X2Icon, ChartBarIcon, WrenchScrewdriverIcon,
    UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon, EyeIcon, EyeSlashIcon,
    BellIcon, BellSlashIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { requestNotificationPermission, getCachedFcmToken } from '../utils/fcmService';
import { ref, get } from 'firebase/database';
import { db } from '../realtimedbConfig';
import TrainingStatsWidget from '../components/TrainingStatsWidget';
import { loadProgressFromLocal } from '../utils/trainingHelpers';

// Import test utilities in development
if (import.meta.env.DEV) {
    import('../utils/testNotifications');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeAgo = (date: Date): string => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
};

type TabId = 'overview' | 'navigation' | 'system' | 'profile';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'overview',    label: 'Vue d\'ensemble', icon: ChartBarIcon },
    { id: 'navigation',  label: 'Navigation',      icon: Squares2X2Icon },
    { id: 'system',      label: 'Système',         icon: WrenchScrewdriverIcon },
    { id: 'profile',     label: 'Profil',          icon: UserCircleIcon },
];

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
    title: string; value: number; icon: React.ElementType;
    link: string; isNew?: boolean; accent?: string;
}> = ({ title, value, icon: Icon, link, isNew, accent = 'text-pm-gold' }) => (
    <Link to={link} className="glass-card p-4 sm:p-6 flex items-center gap-3 sm:gap-5 hover:border-white/20 transition-all group">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/40 flex items-center justify-center shrink-0 ${accent}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.35em] text-white/30 truncate">{title}</p>
            <p className={`text-2xl sm:text-4xl font-playfair font-black mt-1 ${isNew ? accent : 'text-white'}`}>{value}</p>
        </div>
        {isNew && <span className="ml-auto w-2 h-2 rounded-full bg-pm-gold animate-pulse shrink-0" />}
    </Link>
);

// ── DashboardCard ─────────────────────────────────────────────────────────────
const DashboardCard: React.FC<{
    title: string; icon: React.ElementType; link: string;
    description: string; notificationCount?: number; accent?: string;
}> = ({ title, icon: Icon, link, description, notificationCount, accent = 'text-pm-gold' }) => (
    <Link to={link} className="relative group glass-card p-6 hover:border-pm-gold/40 hover:-translate-y-1 transition-all duration-300">
        {notificationCount && notificationCount > 0 && (
            <span className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                {notificationCount}
            </span>
        )}
        <Icon className={`w-8 h-8 mb-4 ${accent} opacity-60 group-hover:opacity-100 transition-opacity`} />
        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white group-hover:text-pm-gold transition-colors mb-2">{title}</h3>
        <p className="text-[11px] text-white/30 leading-relaxed">{description}</p>
    </Link>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Admin: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { data, saveData } = useData();
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    // ── Profil admin ──────────────────────────────────────────────────────────
    const [editingProfile, setEditingProfile] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const profile = data?.adminProfile;
    const [profileForm, setProfileForm] = useState({
        name: '', email: '', phone: '', role: '', avatarUrl: '', username: '', password: '',
    });

    const startEditProfile = () => {
        if (!profile) return;
        setProfileForm({
            name: profile.name ?? '',
            email: profile.email ?? '',
            phone: profile.phone ?? '',
            role: profile.role ?? '',
            avatarUrl: profile.avatarUrl ?? '',
            username: profile.username ?? '',
            password: profile.password ?? '',
        });
        setEditingProfile(true);
    };

    const saveProfile = async () => {
        if (!data) return;
        setProfileSaving(true);
        try {
            await saveData({ ...data, adminProfile: { ...data.adminProfile, ...profileForm } });
            setEditingProfile(false);
        } catch (e) {
            console.error('Erreur sauvegarde profil:', e);
        } finally {
            setProfileSaving(false);
        }
    };

    // ── Notifications push ────────────────────────────────────────────────────
    const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

    useEffect(() => {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted' && getCachedFcmToken()) {
            setPushStatus('granted');
        } else if (Notification.permission === 'denied') {
            setPushStatus('denied');
        }
    }, []);

    const subscribePush = async () => {
        setPushStatus('loading');
        const token = await requestNotificationPermission();
        setPushStatus(token ? 'granted' : 'denied');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Stats des collections lazy — chargées via get() léger
    const [lazyStats, setLazyStats] = useState({ newCastingApps: 0, newBookingRequests: 0, newMessages: 0, newReservations: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [castingSnap, bookingSnap, msgSnap, fdSnap] = await Promise.all([
                    get(ref(db, 'castingApplications')),
                    get(ref(db, 'bookingRequests')),
                    get(ref(db, 'contactMessages')),
                    get(ref(db, 'fashionDayApplications')),
                ]);
                const toArr = (snap: any) => snap.exists() ? Object.values(snap.val()) : [];
                const castings = toArr(castingSnap) as any[];
                const bookings = toArr(bookingSnap) as any[];
                const msgs = toArr(msgSnap) as any[];
                const fds = toArr(fdSnap) as any[];
                setLazyStats({
                    newCastingApps: castings.filter(a => a.status === 'Nouveau').length,
                    newBookingRequests: bookings.filter(b => b.status === 'Nouveau').length,
                    newMessages: msgs.filter(m => m.status === 'Nouveau').length,
                    newReservations: fds.filter(f => f.status === 'Nouveau').length,
                });
            } catch (e) {
                console.error('Stats fetch error:', e);
            }
        };
        fetchCounts();
    }, []);

    const stats = useMemo(() => {
        if (!data) return { totalModels: 0, recentActivities: [] as any[] };
        const totalModels = data.models?.length || 0;
        return { totalModels, recentActivities: [] as any[] };
    }, [data]);

    // Charger la progression de formation
    const [trainingProgress, setTrainingProgress] = useState<any[]>([]);
    useEffect(() => {
        const progress = loadProgressFromLocal();
        setTrainingProgress(progress);
    }, []);

    const activityIconMap: Record<string, React.ElementType> = {
        casting: ClipboardDocumentListIcon,
        booking: BriefcaseIcon,
        message: EnvelopeIcon,
    };

    const quickActions = [
        { label: 'Ajouter Mannequin',  icon: PlusIcon,         link: '/admin/models',              color: 'bg-pm-gold text-pm-dark' },
        { label: 'Publier Article',    icon: NewspaperIcon,    link: '/admin/magazine',             color: 'bg-blue-600 text-white' },
        { label: 'Mailing',            icon: PaperAirplaneIcon,link: '/admin/mailing',              color: 'bg-purple-600 text-white' },
        { label: 'Nouvelle Édition PFD', icon: SparklesIcon,   link: '/admin/fashion-day-events',   color: 'bg-white/10 text-white' },
    ];

    return (
        <>
            <SEO title="Tableau de Bord Admin" noIndex />

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <span className="section-label">Perfect Models Management</span>
                    <h1 className="text-4xl font-playfair font-black text-white">Tableau de Bord</h1>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-red-400 transition-colors">
                    <ArrowRightOnRectangleIcon className="w-5 h-5" /> Déconnexion
                </button>
            </div>

            {/* ── Quick Actions ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
                {quickActions.map((a, i) => (
                    <Link key={i} to={a.link} className="flex items-center gap-3 p-4 border border-white/5 hover:border-white/20 transition-all group">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.color}`}>
                            <a.icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50 group-hover:text-white transition-colors leading-tight break-words">{a.label}</span>
                    </Link>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-white/5 mb-8 overflow-x-auto no-scrollbar">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3 sm:px-5 py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] border-b-2 -mb-px transition-all whitespace-nowrap ${
                                activeTab === tab.id ? 'border-pm-gold text-pm-gold' : 'border-transparent text-white/30 hover:text-white/60'
                            }`}>
                            <Icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Tab: Overview ── */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard title="Candidatures Casting" value={lazyStats.newCastingApps}    icon={ClipboardDocumentListIcon} link="/admin/casting-applications" isNew={lazyStats.newCastingApps > 0}    accent="text-pm-gold" />
                        <StatCard title="Demandes Booking"     value={lazyStats.newBookingRequests} icon={BriefcaseIcon}             link="/admin/bookings"            isNew={lazyStats.newBookingRequests > 0} accent="text-blue-400" />
                        <StatCard title="Réservations PFD"     value={lazyStats.newReservations}    icon={StarIcon}                  link="/admin/fashion-day-events"  isNew={lazyStats.newReservations > 0}    accent="text-purple-400" />
                        <StatCard title="Total Mannequins"     value={stats.totalModels}            icon={UsersIcon}                 link="/admin/models"                                                       accent="text-white/50" />
                    </div>

                    {/* Training Stats */}
                    <div className="mb-8">
                        <TrainingStatsWidget allProgress={trainingProgress} />
                    </div>

                    {/* Activity + Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Feed */}
                        <div className="lg:col-span-2 glass-card overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-white flex items-center gap-3">
                                    <SignalIcon className="w-4 h-4 text-pm-gold" /> Activités Récentes
                                </h2>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Nouvelles</span>
                            </div>
                            <div className="divide-y divide-white/5">
                                <div className="px-6 py-12 text-center text-white/20 text-xs italic">Consultez les sections dédiées pour les détails.</div>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-4">
                            <div className="glass-card p-6">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold mb-6">État du Système</h3>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Base de données', ok: true },
                                        { label: 'Stockage images', ok: true },
                                        { label: 'Service email', ok: true },
                                        { label: 'Notifications push', ok: true },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center justify-between">
                                            <span className="text-[11px] text-white/40">{s.label}</span>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                                                    {s.ok ? 'En ligne' : 'Hors ligne'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card p-6 border-pm-gold/20">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold mb-2">Version</p>
                                <p className="text-2xl font-playfair font-black text-white">2.5.0</p>
                                <p className="text-[10px] text-white/30 mt-1">Production · Stable</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Navigation ── */}
            {activeTab === 'navigation' && (
                <div className="space-y-10">
                    {[
                        {
                            label: 'Talents & Contenu',
                            cards: [
                                { title: 'Galerie',       icon: PhotoIcon,                 link: '/admin/gallery',               description: 'Photos et vidéos des prestations.' },
                                { title: 'Mannequins',    icon: UsersIcon,                 link: '/admin/models',                description: 'Profils, photos et informations.' },
                                { title: 'Magazine',      icon: NewspaperIcon,             link: '/admin/magazine',              description: 'Articles et contenu éditorial.' },
                                { title: 'Actualités',    icon: CalendarDaysIcon,          link: '/admin/news',                  description: 'Annonces et actualités.' },
                                { title: 'Agence',        icon: BuildingStorefrontIcon,    link: '/admin/agency',                description: 'Infos et chronologie de l\'agence.' },
                            ]
                        },
                        {
                            label: 'Recrutement',
                            cards: [
                                { title: 'Candidatures Casting',  icon: ClipboardDocumentListIcon,  link: '/admin/casting-applications',  description: 'Candidatures reçues.', notif: lazyStats.newCastingApps },
                                { title: 'Résultats Casting',     icon: ClipboardDocumentCheckIcon, link: '/admin/casting-results',       description: 'Scores et résultats du jury.' },
                                { title: 'Candidatures PFD',      icon: SparklesIcon,               link: '/admin/fashion-day-applications', description: 'Candidatures Perfect Fashion Day.' },
                                { title: 'Éditions PFD',          icon: PresentationChartLineIcon,  link: '/admin/fashion-day-events',    description: 'Gérer les éditions du PFD.' },
                            ]
                        },
                        {
                            label: 'Opérations',
                            cards: [
                                { title: 'Bookings',          icon: BriefcaseIcon,      link: '/admin/bookings',          description: 'Demandes de réservation.', notif: lazyStats.newBookingRequests },
                                { title: 'Paiements',         icon: CurrencyDollarIcon, link: '/admin/payments',          description: 'Suivi des paiements.' },
                                { title: 'Absences',          icon: CalendarIcon,       link: '/admin/absences',          description: 'Registre des présences.' },
                                { title: 'Direction Artistique', icon: PaintBrushIcon,  link: '/admin/artistic-direction', description: 'Briefs et directives créatives.' },
                            ]
                        },
                        {
                            label: 'Formation',
                            cards: [
                                { title: 'Formation Avancée', icon: AcademicCapIcon,      link: '/formation',                description: 'Modules de formation professionnelle.' },
                                { title: 'Progression',       icon: BookOpenIcon,         link: '/admin/classroom-progress', description: 'Suivi des mannequins.' },
                                { title: 'Accès Modèles',     icon: KeyIcon,              link: '/admin/model-access',       description: 'Identifiants et accès.' },
                                { title: 'Récupération',      icon: ExclamationTriangleIcon, link: '/admin/recovery-requests', description: 'Demandes de récupération.' },
                            ]
                        },
                        {
                            label: 'Communication',
                            cards: [
                                { title: 'Messages',      icon: EnvelopeIcon,             link: '/admin/messages',   description: 'Messages du formulaire contact.', notif: lazyStats.newMessages },
                                { title: 'Commentaires',  icon: ChatBubbleLeftRightIcon,  link: '/admin/comments',   description: 'Modération des commentaires.' },
                                { title: 'Mailing',       icon: PaperAirplaneIcon,        link: '/admin/mailing',    description: 'Campagnes email.' },
                            ]
                        },
                    ].map(group => (
                        <div key={group.label}>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-pm-gold/40 mb-4">{group.label}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {group.cards.map(c => (
                                    <DashboardCard key={c.link} title={c.title} icon={c.icon} link={c.link} description={c.description} notificationCount={(c as any).notif} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Tab: System ── */}
            {activeTab === 'system' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-8">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold mb-2">Informations Plateforme</h3>
                        <p className="text-[9px] text-white/20 mb-8">Les valeurs des clés sont masquées. Modifiez-les dans <Link to="/admin/settings" className="text-pm-gold hover:underline">Paramètres → Clés API</Link>.</p>
                        <div className="space-y-5">
                            {[
                                { label: 'Version',              value: '2.5.0-gold' },
                                { label: 'Environnement',        value: 'Production' },
                                { label: 'Framework',            value: 'React 18 + Vite' },
                                { label: 'Base de données',      value: 'Firebase Realtime DB' },
                                { label: 'Stockage',             value: 'ImgBB + Dropbox' },
                                { label: 'Email',                value: 'Brevo (SMTP)' },
                                { label: 'Notifications',        value: 'FCM Push' },
                                { label: 'Clé Brevo',            value: import.meta.env.VITE_BREVO_API_KEY ? '••••••••' + import.meta.env.VITE_BREVO_API_KEY.slice(-6) : 'Non configurée' },
                                { label: 'Clé ImgBB',            value: import.meta.env.VITE_IMGBB_API_KEY ? '••••••••' + import.meta.env.VITE_IMGBB_API_KEY.slice(-4) : 'Non configurée' },
                                { label: 'VAPID Key (FCM)',       value: import.meta.env.VITE_FIREBASE_VAPID_KEY ? '••••••••' + import.meta.env.VITE_FIREBASE_VAPID_KEY.slice(-6) : 'Non configurée' },
                                { label: 'Chatbot ID',           value: import.meta.env.VITE_CHATBOT_ID ? '••••••••' + import.meta.env.VITE_CHATBOT_ID.slice(-6) : 'Non configuré' },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{row.label}</span>
                                    <span className="text-[11px] font-medium text-white/70">{row.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-8">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">État des Services</h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Firebase Realtime DB', ok: true },
                                { label: 'Firebase Messaging',   ok: true },
                                { label: 'ImgBB Storage',        ok: !!import.meta.env.VITE_IMGBB_API_KEY || true },
                                { label: 'Brevo Email',          ok: !!import.meta.env.VITE_BREVO_API_KEY },
                                { label: 'Chatbase Widget',      ok: !!import.meta.env.VITE_CHATBOT_ID },
                                { label: 'Service Worker PWA',   ok: true },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{s.label}</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${s.ok ? 'text-green-400' : 'text-red-400'}`}>
                                            {s.ok ? 'Opérationnel' : 'Hors ligne'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2 glass-card p-8">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-pm-gold mb-8">Accès Rapide Configuration</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <DashboardCard title="Paramètres"   icon={Cog6ToothIcon}    link="/admin/settings"      description="Configuration générale." />
                            <DashboardCard title="Accès Modèles" icon={KeyIcon}         link="/admin/model-access"  description="Identifiants mannequins." />
                            <DashboardCard title="Récupération" icon={ExclamationTriangleIcon} link="/admin/recovery-requests" description="Demandes d'accès." />
                            <DashboardCard title="Mailing"      icon={PaperAirplaneIcon} link="/admin/mailing"      description="Campagnes email." />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Tab: Profile ── */}
            {activeTab === 'profile' && (
                <div className="max-w-2xl mx-auto">
                    <div className="glass-card p-8">
                        {/* Avatar + nom */}
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
                            <div className="relative shrink-0">
                                {(editingProfile ? profileForm.avatarUrl : profile?.avatarUrl) ? (
                                    <img src={editingProfile ? profileForm.avatarUrl : profile?.avatarUrl}
                                        alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-pm-gold/40" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-pm-gold/10 border-2 border-pm-gold/20 flex items-center justify-center">
                                        <UserCircleIcon className="w-10 h-10 text-pm-gold/40" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xl font-playfair font-black text-white">{profile?.name || 'Admin'}</p>
                                <p className="text-xs text-pm-gold/60 uppercase tracking-widest mt-1">{profile?.role || 'Administrateur'}</p>
                                <p className="text-xs text-white/30 mt-1">{profile?.email}</p>
                            </div>
                            {!editingProfile ? (
                                <button onClick={startEditProfile}
                                    className="flex items-center gap-2 text-xs text-pm-gold border border-pm-gold/30 px-4 py-2 rounded-lg hover:bg-pm-gold/10 transition-colors shrink-0">
                                    <PencilIcon className="w-3.5 h-3.5" /> Modifier
                                </button>
                            ) : (
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={saveProfile} disabled={profileSaving}
                                        className="flex items-center gap-1.5 text-xs text-green-400 border border-green-400/30 px-3 py-2 rounded-lg hover:bg-green-400/10 transition-colors disabled:opacity-50">
                                        {profileSaving
                                            ? <span className="loading loading-spinner loading-xs text-green-400" />
                                            : <CheckIcon className="w-3.5 h-3.5" />
                                        } Sauvegarder
                                    </button>
                                    <button onClick={() => setEditingProfile(false)}
                                        className="flex items-center gap-1.5 text-xs text-white/40 border border-white/10 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                        <XMarkIcon className="w-3.5 h-3.5" /> Annuler
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Champs */}
                        <div className="space-y-5">
                            {[
                                { label: 'Nom complet',   field: 'name',      type: 'text',  placeholder: 'Ex: Parfait Louis Asseko' },
                                { label: 'Email',         field: 'email',     type: 'email', placeholder: 'contact@perfectmodels.online' },
                                { label: 'Téléphone',     field: 'phone',     type: 'tel',   placeholder: '+241 077 00 00 00' },
                                { label: 'Rôle / Titre',  field: 'role',      type: 'text',  placeholder: 'Ex: Directeur Artistique' },
                                { label: "URL de l'avatar", field: 'avatarUrl', type: 'url', placeholder: 'https://...' },
                            ].map(({ label, field, type, placeholder }) => (
                                <div key={field}>
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 block">{label}</label>
                                    {editingProfile ? (
                                        <input type={type} value={profileForm[field as keyof typeof profileForm]}
                                            onChange={e => setProfileForm(f => ({ ...f, [field]: e.target.value }))}
                                            placeholder={placeholder}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold transition-colors" />
                                    ) : (
                                        <p className="text-sm text-white/70 py-2.5 border-b border-white/5">
                                            {(profile as any)?.[field] || <span className="text-white/20 italic">Non renseigné</span>}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {/* Identifiants */}
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold/60 mb-4">Identifiants de connexion</p>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 block">Nom d'utilisateur</label>
                                        {editingProfile ? (
                                            <input type="text" value={profileForm.username}
                                                onChange={e => setProfileForm(f => ({ ...f, username: e.target.value }))}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-pm-off-white font-mono focus:outline-none focus:border-pm-gold transition-colors" />
                                        ) : (
                                            <p className="text-sm font-mono text-pm-gold/80 py-2.5 border-b border-white/5">{profile?.username}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 block">Mot de passe</label>
                                        {editingProfile ? (
                                            <div className="relative">
                                                <input type={showPassword ? 'text' : 'password'} value={profileForm.password}
                                                    onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-pm-off-white font-mono focus:outline-none focus:border-pm-gold transition-colors" />
                                                <button type="button" onClick={() => setShowPassword(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                                                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-sm font-mono text-white/30 py-2.5 border-b border-white/5">••••••••••</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Notifications push */}
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold/60 mb-4">Notifications Push</p>
                                <div className="flex items-center justify-between p-4 bg-white/3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        {pushStatus === 'granted'
                                            ? <BellIcon className="w-5 h-5 text-green-400" />
                                            : <BellSlashIcon className="w-5 h-5 text-white/30" />
                                        }
                                        <div>
                                            <p className="text-xs font-bold text-white/70">
                                                {pushStatus === 'granted' ? 'Notifications activées' :
                                                 pushStatus === 'denied'  ? 'Notifications bloquées' :
                                                 'Recevoir les alertes sur cet appareil'}
                                            </p>
                                            <p className="text-[10px] text-white/30 mt-0.5">
                                                {pushStatus === 'granted' ? 'Visites, soumissions et messages en temps réel.' :
                                                 pushStatus === 'denied'  ? 'Autorisez les notifications dans les paramètres du navigateur.' :
                                                 'Visites, castings, bookings, messages.'}
                                            </p>
                                        </div>
                                    </div>
                                    {pushStatus !== 'denied' && pushStatus !== 'granted' && (
                                        <button onClick={subscribePush} disabled={pushStatus === 'loading'}
                                            className="shrink-0 flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-pm-gold text-pm-dark px-4 py-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50">
                                            {pushStatus === 'loading'
                                                ? <span className="loading loading-spinner loading-xs text-pm-dark" />
                                                : <BellIcon className="w-3.5 h-3.5" />
                                            }
                                            Activer
                                        </button>
                                    )}
                                    {pushStatus === 'granted' && (
                                        <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-400">
                                            <CheckIcon className="w-3.5 h-3.5" /> Actif
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Admin;
