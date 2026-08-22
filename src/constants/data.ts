// FIX: Corrected import to use MonthlyPayment as the Transaction type is deprecated.
import { Model, Service, AchievementCategory, ModelDistinction, Testimonial, ContactInfo, SiteImages, Partner, ApiKeys, CastingApplication, FashionDayApplication, NewsItem, FashionDayEvent, ForumThread, ForumReply, ArticleComment, RecoveryRequest, JuryMember, RegistrationStaff, BookingRequest, ContactMessage, SocialLinks, Artist, FAQCategory, Absence, MonthlyPayment, PhotoshootBrief, NavLink, MailingContact } from '../types';

export const siteConfig = {
  logo: '/logo.svg',
};

export const navLinks: NavLink[] = [
  { path: '/', label: 'Accueil', inFooter: true },
  { path: '/agence', label: 'Agence', inFooter: true },
  { path: '/mannequins', label: 'Mannequins', inFooter: true },
  { path: '/fashion-day', label: 'PFD', inFooter: true, footerLabel: 'Perfect Fashion Day' },
  { path: '/magazine', label: 'Magazine', inFooter: true },
  { path: '/services', label: 'Services', inFooter: true },
  { path: '/contact', label: 'Contact', inFooter: true },
  { path: '/formations', label: 'Classroom', inFooter: false },
].filter(link => !['/', '/fashion-day'].includes(link.path));

export const socialLinks: SocialLinks = {
  facebook: 'https://www.facebook.com/PerfectModels241',
  instagram: 'https://www.instagram.com/perfectmodelsmanagement_/',
  youtube: 'https://www.youtube.com/@perfectmodelsmanagement6013',
};

export const contactInfo: ContactInfo = {
  email: 'contact@perfectmodels.online',
  phone: '+241 077 00 00 00',
  address: 'Libreville, Gabon',
  notificationEmail: 'contact@perfectmodels.online',
};

export const siteImages: SiteImages = {
  hero: 'https://i.ibb.co/K2wS0Pz/hero-bg.jpg',
  about: 'https://i.ibb.co/3WfK9Xg/about-img.jpg',
  fashionDayBg: 'https://i.ibb.co/C5rcPJHz/titostyle-53.jpg',
  agencyHistory: 'https://i.ibb.co/jH0YvJg/agency-history.jpg',
  classroomBg: 'https://i.ibb.co/TBt9FBSv/AJC-4630.jpg',
  castingBg: 'https://i.ibb.co/z5TzL2M/casting-bg.jpg',
};

export const apiKeys: ApiKeys = {
  // Configured via environment variables (VITE_RESEND_API_KEY, etc.)
  // See .env.example
  resendApiKey: import.meta.env.VITE_RESEND_API_KEY || '',
  formspreeEndpoint: import.meta.env.VITE_FORMSPREE_ENDPOINT || '',
  firebaseDynamicLinks: {
    webApiKey: import.meta.env.VITE_FIREBASE_DYNAMIC_LINKS_API_KEY || '',
    domainUriPrefix: import.meta.env.VITE_FIREBASE_DYNAMIC_LINKS_DOMAIN || ''
  },
  brevoApiKey: import.meta.env.VITE_BREVO_API_KEY || '',
  dropboxAppKey: import.meta.env.VITE_DROPBOX_APP_KEY || '',
  dropboxAccessToken: import.meta.env.VITE_DROPBOX_ACCESS_TOKEN || '',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || '',
  chatbotId: import.meta.env.VITE_CHATBOT_ID || import.meta.env.NEXT_PUBLIC_CHATBOT_ID || '',
  defaultFromEmail: import.meta.env.DEFAULT_FROM_EMAIL || '',
};

export const juryMembers: JuryMember[] = [
  { id: 'jury1', name: 'Martelly', username: 'jury1', password: 'password2025' },
  { id: 'jury2', name: 'Darain', username: 'jury2', password: 'password2025' },
  { id: 'jury3', name: 'David', username: 'jury3', password: 'password2025' },
  { id: 'jury4', name: 'Sadia', username: 'jury4', password: 'password2025' },
];

export const registrationStaff: RegistrationStaff[] = [
  { id: 'reg1', name: 'Sephora', username: 'enregistrement1', password: 'password2025' },
  { id: 'reg2', name: 'Aimée', username: 'enregistrement2', password: 'password2025' },
  { id: 'reg3', name: 'Duchesse', username: 'enregistrement3', password: 'password2025' },
  { id: 'reg4', name: 'Sephra', username: 'enregistrement4', password: 'password2025' },
];

export const models: Model[] = [
  {
    id: 'noemi-kim',
    name: 'Noemi Kim',
    username: 'Man-PMMN01',
    password: 'noemi2024',
    level: 'Pro',
    email: 'noemi.kim@example.com',
    phone: '+241077000001',
    age: 22,
    height: '1m78',
    gender: 'Femme',
    location: 'Libreville',
    imageUrl: 'https://i.ibb.co/mCcD1Gfq/DSC-0272.jpg',
    isPublic: true,
    portfolioImages: [
      'https://i.ibb.co/z5TzL2M/casting-bg.jpg',
      'https://i.ibb.co/K2wS0Pz/hero-bg.jpg',
      'https://i.ibb.co/C5rcPJHz/titostyle-53.jpg',
    ],
    distinctions: [
      { name: "Palmarès National & International", titles: ["Miss Gabon 2022", "Top Model Afrique Centrale 2023"] }
    ],
    measurements: { chest: '85cm', waist: '62cm', hips: '90cm', shoeSize: '40' },
    categories: ['Défilé', 'Éditorial', 'Beauté'],
    experience: "Mannequin vedette de l'agence, Noemi a défilé pour les plus grands créateurs gabonais et a été le visage de plusieurs campagnes nationales. Son professionnalisme et sa démarche captivante en font une référence.",
    journey: "Découverte lors d'un casting sauvage, Noemi a rapidement gravi les échelons grâce à sa détermination. Formée au sein de la PMM Classroom, elle incarne aujourd'hui l'excellence et l'ambition de l'agence.",
    quizScores: {
      'module-1-les-fondamentaux-du-mannequinat': { score: 3, total: 3, timesLeft: 0, timestamp: '2024-07-01T10:00:00Z' },
      'module-2-techniques-de-podium-catwalk': { score: 2, total: 2, timesLeft: 0, timestamp: '2024-07-02T10:00:00Z' }
    },
  },
  {
    id: 'grace-elsa',
    name: 'Grace Elsa',
    username: 'Man-PMMGE01',
    password: 'graceelsa2026',
    level: 'Pro',
    height: '1m78',
    gender: 'Femme',
    location: 'Libreville',
    imageUrl: '/images/grace-elsa.jpg',
    isPublic: true,
    portfolioImages: [
      '/images/grace-elsa.jpg',
    ],
    fashionDayEditions: [3],
    distinctions: [
      { name: "Perfect Fashion Day 3", titles: ["Égérie Officielle de la 3e Édition"] }
    ],
    measurements: { chest: '84cm', waist: '61cm', hips: '89cm', shoeSize: '39' },
    categories: ['Égérie', 'Défilé', 'Haute Couture', 'Beauté'],
    experience: "Égérie Officielle de la 3e Édition du Perfect Fashion Day. Visage emblématique de l'agence Perfect Models Management pour les campagnes majeures et les défilés de mode au Gabon.",
    journey: "Couronnée Égérie lors de la 3e édition du Perfect Fashion Day, Grace Elsa s'est distinguée par son élégance naturelle, son port altier et son charisme exceptionnel.",
    quizScores: {},
  },
  {
    id: 'aj-caramela',
    name: 'AJ Caramela',
    username: 'Man-PMMA01',
    password: 'caramela2024',
    level: 'Pro',
    height: '1m75',
    gender: 'Femme',
    imageUrl: 'https://i.postimg.cc/k5skXhC2/NR-09474.jpg',
    isPublic: true,
    portfolioImages: [
      'https://i.postimg.cc/Xv24Dvp1/NR-09484.jpg',
      'https://i.postimg.cc/59Qbnb1p/NR-09503-Modifier.jpg',
      'https://i.postimg.cc/k5skXhC2/NR-09474.jpg',
    ],
    distinctions: [
      { name: "Reconnaissance Artistique", titles: ["Visage de l'Année - Gabon Fashion Awards 2023", "Meilleure Collaboration Photo avec NR Picture"] }
    ],
    measurements: { chest: '82cm', waist: '60cm', hips: '88cm', shoeSize: '39' },
    categories: ['Défilé', 'Commercial', 'Éditorial'],
    experience: "Avec son regard perçant et sa polyvalence, AJ excelle dans les shootings éditoriaux et les campagnes publicitaires. Elle a collaboré avec de nombreuses marques locales et photographes de renom.",
    journey: "AJ a rejoint PMM avec une passion pour la photographie. Son aisance devant l'objectif et sa capacité à se transformer lui ont rapidement ouvert les portes des projets les plus créatifs.",
    quizScores: {
      'module-1-les-fondamentaux-du-mannequinat': { score: 3, total: 3, timesLeft: 1, timestamp: '2024-07-03T10:00:00Z' },
      'module-3-photographie-et-expression-corporelle': { score: 2, total: 2, timesLeft: 0, timestamp: '2024-07-04T10:00:00Z' }
    },
  },
  {
    id: 'yann-aubin',
    name: 'Yann Aubin',
    username: 'Man-PMMY01',
    password: 'yann2024',
    level: 'Pro',
    height: '1m88',
    gender: 'Homme',
    imageUrl: 'https://i.ibb.co/Rk1fG3ph/farelmd-37.jpg',
    isPublic: true,
    portfolioImages: [
      'https://i.ibb.co/TBt9FBSv/AJC-4630.jpg',
    ],
    distinctions: [
      { name: "Podiums Masculins", titles: ["Mannequin Homme de l'Année - PFD Awards 2025", "Prix de l'Élégance Masculine - Libreville Fashion Week"] }
    ],
    measurements: { chest: '98cm', waist: '78cm', hips: '95cm', shoeSize: '44' },
    categories: ['Défilé', 'Costume', 'Sportswear'],
    experience: "Spécialiste du prêt-à-porter masculin, Yann est reconnu pour sa démarche puissante et son élégance naturelle. Il est un choix privilégié pour les défilés de créateurs de costumes.",
    journey: "Ancien athlète, Yann a apporté sa discipline et sa prestance au monde du mannequinat. Il s'est rapidement imposé comme une figure incontournable de la mode masculine au Gabon.",
    quizScores: {
      'module-2-techniques-de-podium-catwalk': { score: 2, total: 2, timesLeft: 0, timestamp: '2024-07-05T10:00:00Z' }
    },
  },
];

export const testimonials: Testimonial[] = [
  {
    name: 'Franck B.',
    role: 'Créateur de Mode',
    quote: "Collaborer avec Perfect Models Management est un gage de professionnalisme. Leurs mannequins sont non seulement magnifiques mais aussi incroyablement bien formés et ponctuels. Un vrai plaisir.",
    imageUrl: 'https://i.ibb.co/s5zW7gZ/testimonial-1.jpg',
  },
  {
    name: 'Nadia K.',
    role: 'Directrice Artistique',
    quote: "L'agence a un œil incroyable pour dénicher des talents uniques. Leur catalogue est diversifié et répond perfectly aux besoins créatifs de nos campagnes publicitaires.",
    imageUrl: 'https://i.ibb.co/y4x9Y8X/testimonial-2.jpg',
  },
  {
    name: 'Noemi Kim',
    role: 'Mannequin de l\'agence',
    quote: "PMM est bien plus qu'une agence, c'est une famille qui nous pousse à donner le meilleur de nous-mêmes. La formation et l'encadrement sont exceptionnels.",
    imageUrl: 'https://i.ibb.co/mCcD1Gfq/DSC-0272.jpg',
  },
];

export const castingApplications: CastingApplication[] = [];
export const fashionDayApplications: FashionDayApplication[] = [];
export const forumThreads: ForumThread[] = [];
export const forumReplies: ForumReply[] = [];
export const articleComments: ArticleComment[] = [];
export const recoveryRequests: RecoveryRequest[] = [];
export const bookingRequests: BookingRequest[] = [];
export const contactMessages: ContactMessage[] = [];
export const absences: Absence[] = [];
export const monthlyPayments: MonthlyPayment[] = [];
export const photoshootBriefs: PhotoshootBrief[] = [];

export const mailingContacts: MailingContact[] = [
  // Mode, Culture & Boutiques
  { id: 'mc-01', name: 'Amazone Wear', email: 'amazonewear@gmail.com', category: 'Mode & Boutiques' },
  { id: 'mc-02', name: 'Artemis Luxury Co', email: 'artemisluxury2020@gmail.com', category: 'Mode & Boutiques' },
  { id: 'mc-03', name: 'Galerie Kay Anne', email: 'smariewilma@gmail.com', category: 'Mode & Boutiques' },
  { id: 'mc-04', name: "Even'jet By Coco", email: 'evenjetbycoco@hotmail.com', category: 'Mode & Boutiques' },
  { id: 'mc-05', name: 'MINI LOOK LBV', email: 'minilooklbv@gmail.com', category: 'Mode & Boutiques' },
  { id: 'mc-06', name: 'Fashion Eyes Optic', email: 'fashioneyes123@gmail.com', category: 'Mode & Boutiques' },
  // Hôtellerie, Loisirs & Restauration
  { id: 'mc-07', name: 'Hôtel Radisson Blu', email: 'info.libreville@radissonblu.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-08', name: 'Hôtel Le Cristal', email: 'reservations@lecristal-hotel.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-09', name: 'Nomad Résidence Hôtelière', email: 'info@nomadlibreville.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-10', name: 'Résidence du Phare', email: 'residenceduphare@yahoo.fr', category: 'Hôtellerie & Restauration' },
  { id: 'mc-11', name: 'Hôtel Adagio', email: 'infoshoteladagio@gmail.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-12', name: 'Hôtel Akewa', email: 'hotelakewa@gmail.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-13', name: 'Roma Hotel', email: 'romalibreville@gmail.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-14', name: 'Hôtel Glass (SEHG)', email: 'sehg.hotellerie@yahoo.fr', category: 'Hôtellerie & Restauration' },
  { id: 'mc-15', name: "L'Émir Restaurant", email: 'emirestaurantlbv@gmail.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-16', name: 'Delicatess', email: 'contact.delicatess@gmail.com', category: 'Hôtellerie & Restauration' },
  { id: 'mc-17', name: 'Chocolaterie Julie Nyangui', email: 'julie_nyangui@yahoo.fr', category: 'Hôtellerie & Restauration' },
  // Agences Digitales, Tech & Communication
  { id: 'mc-18', name: 'Agence Oolass', email: 'agenceoolass@gmail.com', category: 'Digital & Tech' },
  { id: 'mc-19', name: 'Gabon Connect', email: 'contact@gabonconnect.com', category: 'Digital & Tech' },
  { id: 'mc-20', name: 'Jeta Com', email: 'contact@jetacomm.com', category: 'Digital & Tech' },
  { id: 'mc-21', name: 'B-COM', email: 'contact@b-com.pro', category: 'Digital & Tech' },
  { id: 'mc-22', name: 'ADS Gabon', email: 'info@adsgabon.com', category: 'Digital & Tech' },
  { id: 'mc-23', name: 'Agence BN Graph', email: 'agencebngraph@yahoo.fr', category: 'Digital & Tech' },
  { id: 'mc-24', name: 'Globale Entreprise Services', email: 'contact@globale-services.com', category: 'Digital & Tech' },
  { id: 'mc-25', name: 'GSI Gabon', email: 'contact@gsi-gabon.com', category: 'Digital & Tech' },
  { id: 'mc-25b', name: 'GSI Gabon (alt)', email: 'rockysyann@gmail.com', category: 'Digital & Tech' },
  { id: 'mc-26', name: 'Dona Pen Design', email: 'design.dona.pen@gmail.com', category: 'Digital & Tech' },
  // Logistique, BTP & Transport
  { id: 'mc-27', name: 'AGS Déménagement', email: 'manager-gabon@agsmovers.com', category: 'Logistique & Transport' },
  { id: 'mc-28', name: 'Bolloré Transport & Logistics', email: 'direction.lbv@bollore.com', category: 'Logistique & Transport' },
  { id: 'mc-29', name: 'CMA CGM Gabon', email: 'gab.service@cma-cgm.com', category: 'Logistique & Transport' },
  { id: 'mc-30', name: 'MSC Gabon', email: 'ga671-infogabon@msc.com', category: 'Logistique & Transport' },
  { id: 'mc-31', name: 'Freinzy Transport', email: 'freinzytransport@gmail.com', category: 'Logistique & Transport' },
  { id: 'mc-32', name: 'Gabon Shipping & Logistics', email: 'service.client@gsl-group.net', category: 'Logistique & Transport' },
  { id: 'mc-33', name: 'Logistiga', email: 'info@logistiga.com', category: 'Logistique & Transport' },
  { id: 'mc-34', name: 'Ozavino Logistics', email: 'ozavinologistics@gmail.com', category: 'Logistique & Transport' },
  { id: 'mc-35', name: 'SLR Gabon', email: 'slrgabon@yahoo.fr', category: 'Logistique & Transport' },
  { id: 'mc-36', name: 'STS Transit', email: 'ststransit2007@yahoo.fr', category: 'Logistique & Transport' },
  { id: 'mc-37', name: 'TCH', email: 'tch.direction@gmail.com', category: 'Logistique & Transport' },
  { id: 'mc-38', name: 'CIDT Gabon', email: 'cidtgabon@yahoo.fr', category: 'Logistique & Transport' },
  { id: 'mc-39', name: 'GAPS Services', email: 'gaps2006@yahoo.fr', category: 'Logistique & Transport' },
  { id: 'mc-40', name: 'OGTT Libreville', email: 'ogttlibreville@yahoo.fr', category: 'Logistique & Transport' },
  { id: 'mc-41', name: 'Batis Gabon (BTP)', email: 'ebtpev@yahoo.fr', category: 'Logistique & Transport' },
  // Droit, Consulting & Services B2B
  { id: 'mc-42', name: 'CEMAC Consulting', email: 'cemacconsulting@yahoo.fr', category: 'Droit & Consulting' },
  { id: 'mc-43', name: 'JMJ Africa', email: 'contact@jmjafrica.com', category: 'Droit & Consulting' },
  { id: 'mc-44', name: 'Yenore Consulting', email: 'arbitrageiimac@gmail.com', category: 'Droit & Consulting' },
  { id: 'mc-45', name: 'HNR Consulting', email: 'contact.hnrconsulting@gmail.com', category: 'Droit & Consulting' },
  { id: 'mc-46', name: 'Project Lawyers', email: 'jpbozec@project-lawyers.com', category: 'Droit & Consulting' },
  { id: 'mc-47', name: "Cabinet d'Almeida", email: 'regine_dalmeida@yahoo.fr', category: 'Droit & Consulting' },
  { id: 'mc-48', name: 'Étude Me Taty', email: 'etudegerangah@yahoo.fr', category: 'Droit & Consulting' },
  { id: 'mc-49', name: 'Me Lubin Ntoutoume', email: 'n_lubin@yahoo.fr', category: 'Droit & Consulting' },
  { id: 'mc-50', name: 'Me Jean Paul Moumbembe', email: 'omchamb@yahoo.fr', category: 'Droit & Consulting' },
  { id: 'mc-51', name: 'Cabinet Agbanrinche', email: 'agbanrinche@yahoo.fr', category: 'Droit & Consulting' },
  // Santé & Polycliniques
  { id: 'mc-52', name: 'SOS Médecins', email: 'sosmedecinslbv@yahoo.fr', category: 'Santé' },
  { id: 'mc-53', name: 'Polyclinique Chambrier', email: 'alawoeeu@yahoo.fr', category: 'Santé' },
  { id: 'mc-54', name: 'Polyclinique El Rapha', email: 'ibolejames@yahoo.fr', category: 'Santé' },
  { id: 'mc-55', name: 'Cabinet Dentaire Les Frangipaniers', email: 'wazalydent@yahoo.fr', category: 'Santé' },
  { id: 'mc-56', name: 'Cabinet Dentaire Centre-Ville', email: 'cabinetdentaire2013@yahoo.fr', category: 'Santé' },
  { id: 'mc-57', name: 'Dr. Sophie Coniquet', email: 'sophieconiquet@yahoo.fr', category: 'Santé' },
  { id: 'mc-58', name: 'Dr. Charafe', email: 'Charafe75@yahoo.fr', category: 'Santé' },
  { id: 'mc-59', name: 'Dr. Gérard Valeri', email: 'gerardvaleri@yahoo.fr', category: 'Santé' },
  { id: 'mc-60', name: 'Dr. Jean-Luc Caine', email: 'caine.jeanluc@yahoo.fr', category: 'Santé' },
  { id: 'mc-61', name: 'Dr. Assengone Zeyi', email: 'assengonezeyi@yahoo.fr', category: 'Santé' },
  { id: 'mc-62', name: 'Dr. Fatoumata Maiga', email: 'Famaiga2002@yahoo.fr', category: 'Santé' },
  { id: 'mc-63', name: "Dr. Steeve Minto'o", email: 'steeve.mintoo@yahoo.fr', category: 'Santé' },
  { id: 'mc-64', name: 'Cabinet Martel (Kiné)', email: 'Martelbertrand@yahoo.fr', category: 'Santé' },
  // Institutions & Grandes Entreprises
  { id: 'mc-65', name: 'FEG', email: 'info@lafeg.ga', category: 'Institution' },
  { id: 'mc-66', name: 'CCI Gabon', email: 'contact@cci-gabon.com', category: 'Institution' },
  { id: 'mc-67', name: 'CNMAG', email: 'cnmagabon@gmail.com', category: 'Institution' },
  { id: 'mc-68', name: 'OGAPI', email: 'ogapiindustries241@gmail.com', category: 'Institution' },
  { id: 'mc-69', name: 'OPRAG', email: 'info@oprag.ga', category: 'Institution' },
  { id: 'mc-70', name: 'SGEPP', email: 'contact@sgepp.ga', category: 'Institution' },
  { id: 'mc-71', name: 'SEEG', email: 'communication@seeg-gabon.com', category: 'Institution' },
  { id: 'mc-72', name: 'SETRAG', email: 'c.communication@setrag.com', category: 'Institution' },
  { id: 'mc-73', name: 'CFAO Motors Gabon', email: 'cfaomotorsgabon@cfao.com', category: 'Institution' },
  { id: 'mc-74', name: 'Groupe Sogafric', email: 'sogafric.services@groupesogafric.com', category: 'Institution' },
  { id: 'mc-75', name: 'Conseil National Climat', email: 'secretariatconseilclimat@gmail.com', category: 'Institution' },
  { id: 'mc-76', name: 'Clean Africa', email: 'contact@cleanafrica.net', category: 'Institution' },
  { id: 'mc-77', name: 'Invest in Gabon', email: 'contact@investingabon.ga', category: 'Institution' },
  { id: 'mc-78', name: 'SICIG', email: 'admin@sicig.net', category: 'Institution' },
  { id: 'mc-79', name: 'CNAMGS', email: 'info@cnamgs.ga', category: 'Institution' },
  // Média
  { id: 'mc-80', name: "Journal d'Émeraude", email: 'contact.journaldemeraude@gmail.com', category: 'Média' },
];
// FIX: Removed beginnerStudents array as the feature is deprecated.



export const newsItems: NewsItem[] = [
  { id: '1', title: "Grand Casting Annuel", date: '2025-09-06', imageUrl: 'https://i.ibb.co/z5TzL2M/casting-bg.jpg', excerpt: "Nous recherchons les prochains visages de la mode. Préparez-vous pour notre grand casting national.", link: '/casting-formulaire' },
  { id: '2', title: "Perfect Fashion Day Édition 2", date: '2025-02-08', imageUrl: 'https://i.ibb.co/C5rcPJHz/titostyle-53.jpg', excerpt: "La seconde édition de notre événement mode phare approche à grands pas. Découvrez le thème et les créateurs.", link: '/fashion-day' },
  { id: '3', title: "Nouveaux Talents 2024", date: '2024-08-15', imageUrl: 'https://i.ibb.co/3WfK9Xg/about-img.jpg', excerpt: "L'agence est fière d'accueillir trois nouveaux mannequins prometteurs dans ses rangs.", link: '/mannequins' },
];

export const fashionDayEvents: FashionDayEvent[] = [
  {
    edition: 1,
    date: "2025-01-25T18:00:00",
    theme: "Racines et Modernité",
    location: "La Gare du Nord – Hôtel Restaurant Bar Casino, Carrefour Acaé",
    promoter: "Parfait Asseko",
    description: "La 1ère Édition de la Perfect Fashion Day a tenu toutes ses promesses en réunissant mode, art, culture et professionnalisme. Le thème « Racines et Modernité » a permis d’explorer la richesse de la culture gabonaise tout en ouvrant un dialogue avec les tendances contemporaines, posant ainsi les bases solides d’un événement de référence pour la mode gabonaise.",
    stylists: [
      {
        name: "AG Style",
        description: "Un mélange parfait de tradition et de modernité.",
        images: [
          "https://i.ibb.co/Gfxgf00z/agstyle-42.jpg", "https://i.ibb.co/4g4x6Dkp/agstyle-41.jpg", "https://i.ibb.co/0y7Pqv9y/agstyle-36.jpg", "https://i.ibb.co/yc5kxJKT/agstyle-33.jpg",
          "https://i.ibb.co/8DTp4Qqy/agstyle-28.jpg", "https://i.ibb.co/DfF1Z4T9/agstyle-23.jpg", "https://i.ibb.co/h1mPDBy4/agstyle-21.jpg", "https://i.ibb.co/d4D6QLnf/agstyle-17.jpg",
          "https://i.ibb.co/60RSnzxY/agstyle-13.jpg", "https://i.ibb.co/hR9Sfy5Q/agstyle-15.jpg", "https://i.ibb.co/KpRpVrg3/agstyle-7.jpg", "https://i.ibb.co/vCNg8h6j/AG-Style.jpg"
        ]
      },
      {
        name: "Farel MD",
        description: "Élégance masculine & attitude.",
        images: [
          "https://i.ibb.co/mC32jrDj/farelmd-31.jpg", "https://i.ibb.co/Rk1fG3ph/farelmd-37.jpg", "https://i.ibb.co/Z6LnsF9F/farelmd-33.jpg", "https://i.ibb.co/0yVgwzxH/farelmd-28.jpg",
          "https://i.ibb.co/bZWLkcw/farelmd-30.jpg", "https://i.ibb.co/LDjkT30K/farelmd-21.jpg", "https://i.ibb.co/rKm9BH3j/farelmd-26.jpg", "https://i.ibb.co/KpY1tHHg/farelmd-10.jpg",
          "https://i.ibb.co/tp51KKMX/farelmd-16.jpg", "https://i.ibb.co/fTrvQht/farelmd-5.jpg"
        ]
      },
      {
        name: "Ventex Custom",
        description: "Une prestation haute en audace et en style.",
        images: [
          "https://i.ibb.co/LDm73BY2/ventex-44.jpg", "https://i.ibb.co/LXj51t0G/ventex-43.jpg", "https://i.ibb.co/hRnhS3gP/ventex-31.jpg", "https://i.ibb.co/fdM74zWJ/ventex-36.jpg",
          "https://i.ibb.co/HTb9F9rc/ventex-21.jpg", "https://i.ibb.co/bjWPHcc3/ventex-28.jpg", "https://i.ibb.co/JW2VY4JY/ventex-18.jpg", "https://i.ibb.co/6JwgLJk2/ventex-4.jpg",
          "https://i.ibb.co/vvYkS6nQ/ventex-14.jpg", "https://i.ibb.co/ch7Fxy8J/ventex-7.jpg"
        ]
      },
      {
        name: "Miguel Fashion Style",
        description: "La finesse sur-mesure.",
        images: [
          "https://i.ibb.co/R4j44vxH/miguel-25.jpg", "https://i.ibb.co/DF36zP1/miguel-24.jpg", "https://i.ibb.co/5hHnGSgR/miguel-23.jpg", "https://i.ibb.co/KccH1yVW/miguel-21.jpg",
          "https://i.ibb.co/tTwH0qkd/miguel-19.jpg", "https://i.ibb.co/PztGS4cG/miguel-13.jpg", "https://i.ibb.co/HfHQDqs9/miguel-12.jpg", "https://i.ibb.co/DPbZq0X5/miguel-6.jpg",
          "https://i.ibb.co/fYzb35qV/miguel-10.jpg"
        ]
      },
      {
        name: "Faran",
        description: "Parade des Miss du Gabon.",
        images: [
          "https://i.ibb.co/xqxq0t42/faran-72.jpg", "https://i.ibb.co/5WRGVpN2/faran-63.jpg", "https://i.ibb.co/C3rMvpRH/faran-62.jpg", "https://i.ibb.co/ccTm9fqZ/faran-45.jpg",
          "https://i.ibb.co/W4JbLKPY/faran-31.jpg", "https://i.ibb.co/kVvx62Cd/faran-7.jpg", "https://i.ibb.co/1fpzHFCR/faran-18.jpg"
        ]
      },
      {
        name: "Madame Luc (Abiale)",
        description: "Une allure élégante et intemporelle.",
        images: [
          "https://i.ibb.co/TM8ZvfwY/madameluc-35.jpg", "https://i.ibb.co/N2n3N649/madameluc-27.jpg", "https://i.ibb.co/HfGP2hfY/madameluc-23.jpg", "https://i.ibb.co/v4bptydm/madameluc-14.jpg",
          "https://i.ibb.co/Nk9JnK8/madameluc-10.jpg", "https://i.ibb.co/wN3028xM/madameluc-1.jpg", "https://i.ibb.co/Z64LbfNr/madameluc-4.jpg"
        ]
      },
      {
        name: "Brand’O",
        description: "Une énergie flamboyante au podium.",
        images: [
          "https://i.ibb.co/jkztFFQV/brando-50.jpg", "https://i.ibb.co/Mxvqp922/brando-45.jpg", "https://i.ibb.co/b5NYjLqm/brando-39.jpg", "https://i.ibb.co/mFGznJJd/brando-34.jpg",
          "https://i.ibb.co/pjQ61C7X/brando-28.jpg", "https://i.ibb.co/mrj3sfP7/brando-26.jpg", "https://i.ibb.co/GQfNYbHh/brando-25.jpg", "https://i.ibb.co/bgJd82zf/brando-24.jpg",
          "https://i.ibb.co/GQzzgTZw/brando-22.jpg", "https://i.ibb.co/4gNj73vP/brando-17.jpg", "https://i.ibb.co/spywFpR6/brando-13.jpg", "https://i.ibb.co/GfYXkKVK/brando-11.jpg",
          "https://i.ibb.co/ymw3cwt9/brando-10.jpg"
        ]
      },
      {
        name: "Tito Style",
        description: "Audace urbaine & inspiration afro.",
        images: [
          "https://i.ibb.co/C5rcPJHz/titostyle-53.jpg", "https://i.ibb.co/gMf55YY9/titostyle-51.jpg", "https://i.ibb.co/8Ty8sGT/titostyle-50.jpg", "https://i.ibb.co/d0tXVs0v/titostyle-45.jpg",
          "https://i.ibb.co/21VQys2y/titostyle-43.jpg", "https://i.ibb.co/wNPRTQrS/titostyle-41.jpg", "https://i.ibb.co/vvc0k6TQ/titostyle-36.jpg", "https://i.ibb.co/PGP9HTrw/titostyle-33.jpg",
          "https://i.ibb.co/QvjHXZFY/titostyle-19.jpg", "https://i.ibb.co/21cjYs2K/titostyle-25.jpg", "https://i.ibb.co/ynCg04LR/titostyle-17.jpg", "https://i.ibb.co/cXkw3btJ/titostyle-4.jpg",
          "https://i.ibb.co/qY64DbG0/titostyle-12.jpg"
        ]
      },
      {
        name: "Edele A",
        description: "Le final tout en poésie.",
        images: [
          "https://i.ibb.co/N26jYJCm/edelea-40.jpg", "https://i.ibb.co/zhtZj7wG/edelea-38.jpg", "https://i.ibb.co/BKwMNJBw/edelea-31.jpg", "https://i.ibb.co/mVJhr45j/edelea-24.jpg",
          "https://i.ibb.co/35dDJXpV/edelea-22.jpg", "https://i.ibb.co/Xx03RWJx/edelea-16.jpg", "https://i.ibb.co/Tq77XgYg/edelea-3.jpg"
        ]
      }
    ],
    featuredModels: [
      "Juliana Jodelle", "Noemi Kim", "Stecya", "Lyne", "Cassandra", "Merveille",
      "Osée Jn", "Donatien", "Pablo Zapatero", "Rosnel", "Moustapha"
    ],
    artists: [
      {
        name: "Lady Riaba",
        description: "Slam poétique intitulé « Racines et Modernité » en ouverture de soirée.",
        images: [
          "https://i.ibb.co/WCYYHQ1/ladyriaba-28.jpg", "https://i.ibb.co/rfLBb0t3/ladyriaba-26.jpg", "https://i.ibb.co/hRFn9tyT/ladyriaba-22.jpg",
          "https://i.ibb.co/Cs3pHkbD/ladyriaba-20.jpg", "https://i.ibb.co/Cp50mQwn/ladyriaba-14.jpg", "https://i.ibb.co/Fq4NQ0gN/ladyriaba-10.jpg",
          "https://i.ibb.co/zhj0xKNN/ladyriaba-8.jpg", "https://i.ibb.co/x8mGQcCG/ladyriaba-6.jpg", "https://i.ibb.co/Kx1WMT87/ladyriaba-5.jpg", "https://i.ibb.co/JRs6P128/ladyriaba-1.jpg"
        ]
      }
    ],
    partners: [
      { type: "Golden Partenaire Officiel", name: "La Gare du Nord" },
      { type: "Golden Partenaire", name: "Indi Hair" },
      { type: "Golden Partenaire", name: "Darain Visuals" },
      { type: "Golden Partenaire", name: "Femmes Belles Ambitieuses et Dynamiques" }
    ]
  },
  {
    edition: 2,
    date: "2026-01-31T18:00:00",
    theme: "L’Art de se révéler",
    location: "Complexe Hôtelier Le Nalys, Angondjé (à confirmer)",
    description: "Après une première édition marquante, riche en émotions et en élégance, Perfect Models Management est fier d’annoncer le retour de la Perfect Fashion Day pour une deuxième édition inédite. Cette nouvelle rencontre mettra à l’honneur une mode profondément enracinée dans la culture, l’histoire personnelle et l’affirmation de soi.",
    stylists: [],
    featuredModels: [],
    artists: [
      {
        name: 'Lady Riaba (Poésie)',
        description: 'Slam introductif sur le thème « L’Art de se révéler »',
        images: []
      }
    ],
    partners: []
  }
];

export const agencyTimeline = [
  { year: '2021', event: 'Création de l\'agence Perfect Models Management' },
  { year: '2022', event: 'Lancement du programme de formation "PMM Classroom"' },
  { year: '2023', event: 'Nos mannequins participent à la Libreville Fashion Week' },
  { year: '2025', event: 'Première édition du Perfect Fashion Day' },
];

export const agencyInfo = {
  about: {
    p1: "Fondée en 2021 par Parfait Asseko, Perfect Models Management est née d'une vision : créer une agence de mannequins d'élite au Gabon, capable de rivaliser avec les standards internationaux. Nous sommes plus qu'une simple agence ; nous sommes un berceau de talents, une plateforme de développement et un acteur clé de l'écosystème de la mode en Afrique Centrale.",
    p2: "Notre mission est de découvrir, former et propulser les futurs visages de la mode, tout en offrant à nos clients un service irréprochable et des profils adaptés à leurs besoins les plus exigeants. L'élégance, le professionnalisme et la passion sont les piliers de notre identité."
  },
  values: [
    { name: 'Excellence', description: 'Nous visons les plus hauts standards dans tout ce que nous entreprenons.' },
    { name: 'Intégrité', description: 'Nous opérons avec transparence et respect envers nos talents et nos clients.' },
    { name: 'Développement', description: 'Nous investissons dans la formation continue de nos mannequins.' },
  ],
};

export const modelDistinctions: ModelDistinction[] = [
  { name: 'Miss Gabon', titles: ['Lauréate 2022', '1ère Dauphine 2021'] },
  { name: 'Top Model Afrique', titles: ['Gagnant Catégorie Homme 2023'] },
  { name: 'Elite Model Look', titles: ['Finaliste Gabon 2023'] },
  { name: 'Libreville Fashion Week', titles: ['Mannequin de l\'année 2024'] }
];

export const agencyServices: Service[] = [
  {
    slug: "casting-mannequins",
    title: "Casting Mannequins",
    description: "Organisation de castings professionnels pour défilés, shootings, publicités et clips.",
    details: {
      title: "Avantages du service",
      points: [
        "Sélection rigourouse de mannequins adaptés à votre projet",
        "Gestion complète de la logistique et communication avec les candidats",
        "Accès à notre base de mannequins expérimentés"
      ]
    },
    icon: "UsersIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Casting+Mannequins",
    category: "Services Mannequinat"
  },
  {
    slug: "booking-mannequins",
    title: "Booking Mannequins",
    description: "Réservation de mannequins pour événements, shootings ou campagnes publicitaires.",
    details: {
      title: "Ce que nous proposons",
      points: [
        "Mannequins professionnels pour tous types de projets",
        "Flexibilité selon vos besoins (durée, lieu, type de prestation)",
        "Suivi personnalisé avant et pendant le projet"
      ]
    },
    icon: "UserGroupIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Booking+Mannequins",
    category: "Services Mannequinat"
  },
  {
    slug: "mannequins-pour-defiles",
    title: "Mannequins pour Défilés",
    description: "Des mannequins professionnels pour vos défilés, avec coaching sur la posture et la démarche.",
    details: {
      title: "Inclus",
      points: [
        "Présentation élégante et harmonieuse de vos créations",
        "Maîtrise parfaite du passage sur podium",
        "Coordination avec votre équipe pour un spectacle mémorable"
      ]
    },
    icon: "AcademicCapIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Mannequins+pour+Defiles",
    category: "Services Mannequinat"
  },
  {
    slug: "mannequins-publicite-audiovisuel",
    title: "Mannequins Publicité / Audiovisuel",
    description: "Mannequins pour publicité, clips et projets audiovisuels.",
    details: {
      title: "Inclus",
      points: [
        "Mise en scène adaptée à vos besoins",
        "Mannequins expressifs et professionnels",
        "Accompagnement par notre équipe de production si nécessaire"
      ]
    },
    icon: "VideoCameraIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Mannequins+Publicite+Audiovisuel",
    category: "Services Mannequinat"
  },
  {
    slug: "mannequins-photo",
    title: "Mannequins Photo",
    description: "Shooting photo pour catalogues, lookbooks ou réseaux sociaux.",
    details: {
      title: "Ce que nous offrons",
      points: [
        "Photographie en studio ou extérieur",
        "Mannequins adaptés au style de votre marque",
        "Collaboration avec maquilleurs, stylistes et photographes professionnels"
      ]
    },
    icon: "PhotoIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Mannequins+Photo",
    category: "Services Mannequinat"
  },
  {
    slug: "mannequins-figurants",
    title: "Mannequins Figurants",
    description: "Figurants pour clips, films ou événements nécessitant un public.",
    details: {
      title: "Avantages",
      points: [
        "Figurants sélectionnés selon vos besoins spécifiques",
        "Gestion complète de la logistique et présence sur site"
      ]
    },
    icon: "UsersIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Mannequins+Figurants",
    category: "Services Mannequinat"
  },
  {
    slug: "formation-mannequins",
    title: "Formation Mannequins",
    description: "Coaching complet pour mannequins : posture, démarche, expressions et présence scénique.",
    details: {
      title: "Objectifs",
      points: [
        "Optimisation de la performance en casting ou sur podium",
        "Développement de confiance et professionnalisme"
      ]
    },
    icon: "AcademicCapIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Formation+Mannequins",
    category: "Services Mannequinat"
  },
  {
    slug: "conseil-image-style",
    title: "Conseil en Image et Style",
    description: "Accompagnement pour look, coiffure, maquillage et style vestimentaire.",
    details: {
      title: "Avantages",
      points: [
        "Image cohérente et professionnelle",
        "Adaptation au projet ou événement",
        "Recommandations personnalisées pour un impact visuel fort"
      ]
    },
    icon: "IdentificationIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Conseil+en+Image+et+Style",
    category: "Services Mannequinat"
  },
  {
    slug: "creation-tenues-sur-mesure",
    title: "Création de Tenues Sur-Mesure",
    description: "Tenues sur-mesure pour femmes, hommes et enfants, en accord avec vos goûts et votre identité.",
    details: {
      title: "Inclus",
      points: [
        "Couture à la main et finitions parfaites",
        "Utilisation de tissus haut de gamme (wax, satin, mousseline, dentelle, tulle)",
        "Designs uniques et personnalisés"
      ]
    },
    icon: "ScissorsIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Creation+de+Tenues+Sur-Mesure",
    category: "Services Mode et Stylisme"
  },
  {
    slug: "location-tenues-mode",
    title: "Location de Tenues de Mode",
    description: "Accédez à notre collection de tenues pour vos défilés, shootings ou événements spéciaux.",
    details: {
      title: "Avantages",
      points: [
        "Choix parmi une large gamme de styles et tailles",
        "Tenues disponibles pour une période flexible"
      ]
    },
    icon: "BriefcaseIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Location+de+Tenues+de+Mode",
    category: "Services Mode et Stylisme"
  },
  {
    slug: "styling-conseil-mode",
    title: "Styling & Conseil Mode",
    description: "Création de looks parfaits pour campagnes, shootings ou événements.",
    details: {
      title: "Avantages",
      points: [
        "Coordination totale des couleurs et accessoires",
        "Conseils mode personnalisés selon vos objectifs"
      ]
    },
    icon: "PaintBrushIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Styling+et+Conseil+Mode",
    category: "Services Mode et Stylisme"
  },
  {
    slug: "organisation-defiles-mode",
    title: "Organisation Défilés de Mode",
    description: "Planification et exécution complète du défilé : mannequins, scénographie, musique, mise en scène.",
    details: {
      title: "Inclus",
      points: [
        "Événement professionnel et mémorable",
        "Coordination complète avec stylistes et partenaires",
        "Expérience exceptionnelle pour vos invités et participants"
      ]
    },
    icon: "PresentationChartLineIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Organisation+Defiles+de+Mode",
    category: "Services Mode et Stylisme"
  },
  {
    slug: "conseil-creatif-branding",
    title: "Conseil Créatif et Branding",
    description: "Développement de l’identité visuelle et de la présence de votre marque.",
    details: {
      title: "Avantages",
      points: [
        "Conception de l’identité visuelle (logo, charte graphique)",
        "Développement de votre style unique pour vos collections",
        "Conseils sur marketing et communication"
      ]
    },
    icon: "SparklesIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Conseil+Creatif+et+Branding",
    category: "Services Mode et Stylisme"
  },
  {
    slug: "shooting-mode-professionnel",
    title: "Shooting Mode Professionnel",
    description: "Organisation complète de shootings en studio ou extérieur avec photographe, styliste et maquilleur.",
    details: {
      title: "Inclus",
      points: [
        "Photos de haute qualité pour vos catalogues ou réseaux sociaux",
        "Coordination totale pour un résultat harmonieux",
        "Accompagnement personnalisé selon votre projet"
      ]
    },
    icon: "CameraIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Shooting+Mode+Professionnel",
    category: "Services Mode et Stylisme"
  },
  {
    slug: "accessoires-lookbook",
    title: "Accessoires et Lookbook",
    description: "Création ou fourniture d’accessoires pour compléter vos collections et shootings.",
    details: {
      title: "Inclus",
      points: [
        "Sélection harmonisée avec vos tenues",
        "Conseil styling pour un look complet et percutant"
      ]
    },
    icon: "StarIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Accessoires+et+Lookbook",
    category: "Services Mode et Stylisme"
  },
  {
    slug: "animation-shows-defiles",
    title: "Animation de Shows / Défilés",
    description: "Animation complète de vos événements mode pour captiver votre public.",
    details: {
      title: "Inclus",
      points: [
        "Coordination des mannequins et performances artistiques",
        "Gestion du rythme et de la mise en scène"
      ]
    },
    icon: "MegaphoneIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Animation+de+Shows+Defiles",
    category: "Services Événementiels"
  },
  {
    slug: "presentateurs-hotes",
    title: "Présentateurs / Hôtes de Cérémonie",
    description: "Hôtes professionnels pour introduire vos défilés et événements.",
    icon: "MicrophoneIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Presentateurs+Hotes+de+Ceremonie",
    category: "Services Événementiels"
  },
  {
    slug: "promotion-communication",
    title: "Promotion et Communication",
    description: "Couverture complète de vos événements et projets sur réseaux sociaux et médias partenaires.",
    icon: "ChatBubbleLeftRightIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Promotion+et+Communication",
    category: "Services Événementiels"
  },
  {
    slug: "partenariat-marques",
    title: "Partenariat avec Marques",
    description: "Mise en relation de marques avec mannequins, créateurs et stylistes pour des collaborations impactantes.",
    icon: "BuildingStorefrontIcon",
    buttonText: "Réserver ce service",
    buttonLink: "/contact?service=Partenariat+avec+Marques",
    category: "Services Événementiels"
  }
];

export const agencyAchievements: AchievementCategory[] = [
  { name: 'Défilés de Mode', items: ['Libreville Fashion Week', 'Black Fashion Week Paris (Représentation)', 'FIMA Niger (Représentation)'] },
  { name: 'Campagnes Publicitaires', items: ['Airtel Gabon', 'BGFI Bank', 'Sobebra', 'Canal+'] },
  { name: 'Magazines', items: ['Gabon Magazine', 'Afropolitan', 'Elle Côte d\'Ivoire (Édito)'] },
];

export const agencyPartners: Partner[] = [
  { name: 'G Store' },
  { name: 'NR Picture' },
  { name: 'Tito Style' },
  { name: 'La Gare du Nord' },
  { name: 'Miguel Fashion Style' }
];

export const faqData: FAQCategory[] = [
  {
    category: 'Devenir Mannequin',
    items: [
      {
        question: "Quels sont les critères pour devenir mannequin chez PMM ?",
        answer: "Nous recherchons des profils variés. Pour les défilés, les critères de taille sont généralement de 1m70 minimum pour les femmes et 1m80 pour les hommes. Cependant, nous encourageons tous les talents, y compris pour le mannequinat commercial et beauté, à postuler via notre page Casting."
      },
      {
        question: "Dois-je avoir de l'expérience pour postuler ?",
        answer: "Non, l'expérience n'est pas obligatoire. Perfect Models Management est aussi une agence de développement. Nous organisons des castings pour dénicher de nouveaux talents que nous formons ensuite via notre 'Classroom Débutant'."
      },
      {
        question: "Comment se déroule le processus de casting ?",
        answer: "Après avoir postulé en ligne, les profils présélectionnés sont invités à un casting physique. Vous serez évalué sur votre démarche, votre photogénie et votre personnalité par un jury de professionnels. Les candidats retenus intègrent ensuite notre programme de formation."
      }
    ]
  },
  {
    category: 'Nos Services',
    items: [
      {
        question: "Comment puis-je booker un mannequin pour mon projet ?",
        answer: "C'est très simple. Vous pouvez nous contacter via notre page Contact ou remplir directement le formulaire de demande de booking. Précisez la nature de votre projet, les dates, et le(s) profil(s) recherché(s), et notre équipe vous répondra dans les plus brefs délais."
      },
      {
        question: "Organisez-vous des shootings pour des particuliers ?",
        answer: "Oui, via notre service 'Shooting Mode Professionnel'. Nous pouvons organiser une séance photo complète pour vous, que ce soit pour un book personnel ou simplement pour le plaisir, en collaboration avec nos photographes, stylistes et maquilleurs partenaires."
      }
    ]
  },
  {
    category: 'Événements',
    items: [
      {
        question: "Comment puis-je participer au Perfect Fashion Day en tant que créateur ?",
        answer: "Nous ouvrons les candidatures pour les créateurs plusieurs mois avant chaque édition. Vous pouvez soumettre votre dossier via le formulaire de candidature dédié sur la page 'Perfect Fashion Day' lorsque les inscriptions sont ouvertes."
      },
      {
        question: "Vendez-vous des billets pour assister à vos défilés ?",
        answer: "L'accès à nos événements comme le Perfect Fashion Day se fait généralement sur invitation. Cependant, nous organisons parfois des concours sur nos réseaux sociaux pour faire gagner des places. Suivez-nous pour ne rien manquer !"
      },
      {
        question: "Comment devenir partenaire de vos événements ?",
        answer: "Nous sommes toujours ouverts à des collaborations avec des marques et entreprises qui partagent nos valeurs. Veuillez nous contacter via notre page Contact pour discuter des opportunités de partenariat pour nos prochains événements."
      }
    ]
  }
];
