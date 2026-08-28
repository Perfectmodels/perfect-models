export const RESOURCE_DEFINITIONS = {
  models: { table: 'models', primaryKey: 'id', title: 'Mannequins', orderBy: 'created_at', columns: ['name', 'username', 'gender', 'height', 'level', 'is_public', 'is_active', 'status'] },
  'casting-applications': { table: 'casting_applications', primaryKey: 'id', title: 'Candidatures casting', orderBy: 'created_at', columns: ['full_name', 'email', 'phone', 'gender', 'height_cm', 'status', 'created_at'] },
  'casting-scores': { table: 'casting_scores', primaryKey: 'id', title: 'Notes du jury', orderBy: 'created_at', columns: ['casting_application_id', 'jury_user_id', 'overall', 'notes', 'created_at'] },
  bookings: { table: 'booking_requests', primaryKey: 'id', title: 'Bookings', orderBy: 'created_at', columns: ['name', 'email', 'phone', 'model_id', 'status', 'created_at'] },
  'fashion-day-applications': { table: 'fashion_day_applications', primaryKey: 'id', title: 'Candidatures Fashion Day', orderBy: 'created_at', columns: ['applicant_name', 'email', 'phone', 'application_type', 'status', 'created_at'] },
  'fashion-day-events': { table: 'fashion_day_events', primaryKey: 'id', title: 'Perfect Fashion Day', orderBy: 'edition', columns: ['edition', 'theme', 'event_date', 'location', 'promoter', 'mc'] },
  'fashion-day-reservations': { table: 'fashion_day_reservations', primaryKey: 'id', title: 'Réservations Fashion Day', orderBy: 'submitted_at', columns: ['name', 'email', 'phone', 'table_option_id', 'status', 'submitted_at'] },
  services: { table: 'services', primaryKey: 'id', title: 'Services', orderBy: 'position', columns: ['title', 'slug', 'category', 'is_active', 'position'] },
  magazine: { table: 'blog_posts', primaryKey: 'id', title: 'Magazine', orderBy: 'created_at', columns: ['title', 'slug', 'category', 'status', 'published_at'] },
  gallery: { table: 'media_library', primaryKey: 'id', title: 'Médiathèque', orderBy: 'created_at', columns: ['file_name', 'provider', 'category', 'url', 'created_at'] },
  mailing: { table: 'mailing_contacts', primaryKey: 'id', title: 'Mailing', orderBy: 'created_at', columns: ['name', 'email', 'category', 'created_at'] },
  messages: { table: 'messages', primaryKey: 'id', title: 'Messagerie', orderBy: 'created_at', columns: ['direction', 'channel', 'recipient', 'subject', 'status', 'created_at'] },
  notifications: { table: 'notifications', primaryKey: 'id', title: 'Notifications', orderBy: 'created_at', columns: ['type', 'title', 'body', 'audience_role', 'is_read', 'created_at'] },
  absences: { table: 'absences', primaryKey: 'id', title: 'Absences', orderBy: 'created_at', columns: ['model_id', 'event_date', 'reason', 'status', 'created_at'] },
  payments: { table: 'monthly_payments', primaryKey: 'id', title: 'Paiements', orderBy: 'created_at', columns: ['model_id', 'period', 'amount', 'currency', 'status', 'paid_at'] },
  comments: { table: 'article_comments', primaryKey: 'id', title: 'Commentaires', orderBy: 'created_at', columns: ['author_name', 'body', 'status', 'created_at'] },
  recovery: { table: 'recovery_requests', primaryKey: 'id', title: 'Récupération de compte', orderBy: 'created_at', columns: ['email', 'identifier', 'status', 'created_at'] },
  'photoshoot-briefs': { table: 'photoshoot_briefs', primaryKey: 'id', title: 'Direction artistique', orderBy: 'created_at', columns: ['title', 'event_date', 'location', 'status', 'created_at'] },
  'jury-members': { table: 'jury_members', primaryKey: 'id', title: 'Jury', orderBy: 'created_at', columns: ['name', 'email', 'phone', 'is_active'] },
  'registration-staff': { table: 'registration_staff', primaryKey: 'id', title: 'Équipe d’enregistrement', orderBy: 'created_at', columns: ['name', 'email', 'phone', 'is_active'] },
  'admin-permissions': { table: 'admin_permissions', primaryKey: 'permission_key', title: 'Permissions admin', orderBy: 'permission_key', columns: ['permission_key', 'value', 'updated_at'] },
  'beauty-contests': { table: 'beauty_contests', primaryKey: 'id', title: 'Concours de beauté', orderBy: 'created_at', columns: ['name', 'status', 'created_at', 'updated_at'] },
  courses: { table: 'courses', primaryKey: 'id', title: 'Classroom', orderBy: 'position', columns: ['id', 'title', 'description', 'is_active', 'position', 'updated_at'] },
  'course-progress': { table: 'course_progress', primaryKey: 'id', title: 'Progression Classroom', orderBy: 'updated_at', columns: ['user_id', 'course_id', 'completed_at', 'updated_at'] },
  'classroom-messages': { table: 'classroom_messages', primaryKey: 'id', title: 'Messages Classroom', orderBy: 'created_at', columns: ['model_id', 'direction', 'subject', 'status', 'created_at'] },
  'classroom-requests': { table: 'classroom_requests', primaryKey: 'id', title: 'Demandes Classroom', orderBy: 'created_at', columns: ['model_id', 'request_type', 'status', 'created_at'] },
  'forum-threads': { table: 'forum_threads', primaryKey: 'id', title: 'Forum', orderBy: 'created_at', columns: ['title', 'status', 'author_user_id', 'created_at'] },
  'forum-replies': { table: 'forum_replies', primaryKey: 'id', title: 'Réponses forum', orderBy: 'created_at', columns: ['thread_id', 'author_user_id', 'body', 'created_at'] },
  'site-settings': { table: 'site_settings', primaryKey: 'key', title: 'Paramètres du site', orderBy: 'key', columns: ['key', 'value', 'updated_at'] },
  navigation: { table: 'navigation_items', primaryKey: 'id', title: 'Navigation', orderBy: 'position', columns: ['label', 'path', 'in_footer', 'position', 'is_active'] },
  'social-links': { table: 'social_links', primaryKey: 'platform', title: 'Réseaux sociaux', orderBy: 'position', columns: ['platform', 'url', 'position', 'is_active'] },
  timeline: { table: 'agency_timeline', primaryKey: 'id', title: 'Historique agence', orderBy: 'position', columns: ['year', 'event', 'position'] },
  content: { table: 'content_blocks', primaryKey: 'key', title: 'Contenus des pages', orderBy: 'key', columns: ['key', 'value', 'updated_at'] },
  entities: { table: 'entities', primaryKey: 'id', title: 'Entités', orderBy: 'created_at', columns: ['entity_type', 'display_name', 'website_url', 'created_at'] },
  profiles: { table: 'profiles', primaryKey: 'user_id', title: 'Profils utilisateurs', orderBy: 'created_at', columns: ['display_name', 'email', 'role', 'identifier', 'model_id', 'is_active'] },
  analytics: { table: 'analytics_events', primaryKey: 'id', title: 'Analytics', orderBy: 'created_at', columns: ['event_type', 'path', 'user_id', 'created_at'] },
} as const;

export type ResourceName = keyof typeof RESOURCE_DEFINITIONS;

export function isResourceName(value: string): value is ResourceName {
  return Object.prototype.hasOwnProperty.call(RESOURCE_DEFINITIONS, value);
}
