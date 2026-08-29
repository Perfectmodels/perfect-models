import type { CrudField, CrudFieldOption, ResourceName } from '@/lib/agency-resource-registry';

const option = (label: string, value = label): CrudFieldOption => ({ label, value });
const GENDER_OPTIONS = [option('Femme'), option('Homme'), option('Autre')];
const LEVEL_OPTIONS = [option('Débutant'), option('Intermédiaire'), option('Confirmé'), option('Professionnel')];
const CURRENCY_OPTIONS = [option('Franc CFA (XAF)', 'XAF'), option('Euro (EUR)', 'EUR'), option('Dollar US (USD)', 'USD')];
const SERVICE_CATEGORY_OPTIONS = [option('Services Mannequinat'), option('Services Mode et Stylisme'), option('Services Événementiels')];
const ARTICLE_CATEGORY_OPTIONS = [option('Actualités'), option('Talents'), option('Événements'), option('Mode'), option('Conseils'), option('Agence')];
const MEDIA_PROVIDER_OPTIONS = [option('ImgBB', 'imgbb'), option('Postimages', 'postimg'), option('Supabase Storage', 'supabase'), option('Local', 'local')];
const MEDIA_CATEGORY_OPTIONS = [option('Mannequin', 'model'), option('Événement', 'event'), option('Article', 'article'), option('Agence', 'agency'), option('Autre', 'other')];
const MESSAGE_CHANNEL_OPTIONS = [option('E-mail', 'email'), option('Interne', 'internal'), option('Push', 'push'), option('WhatsApp', 'whatsapp')];
const SOCIAL_PLATFORM_OPTIONS = [option('Instagram', 'instagram'), option('Facebook', 'facebook'), option('TikTok', 'tiktok'), option('YouTube', 'youtube'), option('WhatsApp', 'whatsapp'), option('LinkedIn', 'linkedin')];
const APPLICATION_TYPE_OPTIONS = [option('Mannequin', 'model'), option('Créateur / Styliste', 'designer'), option('Partenaire', 'partner'), option('Prestataire', 'provider'), option('Autre', 'other')];
const ENTITY_TYPE_OPTIONS = [option('Mannequin', 'model'), option('Styliste', 'stylist'), option('Artiste', 'artist'), option('Partenaire', 'partner'), option('Prestataire', 'provider')];
const CASTING_STATUS_OPTIONS = [option('Nouveau'), option('En étude'), option('Accepté'), option('Refusé')];

const STATUS_BY_RESOURCE: Partial<Record<ResourceName, readonly CrudFieldOption[]>> = {
  models: [option('Actif', 'active'), option('Inactif', 'inactive'), option('À réclamer', 'pending_claim')],
  'casting-applications': CASTING_STATUS_OPTIONS,
  'booking-requests': [option('Nouveau', 'new'), option('En étude', 'pending'), option('Confirmé', 'confirmed'), option('Refusé', 'rejected'), option('Annulé', 'cancelled')],
  bookings: [option('Option', 'option'), option('Confirmé', 'confirmed'), option('En production', 'in_production'), option('Terminé', 'completed'), option('Annulé', 'cancelled')],
  castings: [option('Brouillon', 'draft'), option('Ouvert', 'open'), option('Matching', 'matching'), option('Shortlist', 'shortlist'), option('Callback', 'callback'), option('Clôturé', 'closed'), option('Annulé', 'cancelled')],
  'booking-options': [option('Active', 'active'), option('Libérée', 'released'), option('Confirmée', 'confirmed'), option('Expirée', 'expired'), option('Annulée', 'cancelled')],
  clients: [option('Prospect', 'lead'), option('Actif', 'active'), option('Inactif', 'inactive'), option('Archivé', 'archived')],
  quotes: [option('Brouillon', 'draft'), option('Envoyé', 'sent'), option('Accepté', 'accepted'), option('Refusé', 'rejected'), option('Expiré', 'expired'), option('Annulé', 'cancelled')],
  contracts: [option('Brouillon', 'draft'), option('Envoyé', 'sent'), option('Vu', 'viewed'), option('Signé', 'signed'), option('Expiré', 'expired'), option('Annulé', 'cancelled')],
  invoices: [option('Brouillon', 'draft'), option('Envoyée', 'sent'), option('Partiel', 'partial'), option('Payée', 'paid'), option('En retard', 'overdue'), option('Annulée', 'cancelled')],
  'image-rights': [option('Brouillon', 'draft'), option('Actifs', 'active'), option('À renouveler', 'expiring'), option('Expirés', 'expired'), option('Renouvelés', 'renewed'), option('Annulés', 'cancelled')],
  absences: [option('En attente', 'pending'), option('Justifiée', 'approved'), option('Refusée', 'rejected')],
  payments: [option('En attente', 'pending'), option('Payé', 'paid'), option('Impayé', 'unpaid'), option('Annulé', 'cancelled')],
  magazine: [option('Brouillon', 'draft'), option('Publié', 'published'), option('Archivé', 'archived')],
  'fashion-day-applications': [option('Nouveau', 'new'), option('En étude', 'pending'), option('Accepté', 'approved'), option('Refusé', 'rejected')],
  'fashion-day-reservations': [option('Nouveau'), option('Confirmée'), option('Payée'), option('Annulée')],
  messages: [option('Nouveau', 'new'), option('Lu', 'read'), option('Envoyé', 'sent'), option('Échec', 'failed'), option('Archivé', 'archived')],
  notifications: [option('Non lu', 'unread'), option('Lu', 'read')],
  comments: [option('En attente', 'pending'), option('Approuvé', 'approved'), option('Refusé', 'rejected'), option('Archivé', 'archived')],
  recovery: [option('Nouveau', 'new'), option('En cours', 'pending'), option('Résolu', 'resolved'), option('Refusé', 'rejected')],
  'photoshoot-briefs': [option('Brouillon', 'draft'), option('Publié', 'published'), option('Terminé', 'completed'), option('Annulé', 'cancelled')],
  'beauty-contests': [option('Brouillon', 'draft'), option('Actif', 'active'), option('Terminé', 'completed'), option('Archivé', 'archived')],
  'classroom-messages': [option('Nouveau', 'new'), option('Lu', 'read'), option('Archivé', 'archived')],
  'classroom-requests': [option('Nouveau', 'new'), option('En cours', 'pending'), option('Approuvé', 'approved'), option('Refusé', 'rejected'), option('Terminé', 'completed')],
  'forum-threads': [option('Actif', 'active'), option('Fermé', 'closed'), option('Archivé', 'archived')],
};

export function enhanceAdminFields(resource: ResourceName, fields: readonly CrudField[]): CrudField[] {
  return fields.map((field) => {
    if (field.name === 'gender') return { ...field, type: 'select', options: GENDER_OPTIONS };
    if (field.name === 'level') return { ...field, type: 'select', options: LEVEL_OPTIONS };
    if (field.name === 'currency' || field.name === 'rate_currency') return { ...field, type: 'select', options: CURRENCY_OPTIONS };
    if (field.name === 'channel') return { ...field, type: 'select', options: MESSAGE_CHANNEL_OPTIONS };
    if (field.name === 'platform') return { ...field, type: 'select', options: SOCIAL_PLATFORM_OPTIONS };
    if (field.name === 'application_type') return { ...field, type: 'select', options: APPLICATION_TYPE_OPTIONS };
    if (field.name === 'entity_type') return { ...field, type: 'select', options: ENTITY_TYPE_OPTIONS };
    if (field.name === 'status' && STATUS_BY_RESOURCE[resource]) return { ...field, type: 'select', options: STATUS_BY_RESOURCE[resource] };
    if (resource === 'services' && field.name === 'category') return { ...field, type: 'select', options: SERVICE_CATEGORY_OPTIONS };
    if (resource === 'magazine' && field.name === 'category') return { ...field, type: 'select', options: ARTICLE_CATEGORY_OPTIONS };
    if (resource === 'gallery' && field.name === 'provider') return { ...field, type: 'select', options: MEDIA_PROVIDER_OPTIONS };
    if (resource === 'gallery' && field.name === 'category') return { ...field, type: 'select', options: MEDIA_CATEGORY_OPTIONS };
    return field;
  });
}
