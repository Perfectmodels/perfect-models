
export interface ModelCollaboration {
  id: string;
  title: string;
  clientOrBrand?: string;
  type?: 'Fashion Day' | 'Shooting' | 'Défilé' | 'Campagne' | 'Presse' | 'Autre';
  date?: string;
  imageUrl?: string;
  galleryImages?: string[];
  link?: string;
}

export interface Model {
  id: string;
  name: string;
  username: string;
  password: string;
  email?: string;
  firebaseUid?: string;
  phone?: string;
  age?: number;
  height: string;
  gender: 'Homme' | 'Femme';
  location?: string;
  imageUrl: string;
  portfolioImages?: string[];
  distinctions?: ModelDistinction[];
  collaborations?: ModelCollaboration[];
  fashionDayEditions?: number[];
  taggedGalleryIds?: string[];
  isPublic?: boolean; 
  level?: 'Pro' | 'Débutant';
  permissions?: UserPermissions;
  measurements: {
    chest: string;
    waist: string;
    hips: string;
    shoeSize: string;
  };
  categories: string[];
  experience: string;
  journey: string;
  quizScores: { 
    [chapterSlug: string]: {
      score: number;
      total: number;
      timesLeft: number;
      timestamp: string;
    } 
  };
  lastLogin?: string;
  lastActivity?: string;
}

// ── Permissions granulaires par utilisateur ───────────────────────────────────
export interface UserPermissions {
  // Mannequins
  canAccessFormation?: boolean;       // Formation avancée
  canAccessClassroom?: boolean;       // Classroom (cours de base)
  canAccessForum?: boolean;           // Forum de la classe
  canViewPhotoshootBriefs?: boolean;  // Briefings photoshoots
  canViewResults?: boolean;           // Résultats et scores
  canEditProfile?: boolean;           // Modification du profil public
  // Jury
  canScoreCasting?: boolean;          // Notation casting
  canViewAllCandidates?: boolean;     // Voir toutes les candidatures
  // Staff
  canRegisterCandidates?: boolean;    // Enregistrement candidatures
  canPrintList?: boolean;             // Impression liste
  // Général
  isActive?: boolean;                 // Compte actif/suspendu
}

// ── Permissions d'accès aux pages admin (pour les délégués admin) ─────────────
export interface AdminPagePermissions {
  dashboard?: boolean;              // /admin — Tableau de bord
  models?: boolean;                 // /admin/models — Mannequins
  absences?: boolean;               // /admin/absences — Absences
  agency?: boolean;                 // /admin/agency — Agence
  artisticDirection?: boolean;      // /admin/artistic-direction — Direction artistique
  beautyContests?: boolean;         // /admin/beauty-contests — Concours beauté
  bookings?: boolean;               // /admin/bookings — Réservations
  castingApplications?: boolean;    // /admin/casting-applications — Candidatures casting
  castingResults?: boolean;         // /admin/casting-results — Résultats casting
  classroom?: boolean;              // /admin/classroom — Classroom
  classroomProgress?: boolean;      // /admin/classroom-progress — Progression
  comments?: boolean;               // /admin/comments — Commentaires
  fashionDayApplications?: boolean; // /admin/fashion-day-applications — Dossiers Fashion Day
  fashionDayEvents?: boolean;       // /admin/fashion-day-events — Événements Fashion Day
  gallery?: boolean;                // /admin/gallery — Galerie
  imageAnalysis?: boolean;          // /admin/analyser-image — Analyse IA
  imageGeneration?: boolean;        // /admin/generer-image — Génération IA
  liveChat?: boolean;               // /admin/live-chat — Chat en direct
  magazine?: boolean;               // /admin/magazine — Magazine
  mailing?: boolean;                // /admin/mailing — Mailing
  mediaLibrary?: boolean;           // /admin/media-library — Médiathèque
  messages?: boolean;               // /admin/messages — Messages
  modelAccess?: boolean;            // /admin/model-access — Accès mannequins
  news?: boolean;                   // /admin/news — Actualités
  payments?: boolean;               // /admin/payments — Paiements
  recovery?: boolean;               // /admin/recovery-requests — Récupération
  settings?: boolean;               // /admin/settings — Paramètres
  userPermissions?: boolean;        // /admin/user-permissions — Gestion des permissions (cette page)
}

// Clé de permission associée à chaque route admin
export const ADMIN_PAGE_PERMISSION_MAP: Record<string, keyof AdminPagePermissions> = {
  '/admin':                           'dashboard',
  '/admin/models':                    'models',
  '/admin/absences':                  'absences',
  '/admin/agency':                    'agency',
  '/admin/artistic-direction':        'artisticDirection',
  '/admin/beauty-contests':           'beautyContests',
  '/admin/bookings':                  'bookings',
  '/admin/casting-applications':      'castingApplications',
  '/admin/casting-results':           'castingResults',
  '/admin/classroom':                 'classroom',
  '/admin/classroom-progress':        'classroomProgress',
  '/admin/comments':                  'comments',
  '/admin/fashion-day-applications':  'fashionDayApplications',
  '/admin/fashion-day-events':        'fashionDayEvents',
  '/admin/gallery':                   'gallery',
  '/admin/analyser-image':            'imageAnalysis',
  '/admin/generer-image':             'imageGeneration',
  '/admin/live-chat':                 'liveChat',
  '/admin/magazine':                  'magazine',
  '/admin/mailing':                   'mailing',
  '/admin/media-library':             'mediaLibrary',
  '/admin/messages':                  'messages',
  '/admin/model-access':              'modelAccess',
  '/admin/news':                      'news',
  '/admin/payments':                  'payments',
  '/admin/recovery-requests':         'recovery',
  '/admin/settings':                  'settings',
  '/admin/user-permissions':          'userPermissions',
};

// Labels lisibles pour chaque permission admin
export const ADMIN_PERMISSION_LABELS: Record<keyof AdminPagePermissions, string> = {
  dashboard:               'Tableau de bord',
  models:                  'Mannequins',
  absences:                'Absences',
  agency:                  'Agence',
  artisticDirection:       'Direction artistique',
  beautyContests:          'Concours beauté',
  bookings:                'Réservations',
  castingApplications:     'Candidatures casting',
  castingResults:          'Résultats casting',
  classroom:               'Classroom',
  classroomProgress:       'Progression classroom',
  comments:                'Commentaires',
  fashionDayApplications:  'Dossiers Fashion Day',
  fashionDayEvents:        'Événements Fashion Day',
  gallery:                 'Galerie',
  imageAnalysis:           'Analyse IA',
  imageGeneration:         'Génération IA',
  liveChat:                'Chat en direct',
  magazine:                'Magazine',
  mailing:                 'Mailing',
  mediaLibrary:            'Médiathèque',
  messages:                'Messages',
  modelAccess:             'Accès mannequins',
  news:                    'Actualités',
  payments:                'Paiements',
  recovery:                'Récupération compte',
  settings:                'Paramètres site',
  userPermissions:         'Gestion des permissions',
};

// Permissions par défaut selon le rôle
export const DEFAULT_PERMISSIONS: Record<string, UserPermissions> = {
  student: {
    canAccessFormation: true,
    canAccessClassroom: true,
    canAccessForum: true,
    canViewPhotoshootBriefs: true,
    canViewResults: true,
    canEditProfile: true,
    isActive: true,
  },
  jury: {
    canScoreCasting: true,
    canViewAllCandidates: true,
    isActive: true,
  },
  registration: {
    canRegisterCandidates: true,
    canPrintList: true,
    isActive: true,
  },
};

export interface Stylist {
  name: string;
  description: string;
  images: string[];
}

export interface Artist {
  name: string;
  description: string;
  images: string[];
}

export interface FashionDayEvent {
  edition: number;
  date: string;
  theme: string;
  location?: string;
  mc?: string;
  promoter?: string;
  stylists?: Stylist[];
  featuredModels?: string[];
  artists?: Artist[];
  partners?: { type: string; name: string }[];
  description: string;
  announcementVideoUrl?: string;
  announcementVideoEmbedUrl?: string;
  galleryImages?: string[];
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
}

export interface Service {
  slug: string;
  icon: string;
  title: string;
  category: 'Services Mannequinat' | 'Services Mode et Stylisme' | 'Services Événementiels';
  description: string;
  details?: { 
    title: string;
    points: string[];
  };
  buttonText: string;
  buttonLink: string;
  isComingSoon?: boolean;
}

export interface AchievementCategory {
  name: string;
  items: string[];
}

export interface ModelDistinction {
    name: string;
    titles: string[];
}

export type ArticleContent = 
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'youtube'; url: string; caption?: string };

export interface Article {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  date: string;
  content: ArticleContent[];
  tags?: string[];
  isFeatured?: boolean;
  status?: 'draft' | 'published';
  photographer?: string;
  brands?: string[];
  viewCount?: number;
  reactions?: {
    likes: number;
    dislikes: number;
  };
}


export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Chapter {
  slug: string;
  title: string;
  content: string;
}

export interface Module {
  slug: string;
  title: string;
  chapters: Chapter[];
  quiz: QuizQuestion[];
}

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  imageUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  excerpt: string;
  link?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  notificationEmail?: string;
}

export interface SiteImages {
  hero: string;
  about: string;
  fashionDayBg: string;
  agencyHistory: string;
  classroomBg: string;
  castingBg: string;
}

export interface Partner {
  name: string;
}

export interface ApiKeys {
  resendApiKey: string;
  formspreeEndpoint: string;
  firebaseDynamicLinks?: {
    webApiKey?: string;
    domainUriPrefix: string;
  };
  imgbbApiKey?: string;
  brevoApiKey?: string;
  dropboxAppKey?: string;
  dropboxAccessToken?: string;
  geminiApiKey?: string;
  vapidKey?: string;
  chatbotId?: string;
  defaultFromEmail?: string;
}

export type CastingApplicationStatus = 'Nouveau' | 'Présélectionné' | 'Accepté' | 'Refusé';

export interface JuryScore {
  physique: number;
  presence: number;
  photogenie: number;
  potentiel: number;
  notes?: string;
  overall: number;
}

export interface JuryMember {
  id: string;
  name: string;
  username: string;
  password: string;
  email?: string;
  firebaseUid?: string;
}

export interface RegistrationStaff {
  id: string;
  name: string;
  username: string;
  password: string;
  email?: string;
  firebaseUid?: string;
}

export interface CastingApplication {
  id: string;
  submissionDate: string;
  status: CastingApplicationStatus;
  
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  nationality: string;
  city: string;
  gender: 'Homme' | 'Femme';
  height: string;
  weight: string;
  chest: string;
  waist: string;
  hips: string;
  shoeSize: string;
  eyeColor: string;
  hairColor: string;
  experience: string;
  instagram: string;
  portfolioLink: string;

  photoPortraitUrl?: string | null;
  photoFullBodyUrl?: string | null;
  photoProfileUrl?: string | null;

  scores?: {
    [juryId: string]: JuryScore;
  };
  
  passageNumber?: number;
}

export type FashionDayApplicationRole = 'Mannequin' | 'Styliste' | 'Partenaire' | 'Photographe' | 'MUA' | 'Autre';
export type FashionDayApplicationStatus = 'Nouveau' | 'En attente' | 'Accepté' | 'Refusé';

export interface FashionDayApplication {
  id: string;
  submissionDate: string;
  name: string;
  email: string;
  phone: string;
  role: FashionDayApplicationRole;
  message: string;
  status: FashionDayApplicationStatus;
}

export interface ForumThread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  initialPost: string;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  content: string;
}

export interface ArticleComment {
  id: string;
  articleSlug: string;
  authorName: string; 
  createdAt: string;
  content: string;
}

export interface RecoveryRequest {
  id: string;
  modelName: string;
  phone: string;
  timestamp: string;
  status: 'Nouveau' | 'Traité';
}

export interface BookingRequest {
  id: string;
  submissionDate: string;
  status: 'Nouveau' | 'Confirmé' | 'Annulé';
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  requestedModels: string;
  startDate?: string;
  endDate?: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  submissionDate: string;
  status: 'Nouveau' | 'Lu' | 'Archivé';
  name: string;
  email: string;
  subject: string;
  message: string;
  label?: 'Partenariat' | 'Casting' | 'Presse' | 'Booking' | 'Autre';
  folder?: 'inbox' | 'sent' | 'drafts';
  replyTo?: string;
  mediaLinks?: { name: string; url: string }[];
}

export interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    onInsertContent: (content: string) => void;
    fieldName: string;
    initialPrompt: string;
    jsonSchema?: any;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  category: string;
  items: FAQItem[];
}

export interface Absence {
  id: string;
  modelId: string;
  modelName: string;
  date: string; // YYYY-MM-DD
  reason: 'Maladie' | 'Personnel' | 'Non justifié' | 'Autre';
  notes?: string;
  isExcused: boolean;
}

// FIX: Replaced Transaction with MonthlyPayment to standardize financial data types.
export interface MonthlyPayment {
  id: string; // e.g., 'modelId-YYYY-MM'
  modelId: string;
  modelName: string;
  month: string; // 'YYYY-MM'
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  method: 'Virement' | 'Espèces' | 'Autre';
  status: 'Payé' | 'En attente' | 'En retard';
  notes?: string;
}

export type TransactionType = 'Revenu' | 'Dépense';
export type TransactionCategory =
  | 'Paiement Mannequin'
  | 'Booking Client'
  | 'Fashion Day'
  | 'Casting'
  | 'Formation'
  | 'Loyer'
  | 'Équipement'
  | 'Marketing'
  | 'Salaires'
  | 'Fournitures'
  | 'Transport'
  | 'Autre';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: TransactionCategory;
  label: string;
  amount: number;
  method: 'Virement' | 'Espèces' | 'Mobile Money' | 'Chèque' | 'Autre';
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface PhotoshootBrief {
  id: string;
  modelId: string;
  modelName: string;
  theme: string;
  clothingStyle: string;
  accessories: string;
  location: string;
  dateTime: string; // ISO string format for date and time
  createdAt: string; // ISO string format
  status: 'Nouveau' | 'Lu' | 'Archivé';
}

export interface NavLink {
    path: string;
    label: string;
    inFooter: boolean;
    footerLabel?: string;
}

export interface MailingContact {
  id: string;
  name: string;
  email: string;
  category?: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  username: string;
  password: string;
  email: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
}

export type GalleryCategory =
  | 'Défilés'
  | 'Shootings Photo'
  | 'Campagnes Publicitaires'
  | 'Fashion Day'
  | 'Collaborations'
  | 'Entraînements'
  | 'Backstage'
  | 'Lookbook'
  | 'Événements'
  | 'Presse & Médias'
  | 'Autres';
export type GalleryMediaType = 'image' | 'video';

export interface GalleryAlbum {
  id: string;
  name: string;
  description?: string;
  category: GalleryCategory;
  coverUrl?: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  publicId?: string;
  mediaType: GalleryMediaType;
  category: GalleryCategory;
  albumId?: string;
  caption?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export type NewsletterStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';

export interface Newsletter {
   id: string;
   subject: string;
   htmlContent: string;
   plainTextContent?: string;
   status: NewsletterStatus;
   createdAt: string;
   updatedAt: string;
   scheduledFor?: string;
   sentAt?: string;
   sentToCount?: number;
}
