import type { CrudField } from '@/lib/resource-registry';

const option = (label: string, value = label) => ({ label, value });

export const MODEL_ADMIN_COLUMNS = [
  'name', 'username', 'gender', 'height_cm', 'hair_color', 'eye_color', 'location', 'level', 'base_rate', 'is_public', 'status',
] as const;

export const MODEL_ADMIN_FIELDS: CrudField[] = [
  { name: 'id', label: 'Identifiant fiche', type: 'text', required: true, createOnly: true, placeholder: 'ex. sarah-klomegan' },
  { name: 'name', label: 'Nom complet', type: 'text', required: true },
  { name: 'username', label: 'Identifiant agence', type: 'text' },
  { name: 'email', label: 'E-mail', type: 'email' },
  { name: 'phone', label: 'Téléphone', type: 'tel' },
  { name: 'birth_date', label: 'Date de naissance', type: 'date' },
  { name: 'gender', label: 'Genre', type: 'select', options: [option('Femme'), option('Homme'), option('Autre')] },
  { name: 'nationality', label: 'Nationalité', type: 'text', defaultValue: 'Gabonaise' },
  { name: 'location', label: 'Ville / localisation', type: 'text' },
  { name: 'height_cm', label: 'Taille (cm)', type: 'number', min: 100, max: 230, step: 0.5 },
  { name: 'chest_cm', label: 'Poitrine (cm)', type: 'number', min: 40, max: 180, step: 0.5 },
  { name: 'waist_cm', label: 'Tour de taille (cm)', type: 'number', min: 35, max: 180, step: 0.5 },
  { name: 'hips_cm', label: 'Hanches (cm)', type: 'number', min: 40, max: 200, step: 0.5 },
  { name: 'shoe_size', label: 'Pointure', type: 'select', options: Array.from({ length: 19 }, (_, index) => option(String(30 + index))) },
  { name: 'eye_color', label: 'Couleur des yeux', type: 'select', options: [option('Marron'), option('Noir'), option('Noisette'), option('Vert'), option('Bleu'), option('Gris'), option('Autre')] },
  { name: 'hair_color', label: 'Couleur des cheveux', type: 'select', options: [option('Noir'), option('Brun'), option('Châtain'), option('Blond'), option('Roux'), option('Gris'), option('Autre')] },
  { name: 'level', label: 'Niveau', type: 'select', options: [option('Débutant'), option('Intermédiaire'), option('Confirmé'), option('Professionnel')] },
  { name: 'categories', label: 'Catégories', type: 'tags', help: 'Ex. fashion, beauty, runway, commercial, e-commerce, influence.' },
  { name: 'mobility', label: 'Mobilité', type: 'tags', help: 'Villes ou pays dans lesquels le mannequin peut travailler.' },
  { name: 'base_rate', label: 'Tarif de base', type: 'number', min: 0, step: 1 },
  { name: 'rate_currency', label: 'Devise du tarif', type: 'select', defaultValue: 'XAF', options: [option('Franc CFA', 'XAF'), option('Euro', 'EUR'), option('Dollar US', 'USD')] },
  { name: 'image_url', label: 'Photo principale', type: 'url' },
  { name: 'instagram_url', label: 'Instagram', type: 'url' },
  { name: 'experience', label: 'Expérience', type: 'textarea', wide: true },
  { name: 'journey', label: 'Parcours', type: 'textarea', wide: true },
  { name: 'is_public', label: 'Visible publiquement', type: 'boolean', defaultValue: true, help: 'Les profils mannequins sont publics par défaut sur le roster Perfect Models Management.' },
  { name: 'is_active', label: 'Actif dans l’agence', type: 'boolean', defaultValue: true },
  { name: 'status', label: 'Statut', type: 'select', defaultValue: 'active', options: [option('Actif', 'active'), option('Inactif', 'inactive'), option('Suspendu', 'suspended')] },
];
