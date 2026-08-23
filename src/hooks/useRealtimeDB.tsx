import { useCallback, useEffect, useState } from 'react';
import logger from '../utils/logger';
import { invalidateCache } from './useFirebaseCollection';
import type {
  Model, FashionDayEvent, Service, AchievementCategory, ModelDistinction, Testimonial,
  ContactInfo, SiteImages, Partner, ApiKeys, CastingApplication, FashionDayApplication,
  NewsItem, ForumThread, ForumReply, Article, Module, ArticleComment, RecoveryRequest,
  JuryMember, RegistrationStaff, BookingRequest, ContactMessage, FAQCategory, Absence,
  MonthlyPayment, Transaction, PhotoshootBrief, NavLink, AdminProfile, GalleryItem,
  GalleryAlbum, MailingContact,
} from '../types';

export const LAZY_COLLECTIONS = [
  'castingApplications', 'fashionDayApplications', 'contactMessages', 'bookingRequests',
  'recoveryRequests', 'articleComments', 'forumReplies', 'absences', 'monthlyPayments',
  'transactions', 'photoshootBriefs', 'mailingContacts', 'gallery', 'galleryAlbums',
] as const;

export interface AppData {
  siteConfig: { logo: string };
  navLinks: NavLink[];
  socialLinks: { facebook: string; instagram: string; youtube: string; tiktok?: string; whatsapp?: string; linkedin?: string; twitter?: string };
  agencyTimeline: { year: string; event: string }[];
  agencyInfo: { about: { p1: string; p2: string }; values: { name: string; description: string }[] };
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
  [key: string]: any;
}

const ARRAY_KEYS = [
  'navLinks', 'agencyTimeline', 'modelDistinctions', 'agencyServices', 'agencyAchievements',
  'agencyPartners', 'models', 'fashionDayEvents', 'testimonials', 'articles', 'courseData',
  'castingApplications', 'fashionDayApplications', 'newsItems', 'forumThreads', 'forumReplies',
  'articleComments', 'recoveryRequests', 'bookingRequests', 'contactMessages', 'juryMembers',
  'registrationStaff', 'faqData', 'absences', 'monthlyPayments', 'transactions',
  'photoshootBriefs', 'gallery', 'galleryAlbums', 'mailingContacts',
] as const;

const arr = (value: any) => Array.isArray(value)
  ? value.filter(Boolean)
  : value && typeof value === 'object'
    ? Object.values(value).filter(Boolean)
    : [];

const dedupe = (items: any[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = String(item?.id ?? item?.slug ?? item?.edition ?? JSON.stringify(item));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const emptyData = (): AppData => ({
  siteConfig: { logo: '' },
  navLinks: [],
  socialLinks: { facebook: '', instagram: '', youtube: '', tiktok: '', whatsapp: '' },
  agencyTimeline: [],
  agencyInfo: { about: { p1: '', p2: '' }, values: [] },
  modelDistinctions: [],
  agencyServices: [],
  agencyAchievements: [],
  agencyPartners: [],
  models: [],
  fashionDayEvents: [],
  testimonials: [],
  articles: [],
  courseData: [],
  contactInfo: { email: '', phone: '', address: '' } as ContactInfo,
  siteImages: { hero: '', about: '', fashionDayBg: '', agencyHistory: '', classroomBg: '', castingBg: '' } as SiteImages,
  apiKeys: {} as ApiKeys,
  castingApplications: [],
  fashionDayApplications: [],
  newsItems: [],
  forumThreads: [],
  forumReplies: [],
  articleComments: [],
  recoveryRequests: [],
  bookingRequests: [],
  contactMessages: [],
  juryMembers: [],
  registrationStaff: [],
  faqData: [],
  absences: [],
  monthlyPayments: [],
  transactions: [],
  photoshootBriefs: [],
  adminProfile: { id: 'admin', name: 'Administration PMM', username: 'admin', password: '', email: 'admin@perfectmodels.online' } as AdminProfile,
  gallery: [],
  galleryAlbums: [],
  mailingContacts: [],
});

const normalize = (raw: any): AppData => {
  const merged: any = { ...emptyData(), ...(raw && typeof raw === 'object' ? raw : {}) };
  for (const key of ARRAY_KEYS) merged[key] = dedupe(arr(merged[key]));
  // Secrets remain server-only and must never be hydrated into browser state.
  merged.apiKeys = {};
  return merged as AppData;
};

export const useRealtimeDB = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isInitialized, setInitialized] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/data', { credentials: 'include', cache: 'no-store' });
      if (!response.ok) throw new Error(`API data ${response.status}`);
      const payload = await response.json();
      setData(normalize(payload.data));
    } catch (error) {
      // Never inject demo/business seed data after a server failure: an empty state is safer than false data.
      logger.error('Server data load failed', error);
      setData((current) => current ?? emptyData());
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const onAuthChanged = () => void load();
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    window.addEventListener('pmm-auth-changed', onAuthChanged);
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(() => void load(), 30_000);
    return () => {
      window.removeEventListener('pmm-auth-changed', onAuthChanged);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, [load]);

  const saveData = useCallback(async (newData: AppData) => {
    const response = await fetch('/api/data', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Sauvegarde serveur impossible');
    }
    setData(normalize(newData));
    LAZY_COLLECTIONS.forEach(invalidateCache);
  }, []);

  const addDocument = useCallback(async (path: string, item: any) => {
    const response = await fetch(`/api/data/${encodeURIComponent(path)}`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Création impossible');
    invalidateCache(path);
    await load();
    return payload.id as string;
  }, [load]);

  const updateDocument = useCallback(async (path: string, id: string, updates: any) => {
    const response = await fetch(`/api/data/${encodeURIComponent(path)}/${encodeURIComponent(id)}`, {
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Mise à jour impossible');
    invalidateCache(path);
    await load();
  }, [load]);

  const deleteDocument = useCallback(async (path: string, id: string) => {
    const response = await fetch(`/api/data/${encodeURIComponent(path)}/${encodeURIComponent(id)}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) throw new Error('Suppression impossible');
    invalidateCache(path);
    await load();
  }, [load]);

  return { data, saveData, isInitialized, addDocument, updateDocument, deleteDocument };
};
