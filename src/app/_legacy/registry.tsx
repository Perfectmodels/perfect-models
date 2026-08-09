'use client';

import dynamic from 'next/dynamic';

export const Home = dynamic(() => import('@/legacy-pages/Home'), { ssr: false });
export const Agency = dynamic(() => import('@/legacy-pages/Agency'), { ssr: false });
export const Models = dynamic(() => import('@/legacy-pages/Models'), { ssr: false });
export const ModelDetail = dynamic(() => import('@/legacy-pages/ModelDetail'), { ssr: false });
export const FashionDay = dynamic(() => import('@/legacy-pages/FashionDay'), { ssr: false });
export const Magazine = dynamic(() => import('@/legacy-pages/Magazine'), { ssr: false });
export const ArticleDetail = dynamic(() => import('@/legacy-pages/ArticleDetail'), { ssr: false });
export const Contact = dynamic(() => import('@/legacy-pages/Contact'), { ssr: false });
export const Services = dynamic(() => import('@/legacy-pages/Services'), { ssr: false });
export const ServiceDetail = dynamic(() => import('@/legacy-pages/ServiceDetail'), { ssr: false });
export const Casting = dynamic(() => import('@/legacy-pages/Casting'), { ssr: false });
export const CastingForm = dynamic(() => import('@/legacy-pages/CastingForm'), { ssr: false });
export const FashionDayApplicationForm = dynamic(() => import('@/legacy-pages/FashionDayApplicationForm'), { ssr: false });
export const Login = dynamic(() => import('@/legacy-pages/Login'), { ssr: false });
export const PhoneLogin = dynamic(() => import('@/legacy-pages/PhoneLogin'), { ssr: false });
export const PrivacyPolicy = dynamic(() => import('@/legacy-pages/PrivacyPolicy'), { ssr: false });
export const TermsOfUse = dynamic(() => import('@/legacy-pages/TermsOfUse'), { ssr: false });
export const Gallery = dynamic(() => import('@/legacy-pages/Gallery'), { ssr: false });
export const MissOneLight = dynamic(() => import('@/legacy-pages/MissOneLight'), { ssr: false });
export const AdvancedTraining = dynamic(() => import('@/legacy-pages/AdvancedTraining'), { ssr: false });
export const TrainingModuleView = dynamic(() => import('@/legacy-pages/TrainingModuleView'), { ssr: false });
export const Activity = dynamic(() => import('@/legacy-pages/Activity'), { ssr: false });
export const ClassroomForum = dynamic(() => import('@/legacy-pages/ClassroomForum'), { ssr: false });
export const ForumThread = dynamic(() => import('@/legacy-pages/ForumThread'), { ssr: false });
export const ChapterDetail = dynamic(() => import('@/legacy-pages/ChapterDetail'), { ssr: false });
export const ModelDashboard = dynamic(() => import('@/legacy-pages/ModelDashboard'), { ssr: false });
export const JuryCasting = dynamic(() => import('@/legacy-pages/JuryCasting'), { ssr: false });
export const RegistrationCasting = dynamic(() => import('@/legacy-pages/RegistrationCasting'), { ssr: false });
export const Admin = dynamic(() => import('@/legacy-pages/Admin'), { ssr: false });
export const AdminModels = dynamic(() => import('@/legacy-pages/AdminModels'), { ssr: false });
export const AdminMediaLibrary = dynamic(() => import('@/legacy-pages/AdminMediaLibrary'), { ssr: false });
export const AdminMagazine = dynamic(() => import('@/legacy-pages/AdminMagazine'), { ssr: false });
export const AdminClassroom = dynamic(() => import('@/legacy-pages/AdminClassroom'), { ssr: false });
export const AdminSettings = dynamic(() => import('@/legacy-pages/AdminSettings'), { ssr: false });
export const AdminAgency = dynamic(() => import('@/legacy-pages/AdminAgency'), { ssr: false });
export const AdminCasting = dynamic(() => import('@/legacy-pages/AdminCasting'), { ssr: false });
export const AdminCastingResults = dynamic(() => import('@/legacy-pages/AdminCastingResults'), { ssr: false });
export const AdminFashionDay = dynamic(() => import('@/legacy-pages/AdminFashionDay'), { ssr: false });
export const AdminFashionDayEvents = dynamic(() => import('@/legacy-pages/AdminFashionDayEvents'), { ssr: false });
export const AdminNews = dynamic(() => import('@/legacy-pages/AdminNews'), { ssr: false });
export const AdminClassroomProgress = dynamic(() => import('@/legacy-pages/AdminClassroomProgress'), { ssr: false });
export const AdminModelAccess = dynamic(() => import('@/legacy-pages/AdminModelAccess'), { ssr: false });
export const AdminRecovery = dynamic(() => import('@/legacy-pages/AdminRecovery'), { ssr: false });
export const AdminComments = dynamic(() => import('@/legacy-pages/AdminComments'), { ssr: false });
export const AdminMessages = dynamic(() => import('@/legacy-pages/AdminMessages'), { ssr: false });
export const AdminBookings = dynamic(() => import('@/legacy-pages/AdminBookings'), { ssr: false });
export const AdminPayments = dynamic(() => import('@/legacy-pages/AdminPayments'), { ssr: false });
export const AdminAbsences = dynamic(() => import('@/legacy-pages/AdminAbsences'), { ssr: false });
export const AdminArtisticDirection = dynamic(() => import('@/legacy-pages/AdminArtisticDirection'), { ssr: false });
export const ImageGeneration = dynamic(() => import('@/legacy-pages/ImageGeneration'), { ssr: false });
export const ImageAnalysis = dynamic(() => import('@/legacy-pages/ImageAnalysis'), { ssr: false });
export const LiveChat = dynamic(() => import('@/legacy-pages/LiveChat'), { ssr: false });
export const AdminGallery = dynamic(() => import('@/legacy-pages/AdminGallery'), { ssr: false });
export const AdminMailing = dynamic(() => import('@/legacy-pages/AdminMailing'), { ssr: false });
export const AdminMissOneLight = dynamic(() => import('@/legacy-pages/AdminMissOneLight'), { ssr: false });
export const AdminBeautyContest = dynamic(() => import('@/legacy-pages/AdminBeautyContest'), { ssr: false });
export const AdminFirebaseSetup = dynamic(() => import('@/legacy-pages/AdminFirebaseSetup'), { ssr: false });
export const NotFound = dynamic(() => import('@/legacy-pages/NotFound'), { ssr: false });

export const legacyPages = {
  Home, Agency, Models, ModelDetail, FashionDay, Magazine, ArticleDetail, Contact, Services, ServiceDetail,
  Casting, CastingForm, FashionDayApplicationForm, Login, PhoneLogin, PrivacyPolicy, TermsOfUse, Gallery, MissOneLight,
  AdvancedTraining, TrainingModuleView, Activity, ClassroomForum, ForumThread, ChapterDetail, ModelDashboard,
  JuryCasting, RegistrationCasting, Admin, AdminModels, AdminMediaLibrary, AdminMagazine, AdminClassroom, AdminSettings,
  AdminAgency, AdminCasting, AdminCastingResults, AdminFashionDay, AdminFashionDayEvents, AdminNews, AdminClassroomProgress,
  AdminModelAccess, AdminRecovery, AdminComments, AdminMessages, AdminBookings, AdminPayments, AdminAbsences,
  AdminArtisticDirection, ImageGeneration, ImageAnalysis, LiveChat, AdminGallery, AdminMailing, AdminMissOneLight,
  AdminBeautyContest, AdminFirebaseSetup, NotFound,
} as const;

export type LegacyPageName = keyof typeof legacyPages;
