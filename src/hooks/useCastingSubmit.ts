
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface UseCastingSubmitProps {
  form: UseFormReturn<ModelApplication>;
  onSuccess: () => void;
}

export const useCastingSubmit = ({ form, onSuccess }: UseCastingSubmitProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWhatsAppSubmit = async (data: ModelApplication) => {
    setIsLoading(true);
    
    try {
      // Convertir la date en string si c'est un objet Date
      const processedData = {
        ...data,
        date_of_birth: data.date_of_birth instanceof Date 
          ? data.date_of_birth.toISOString().split('T')[0] 
          : data.date_of_birth
      };

      // Construire le message WhatsApp
      const message = buildWhatsAppMessage(processedData);
      const whatsappUrl = `https://wa.me/24177507950?text=${encodeURIComponent(message)}`;
      
      // Ouvrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Appeler onSuccess pour réinitialiser le formulaire et afficher le succès
      onSuccess();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      return { success: false, error: 'Erreur lors de la soumission' };
    } finally {
      setIsLoading(false);
    }
  };

  const buildWhatsAppMessage = (data: ModelApplication) => {
    return `🌟 NOUVELLE CANDIDATURE MANNEQUIN 🌟

📝 INFORMATIONS PERSONNELLES
Nom: ${data.last_name}
Prénom: ${data.first_name}
Email: ${data.email}
Téléphone: ${data.phone}
Genre: ${data.gender}
Date de naissance: ${data.date_of_birth}
Âge: ${data.age || 'Non renseigné'}

📏 MENSURATIONS
Taille: ${data.height} cm
Poids: ${data.weight || 'Non renseigné'} kg
Tour de poitrine: ${data.bust || 'Non renseigné'} cm
Tour de taille: ${data.waist || 'Non renseigné'} cm
Tour de hanches: ${data.hips || 'Non renseigné'} cm
Pointure: ${data.shoe_size || 'Non renseigné'}
Couleur des cheveux: ${data.hair_color || 'Non renseigné'}
Couleur des yeux: ${data.eye_color || 'Non renseigné'}

💼 EXPÉRIENCE & COMPÉTENCES
Expérience: ${data.experience || 'Non renseigné'}
Disponibilité: ${data.availability || 'Non renseigné'}
Langues: ${data.languages?.join(', ') || 'Non renseigné'}
Compétences spéciales: ${data.special_skills?.join(', ') || 'Non renseigné'}
Événements participés: ${data.events_participated?.join(', ') || 'Aucun'}

🔗 RÉSEAUX SOCIAUX
Instagram: ${data.instagram_url || 'Non renseigné'}

---
Candidature envoyée depuis le site Perfect Models Management`;
  };

  return { handleWhatsAppSubmit, isLoading };
};
