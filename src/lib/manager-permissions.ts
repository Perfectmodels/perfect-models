import type { AdminPagePermissions } from '@/types';

export const MANAGER_DEFAULT_PERMISSIONS: Required<AdminPagePermissions> = {
  dashboard: false,
  models: true,
  absences: true,
  agency: false,
  artisticDirection: true,
  beautyContests: false,
  bookings: true,
  castingApplications: false,
  castingResults: false,
  classroom: true,
  classroomProgress: true,
  comments: false,
  fashionDayApplications: false,
  fashionDayEvents: false,
  gallery: false,
  imageAnalysis: false,
  imageGeneration: false,
  liveChat: false,
  magazine: false,
  mailing: false,
  mediaLibrary: false,
  messages: true,
  modelAccess: false,
  news: false,
  payments: true,
  recovery: false,
  settings: false,
  userPermissions: false,
};

export function defaultManagerPermissions(): AdminPagePermissions {
  return { ...MANAGER_DEFAULT_PERMISSIONS };
}
