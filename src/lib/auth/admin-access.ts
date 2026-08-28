import type { AdminPagePermissions } from '@/types';
import type { ResourceName } from '@/lib/resource-registry';
import type { AppSessionProfile } from './profile';

export const RESOURCE_PERMISSION_MAP: Partial<Record<ResourceName, keyof AdminPagePermissions>> = {
  models: 'models',
  'casting-applications': 'castingApplications',
  'casting-scores': 'castingResults',
  bookings: 'bookings',
  'fashion-day-applications': 'fashionDayApplications',
  'fashion-day-events': 'fashionDayEvents',
  'fashion-day-reservations': 'fashionDayEvents',
  services: 'agency',
  magazine: 'magazine',
  gallery: 'mediaLibrary',
  mailing: 'mailing',
  messages: 'messages',
  notifications: 'messages',
  absences: 'absences',
  payments: 'payments',
  comments: 'comments',
  recovery: 'recovery',
  'photoshoot-briefs': 'artisticDirection',
  'beauty-contests': 'beautyContests',
  courses: 'classroom',
  'course-progress': 'classroomProgress',
  'classroom-messages': 'liveChat',
  'classroom-requests': 'classroomProgress',
};

export function hasAdminPermission(profile: AppSessionProfile, permission: keyof AdminPagePermissions) {
  if (profile.role === 'admin') return true;
  if (profile.role !== 'manager') return false;
  return Boolean(profile.adminPermissions?.[permission]);
}

export function hasResourcePermission(profile: AppSessionProfile, resource: ResourceName) {
  if (profile.role === 'admin') return true;
  const permission = RESOURCE_PERMISSION_MAP[resource];
  return Boolean(permission && hasAdminPermission(profile, permission));
}
