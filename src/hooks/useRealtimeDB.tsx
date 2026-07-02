import { useState, useEffect, useCallback } from 'react';
import { db } from '../realtimedbConfig';
import { ref, onValue, set, get, update, remove, push } from 'firebase/database';
import logger from '../utils/logger';
import { invalidateCache } from './useFirebaseCollection';
import { navLinks as initialNavLinks } from '../constants/data';

/**
 * Collections lourdes exclues du listener global.
 * Elles sont chargées à la demande via useFirebaseCollection.
 * Cela réduit drastiquement les lectures Realtime DB au démarrage.
 */
export const LAZY_COLLECTIONS = [
  'castingApplications',
  'fashionDayApplications',
  'contactMessages',
  'bookingRequests',
  'recoveryRequests',
  'articleComments',
  'forumReplies',
  'absences',
  'monthlyPayments',
  'transactions',
  'photoshootBriefs',
  'mailingContacts',
  'gallery',
  'galleryAlbums',
] as const;

export type LazyCollection = typeof LAZY_COLLECTIONS[number];
import { Model, FashionDayEvent, Service, AchievementCategory, ModelDistinction, Testimonial, ContactInfo, SiteImages, Partner, ApiKeys, CastingApplication, FashionDayApplication, NewsItem, ForumThread, ForumReply, Article, Module, ArticleComment, RecoveryRequest, JuryMember, RegistrationStaff, BookingRequest, ContactMessage, FAQCategory, Absence, MonthlyPayment, Transaction, PhotoshootBrief, NavLink, AdminProfile, GalleryItem, GalleryAlbum, MailingContact } from '../types';

// Seed candidates Miss One Light
const MISS_ONE_LIGHT_CANDIDATES = [
    { order: 1,  name: 'LÉONCIA',  slug: 'leoncia',  photo: '', bio: '', votes: 0, status: 'active' },
    { order: 2,  name: 'CELIA',    slug: 'celia',    photo: '', bio: '', votes: 0, status: 'active' },
    { order: 3,  name: 'LAÏCA',    slug: 'laica',    photo: '', bio: '', votes: 0, status: 'active' },
    { order: 4,  name: 'SARAH',    slug: 'sarah',    photo: '', bio: '', votes: 0, status: 'active' },
    { order: 5,  name: 'ANNA',     slug: 'anna',     photo: '', bio: '', votes: 0, status: 'active' },
    { order: 6,  name: 'RÉUSSITE', slug: 'reussite', photo: '', bio: '', votes: 0, status: 'active' },
    { order: 7,  name: 'JOHANNE',  slug: 'johanne',  photo: '', bio: '', votes: 0, status: 'active' },
    { order: 8,  name: 'LEÏLA',    slug: 'leila',    photo: '', bio: '', votes: 0, status: 'active' },
    { order: 9,  name: 'DJENIFER', slug: 'djenifer', photo: '', bio: '', votes: 0, status: 'active' },
    { order: 10, name: 'RENÉE',    slug: 'renee',    photo: '', bio: '', votes: 0, status: 'active' },
    { order: 11, name: 'FANELLA',  slug: 'fanella',  photo: '', bio: '', votes: 0, status: 'active' },
    { order: 12, name: 'ARIANA',   slug: 'ariana',   photo: '', bio: '', votes: 0, status: 'active' },
];

// Convert array to keyed object (slug as key) for RTDB
const missOneLightCandidatesObj = Object.fromEntries(
    MISS_ONE_LIGHT_CANDIDATES.map(c => [c.slug, c])
);

// Lazy-load initial seed data — only needed if Firebase DB is empty (first run)
const loadInitialData = async () => {
    const [{ articles }, { courseData }, data] = await Promise.all([
        import('../constants/magazineData'),
        import('../constants/courseData'),
        import('../constants/data'),
    ]);
    return { ...data, articles, courseData };
};

export interface AppData {
    siteConfig: { logo: string };
    navLinks: NavLink[];
    socialLinks: { facebook: string; instagram: string; youtube: string; };
    agencyTimeline: { year: string; event: string; }[];
    agencyInfo: {
        about: { p1: string; p2: string; };
        values: { name: string; description: string; }[];
    };
    modelDistinctions: ModelDistinction[];
    agencyServices: Service[];
    agencyAchievements: AchievementCategory[];
    agencyPartners: Partner[];
    models: Model[];
    fashionDayEvents: FashionDayEvent[];
    testimonials: Testimonial[];
    articles: Article[];
    courseData: Module[];
    contactInfo: ContactInfo;
    siteImages: SiteImages;
    apiKeys: ApiKeys;
    castingApplications: CastingApplication[];
    fashionDayApplications: FashionDayApplication[];
    newsItems: NewsItem[];
    forumThreads: ForumThread[];
    forumReplies: ForumReply[];
    articleComments: ArticleComment[];
    recoveryRequests: RecoveryRequest[];
    bookingRequests: BookingRequest[];
    contactMessages: ContactMessage[];
    juryMembers: JuryMember[];
    registrationStaff: RegistrationStaff[];
    faqData: FAQCategory[];
    absences: Absence[];
    monthlyPayments: MonthlyPayment[];
    transactions: Transaction[];
    photoshootBriefs: PhotoshootBrief[];
    adminProfile: AdminProfile;
    gallery: GalleryItem[];
    galleryAlbums: GalleryAlbum[];
    mailingContacts: MailingContact[];
}

// Renamed hook to useRealtimeDB
export const useRealtimeDB = () => {
    const [data, setData] = useState<AppData | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load initial seed data lazily — only called when Firebase DB is empty
    const getInitialData = useCallback(async (): Promise<AppData> => {
        const d = await loadInitialData();
        return {
            models: d.models,
            siteConfig: d.siteConfig,
            contactInfo: d.contactInfo,
            siteImages: d.siteImages,
            apiKeys: d.apiKeys,
            castingApplications: d.castingApplications,
            fashionDayApplications: d.fashionDayApplications,
            forumThreads: d.forumThreads,
            forumReplies: d.forumReplies,
            articleComments: d.articleComments,
            recoveryRequests: d.recoveryRequests,
            bookingRequests: d.bookingRequests,
            contactMessages: d.contactMessages,
            absences: d.absences,
            monthlyPayments: d.monthlyPayments,
            photoshootBriefs: d.photoshootBriefs,
            newsItems: d.newsItems,
            navLinks: d.navLinks,
            fashionDayEvents: d.fashionDayEvents,
            socialLinks: d.socialLinks,
            agencyTimeline: d.agencyTimeline,
            agencyInfo: d.agencyInfo,
            modelDistinctions: d.modelDistinctions,
            agencyServices: d.agencyServices,
            agencyAchievements: d.agencyAchievements,
            agencyPartners: d.agencyPartners,
            testimonials: d.testimonials,
            articles: d.articles,
            courseData: d.courseData,
            juryMembers: d.juryMembers,
            registrationStaff: d.registrationStaff,
            faqData: d.faqData,
            adminProfile: { id: 'admin', name: 'Admin Principal', username: 'admin', password: '', email: 'contact@perfectmodels.online' },
            gallery: [],
            galleryAlbums: [],
            transactions: [],
            mailingContacts: d.mailingContacts,
        };
    }, []);
    // Helper function to convert Firebase objects to arrays
    const convertToArray = (obj: any): any[] => {
        if (!obj) return [];
        if (Array.isArray(obj)) return obj;
        // Convert object with numeric keys to array
        return Object.values(obj);
    };

    // Helper function to deduplicate array based on ID
    const deduplicateById = (arr: any[]): any[] => {
        const seen = new Set();
        return arr.filter(item => {
            if (!item || !item.id) return true;
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
    };

    // Helper function to deduplicate navLinks by path
    const deduplicateNavLinks = (arr: any[]): any[] => {
        const seen = new Set();
        return arr.filter(item => {
            if (!item || !item.path) return false;
            if (seen.has(item.path)) return false;
            seen.add(item.path);
            return true;
        });
    };

    // Helper function to deduplicate fashionDayEvents by edition
    const deduplicateFashionDayEvents = (arr: any[]): any[] => {
        const seen = new Set();
        return arr.filter(event => {
            if (!event || typeof event.edition === 'undefined') return false;
            if (seen.has(event.edition)) return false;
            seen.add(event.edition);
            return true;
        });
    };

    // Helper function to normalize data structure from Firebase
    const normalizeData = (dbData: any): AppData => {
        // Convert fashionDayEvents and normalize nested arrays
        const fashionDayEventsArray = convertToArray(dbData.fashionDayEvents).map((event: any) => ({
            ...event,
            stylists: deduplicateById(convertToArray(event.stylists)),
            partners: deduplicateById(convertToArray(event.partners)),
            artists: deduplicateById(convertToArray(event.artists)),
        }));

        // Deduplicate by edition number
        const fashionDayEvents = deduplicateFashionDayEvents(fashionDayEventsArray);

        // Convert agencyAchievements and normalize nested items array
        const agencyAchievements = deduplicateById(convertToArray(dbData.agencyAchievements).map((achievement: any) => ({
            ...achievement,
            items: convertToArray(achievement.items),
        })));

        // Process navLinks — merge DB links with seed to ensure new entries always appear
        const processedNavLinks = deduplicateNavLinks([
            ...convertToArray(dbData.navLinks),
            // Inject any seed links missing from DB (e.g. newly added pages)
            ...initialNavLinks.filter(
                seed => !convertToArray(dbData.navLinks).some((db: any) => db?.path === seed.path)
            ),
        ]);
        const filteredNavLinks = processedNavLinks.filter(link => {
            const shouldExclude = link && (link.path === '/' || link.path === '/fashion-day');
            if (shouldExclude) {
                console.log('🚫 Filtering out:', link.label, link.path);
            }
            return !shouldExclude;
        });
        console.log('✅ Final navLinks:', filteredNavLinks.map(l => l?.label).join(', '));

        return {
            ...dbData,
            models: deduplicateById(convertToArray(dbData.models)),
            navLinks: filteredNavLinks,
            fashionDayEvents,
            agencyPartners: deduplicateById(convertToArray(dbData.agencyPartners)),
            agencyServices: deduplicateById(convertToArray(dbData.agencyServices)),
            agencyAchievements,
            modelDistinctions: deduplicateById(convertToArray(dbData.modelDistinctions)),
            testimonials: deduplicateById(convertToArray(dbData.testimonials)),
            articles: deduplicateById(convertToArray(dbData.articles)),
            courseData: deduplicateById(convertToArray(dbData.courseData)),
            castingApplications: deduplicateById(convertToArray(dbData.castingApplications)),
            fashionDayApplications: deduplicateById(convertToArray(dbData.fashionDayApplications)),
            newsItems: deduplicateById(convertToArray(dbData.newsItems)),
            forumThreads: deduplicateById(convertToArray(dbData.forumThreads)),
            forumReplies: deduplicateById(convertToArray(dbData.forumReplies)),
            articleComments: deduplicateById(convertToArray(dbData.articleComments)),
            recoveryRequests: deduplicateById(convertToArray(dbData.recoveryRequests)),
            bookingRequests: deduplicateById(convertToArray(dbData.bookingRequests)),
            contactMessages: deduplicateById(convertToArray(dbData.contactMessages)),
            juryMembers: deduplicateById(convertToArray(dbData.juryMembers)),
            registrationStaff: deduplicateById(convertToArray(dbData.registrationStaff)),
            faqData: deduplicateById(convertToArray(dbData.faqData)),
            absences: deduplicateById(convertToArray(dbData.absences)),
            monthlyPayments: deduplicateById(convertToArray(dbData.monthlyPayments)),
            transactions: deduplicateById(convertToArray(dbData.transactions)),
            photoshootBriefs: deduplicateById(convertToArray(dbData.photoshootBriefs)),
            gallery: deduplicateById(convertToArray(dbData.gallery)),
            galleryAlbums: deduplicateById(convertToArray(dbData.galleryAlbums ?? [])),
            agencyTimeline: deduplicateById(convertToArray(dbData.agencyTimeline)),
            mailingContacts: deduplicateById(convertToArray(dbData.mailingContacts ?? [])),            // Handle nested objects within agencyInfo
            agencyInfo: dbData.agencyInfo ? {
                ...dbData.agencyInfo,
                values: deduplicateById(convertToArray(dbData.agencyInfo.values))
            } : { about: { p1: '', p2: '' }, values: [] },
        };
    };

    useEffect(() => {
        // On écoute uniquement le nœud racine SANS les collections lourdes.
        // Les collections lourdes sont chargées à la demande via useFirebaseCollection.
        const dbRef = ref(db);

        const unsubscribe = onValue(dbRef, (snapshot) => {
            const dbData = snapshot.val();
            if (dbData) {
                // Injecter des tableaux vides pour les collections lazy
                // afin que le reste de l'app ne casse pas
                const withLazyPlaceholders = { ...dbData };
                LAZY_COLLECTIONS.forEach(col => {
                    if (!(col in withLazyPlaceholders)) {
                        withLazyPlaceholders[col] = [];
                    }
                });
                const normalizedData = normalizeData(withLazyPlaceholders);
                setData(normalizedData);
                logger.log("✅ Realtime DB data loaded successfully");

                // Patch: if missOneLight/candidates is missing, seed it now
                if (!dbData.missOneLight?.candidates) {
                    set(ref(db, 'missOneLight/candidates'), missOneLightCandidatesObj)
                        .then(() => logger.log("✅ missOneLight/candidates seeded"))
                        .catch(() => {});
                }

                setIsInitialized(true);
            } else {
                // DB is empty — load seed data lazily then write it
                getInitialData().then(initial => {
                    // Include Miss One Light candidates in the seed
                    const withMissOneLight = {
                        ...initial,
                        missOneLight: { candidates: missOneLightCandidatesObj },
                    };
                    set(dbRef, withMissOneLight).then(() => {
                        setData(initial);
                        logger.log("✅ Realtime DB seeded with initial data.");
                    }).catch(error => {
                        logger.error("Realtime DB seeding failed:", error);
                        setData(initial);
                    }).finally(() => setIsInitialized(true));
                });
            }
        }, (error) => {
            logger.error("Realtime DB read failed:", error);
            // Fallback: load seed data lazily
            getInitialData().then(initial => {
                setData(initial);
                setIsInitialized(true);
            });
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [getInitialData]);

    const saveData = useCallback(async (newData: AppData) => {
        try {
            const dbRef = ref(db);
            // Firebase rejette les valeurs undefined — on les nettoie avant l'écriture
            const clean = JSON.parse(JSON.stringify(newData));
            await set(dbRef, clean);
            setData(newData); // Optimistic update
            // Invalider le cache des collections lazy qui ont pu changer
            LAZY_COLLECTIONS.forEach(col => invalidateCache(col));
            logger.log("✅ Data saved to Realtime DB successfully");
        } catch (error) {
            logger.error("Error saving data to Realtime DB:", error);
            throw error;
        }
    }, []);

    // --- CRUD functions for Realtime Database ---

    const addDocument = useCallback(async (path: string, item: any) => {
        try {
            const pathRef = ref(db, path);
            const newDocRef = push(pathRef); // Generate a unique key
            await set(newDocRef, { ...item, id: newDocRef.key });
            invalidateCache(path); // Invalider le cache de cette collection
            return newDocRef.key;
        } catch (error) {
            logger.error(`Error adding document to ${path}: `, error);
            throw error;
        }
    }, []);

    const updateDocument = useCallback(async (path: string, id: string, updates: any) => {
        try {
            const docRef = ref(db, `${path}/${id}`);
            await update(docRef, updates);
            invalidateCache(path); // Invalider le cache de cette collection
        } catch (error) {
            logger.error(`Error updating document ${id} in ${path}: `, error);
            throw error;
        }
    }, []);

    const deleteDocument = useCallback(async (path: string, id: string) => {
        try {
            const docRef = ref(db, `${path}/${id}`);
            await remove(docRef);
            invalidateCache(path); // Invalider le cache de cette collection
        } catch (error) {
            logger.error(`Error deleting document ${id} from ${path}: `, error);
            throw error;
        }
    }, []);

    return { data, saveData, isInitialized, addDocument, updateDocument, deleteDocument };
};

