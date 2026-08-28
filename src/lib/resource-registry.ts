export type CrudFieldType =
  | 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'number' | 'boolean'
  | 'select' | 'date' | 'datetime-local' | 'json' | 'tags' | 'number-list';

export type CrudFieldOption = { label: string; value: string };

export type CrudField = {
  name: string;
  label: string;
  type: CrudFieldType;
  required?: boolean;
  createOnly?: boolean;
  placeholder?: string;
  help?: string;
  options?: readonly CrudFieldOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | boolean | Record<string, unknown> | unknown[];
  wide?: boolean;
};

export type ResourceDefinition = {
  table: string;
  primaryKey: string;
  title: string;
  orderBy: string;
  columns: readonly string[];
  fields: readonly CrudField[];
  canCreate?: boolean;
  canDelete?: boolean;
};

const STATUS_OPTIONS: CrudFieldOption[] = [
  ['Nouveau', 'new'], ['En attente', 'pending'], ['Actif', 'active'], ['Inactif', 'inactive'],
  ['Approuvé', 'approved'], ['Refusé', 'rejected'], ['Confirmé', 'confirmed'], ['Annulé', 'cancelled'],
  ['Brouillon', 'draft'], ['Publié', 'published'], ['Archivé', 'archived'], ['Terminé', 'completed'],
  ['Payé', 'paid'], ['Impayé', 'unpaid'], ['Envoyé', 'sent'], ['Échec', 'failed'], ['Lu', 'read'],
].map(([label, value]) => ({ label, value }));

const ROLE_OPTIONS: CrudFieldOption[] = [
  ['Administrateur', 'admin'], ['Manager', 'manager'], ['Mannequin', 'model'], ['Étudiant', 'student'],
  ['Jury', 'jury'], ['Équipe', 'staff'],
].map(([label, value]) => ({ label, value }));

const LABELS: Record<string, string> = {
  id: 'Identifiant', user_id: 'Utilisateur', auth_user_id: 'Compte utilisateur', author_user_id: 'Auteur',
  recipient_user_id: 'Destinataire', jury_user_id: 'Membre du jury', casting_application_id: 'Candidature casting',
  model_id: 'Mannequin', model_ids: 'Mannequins', post_id: 'Article', thread_id: 'Discussion', course_id: 'Cours',
  name: 'Nom', full_name: 'Nom complet', first_name: 'Prénom', last_name: 'Nom', display_name: 'Nom affiché',
  applicant_name: 'Nom du candidat', author_name: 'Auteur', username: 'Nom d’utilisateur', identifier: 'Identifiant',
  email: 'E-mail', phone: 'Téléphone', gender: 'Genre', birth_date: 'Date de naissance', age: 'Âge',
  nationality: 'Nationalité', city: 'Ville', height: 'Taille', height_cm: 'Taille (cm)', location: 'Lieu', level: 'Niveau',
  title: 'Titre', slug: 'Slug', description: 'Description', details: 'Détails', excerpt: 'Résumé', content: 'Contenu',
  body: 'Message', message: 'Message', subject: 'Objet', notes: 'Notes', reason: 'Motif', experience: 'Expérience', journey: 'Parcours',
  category: 'Catégorie', categories: 'Catégories', tags: 'Mots-clés', type: 'Type', request_type: 'Type de demande',
  application_type: 'Type de candidature', entity_type: 'Type d’entité', normalized_name: 'Nom normalisé', status: 'Statut',
  direction: 'Direction', channel: 'Canal', audience_role: 'Public', role: 'Rôle', recipient: 'Destinataire', sender: 'Expéditeur',
  event_date: 'Date de l’événement', published_at: 'Publication', paid_at: 'Date du paiement', completed_at: 'Fin du cours',
  submitted_at: 'Date d’envoi', read_at: 'Date de lecture', period: 'Période', amount: 'Montant', currency: 'Devise',
  edition: 'Édition', theme: 'Thème', promoter: 'Promoteur', mc: 'Maître de cérémonie', position: 'Position', year: 'Année',
  event: 'Événement', path: 'Chemin', href: 'Lien', platform: 'Plateforme', url: 'URL', image_url: 'Photo principale',
  instagram_url: 'Instagram', cover_image_url: 'Image de couverture', logo_url: 'Logo', website_url: 'Site web',
  button_text: 'Texte du bouton', button_link: 'Lien du bouton', icon: 'Icône', alt_text: 'Texte alternatif',
  file_name: 'Nom du fichier', provider: 'Hébergeur', provider_key: 'Clé hébergeur', pathname: 'Chemin du fichier',
  mime_type: 'Type de fichier', size_bytes: 'Taille (octets)', source: 'Source', provider_message_id: 'Identifiant fournisseur',
  table_option_id: 'Option de table', special_requests: 'Demandes particulières', physique: 'Physique', presence: 'Présence',
  photogenie: 'Photogénie', potentiel: 'Potentiel', overall: 'Note globale', progress: 'Progression', measurements: 'Mensurations',
  permissions: 'Permissions', configuration: 'Configuration', metadata: 'Métadonnées', attachments: 'Pièces jointes', photos: 'Photos',
  gallery_images: 'Images de galerie', social_links: 'Réseaux sociaux', value: 'Valeur', key: 'Clé', permission_key: 'Clé de permission',
  is_active: 'Actif', is_public: 'Visible publiquement', is_read: 'Lu', in_footer: 'Afficher dans le pied de page',
  must_change_password: 'Changement de mot de passe requis', label: 'Libellé',
};

const JSON_FIELDS = new Set(['measurements', 'permissions', 'progress', 'configuration', 'metadata', 'attachments', 'photos', 'gallery_images', 'value', 'social_links']);
const TAG_FIELDS = new Set(['categories', 'tags', 'model_ids']);
const NUMBER_FIELDS = new Set(['age', 'height_cm', 'position', 'edition', 'amount', 'size_bytes', 'physique', 'presence', 'photogenie', 'potentiel', 'overall']);
const TEXTAREA_FIELDS = new Set(['description', 'details', 'excerpt', 'content', 'body', 'message', 'notes', 'reason', 'experience', 'journey', 'event', 'special_requests']);
const DATETIME_FIELDS = new Set(['event_date', 'published_at', 'paid_at', 'completed_at', 'submitted_at', 'read_at']);

function humanize(name: string) {
  return name.replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function baseField(name: string): CrudField {
  let type: CrudFieldType = 'text';
  if (name === 'email') type = 'email';
  else if (name === 'phone') type = 'tel';
  else if (name.endsWith('_url') || name === 'url') type = 'url';
  else if (name === 'birth_date') type = 'date';
  else if (DATETIME_FIELDS.has(name)) type = 'datetime-local';
  else if (name.startsWith('is_') || name === 'in_footer' || name === 'must_change_password') type = 'boolean';
  else if (NUMBER_FIELDS.has(name)) type = 'number';
  else if (JSON_FIELDS.has(name)) type = 'json';
  else if (TAG_FIELDS.has(name)) type = 'tags';
  else if (TEXTAREA_FIELDS.has(name)) type = 'textarea';
  else if (name === 'status' || name === 'role' || name === 'audience_role') type = 'select';
  return {
    name,
    label: LABELS[name] || humanize(name),
    type,
    wide: TEXTAREA_FIELDS.has(name) || JSON_FIELDS.has(name),
    ...(name === 'status' ? { options: STATUS_OPTIONS } : {}),
    ...(name === 'role' || name === 'audience_role' ? { options: ROLE_OPTIONS } : {}),
  };
}

function formFields(names: readonly string[], required: readonly string[] = [], overrides: Record<string, Partial<CrudField>> = {}) {
  return names.map((name) => ({ ...baseField(name), required: required.includes(name), ...overrides[name], name }));
}

function resource(
  table: string,
  primaryKey: string,
  title: string,
  orderBy: string,
  columns: readonly string[],
  formNames: readonly string[],
  required: readonly string[] = [],
  overrides: Record<string, Partial<CrudField>> = {},
  options: Pick<ResourceDefinition, 'canCreate' | 'canDelete'> = {},
): ResourceDefinition {
  return { table, primaryKey, title, orderBy, columns, fields: formFields(formNames, required, overrides), ...options };
}

function defineResources<T extends Record<string, ResourceDefinition>>(definitions: T) { return definitions; }

const active = { defaultValue: true };
const inactive = { defaultValue: false };
const emptyObject = { defaultValue: {} };
const emptyArray = { defaultValue: [] };

export const RESOURCE_DEFINITIONS = defineResources({
  models: resource('models', 'id', 'Mannequins', 'created_at',
    ['name', 'username', 'gender', 'height', 'level', 'is_public', 'is_active', 'status'],
    ['id', 'name', 'username', 'email', 'phone', 'birth_date', 'gender', 'nationality', 'height', 'location', 'level', 'image_url', 'instagram_url', 'categories', 'measurements', 'experience', 'journey', 'is_public', 'is_active', 'status'],
    ['id', 'name'], { id: { createOnly: true, placeholder: 'ex. audrey-kabangu' }, gender: { type: 'select', options: [{ label: 'Femme', value: 'female' }, { label: 'Homme', value: 'male' }, { label: 'Autre', value: 'other' }] }, measurements: { ...emptyObject, help: 'Mensurations avancées au format JSON.' }, is_public: inactive, is_active: active, status: { defaultValue: 'active' } }),

  'casting-applications': resource('casting_applications', 'id', 'Candidatures casting', 'created_at',
    ['full_name', 'email', 'phone', 'gender', 'height_cm', 'status', 'created_at'],
    ['full_name', 'first_name', 'last_name', 'email', 'phone', 'gender', 'birth_date', 'age', 'city', 'height_cm', 'status', 'photos', 'measurements', 'experience', 'notes'],
    ['full_name', 'email'], { status: { defaultValue: 'new' }, photos: { ...emptyArray, type: 'json' }, measurements: emptyObject }),

  'casting-scores': resource('casting_scores', 'id', 'Notes du jury', 'created_at',
    ['casting_application_id', 'jury_user_id', 'overall', 'notes', 'created_at'],
    ['casting_application_id', 'jury_user_id', 'physique', 'presence', 'photogenie', 'potentiel', 'overall', 'notes'],
    ['casting_application_id'], Object.fromEntries(['physique', 'presence', 'photogenie', 'potentiel', 'overall'].map((name) => [name, { min: 0, max: 20, step: 0.5, defaultValue: 0 }]))),

  bookings: resource('booking_requests', 'id', 'Bookings', 'created_at', ['name', 'email', 'phone', 'model_id', 'status', 'created_at'], ['name', 'email', 'phone', 'model_id', 'status'], ['name', 'email'], { status: { defaultValue: 'new' } }),
  'fashion-day-applications': resource('fashion_day_applications', 'id', 'Candidatures Fashion Day', 'created_at', ['applicant_name', 'email', 'phone', 'application_type', 'status', 'created_at'], ['applicant_name', 'email', 'phone', 'application_type', 'status'], ['applicant_name', 'email'], { status: { defaultValue: 'new' } }),
  'fashion-day-events': resource('fashion_day_events', 'id', 'Perfect Fashion Day', 'edition', ['edition', 'theme', 'event_date', 'location', 'promoter', 'mc'], ['edition', 'theme', 'event_date', 'location', 'description', 'promoter', 'mc', 'cover_image_url', 'gallery_images'], ['edition', 'theme'], { gallery_images: { ...emptyArray, type: 'json' } }),
  'fashion-day-reservations': resource('fashion_day_reservations', 'id', 'Réservations Fashion Day', 'submitted_at', ['name', 'email', 'phone', 'table_option_id', 'status', 'submitted_at'], ['name', 'email', 'phone', 'table_option_id', 'special_requests', 'status'], ['name', 'email'], { status: { defaultValue: 'new' } }),

  services: resource('services', 'id', 'Services', 'position', ['title', 'slug', 'category', 'is_active', 'position'], ['title', 'slug', 'category', 'description', 'details', 'icon', 'button_text', 'button_link', 'is_active', 'position'], ['title', 'slug'], { is_active: active, position: { defaultValue: 0 } }),
  magazine: resource('blog_posts', 'id', 'Magazine', 'created_at', ['title', 'slug', 'category', 'status', 'published_at'], ['title', 'slug', 'excerpt', 'content', 'cover_image_url', 'author_name', 'category', 'tags', 'status', 'published_at'], ['title', 'slug', 'content'], { status: { defaultValue: 'draft' } }),
  gallery: resource('media_library', 'id', 'Médiathèque', 'created_at', ['file_name', 'provider', 'category', 'url', 'created_at'], ['file_name', 'url', 'provider', 'provider_key', 'pathname', 'mime_type', 'size_bytes', 'category', 'source', 'alt_text', 'metadata'], ['file_name', 'url'], { metadata: emptyObject }),
  mailing: resource('mailing_contacts', 'id', 'Mailing', 'created_at', ['name', 'email', 'category', 'created_at'], ['name', 'email', 'category'], ['email']),
  messages: resource('messages', 'id', 'Messagerie', 'created_at', ['direction', 'channel', 'recipient', 'subject', 'status', 'created_at'], ['direction', 'channel', 'recipient', 'sender', 'subject', 'body', 'status', 'model_id', 'provider_message_id', 'metadata'], ['direction', 'body'], { direction: { type: 'select', options: [{ label: 'Entrant', value: 'inbound' }, { label: 'Sortant', value: 'outbound' }] }, status: { defaultValue: 'new' }, metadata: emptyObject }),
  notifications: resource('notifications', 'id', 'Notifications', 'created_at', ['type', 'title', 'body', 'audience_role', 'is_read', 'created_at'], ['recipient_user_id', 'audience_role', 'type', 'title', 'body', 'href', 'is_read', 'read_at', 'metadata'], ['title', 'body'], { is_read: inactive, metadata: emptyObject }),
  absences: resource('absences', 'id', 'Absences', 'created_at', ['model_id', 'event_date', 'reason', 'status', 'created_at'], ['model_id', 'event_date', 'reason', 'status', 'notes'], ['model_id', 'event_date'], { event_date: { type: 'date' }, status: { defaultValue: 'pending' } }),
  payments: resource('monthly_payments', 'id', 'Paiements', 'created_at', ['model_id', 'period', 'amount', 'currency', 'status', 'paid_at'], ['model_id', 'period', 'amount', 'currency', 'status', 'paid_at'], ['model_id', 'period', 'amount', 'currency'], { period: { type: 'date' }, amount: { min: 0, step: 0.01 }, currency: { defaultValue: 'XAF' }, status: { defaultValue: 'pending' } }),
  comments: resource('article_comments', 'id', 'Commentaires', 'created_at', ['author_name', 'body', 'status', 'created_at'], ['post_id', 'user_id', 'author_name', 'body', 'status'], ['author_name', 'body'], { status: { defaultValue: 'pending' } }),
  recovery: resource('recovery_requests', 'id', 'Récupération de compte', 'created_at', ['email', 'identifier', 'status', 'created_at'], ['email', 'identifier', 'status'], [], { status: { defaultValue: 'new' } }),
  'photoshoot-briefs': resource('photoshoot_briefs', 'id', 'Direction artistique', 'created_at', ['title', 'event_date', 'location', 'status', 'created_at'], ['title', 'description', 'event_date', 'location', 'model_ids', 'attachments', 'status'], ['title'], { attachments: { ...emptyArray, type: 'json' }, status: { defaultValue: 'draft' } }),
  'jury-members': resource('jury_members', 'id', 'Jury', 'created_at', ['name', 'email', 'phone', 'is_active'], ['name', 'email', 'phone', 'is_active', 'permissions'], ['name', 'email'], { is_active: active, permissions: emptyObject }),
  'registration-staff': resource('registration_staff', 'id', 'Équipe d’enregistrement', 'created_at', ['name', 'email', 'phone', 'is_active'], ['name', 'email', 'phone', 'is_active', 'permissions'], ['name', 'email'], { is_active: active, permissions: emptyObject }),
  'admin-permissions': resource('admin_permissions', 'permission_key', 'Permissions admin', 'permission_key', ['permission_key', 'value', 'updated_at'], ['permission_key', 'value'], ['permission_key', 'value'], { permission_key: { createOnly: true }, value: emptyObject }),
  'beauty-contests': resource('beauty_contests', 'id', 'Concours de beauté', 'created_at', ['name', 'status', 'created_at', 'updated_at'], ['name', 'status', 'configuration'], ['name'], { status: { defaultValue: 'draft' }, configuration: emptyObject }),

  courses: resource('courses', 'id', 'Classroom', 'position', ['id', 'title', 'description', 'is_active', 'position', 'updated_at'], ['id', 'title', 'description', 'content', 'is_active', 'position'], ['id', 'title', 'content'], { id: { createOnly: true, placeholder: 'ex. posture-et-demarche' }, content: { type: 'json', ...emptyObject, help: 'Structure pédagogique du cours au format JSON.' }, is_active: active, position: { defaultValue: 0 } }),
  'course-progress': resource('course_progress', 'id', 'Progression Classroom', 'updated_at', ['user_id', 'course_id', 'completed_at', 'updated_at'], ['user_id', 'course_id', 'progress', 'completed_at'], ['user_id', 'course_id', 'progress'], { progress: emptyObject }),
  'classroom-messages': resource('classroom_messages', 'id', 'Messages Classroom', 'created_at', ['model_id', 'direction', 'subject', 'status', 'created_at'], ['model_id', 'direction', 'subject', 'body', 'status'], ['model_id', 'direction', 'body'], { direction: { type: 'select', options: [{ label: 'Mannequin → Équipe', value: 'model_to_admin' }, { label: 'Équipe → Mannequin', value: 'admin_to_model' }] }, status: { defaultValue: 'new' } }),
  'classroom-requests': resource('classroom_requests', 'id', 'Demandes Classroom', 'created_at', ['model_id', 'request_type', 'status', 'created_at'], ['model_id', 'request_type', 'status', 'message'], ['model_id', 'request_type', 'message'], { status: { defaultValue: 'new' } }),
  'forum-threads': resource('forum_threads', 'id', 'Forum', 'created_at', ['title', 'status', 'author_user_id', 'created_at'], ['author_user_id', 'title', 'body', 'status'], ['title', 'body'], { status: { defaultValue: 'active' } }),
  'forum-replies': resource('forum_replies', 'id', 'Réponses forum', 'created_at', ['thread_id', 'author_user_id', 'body', 'created_at'], ['thread_id', 'author_user_id', 'body'], ['thread_id', 'body']),

  'site-settings': resource('site_settings', 'key', 'Paramètres du site', 'key', ['key', 'value', 'updated_at'], ['key', 'value'], ['key', 'value'], { key: { createOnly: true }, value: emptyObject }),
  navigation: resource('navigation_items', 'id', 'Navigation', 'position', ['label', 'path', 'in_footer', 'position', 'is_active'], ['label', 'path', 'in_footer', 'position', 'is_active'], ['label', 'path'], { path: { placeholder: '/mannequins' }, in_footer: inactive, position: { defaultValue: 0 }, is_active: active }),
  'social-links': resource('social_links', 'platform', 'Réseaux sociaux', 'position', ['platform', 'url', 'position', 'is_active'], ['platform', 'url', 'position', 'is_active'], ['platform', 'url'], { platform: { createOnly: true }, position: { defaultValue: 0 }, is_active: active }),
  timeline: resource('agency_timeline', 'id', 'Historique agence', 'position', ['year', 'event', 'position'], ['year', 'event', 'position'], ['year', 'event'], { position: { defaultValue: 0 } }),
  content: resource('content_blocks', 'key', 'Contenus des pages', 'key', ['key', 'value', 'updated_at'], ['key', 'value'], ['key', 'value'], { key: { createOnly: true }, value: emptyObject }),
  entities: resource('entities', 'id', 'Entités', 'created_at', ['entity_type', 'display_name', 'website_url', 'created_at'], ['entity_type', 'normalized_name', 'display_name', 'description', 'logo_url', 'website_url', 'social_links', 'metadata'], ['entity_type', 'normalized_name', 'display_name'], { social_links: emptyObject, metadata: emptyObject }),
  profiles: resource('profiles', 'user_id', 'Profils utilisateurs', 'created_at', ['display_name', 'email', 'role', 'identifier', 'model_id', 'is_active'], ['user_id', 'display_name', 'email', 'role', 'identifier', 'model_id', 'must_change_password', 'is_active', 'metadata'], ['user_id', 'role'], { user_id: { createOnly: true, help: 'UUID d’un compte Supabase Auth existant.' }, role: { defaultValue: 'student' }, must_change_password: inactive, is_active: active, metadata: emptyObject }),
  analytics: resource('analytics_events', 'id', 'Analytics', 'created_at', ['event_type', 'path', 'user_id', 'created_at'], ['event_type', 'path', 'user_id', 'session_id', 'metadata'], [], {}, { canCreate: false, canDelete: false }),
});

export type ResourceName = keyof typeof RESOURCE_DEFINITIONS;

export function isResourceName(value: string): value is ResourceName {
  return Object.prototype.hasOwnProperty.call(RESOURCE_DEFINITIONS, value);
}
