
import { ServiceTarif } from '@/types/mannequinOrder';

export const serviceTarifs: ServiceTarif[] = [
  {
    id: 'shooting-basic',
    name: 'Shooting Photo Basique',
    description: 'Séance photo professionnelle en studio',
    basePrice: 75000,
    duration: '2-3 heures',
    features: ['1 mannequin', 'Studio inclus', '20 photos retouchées', 'Éclairage professionnel'],
    category: 'shooting'
  },
  {
    id: 'shooting-premium',
    name: 'Shooting Photo Premium',
    description: 'Séance photo avec mannequin expérimenté et décors multiples',
    basePrice: 150000,
    duration: '4-6 heures',
    features: ['1 mannequin expérimenté', 'Multiple décors', '50 photos retouchées', 'Maquillage inclus', 'Styling conseil'],
    category: 'shooting',
    recommended: true
  },
  {
    id: 'defile-local',
    name: 'Défilé Local',
    description: 'Participation à un défilé de mode local',
    basePrice: 100000,
    duration: '1 journée',
    features: ['1 mannequin', 'Répétitions incluses', 'Maquillage/coiffure', 'Transport local'],
    category: 'defile'
  },
  {
    id: 'defile-fashion-week',
    name: 'Fashion Week',
    description: 'Défilé haute couture pour événement majeur',
    basePrice: 400000,
    duration: '2-3 jours',
    features: ['Mannequin professionnel', 'Formation intensive', 'Hébergement inclus', 'Équipe styling complète'],
    category: 'defile',
    recommended: true
  },
  {
    id: 'evenement-corporate',
    name: 'Événement Corporate',
    description: 'Présence lors d\'événements d\'entreprise',
    basePrice: 125000,
    duration: '4-8 heures',
    features: ['Mannequin expérimenté', 'Tenue fournie', 'Formation protocole', 'Disponibilité flexible'],
    category: 'evenement'
  },
  {
    id: 'publicite-campagne',
    name: 'Campagne Publicitaire',
    description: 'Tournage pour spot publicitaire ou campagne marketing',
    basePrice: 250000,
    duration: '1-2 jours',
    features: ['Mannequin professionnel', 'Droits d\'image inclus', 'Multiple prises', 'Post-production'],
    category: 'publicite',
    recommended: true
  }
];
