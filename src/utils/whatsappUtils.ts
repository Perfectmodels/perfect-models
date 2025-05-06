
import { ModelApplication } from '@/types/modelTypes';

export const createWhatsAppLink = (data: ModelApplication) => {
  // Mapping gender values to French terms
  let genderText = 'Non spécifié';
  if (data.gender === 'male') genderText = 'Homme';
  if (data.gender === 'female') genderText = 'Femme';
  if (data.gender === 'other') genderText = 'Autre';
  
  // Format languages and skills as comma-separated lists if they exist
  const languagesText = data.languages && data.languages.length > 0 
    ? data.languages.join(', ') 
    : 'Non spécifié';
  
  const skillsText = data.special_skills && data.special_skills.length > 0 
    ? data.special_skills.join(', ') 
    : 'Non spécifié';
  
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
Pointure: ${data.shoe_size || 'Non spécifié'}\n
Couleur des cheveux: ${data.hair_color || 'Non spécifié'}\n
Couleur des yeux: ${data.eye_color || 'Non spécifié'}\n
Disponibilité: ${data.availability || 'Non spécifié'}\n
Langues: ${languagesText}\n
Compétences: ${skillsText}\n
Instagram: ${data.instagram_url || 'Non spécifié'}\n
Expérience: ${data.experience || 'Non spécifié'}`
  );
  
  return `https://wa.me/24107507950?text=${message}`;
};
