
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import { supabase } from '@/integrations/supabase/client';

interface UseCastingSubmitProps {
  form: UseFormReturn<ModelApplication>;
  onSuccess: () => void;
}

export const useCastingSubmit = ({ form, onSuccess }: UseCastingSubmitProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWhatsAppSubmit = async (data: ModelApplication) => {
    setIsLoading(true);
    
    try {
      // 1. Extraire les données relationnelles
      const { languages, special_skills, events_participated } = data;

      // 2. Insérer la candidature principale dans la table 'model_applications'
      const { data: newApplication, error: applicationError } = await supabase
        .from('model_applications')
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          category_id: data.category_id,
          date_of_birth: data.date_of_birth instanceof Date 
            ? data.date_of_birth.toISOString().split('T')[0] 
            : data.date_of_birth,
          age: data.age,
          weight: data.weight,
          height: data.height,
          bust: data.bust,
          waist: data.waist,
          hips: data.hips,
          shoe_size: data.shoe_size,
          hair_color: data.hair_color,
          eye_color: data.eye_color,
          experience: data.experience,
          instagram_url: data.instagram_url || null,
          availability: data.availability,
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      const applicationId = newApplication.id;

      // 3. Insérer les données relationnelles (langues, compétences, événements)
      if (languages && languages.length > 0) {
        const languagesToInsert = languages.map(lang => ({ application_id: applicationId, language: lang }));
        const { error } = await supabase.from('model_languages').insert(languagesToInsert);
        if (error) throw error;
      }

      if (special_skills && special_skills.length > 0) {
        const skillsToInsert = special_skills.map(skill => ({ application_id: applicationId, skill: skill }));
        const { error } = await supabase.from('model_skills').insert(skillsToInsert);
        if (error) throw error;
      }

      if (events_participated && events_participated.length > 0) {
        const eventsToInsert = events_participated.map(event => ({ application_id: applicationId, event_name: event }));
        const { error } = await supabase.from('model_events').insert(eventsToInsert);
        if (error) throw error;
      }

      // Construire le message WhatsApp avec les données originales
      const message = buildWhatsAppMessage(data);
      const whatsappUrl = `https://wa.me/24177507950?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      
      onSuccess();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      form.setError("root", { message: "Une erreur est survenue lors de l'enregistrement de votre candidature. Veuillez réessayer." });
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
