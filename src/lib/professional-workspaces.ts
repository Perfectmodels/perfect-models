export type WorkspaceTone = 'wine' | 'coral' | 'gold' | 'emerald' | 'blue' | 'violet' | 'amber' | 'slate';

export type WorkspaceMetric = {
  label: string;
  field?: string;
  value?: string | number | boolean | null;
  tone?: WorkspaceTone;
};

export type WorkspaceAction = {
  label: string;
  href: string;
  description: string;
};

export type ProfessionalWorkspaceConfig = {
  family: string;
  kicker: string;
  mission: string;
  metrics: WorkspaceMetric[];
  workflow: Array<{ label: string; detail: string }>;
  actions: WorkspaceAction[];
  rules: string[];
};

type FamilyKey = 'talent' | 'casting' | 'production' | 'crm' | 'finance' | 'events' | 'editorial' | 'communication' | 'training' | 'governance';

const FAMILY_BY_RESOURCE: Record<string, FamilyKey> = {
  models: 'talent', availability: 'talent', absences: 'talent',
  'casting-applications': 'casting', castings: 'casting', 'casting-talents': 'casting',
  'booking-requests': 'production', bookings: 'production', 'booking-options': 'production', 'calendar-events': 'production',
  clients: 'crm', 'client-contacts': 'crm', 'client-selections': 'crm', 'selection-items': 'crm',
  quotes: 'finance', contracts: 'finance', invoices: 'finance', 'invoice-payments': 'finance', 'image-rights': 'finance', payments: 'finance',
  'beauty-contests': 'events', 'fashion-day-applications': 'events', 'fashion-day-events': 'events', 'jury-members': 'events', 'registration-staff': 'events',
  magazine: 'editorial', gallery: 'editorial', services: 'editorial', content: 'editorial', navigation: 'editorial', 'social-links': 'editorial', 'site-settings': 'editorial',
  mailing: 'communication', messages: 'communication', notifications: 'communication',
  courses: 'training', 'course-progress': 'training', 'classroom-messages': 'training', 'photoshoot-briefs': 'training',
  recovery: 'governance', 'admin-permissions': 'governance', profiles: 'governance',
};

const FAMILY_CONFIG: Record<FamilyKey, ProfessionalWorkspaceConfig> = {
  talent: {
    family: 'Talent Intelligence',
    kicker: 'Roster · carrière · disponibilité',
    mission: 'Piloter chaque talent comme un actif professionnel : profil 360°, employabilité, disponibilité, image, progression et valeur commerciale.',
    metrics: [
      { label: 'Actifs', field: 'is_active', value: true, tone: 'emerald' },
      { label: 'Publics', field: 'is_public', value: true, tone: 'blue' },
      { label: 'À régulariser', field: 'status', value: 'pending', tone: 'amber' },
    ],
    workflow: [
      { label: 'Qualifier', detail: 'Identité, mensurations, book, catégories et mobilité.' },
      { label: 'Positionner', detail: 'Niveau, tarifs, marché cible, comp card et image.' },
      { label: 'Disponibiliser', detail: 'Agenda, indisponibilités, options et conflits.' },
      { label: 'Activer', detail: 'Matching castings, bookings, contrats et performance.' },
    ],
    actions: [
      { label: 'Smart Talent Search', href: '/admin/talent-search', description: 'Recherche métier et requêtes naturelles.' },
      { label: 'Comp Cards', href: '/admin/comp-cards', description: 'Documents commerciaux PDF des talents.' },
      { label: 'Disponibilités', href: '/admin/talent-availability', description: 'Agenda talents et indisponibilités.' },
    ],
    rules: ['Aucun talent commercialisable sans profil suffisamment complet.', 'Les indisponibilités et options doivent alimenter le matching.', 'Les informations normalisées priment sur les champs historiques.'],
  },
  casting: {
    family: 'Casting Operations',
    kicker: 'Brief · matching · shortlist · sélection',
    mission: 'Gérer le casting comme un pipeline de production : brief client, critères, matching explicable, convocations, shortlist, callbacks et sélection finale.',
    metrics: [
      { label: 'Nouveaux', field: 'status', value: 'new', tone: 'coral' },
      { label: 'Confirmés', field: 'status', value: 'confirmed', tone: 'emerald' },
      { label: 'Sélectionnés', field: 'status', value: 'selected', tone: 'gold' },
    ],
    workflow: [
      { label: 'Brief', detail: 'Besoin client, profils, contraintes et date.' },
      { label: 'Matcher', detail: 'Score de compatibilité et disponibilité.' },
      { label: 'Auditionner', detail: 'Invitation, présence, notes et callback.' },
      { label: 'Sélectionner', detail: 'Shortlist client, décision et conversion booking.' },
    ],
    actions: [
      { label: 'Moteur de matching', href: '/admin/casting-matching', description: 'Classement explicable des talents.' },
      { label: 'Pipeline casting', href: '/admin/casting-pipeline', description: 'Suivi par étape des talents.' },
      { label: 'Portail candidatures', href: '/admin/casting-applications', description: 'Intake et qualification des dossiers.' },
    ],
    rules: ['Un casting doit rester distinct du recrutement agence.', 'Tout matching doit intégrer les conflits de disponibilité.', 'Une sélection finale doit pouvoir être convertie en booking.'],
  },
  production: {
    family: 'Booking & Production',
    kicker: 'Option · booking · agenda · livraison',
    mission: 'Orchestrer les missions commerciales de bout en bout : demande entrante, option, confirmation, planning, documents, coûts, droits et clôture.',
    metrics: [
      { label: 'À traiter', field: 'status', value: 'new', tone: 'coral' },
      { label: 'Confirmés', field: 'status', value: 'confirmed', tone: 'emerald' },
      { label: 'En production', field: 'status', value: 'in_production', tone: 'blue' },
    ],
    workflow: [
      { label: 'Intake', detail: 'Qualifier la demande, le client et le besoin.' },
      { label: 'Optionner', detail: 'Bloquer provisoirement le talent et détecter les conflits.' },
      { label: 'Confirmer', detail: 'Créer booking, contrat, calendrier et finance.' },
      { label: 'Clôturer', detail: 'Livraison, paiement, droits et historique.' },
    ],
    actions: [
      { label: 'Calendrier agence', href: '/admin/calendar', description: 'Vue unifiée options, bookings et conflits.' },
      { label: 'Finance', href: '/admin/finance', description: 'Commissions, factures et encours.' },
      { label: 'Contrats', href: '/admin/contracts', description: 'Documents et signatures.' },
    ],
    rules: ['La confirmation déclenche les documents et le calendrier.', 'Les chevauchements d’options doivent être visibles avant confirmation.', 'Chaque booking conserve son historique financier et juridique.'],
  },
  crm: {
    family: 'Client CRM',
    kicker: 'Prospection · relation · opportunités · fidélisation',
    mission: 'Centraliser la relation client autour des contacts, castings, bookings, sélections, messages, chiffre d’affaires et historique de collaboration.',
    metrics: [
      { label: 'Actifs', field: 'status', value: 'active', tone: 'emerald' },
      { label: 'Nouveaux', field: 'status', value: 'new', tone: 'coral' },
      { label: 'En attente', field: 'status', value: 'pending', tone: 'amber' },
    ],
    workflow: [
      { label: 'Qualifier', detail: 'Entreprise, contacts, besoins et potentiel.' },
      { label: 'Développer', detail: 'Castings, propositions, sélections et échanges.' },
      { label: 'Convertir', detail: 'Booking, devis, contrat et facture.' },
      { label: 'Fidéliser', detail: 'Historique, performance et prochaines opportunités.' },
    ],
    actions: [
      { label: 'Contacts CRM', href: '/admin/client-contacts', description: 'Décideurs et interlocuteurs.' },
      { label: 'Sélections client', href: '/admin/client-selections', description: 'Shortlists privées partageables.' },
      { label: 'Messagerie', href: '/admin/messages', description: 'Historique lié aux dossiers métier.' },
    ],
    rules: ['Les échanges doivent être rattachables au client et au dossier concerné.', 'Le CRM doit relier commercial, production et finance.', 'Une shortlist client n’expose que les informations nécessaires.'],
  },
  finance: {
    family: 'Finance & Legal',
    kicker: 'Devis · contrats · factures · paiements · droits',
    mission: 'Sécuriser la marge agence et la conformité documentaire : devis, commissions, contrats, échéances, encaissements et droits à l’image.',
    metrics: [
      { label: 'Brouillons', field: 'status', value: 'draft', tone: 'slate' },
      { label: 'Envoyés', field: 'status', value: 'sent', tone: 'blue' },
      { label: 'Payés / signés', field: 'status', value: 'paid', tone: 'emerald' },
    ],
    workflow: [
      { label: 'Chiffrer', detail: 'Tarif, marge, commission et conditions.' },
      { label: 'Contractualiser', detail: 'Engagements, signature et pièces.' },
      { label: 'Facturer', detail: 'Émission, échéance et suivi.' },
      { label: 'Réconcilier', detail: 'Paiements, net mannequin, droits et clôture.' },
    ],
    actions: [
      { label: 'Cockpit finance', href: '/admin/finance', description: 'KPIs, encours et échéances.' },
      { label: 'Bookings', href: '/admin/bookings', description: 'Origine opérationnelle des revenus.' },
      { label: 'Droits à l’image', href: '/admin/image-rights', description: 'Périmètres, usages et expirations.' },
    ],
    rules: ['Les montants booking, commission et net mannequin sont cohérents automatiquement.', 'Les échéances contractuelles et droits doivent être surveillés.', 'Les paiements doivent réconcilier les factures et leur statut.'],
  },
  events: {
    family: 'Event Operations',
    kicker: 'Candidatures · jury · programme · production',
    mission: 'Exploiter les événements comme des projets structurés : candidatures, équipes, jury, programmation, participants, contenu et suivi opérationnel.',
    metrics: [
      { label: 'Nouveaux', field: 'status', value: 'new', tone: 'coral' },
      { label: 'Confirmés', field: 'status', value: 'confirmed', tone: 'emerald' },
      { label: 'En attente', field: 'status', value: 'pending', tone: 'amber' },
    ],
    workflow: [
      { label: 'Préparer', detail: 'Édition, thème, dates, équipe et règles.' },
      { label: 'Sélectionner', detail: 'Candidatures, jury et validation.' },
      { label: 'Produire', detail: 'Programme, participants, logistique et contenu.' },
      { label: 'Capitaliser', detail: 'Résultats, galerie, communication et bilan.' },
    ],
    actions: [
      { label: 'Perfect Fashion Day', href: '/admin/fashion-day-events', description: 'Éditions et production événementielle.' },
      { label: 'Candidatures', href: '/admin/fashion-day-applications', description: 'Dossiers et décisions.' },
      { label: 'Médiathèque', href: '/admin/media-library', description: 'Assets de communication et archives.' },
    ],
    rules: ['Chaque événement doit avoir une source de vérité unique.', 'Les candidatures suivent des étapes et décisions traçables.', 'Les contenus produits sont réutilisables dans le Journal et la médiathèque.'],
  },
  editorial: {
    family: 'Content & Brand Studio',
    kicker: 'Journal · médias · marque · diffusion',
    mission: 'Piloter la marque comme une rédaction et un studio : contenus structurés, médias, SEO, navigation, services et expérience publique cohérente.',
    metrics: [
      { label: 'Brouillons', field: 'status', value: 'draft', tone: 'slate' },
      { label: 'Publiés', field: 'status', value: 'published', tone: 'emerald' },
      { label: 'Archivés', field: 'status', value: 'archived', tone: 'amber' },
    ],
    workflow: [
      { label: 'Concevoir', detail: 'Angle, contenu, médias et structure.' },
      { label: 'Valider', detail: 'Qualité, marque, SEO et droits.' },
      { label: 'Publier', detail: 'Web, réseaux et campagnes.' },
      { label: 'Mesurer', detail: 'Performance, réemploi et archivage.' },
    ],
    actions: [
      { label: 'Journal', href: '/admin/blog', description: 'CMS éditorial et articles magazine.' },
      { label: 'Médiathèque', href: '/admin/media-library', description: 'Bibliothèque d’assets et métadonnées.' },
      { label: 'Site & navigation', href: '/admin/settings/site', description: 'Paramètres de l’expérience publique.' },
    ],
    rules: ['La publication est séparée de la simple saisie de données.', 'Les médias doivent conserver crédits, alt et contexte d’usage.', 'Le SEO et la cohérence de marque font partie du workflow éditorial.'],
  },
  communication: {
    family: 'Communication Hub',
    kicker: 'Messages · audiences · campagnes · suivi',
    mission: 'Centraliser les communications sortantes et entrantes, rattacher les échanges aux dossiers métier et piloter la relation avec les audiences.',
    metrics: [
      { label: 'Nouveaux', field: 'status', value: 'new', tone: 'coral' },
      { label: 'Envoyés', field: 'status', value: 'sent', tone: 'blue' },
      { label: 'Lus', field: 'status', value: 'read', tone: 'emerald' },
    ],
    workflow: [
      { label: 'Segmenter', detail: 'Audience, contexte et priorité.' },
      { label: 'Composer', detail: 'Message, modèle et pièces.' },
      { label: 'Distribuer', detail: 'E-mail, notification ou autre canal.' },
      { label: 'Tracer', detail: 'Statut, dossier lié et historique.' },
    ],
    actions: [
      { label: 'Messagerie CRM', href: '/admin/messages', description: 'Échanges liés aux clients et productions.' },
      { label: 'Mailing', href: '/admin/mailing', description: 'Base contacts et diffusion.' },
      { label: 'Notifications', href: '/admin/notifications', description: 'Centre de notifications applicatives.' },
    ],
    rules: ['Les messages métier doivent être reliés au contexte concerné.', 'Les canaux transactionnels et marketing restent distingués.', 'Les statuts d’envoi et de lecture doivent rester auditables.'],
  },
  training: {
    family: 'Academy & Development',
    kicker: 'Formation · progression · briefs · communauté',
    mission: 'Développer la performance des talents via cours, progression, briefs, échanges et suivi des acquis, reliés aux besoins réels de l’agence.',
    metrics: [
      { label: 'Actifs', field: 'status', value: 'active', tone: 'emerald' },
      { label: 'Terminés', field: 'status', value: 'completed', tone: 'blue' },
      { label: 'En attente', field: 'status', value: 'pending', tone: 'amber' },
    ],
    workflow: [
      { label: 'Planifier', detail: 'Parcours, objectifs et ressources.' },
      { label: 'Former', detail: 'Cours, briefs, exercices et échanges.' },
      { label: 'Évaluer', detail: 'Progression, résultats et feedback.' },
      { label: 'Activer', detail: 'Faire évoluer le positionnement commercial du talent.' },
    ],
    actions: [
      { label: 'Classroom', href: '/admin/classroom', description: 'Cours et contenus pédagogiques.' },
      { label: 'Progression', href: '/admin/classroom-progress', description: 'Suivi individuel des acquis.' },
      { label: 'Direction artistique', href: '/admin/artistic-direction', description: 'Briefs et préparation shootings.' },
    ],
    rules: ['La formation doit être reliée à la progression du talent.', 'Les briefs créatifs sont des documents de production, pas de simples notes.', 'Les résultats utiles doivent enrichir le profil professionnel.'],
  },
  governance: {
    family: 'Governance & Control',
    kicker: 'Accès · rôles · sécurité · configuration',
    mission: 'Administrer la plateforme comme un système d’entreprise : identités, permissions, récupération, paramètres, traçabilité et séparation des responsabilités.',
    metrics: [
      { label: 'Actifs', field: 'is_active', value: true, tone: 'emerald' },
      { label: 'En attente', field: 'status', value: 'pending', tone: 'amber' },
      { label: 'Inactifs', field: 'is_active', value: false, tone: 'slate' },
    ],
    workflow: [
      { label: 'Identifier', detail: 'Compte, rôle, profil et état.' },
      { label: 'Autoriser', detail: 'Permissions minimales nécessaires.' },
      { label: 'Contrôler', detail: 'Accès, récupération et exceptions.' },
      { label: 'Auditer', detail: 'Historique, configuration et risques.' },
    ],
    actions: [
      { label: 'Permissions', href: '/admin/user-permissions', description: 'Délégations et contrôles d’accès.' },
      { label: 'Accès mannequins', href: '/admin/model-access', description: 'Claims et rattachements de comptes.' },
      { label: 'Paramètres site', href: '/admin/settings/site', description: 'Configuration opérationnelle.' },
    ],
    rules: ['Le rôle ne remplace pas les permissions granulaires.', 'Les opérations sensibles restent côté serveur.', 'Les comptes et accès doivent être révocables et traçables.'],
  },
};

const RESOURCE_OVERRIDES: Record<string, Partial<ProfessionalWorkspaceConfig>> = {
  models: { kicker: 'Roster 360° · carrière · commercialisation' },
  'casting-applications': { kicker: 'Recrutement agence · intake · décision' },
  castings: { kicker: 'Castings clients · brief · matching' },
  bookings: { kicker: 'Missions confirmées · production · marge' },
  clients: { kicker: 'Comptes clients · relation · revenu' },
  contracts: { kicker: 'Contrats · signature · conformité' },
  invoices: { kicker: 'Facturation · échéances · encaissements' },
  'image-rights': { kicker: 'Droits · usages · territoires · expiration' },
  gallery: { kicker: 'Digital Asset Management · médias · droits' },
  magazine: { kicker: 'Headless CMS · rédaction · publication' },
  'admin-permissions': { kicker: 'RBAC · délégations · contrôle' },
};

export function professionalWorkspaceFor(resource: string): ProfessionalWorkspaceConfig {
  const family = FAMILY_BY_RESOURCE[resource] || 'governance';
  const base = FAMILY_CONFIG[family];
  const override = RESOURCE_OVERRIDES[resource] || {};
  return {
    ...base,
    ...override,
    metrics: override.metrics || base.metrics,
    workflow: override.workflow || base.workflow,
    actions: override.actions || base.actions,
    rules: override.rules || base.rules,
  };
}
