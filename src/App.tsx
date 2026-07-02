
import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { DataProvider, useData } from './contexts/DataContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/icons/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { PWAInstaller } from './components/PWAInstaller';
import { registerServiceWorker } from './utils/pwa';
import { restoreFcmSession } from './utils/fcmService';
import { notifyAdmin } from './utils/adminNotify';
import { useCapacitor } from './hooks/useCapacitor';
import { initNativePush } from './utils/nativePush';

// Lazy-loaded Pages
const Home = lazy(() => import('./pages/Home'));
const Agency = lazy(() => import('./pages/Agency'));
const Models = lazy(() => import('./pages/Models'));
const ModelDetail = lazy(() => import('./pages/ModelDetail'));
const FashionDay = lazy(() => import('./pages/FashionDay'));
const Magazine = lazy(() => import('./pages/Magazine'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Casting = lazy(() => import('./pages/Casting'));
const CastingForm = lazy(() => import('./pages/CastingForm'));
const FashionDayApplicationForm = lazy(() => import('./pages/FashionDayApplicationForm'));
const Login = lazy(() => import('./pages/Login'));
const PhoneLogin = lazy(() => import('./pages/PhoneLogin'));
const Activity = lazy(() => import('./pages/Activity')); // Renamed Formations
const ChapterDetail = lazy(() => import('./pages/ChapterDetail'));
const ModelDashboard = lazy(() => import('./pages/ModelDashboard')); // Profil
const ClassroomForum = lazy(() => import('./pages/ClassroomForum'));
const ForumThread = lazy(() => import('./pages/ForumThread'));
// FIX: Removed Beginner Classroom pages as the feature has been deprecated.
const Gallery = lazy(() => import('./pages/Gallery'));
const ImageGeneration = lazy(() => import('./pages/ImageGeneration'));
const ImageAnalysis = lazy(() => import('./pages/ImageAnalysis'));
const LiveChat = lazy(() => import('./pages/LiveChat'));

// Formation Avancée
const AdvancedTraining = lazy(() => import('./pages/AdvancedTraining'));
const TrainingModuleView = lazy(() => import('./pages/TrainingModuleView'));


// Admin Pages
const Admin = lazy(() => import('./pages/Admin'));
const AdminAgency = lazy(() => import('./pages/AdminAgency'));
const AdminCasting = lazy(() => import('./pages/AdminCasting'));
const AdminCastingResults = lazy(() => import('./pages/AdminCastingResults'));
const AdminClassroom = lazy(() => import('./pages/AdminClassroom'));
const AdminClassroomProgress = lazy(() => import('./pages/AdminClassroomProgress'));
const AdminFashionDay = lazy(() => import('./pages/AdminFashionDay'));
const AdminFashionDayEvents = lazy(() => import('./pages/AdminFashionDayEvents'));
// FIX: Corrected import paths for Admin pages to resolve module not found errors.
const AdminMagazine = lazy(() => import('./pages/AdminMagazine'));
const AdminModelAccess = lazy(() => import('./pages/AdminModelAccess'));
const AdminModels = lazy(() => import('./pages/AdminModels'));
const AdminNews = lazy(() => import('./pages/AdminNews'));
const AdminRecovery = lazy(() => import('./pages/AdminRecovery'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminComments = lazy(() => import('./pages/AdminComments'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const AdminMessages = lazy(() => import('./pages/AdminMessages'));
// FIX: Removed AdminBeginnerStudents as the feature has been deprecated.
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminAbsences = lazy(() => import('./pages/AdminAbsences'));
const AdminArtisticDirection = lazy(() => import('./pages/AdminArtisticDirection'));
const AdminGallery = lazy(() => import('./pages/AdminGallery'));
const AdminMailing = lazy(() => import('./pages/AdminMailing'));
const MissOneLight = lazy(() => import('./pages/MissOneLight'));
const AdminMissOneLight = lazy(() => import('./pages/AdminMissOneLight'));
const AdminBeautyContest = lazy(() => import('./pages/AdminBeautyContest'));
const AdminFirebaseSetup = lazy(() => import('./pages/AdminFirebaseSetup'));


// Role-specific pages
const JuryCasting = lazy(() => import('./pages/JuryCasting'));
const RegistrationCasting = lazy(() => import('./pages/RegistrationCasting'));

// Static Pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminMediaLibrary = lazy(() => import('./pages/AdminMediaLibrary'));


const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const LoadingFallback: React.FC = () => (
    <div className="w-full h-screen flex items-center justify-center bg-pm-dark">
        <img src="/logo.svg" alt="PMM" className="w-24 h-24 animate-pulse" />
    </div>
);

const pageVariants = {
    initial: {
        opacity: 0,
    },
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    }
};

const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.5
};


const AnimatedRoutes: React.FC = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
            >
                <Routes location={location}>
                    <Route path="/" element={<Home />} />
                    <Route path="/agence" element={<Agency />} />
                    <Route path="/mannequins" element={<Models />} />
                    <Route path="/mannequins/:id" element={<ModelDetail />} />
                    <Route path="/fashion-day" element={<FashionDay />} />
                    <Route path="/magazine" element={<Magazine />} />
                    <Route path="/magazine/:slug" element={<ArticleDetail />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:slug" element={<ServiceDetail />} />
                    <Route path="/casting" element={<Casting />} />
                    <Route path="/casting-formulaire" element={<CastingForm />} />
                    <Route path="/fashion-day-application" element={<FashionDayApplicationForm />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/login/phone" element={<PhoneLogin />} />
                    <Route path="/login/migration" element={<Navigate to="/login" replace />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />
                    <Route path="/galerie" element={<Gallery />} />
                    <Route path="/miss-one-light" element={<MissOneLight />} />
                    
                    {/* Formation Avancée - Accessible uniquement aux mannequins et admin */}
                    <Route path="/formation" element={<ProtectedRoute role="student"><AdvancedTraining /></ProtectedRoute>} />
                    <Route path="/formation/module/:moduleId" element={<ProtectedRoute role="student"><TrainingModuleView /></ProtectedRoute>} />

                    {/* Protected Routes */}
                    <Route path="/formations" element={<ProtectedRoute role="student"><Activity /></ProtectedRoute>} />
                    <Route path="/formations/forum" element={<ProtectedRoute role="student"><ClassroomForum /></ProtectedRoute>} />
                    <Route path="/formations/forum/:threadId" element={<ProtectedRoute role="student"><ForumThread /></ProtectedRoute>} />
                    <Route path="/formations/:moduleSlug/:chapterSlug" element={<ProtectedRoute role="student"><ChapterDetail /></ProtectedRoute>} />
                    <Route path="/profil" element={<ProtectedRoute role="student"><ModelDashboard /></ProtectedRoute>} />

                    {/* FIX: Removed Beginner Classroom routes as the feature has been deprecated. */}

                    <Route path="/jury/casting" element={<ProtectedRoute role="jury"><JuryCasting /></ProtectedRoute>} />
                    <Route path="/enregistrement/casting" element={<ProtectedRoute role="registration"><RegistrationCasting /></ProtectedRoute>} />

                    <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
                    <Route path="/admin/models" element={<ProtectedRoute role="admin"><AdminModels /></ProtectedRoute>} />
                    <Route path="/admin/media-library" element={<ProtectedRoute role="admin"><AdminMediaLibrary /></ProtectedRoute>} />
                    <Route path="/admin/magazine" element={<ProtectedRoute role="admin"><AdminMagazine /></ProtectedRoute>} />
                    <Route path="/admin/classroom" element={<ProtectedRoute role="admin"><AdminClassroom /></ProtectedRoute>} />
                    <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
                    <Route path="/admin/agency" element={<ProtectedRoute role="admin"><AdminAgency /></ProtectedRoute>} />
                    <Route path="/admin/casting-applications" element={<ProtectedRoute role="admin"><AdminCasting /></ProtectedRoute>} />
                    <Route path="/admin/casting-results" element={<ProtectedRoute role="admin"><AdminCastingResults /></ProtectedRoute>} />
                    <Route path="/admin/fashion-day-applications" element={<ProtectedRoute role="admin"><AdminFashionDay /></ProtectedRoute>} />
                    <Route path="/admin/fashion-day-events" element={<ProtectedRoute role="admin"><AdminFashionDayEvents /></ProtectedRoute>} />
                    <Route path="/admin/news" element={<ProtectedRoute role="admin"><AdminNews /></ProtectedRoute>} />
                    <Route path="/admin/classroom-progress" element={<ProtectedRoute role="admin"><AdminClassroomProgress /></ProtectedRoute>} />
                    <Route path="/admin/model-access" element={<ProtectedRoute role="admin"><AdminModelAccess /></ProtectedRoute>} />
                    {/* FIX: Removed AdminBeginnerStudents route as the feature has been deprecated. */}
                    <Route path="/admin/recovery-requests" element={<ProtectedRoute role="admin"><AdminRecovery /></ProtectedRoute>} />
                    <Route path="/admin/comments" element={<ProtectedRoute role="admin"><AdminComments /></ProtectedRoute>} />
                    <Route path="/admin/messages" element={<ProtectedRoute role="admin"><AdminMessages /></ProtectedRoute>} />
                    <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>} />
                    <Route path="/admin/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
                    <Route path="/admin/absences" element={<ProtectedRoute role="admin"><AdminAbsences /></ProtectedRoute>} />
                    <Route path="/admin/artistic-direction" element={<ProtectedRoute role="admin"><AdminArtisticDirection /></ProtectedRoute>} />
                    <Route path="/admin/generer-image" element={<ProtectedRoute role="admin"><ImageGeneration /></ProtectedRoute>} />
                    <Route path="/admin/analyser-image" element={<ProtectedRoute role="admin"><ImageAnalysis /></ProtectedRoute>} />
                    <Route path="/admin/live-chat" element={<ProtectedRoute role="admin"><LiveChat /></ProtectedRoute>} />
                    <Route path="/admin/gallery" element={<ProtectedRoute role="admin"><AdminGallery /></ProtectedRoute>} />
                    <Route path="/admin/mailing" element={<ProtectedRoute role="admin"><AdminMailing /></ProtectedRoute>} />
                    <Route path="/admin/miss-one-light" element={<ProtectedRoute role="admin"><AdminMissOneLight /></ProtectedRoute>} />
                    <Route path="/admin/beauty-contests" element={<ProtectedRoute role="admin"><AdminBeautyContest /></ProtectedRoute>} />
                    <Route path="/admin/firebase-setup" element={<ProtectedRoute role="admin"><AdminFirebaseSetup /></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </motion.div>
        </AnimatePresence>
    );
};

// Pages publiques qui déclenchent une notif de visite
const PUBLIC_PATHS = ['/', '/agence', '/mannequins', '/fashion-day', '/magazine', '/services', '/casting', '/contact'];

const AppContent: React.FC = () => {
    const location = useLocation();
    const { data } = useData();
    const { user } = useAuth();
    const notifiedPaths = useRef<Set<string>>(new Set());

    // Restaurer la session FCM dès que l'admin est authentifié via Firebase
    useEffect(() => {
        if (user?.role === 'admin') {
            restoreFcmSession().catch(() => {});
        }
    }, [user?.role]);

    // Notif visite — une seule fois par chemin par session
    useEffect(() => {
        const path = location.pathname;
        if (!PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/')) ) return;
        if (notifiedPaths.current.has(path)) return;
        notifiedPaths.current.add(path);

        const pageName = path === '/' ? 'Accueil' : path.replace('/', '').replace(/-/g, ' ');
        notifyAdmin('visit', `Page visitée : ${pageName}`).catch(() => {});
    }, [location.pathname]);

    // Notification logic for browser tab title + effacement badge quand admin est actif
    useEffect(() => {
        const originalTitle = "Perfect Models Management";
        if (data && location.pathname.startsWith('/admin')) {
            const newCastingApps = data.castingApplications?.filter(app => app.status === 'Nouveau').length || 0;
            const newFashionDayApps = data.fashionDayApplications?.filter(app => app.status === 'Nouveau').length || 0;
            const newRecoveryRequests = data.recoveryRequests?.filter(req => req.status === 'Nouveau').length || 0;
            const newBookingRequests = data.bookingRequests?.filter(req => req.status === 'Nouveau').length || 0;
            const newMessages = data.contactMessages?.filter(msg => msg.status === 'Nouveau').length || 0;

            const totalNotifications = newCastingApps + newFashionDayApps + newRecoveryRequests + newBookingRequests + newMessages;

            if (totalNotifications > 0) {
                document.title = `(${totalNotifications}) Admin | ${originalTitle}`;
            } else {
                document.title = `Admin | ${originalTitle}`;
            }

            // Effacer le badge de l'app quand l'admin est sur le panel
            if ('clearAppBadge' in navigator) {
                (navigator as any).clearAppBadge().catch(() => {});
            }
            // Signaler au service worker d'effacer le badge
            navigator.serviceWorker?.ready.then(reg => {
                reg.active?.postMessage({ type: 'CLEAR_BADGE' });
            }).catch(() => {});
        } else {
            if (document.title.startsWith('(') || document.title.startsWith('Admin |')) {
                document.title = originalTitle;
            }
        }

        return () => {
            document.title = originalTitle;
        };
    }, [location.pathname, data]);

    // Dropbox Dynamic Sync
    useEffect(() => {
        if (data?.apiKeys?.dropboxAccessToken) {
            import('./utils/dropboxService').then(({ dropboxService }) => {
                dropboxService.updateToken(data.apiKeys.dropboxAccessToken!);
            });
        }
    }, [data?.apiKeys?.dropboxAccessToken]);


    return (
        <Layout>
            <Suspense fallback={<LoadingFallback />}>
                <AnimatedRoutes />
            </Suspense>
        </Layout>
    );
}

const App: React.FC = () => {
    const { isNative } = useCapacitor();

    useEffect(() => {
        if (isNative) {
            // Native mobile: use Capacitor push notifications
            initNativePush();
        } else {
            // Web: enregistrement du service worker (FCM géré dans AppContent selon l'état auth)
            registerServiceWorker();
        }
    }, [isNative]);

    return (
        <DataProvider>
            <AuthProvider>
                <ToastProvider>
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                         <ScrollToTop />
                         <AppContent />
                         <PWAInstaller />
                     </BrowserRouter>
                </ToastProvider>
            </AuthProvider>
        </DataProvider>
    );
};

export default App;
