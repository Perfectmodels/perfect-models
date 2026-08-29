import {
  RESOURCE_DEFINITIONS as LEGACY_RESOURCE_DEFINITIONS,
  type CrudField,
  type CrudFieldOption,
  type ResourceDefinition,
} from '@/lib/resource-registry';

export type { CrudField, CrudFieldOption, ResourceDefinition } from '@/lib/resource-registry';

const option = (label: string, value: string = label): CrudFieldOption => ({ label, value });
const status = (...items: Array<[string, string]>): CrudFieldOption[] => items.map(([label, value]) => option(label, value));

const STATUS = {
  client: status(['Prospect', 'lead'], ['Actif', 'active'], ['Inactif', 'inactive'], ['Archivé', 'archived']),
  casting: status(['Brouillon', 'draft'], ['Ouvert', 'open'], ['Matching', 'matching'], ['Shortlist', 'shortlist'], ['Callback', 'callback'], ['Clôturé', 'closed'], ['Annulé', 'cancelled']),
  castingTalent: status(['Invité', 'invited'], ['Confirmé', 'confirmed'], ['Casting effectué', 'attended'], ['Shortlist', 'shortlist'], ['Callback', 'callback'], ['Sélectionné', 'selected'], ['Booké', 'booked'], ['Refusé', 'rejected'], ['Décliné', 'declined']),
  booking: status(['Option', 'option'], ['Confirmé', 'confirmed'], ['En production', 'in_production'], ['Terminé', 'completed'], ['Annulé', 'cancelled']),
  option: status(['Active', 'active'], ['Libérée', 'released'], ['Confirmée', 'confirmed'], ['Expirée', 'expired'], ['Annulée', 'cancelled']),
  availability: status(['Disponible', 'available'], ['Indisponible', 'unavailable'], ['Voyage', 'travel'], ['À confirmer', 'tentative']),
  quote: status(['Brouillon', 'draft'], ['Envoyé', 'sent'], ['Accepté', 'accepted'], ['Refusé', 'rejected'], ['Expiré', 'expired'], ['Annulé', 'cancelled']),
  contract: status(['Brouillon', 'draft'], ['Envoyé', 'sent'], ['Vu', 'viewed'], ['Signé', 'signed'], ['Expiré', 'expired'], ['Annulé', 'cancelled']),
  invoice: status(['Brouillon', 'draft'], ['Envoyée', 'sent'], ['Paiement partiel', 'partial'], ['Payée', 'paid'], ['En retard', 'overdue'], ['Annulée', 'cancelled']),
  rights: status(['Brouillon', 'draft'], ['Actifs', 'active'], ['À renouveler', 'expiring'], ['Expirés', 'expired'], ['Renouvelés', 'renewed'], ['Annulés', 'cancelled']),
  selection: status(['Brouillon', 'draft'], ['Active', 'active'], ['Clôturée', 'closed'], ['Expirée', 'expired']),
};

const f = (name: string, label: string, type: CrudField['type'] = 'text', extra: Partial<CrudField> = {}): CrudField => ({ name, label, type, ...extra });
const relation = (name: string, label: string, required = false): CrudField => f(name, label, 'select', { required });
const money = (name: string, label: string): CrudField => f(name, label, 'number', { min: 0, step: 0.01 });
const datetime = (name: string, label: string, required = false): CrudField => f(name, label, 'datetime-local', { required });
const date = (name: string, label: string, required = false): CrudField => f(name, label, 'date', { required });
const tags = (name: string, label: string): CrudField => f(name, label, 'tags');
const textarea = (name: string, label: string): CrudField => f(name, label, 'textarea', { wide: true });

const r = (
  table: string,
  title: string,
  orderBy: string,
  columns: string[],
  fields: CrudField[],
  options: Pick<ResourceDefinition, 'canCreate' | 'canDelete' | 'generatePrimaryKey'> = {},
): ResourceDefinition => ({ table, primaryKey: 'id', title, orderBy, columns, fields, ...options });

const ERP_RESOURCE_DEFINITIONS = {
  clients: r('agency_clients', 'Clients / CRM', 'updated_at',
    ['name', 'client_type', 'industry', 'status', 'city', 'billing_email', 'updated_at'],
    [f('name', 'Nom du client', 'text', { required: true }), f('client_type', 'Type de client', 'select', { required: true, options: [option('Marque', 'brand'), option('Agence', 'agency'), option('Production', 'production'), option('Photographe', 'photographer'), option('Studio', 'studio'), option('Créateur', 'designer'), option('Institution', 'institution'), option('Autre', 'other')] }), f('industry', 'Secteur'), f('status', 'Statut', 'select', { options: STATUS.client, defaultValue: 'active' }), f('website_url', 'Site web', 'url'), f('billing_email', 'E-mail facturation', 'email'), f('billing_phone', 'Téléphone', 'tel'), textarea('address', 'Adresse'), f('city', 'Ville'), f('country', 'Pays', 'text', { defaultValue: 'Gabon' }), textarea('notes', 'Notes internes')]),

  'client-contacts': r('agency_contacts', 'Contacts clients', 'updated_at',
    ['first_name', 'last_name', 'client_id', 'role_title', 'email', 'phone', 'is_primary'],
    [relation('client_id', 'Client', true), f('first_name', 'Prénom'), f('last_name', 'Nom'), f('role_title', 'Fonction'), f('email', 'E-mail', 'email'), f('phone', 'Téléphone', 'tel'), f('is_primary', 'Contact principal', 'boolean', { defaultValue: false }), textarea('notes', 'Notes')]),

  castings: r('castings', 'Castings clients', 'updated_at',
    ['title', 'client_id', 'project_type', 'status', 'starts_at', 'location', 'budget'],
    [relation('client_id', 'Client'), f('title', 'Projet / casting', 'text', { required: true }), f('project_type', 'Type de projet', 'select', { options: [option('Fashion', 'fashion'), option('Commercial', 'commercial'), option('Beauty', 'beauty'), option('Éditorial', 'editorial'), option('Runway', 'runway'), option('E-commerce', 'ecommerce'), option('Fitness', 'fitness'), option('Influence', 'influence'), option('Autre', 'other')], defaultValue: 'fashion' }), textarea('brief', 'Brief client'), f('status', 'Statut', 'select', { options: STATUS.casting, defaultValue: 'draft' }), datetime('starts_at', 'Début'), datetime('ends_at', 'Fin'), f('location', 'Lieu'), money('budget', 'Budget'), f('currency', 'Devise', 'select', { options: [option('Franc CFA', 'XAF'), option('Euro', 'EUR'), option('Dollar US', 'USD')], defaultValue: 'XAF' }), f('gender_requirement', 'Genre recherché', 'select', { options: [option('Tous', ''), option('Femme', 'Femme'), option('Homme', 'Homme'), option('Autre', 'Autre')] }), f('age_min', 'Âge minimum', 'number', { min: 0, max: 100 }), f('age_max', 'Âge maximum', 'number', { min: 0, max: 100 }), f('height_min_cm', 'Taille min. (cm)', 'number', { min: 100, max: 230, step: 0.5 }), f('height_max_cm', 'Taille max. (cm)', 'number', { min: 100, max: 230, step: 0.5 }), tags('hair_colors', 'Cheveux recherchés'), tags('eye_colors', 'Yeux recherchés'), tags('categories', 'Catégories recherchées'), f('requested_talents', 'Nombre de talents', 'number', { min: 1, max: 500 }), textarea('internal_notes', 'Commentaires internes')]),

  'casting-talents': r('casting_talents', 'Pipeline casting', 'updated_at',
    ['casting_id', 'model_id', 'stage', 'match_score', 'invited_at', 'updated_at'],
    [relation('casting_id', 'Casting', true), relation('model_id', 'Mannequin', true), f('stage', 'Étape', 'select', { options: STATUS.castingTalent, defaultValue: 'invited' }), f('match_score', 'Score de matching (%)', 'number', { min: 0, max: 100, step: 0.1 }), datetime('invited_at', 'Invitation'), datetime('responded_at', 'Réponse'), datetime('attended_at', 'Présence casting'), textarea('client_feedback', 'Retour client'), textarea('internal_notes', 'Notes internes')]),

  'booking-requests': { ...LEGACY_RESOURCE_DEFINITIONS.bookings, title: 'Demandes de booking' },

  bookings: r('bookings', 'Bookings de production', 'updated_at',
    ['title', 'model_id', 'client_id', 'status', 'starts_at', 'fee_gross', 'currency'],
    [relation('booking_request_id', 'Demande de booking'), relation('casting_id', 'Casting'), relation('client_id', 'Client'), relation('model_id', 'Mannequin', true), f('title', 'Projet', 'text', { required: true }), f('project_type', 'Type de projet', 'select', { options: [option('Fashion', 'fashion'), option('Commercial', 'commercial'), option('Beauty', 'beauty'), option('Éditorial', 'editorial'), option('Runway', 'runway'), option('E-commerce', 'ecommerce'), option('Fitness', 'fitness'), option('Influence', 'influence'), option('Autre', 'other')], defaultValue: 'fashion' }), f('status', 'Statut', 'select', { options: STATUS.booking, defaultValue: 'option' }), datetime('starts_at', 'Début'), datetime('ends_at', 'Fin'), f('location', 'Lieu'), money('fee_gross', 'Cachet brut'), f('currency', 'Devise', 'select', { options: [option('Franc CFA', 'XAF'), option('Euro', 'EUR'), option('Dollar US', 'USD')], defaultValue: 'XAF' }), f('agency_commission_rate', 'Commission agence (%)', 'number', { min: 0, max: 100, step: 0.1, defaultValue: 20 }), money('agency_commission_amount', 'Commission agence'), money('model_net_amount', 'Net mannequin'), money('travel_expenses', 'Frais déplacement'), textarea('notes', 'Notes')]),

  'booking-options': r('booking_options', 'Options mannequins', 'updated_at',
    ['title', 'model_id', 'client_id', 'option_rank', 'status', 'starts_at', 'expires_at'],
    [relation('booking_id', 'Booking'), relation('client_id', 'Client'), relation('model_id', 'Mannequin', true), f('title', 'Option / projet', 'text', { required: true }), f('option_rank', 'Priorité', 'select', { options: [option('Option 1', '1'), option('Option 2', '2'), option('Option 3', '3')], defaultValue: 1 }), f('status', 'Statut', 'select', { options: STATUS.option, defaultValue: 'active' }), datetime('starts_at', 'Début', true), datetime('ends_at', 'Fin', true), money('amount', 'Montant'), f('currency', 'Devise', 'select', { options: [option('Franc CFA', 'XAF'), option('Euro', 'EUR'), option('Dollar US', 'USD')], defaultValue: 'XAF' }), datetime('expires_at', 'Expiration de l’option'), textarea('notes', 'Notes')]),

  availability: r('model_availability', 'Disponibilités talents', 'updated_at',
    ['model_id', 'status', 'starts_at', 'ends_at', 'source', 'reason'],
    [relation('model_id', 'Mannequin', true), datetime('starts_at', 'Début', true), datetime('ends_at', 'Fin', true), f('status', 'Disponibilité', 'select', { options: STATUS.availability, defaultValue: 'available' }), f('source', 'Source', 'select', { options: [option('Agence', 'agency'), option('Mannequin', 'model'), option('Booking', 'booking'), option('Casting', 'casting'), option('Système', 'system')], defaultValue: 'agency' }), textarea('reason', 'Motif / précision')]),

  'calendar-events': r('agency_calendar_events', 'Calendrier agence', 'updated_at',
    ['title', 'event_type', 'model_id', 'starts_at', 'ends_at', 'status'],
    [relation('model_id', 'Mannequin'), relation('casting_id', 'Casting'), relation('booking_id', 'Booking'), relation('option_id', 'Option'), f('event_type', 'Type d’événement', 'select', { required: true, options: [option('Casting', 'casting'), option('Option', 'option'), option('Booking confirmé', 'booking'), option('Shooting', 'shooting'), option('Voyage', 'travel'), option('Indisponible', 'unavailable'), option('Réunion', 'meeting'), option('Autre', 'other')] }), f('title', 'Titre', 'text', { required: true }), datetime('starts_at', 'Début', true), datetime('ends_at', 'Fin', true), f('location', 'Lieu'), f('status', 'Statut', 'select', { options: status(['Actif', 'active'], ['Provisoire', 'tentative'], ['Terminé', 'completed'], ['Annulé', 'cancelled']), defaultValue: 'active' }), textarea('notes', 'Notes')]),

  quotes: r('quotes', 'Devis', 'updated_at',
    ['quote_number', 'client_id', 'status', 'issued_at', 'valid_until', 'total', 'currency'],
    [relation('client_id', 'Client', true), relation('booking_id', 'Booking'), f('quote_number', 'N° devis', 'text', { required: true }), f('status', 'Statut', 'select', { options: STATUS.quote, defaultValue: 'draft' }), date('issued_at', 'Émis le', true), date('valid_until', 'Valable jusqu’au'), money('subtotal', 'Sous-total'), money('tax_amount', 'Taxes'), money('total', 'Total'), f('currency', 'Devise', 'select', { options: [option('Franc CFA', 'XAF'), option('Euro', 'EUR'), option('Dollar US', 'USD')], defaultValue: 'XAF' }), textarea('notes', 'Notes')]),

  contracts: r('contracts', 'Contrats & documents', 'updated_at',
    ['title', 'contract_type', 'model_id', 'client_id', 'status', 'signed_at', 'expires_at'],
    [relation('client_id', 'Client'), relation('model_id', 'Mannequin'), relation('booking_id', 'Booking'), f('contract_type', 'Type de contrat', 'select', { options: [option('Contrat management', 'management'), option('Accord booking', 'booking'), option('Droits d’image', 'image_rights'), option('Release form', 'release'), option('NDA', 'nda'), option('Usage rights', 'usage'), option('Autre', 'other')], defaultValue: 'booking' }), f('title', 'Titre', 'text', { required: true }), f('status', 'Statut', 'select', { options: STATUS.contract, defaultValue: 'draft' }), f('document_url', 'Document', 'url'), datetime('sent_at', 'Envoyé le'), datetime('viewed_at', 'Vu le'), datetime('signed_at', 'Signé le'), datetime('expires_at', 'Expire le'), textarea('notes', 'Notes')]),

  invoices: r('invoices', 'Factures clients', 'updated_at',
    ['invoice_number', 'client_id', 'status', 'issued_at', 'due_at', 'total', 'amount_paid'],
    [relation('client_id', 'Client', true), relation('booking_id', 'Booking'), relation('quote_id', 'Devis'), f('invoice_number', 'N° facture', 'text', { required: true }), f('status', 'Statut', 'select', { options: STATUS.invoice, defaultValue: 'draft' }), date('issued_at', 'Émise le', true), date('due_at', 'Échéance'), money('subtotal', 'Sous-total'), money('tax_amount', 'Taxes'), money('total', 'Total'), money('amount_paid', 'Montant payé'), f('currency', 'Devise', 'select', { options: [option('Franc CFA', 'XAF'), option('Euro', 'EUR'), option('Dollar US', 'USD')], defaultValue: 'XAF' }), textarea('notes', 'Notes')]),

  'invoice-payments': r('invoice_payments', 'Encaissements clients', 'paid_at',
    ['invoice_id', 'amount', 'paid_at', 'payment_method', 'reference'],
    [relation('invoice_id', 'Facture', true), money('amount', 'Montant'), datetime('paid_at', 'Payé le', true), f('payment_method', 'Moyen de paiement', 'select', { options: [option('Virement', 'bank_transfer'), option('Mobile Money', 'mobile_money'), option('Espèces', 'cash'), option('Chèque', 'cheque'), option('Carte', 'card'), option('Autre', 'other')] }), f('reference', 'Référence'), textarea('notes', 'Notes')]),

  'image-rights': r('image_rights', 'Droits d’image', 'updated_at',
    ['campaign', 'model_id', 'client_id', 'status', 'starts_on', 'ends_on', 'rights_fee'],
    [relation('booking_id', 'Booking'), relation('client_id', 'Client'), relation('model_id', 'Mannequin', true), f('campaign', 'Campagne', 'text', { required: true }), tags('territory', 'Territoires'), tags('usage_channels', 'Supports / usages'), date('starts_on', 'Début', true), date('ends_on', 'Expiration', true), f('status', 'Statut', 'select', { options: STATUS.rights, defaultValue: 'active' }), money('rights_fee', 'Montant des droits'), f('currency', 'Devise', 'select', { options: [option('Franc CFA', 'XAF'), option('Euro', 'EUR'), option('Dollar US', 'USD')], defaultValue: 'XAF' }), textarea('notes', 'Notes')]),

  'client-selections': r('client_selections', 'Sélections clients', 'updated_at',
    ['title', 'casting_id', 'client_id', 'status', 'expires_at', 'public_token'],
    [relation('casting_id', 'Casting'), relation('client_id', 'Client'), f('title', 'Titre de la sélection', 'text', { required: true }), f('status', 'Statut', 'select', { options: STATUS.selection, defaultValue: 'active' }), datetime('expires_at', 'Expiration')]),

  'selection-items': r('client_selection_items', 'Talents des sélections', 'updated_at',
    ['selection_id', 'model_id', 'decision', 'client_comment', 'updated_at'],
    [relation('selection_id', 'Sélection', true), relation('model_id', 'Mannequin', true), f('decision', 'Décision client', 'select', { options: [option('En attente', 'pending'), option('Favori', 'favorite'), option('Shortlist', 'shortlist'), option('Refusé', 'rejected')], defaultValue: 'pending' }), textarea('client_comment', 'Commentaire client')]),
} as const satisfies Record<string, ResourceDefinition>;

export const RESOURCE_DEFINITIONS = {
  ...LEGACY_RESOURCE_DEFINITIONS,
  ...ERP_RESOURCE_DEFINITIONS,
};

export type ResourceName = keyof typeof RESOURCE_DEFINITIONS;

export function isResourceName(value: string): value is ResourceName {
  return Object.prototype.hasOwnProperty.call(RESOURCE_DEFINITIONS, value);
}
