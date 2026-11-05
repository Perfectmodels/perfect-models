const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  archived: 'Archivé',
  suspended: 'Suspendu',
  pending: 'En attente',
  validated: 'Confirmé',
  confirmed: 'Confirmé',
  rejected: 'Rejeté',
  draft: 'Brouillon',
  open: 'Ouvert',
  matching: 'Matching',
  shortlist: 'Shortlist',
  callback: 'Callback',
  selected: 'Sélectionné',
  booked: 'Booké',
  attended: 'Casting effectué',
  invited: 'Invité',
  declined: 'Décliné',
  closed: 'Clôturé',
  cancelled: 'Annulé',
  option: 'Option',
  in_production: 'En production',
  completed: 'Terminé',
  available: 'Disponible',
  unavailable: 'Indisponible',
  travel: 'En déplacement',
  tentative: 'À confirmer',
  sent: 'Envoyé',
  viewed: 'Consulté',
  signed: 'Signé',
  expired: 'Expiré',
  expiring: 'À renouveler',
  renewed: 'Renouvelé',
  partial: 'Paiement partiel',
  paid: 'Payé',
  overdue: 'En retard',
  released: 'Libérée',
  favorite: 'Favori',
  lead: 'Prospect',
  new: 'Nouveau',
};

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  membership_package: 'Pack adhésion',
  registration: 'Inscription',
  membership_fee: 'Cotisation mensuelle',
  agency_commission: 'Commission agence',
  other: 'Autre paiement',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  manual: 'Saisie administrative',
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  airtel_money: 'Airtel Money',
  moov_money: 'Moov Money',
  bank_transfer: 'Virement bancaire',
  cheque: 'Chèque',
  card: 'Carte bancaire',
  other: 'Autre moyen',
};

const PROJECT_TYPE_LABELS: Record<string, string> = {
  fashion: 'Mode',
  commercial: 'Publicité',
  beauty: 'Beauté',
  editorial: 'Éditorial',
  runway: 'Défilé',
  ecommerce: 'E-commerce',
  fitness: 'Sport / fitness',
  influence: 'Influence',
  other: 'Autre',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  runway: 'Défilé',
  fashion_show: 'Défilé',
  shooting: 'Shooting',
  campaign: 'Campagne',
  press: 'Presse',
  collaboration: 'Collaboration',
  casting: 'Casting',
  booking: 'Booking',
  travel: 'Déplacement',
  meeting: 'Réunion',
  other: 'Autre',
};

export function formatStatus(value: unknown) {
  const key = String(value || '').trim();
  if (!key) return 'Non renseigné';
  return STATUS_LABELS[key] || key.replace(/_/g, ' ').replace(/^./, (letter) => letter.toLocaleUpperCase('fr'));
}

export function formatPaymentType(value: unknown) {
  const key = String(value || '').trim();
  return PAYMENT_TYPE_LABELS[key] || (key ? formatStatus(key) : 'Paiement');
}

export function formatPaymentMethod(value: unknown) {
  const key = String(value || '').trim();
  return PAYMENT_METHOD_LABELS[key] || (key ? formatStatus(key) : 'Non renseigné');
}

export function formatProjectType(value: unknown) {
  const key = String(value || '').trim();
  return PROJECT_TYPE_LABELS[key] || (key ? formatStatus(key) : 'Projet');
}

export function formatEventType(value: unknown) {
  const key = String(value || '').trim();
  return EVENT_TYPE_LABELS[key] || (key ? formatStatus(key) : 'Événement');
}

export function formatMoney(value: unknown, currency = 'XAF') {
  const amount = Number(value || 0);
  const normalizedCurrency = currency || 'XAF';
  if (!Number.isFinite(amount)) return '—';
  if (normalizedCurrency === 'XAF') {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount)} FCFA`;
  }
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: normalizedCurrency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: unknown, includeTime = false) {
  if (!value) return 'Non renseignée';
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function formatGender(value: unknown) {
  const key = String(value || '').trim().toLocaleLowerCase('fr');
  if (['female', 'femme', 'f'].includes(key)) return 'Femme';
  if (['male', 'homme', 'm'].includes(key)) return 'Homme';
  if (['other', 'autre'].includes(key)) return 'Autre';
  return key ? formatStatus(key) : 'Non renseigné';
}

export function statusTone(value: unknown) {
  const key = String(value || '');
  if (['active', 'available', 'validated', 'confirmed', 'selected', 'booked', 'signed', 'paid', 'completed'].includes(key)) {
    return 'bg-emerald-100 text-emerald-900';
  }
  if (['pending', 'tentative', 'draft', 'option', 'invited', 'expiring', 'partial', 'callback', 'shortlist'].includes(key)) {
    return 'bg-amber-100 text-amber-900';
  }
  if (['inactive', 'archived', 'suspended', 'rejected', 'cancelled', 'expired', 'unavailable', 'overdue'].includes(key)) {
    return 'bg-rose-100 text-rose-900';
  }
  return 'bg-stone-100 text-stone-700';
}
