import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { ref, onValue, set } from '../compat/firebase/database';
import { Model, FashionDayEvent, Service, AchievementCategory, ModelDistinction, Testimonial, ContactInfo, SiteImages, Partner, ApiKeys, CastingApplication, FashionDayApplication, NewsItem, ForumThread, ForumReply, Article, Module, ArticleComment, RecoveryRequest, JuryMember, RegistrationStaff, BookingRequest, ContactMessage, FAQCategory, Absence, MonthlyPayment, PhotoshootBrief, NavLink } from '../types';
import { models as initialModels, siteConfig as initialSiteConfig, contactInfo as initialContactInfo, siteImages as initialSiteImages, apiKeys as initialApiKeys, castingApplications as initialCastingApplications, fashionDayApplications as initialFashionDayApplications, forumThreads as initialForumThreads, forumReplies as initialForumReplies, articleComments as initialArticleComments, recoveryRequests as initialRecoveryRequests, bookingRequests as initialBookingRequests, contactMessages as initialContactMessages, absences as initialAbsences, monthlyPayments as initialMonthlyPayments, photoshootBriefs as initialPhotoshootBriefs, newsItems as initialNewsItems, navLinks as initialNavLinks, fashionDayEvents as initialFashionDayEvents, socialLinks as initialSocialLinks, agencyTimeline as initialAgencyTimeline, agencyInfo as initialAgencyInfo, modelDistinctions as initialModelDistinctions, agencyServices as initialAgencyServices, agencyAchievements as initialAgencyAchievements, agencyPartners as initialAgencyPartners, testimonials as initialTestimonials, juryMembers as initialJuryMembers, registrationStaff as initialRegistrationStaff, faqData as initialFaqData } from '../constants/data';
import { articles as initialArticles } from '../constants/magazineData';
// NOTE: initialArticles is kept as a typed placeholder but NOT used as fallback data.
import { courseData as initialCourseData } from '../constants/courseData';

export interface GalleryAlbum {
    id: string;
    title: string;
    slug: string;
    category: 'Collaborations' | 'Shooting' | 'Défilés' | 'Événements' | 'Backstage' | 'Autres';
    description?: string;
    date?: string;
    location?: string;
    coverImage: string;
    images: string[];
    featured?: boolean;
    published?: boolean;
    participants?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AppData {
    siteConfig: { logo: string };
    navLinks: NavLink[];
    socialLinks: { facebook: string; instagram: string; youtube: string; };
    agencyTimeline: { year: string; event: string; }[];
    agencyInfo: { about: { p1: string; p2: string; }; values: { name: string; description: string; }[]; };
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
    photoshootBriefs: PhotoshootBrief[];
    galleryAlbums: GalleryAlbum[];
}

export const useDataStore = () => {
    const [data, setData] = useState<AppData | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const getInitialData = useCallback((): AppData => ({
        models: initialModels, siteConfig: initialSiteConfig, contactInfo: initialContactInfo, siteImages: initialSiteImages, apiKeys: initialApiKeys,
        castingApplications: initialCastingApplications, fashionDayApplications: initialFashionDayApplications, forumThreads: initialForumThreads, forumReplies: initialForumReplies,
        articleComments: initialArticleComments, recoveryRequests: initialRecoveryRequests, bookingRequests: initialBookingRequests, contactMessages: initialContactMessages,
        absences: initialAbsences, monthlyPayments: initialMonthlyPayments, photoshootBriefs: initialPhotoshootBriefs, newsItems: initialNewsItems, navLinks: initialNavLinks,
        fashionDayEvents: initialFashionDayEvents, socialLinks: initialSocialLinks, agencyTimeline: initialAgencyTimeline, agencyInfo: initialAgencyInfo,
        modelDistinctions: initialModelDistinctions, agencyServices: initialAgencyServices, agencyAchievements: initialAgencyAchievements, agencyPartners: initialAgencyPartners,
        testimonials: initialTestimonials, articles: [], courseData: initialCourseData, juryMembers: initialJuryMembers, registrationStaff: initialRegistrationStaff,
        faqData: initialFaqData, galleryAlbums: [],
    }), []);

    useEffect(() => {
        const dbRef = ref(db, '/');
        const unsubscribe = onValue(dbRef, (snapshot) => {
            const dbData = snapshot.val();
            const initialData = getInitialData();
            if (dbData) {
                const mergedData: AppData = {
                    ...initialData,
                    ...dbData,
                    models: (dbData.models && dbData.models.length > 0) ? dbData.models : initialData.models,
                    articles: (dbData.articles && dbData.articles.length > 0) ? dbData.articles : [],
                    courseData: (dbData.courseData && dbData.courseData.length > 0) ? dbData.courseData : initialData.courseData,
                    newsItems: (dbData.newsItems && dbData.newsItems.length > 0) ? dbData.newsItems : initialData.newsItems,
                    testimonials: (dbData.testimonials && dbData.testimonials.length > 0) ? dbData.testimonials : initialData.testimonials,
                    agencyServices: (dbData.agencyServices && dbData.agencyServices.length > 0) ? dbData.agencyServices : initialData.agencyServices,
                    fashionDayEvents: (dbData.fashionDayEvents && dbData.fashionDayEvents.length > 0) ? dbData.fashionDayEvents : initialData.fashionDayEvents,
                    faqData: (dbData.faqData && dbData.faqData.length > 0) ? dbData.faqData : initialData.faqData,
                    juryMembers: (dbData.juryMembers && dbData.juryMembers.length > 0) ? dbData.juryMembers : initialData.juryMembers,
                    registrationStaff: (dbData.registrationStaff && dbData.registrationStaff.length > 0) ? dbData.registrationStaff : initialData.registrationStaff,
                    galleryAlbums: Array.isArray(dbData.galleryAlbums) ? dbData.galleryAlbums : initialData.galleryAlbums,
                };
                mergedData.navLinks = initialData.navLinks;
                setData(mergedData);
            } else {
                set(dbRef, initialData).then(() => setData(initialData)).catch((error) => console.error('Error seeding database:', error));
            }
            setIsInitialized(true);
        }, (error) => {
            console.error('Firebase read failed: ' + error.message);
            setData(getInitialData());
            setIsInitialized(true);
        });
        return () => unsubscribe();
    }, [getInitialData]);

    const saveData = useCallback(async (newData: AppData) => {
        await set(ref(db, '/'), newData);
        setData(newData);
    }, []);

    const saveGalleryAlbums = useCallback(async (albums: GalleryAlbum[]) => {
        await set(ref(db, '/galleryAlbums'), albums);
        setData((current) => current ? { ...current, galleryAlbums: albums } : current);
    }, []);

    return { data, saveData, saveGalleryAlbums, isInitialized };
};
