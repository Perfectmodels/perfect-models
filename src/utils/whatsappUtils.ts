
import { ModelApplication } from '@/types/modelTypes';

export const createWhatsAppLink = (data: ModelApplication) => {
  // Mapping gender values to French terms
  let genderText = 'Non spécifié';
  if (data.gender === 'male') genderText = 'Homme';
  if (data.gender === 'female') genderText = 'Femme';
  if (data.gender === 'other') genderText = 'Autre';
  
  const message = encodeURIComponent(
    `Nouvelle candidature de mannequin:\n
Nom: ${data.first_name} ${data.last_name}\n
Email: ${data.email}\n
Téléphone: ${data.phone}\n
Genre: ${genderText}\n
Âge: ${data.age || 'Non spécifié'} ans\n
Taille: ${data.height || 'Non spécifié'} cm\n
Poids: ${data.weight || 'Non spécifié'} kg\n
Tour de poitrine: ${data.bust || 'Non spécifié'} cm\n
Tour de taille: ${data.waist || 'Non spécifié'} cm\n
Tour de hanches: ${data.hips || 'Non spécifié'} cm\n
Instagram: ${data.instagram_url || 'Non spécifié'}\n
Expérience: ${data.experience || 'Non spécifié'}\n
Photos jointes: ${(data.portrait_images?.length || 0) + (data.full_body_images?.length || 0)} photos\n
(${data.portrait_images?.length || 0} portraits, ${data.full_body_images?.length || 0} corps entier)`
  );
  
  return `https://wa.me/24107507950?text=${message}`;
};
