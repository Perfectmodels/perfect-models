
import { ModelApplication } from '@/types/modelTypes';

export const createWhatsAppLink = (data: ModelApplication) => {
  const message = encodeURIComponent(
    `Nouvelle candidature de mannequin:\n
Nom: ${data.first_name} ${data.last_name}\n
Email: ${data.email}\n
Téléphone: ${data.phone}\n
Genre: ${data.gender === 'women' ? 'Femme' : data.gender === 'men' ? 'Homme' : 'Enfant'}\n
Âge: ${data.age || 'Non spécifié'}\n
Taille: ${data.height}cm\n
Poids: ${data.weight || 'Non spécifié'}kg\n
Tour de poitrine: ${data.bust || 'Non spécifié'}cm\n
Tour de taille: ${data.waist || 'Non spécifié'}cm\n
Tour de hanches: ${data.hips || 'Non spécifié'}cm\n
Instagram: ${data.instagram_url || 'Non spécifié'}\n
Expérience: ${data.experience || 'Non spécifié'}`
  );
  
  return `https://wa.me/24107507950?text=${message}`;
};
