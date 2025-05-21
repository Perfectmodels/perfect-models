
import { useState } from 'react';
import { toast } from 'sonner';
import { ModelApplication } from '@/types/modelTypes';
import { createWhatsAppLink } from '@/utils/whatsappUtils';
import { UseFormReturn } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';

interface UseCastingSubmitProps {
  form: UseFormReturn<ModelApplication>;
  onSuccess: () => void;
}

export const useCastingSubmit = ({ form, onSuccess }: UseCastingSubmitProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleWhatsAppSubmit = async (data: ModelApplication) => {
    try {
      setIsLoading(true);
      
      // Sauvegarde des données dans la base de données
      const { error: applicationError } = await supabase
        .from('model_applications')
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          category_id: data.category_id,
          date_of_birth: data.date_of_birth,
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
          instagram_url: data.instagram_url,
          availability: data.availability
        });

      if (applicationError) {
        console.error('Erreur lors de l\'enregistrement de la candidature:', applicationError);
        throw new Error('Erreur lors de l\'enregistrement de la candidature');
      }

      // Récupération de l'ID de la candidature
      const { data: applications } = await supabase
        .from('model_applications')
        .select('id')
        .eq('email', data.email)
        .order('created_at', { ascending: false })
        .limit(1);

      if (applications && applications.length > 0) {
        const applicationId = applications[0].id;

        // Enregistrement des langues
        if (data.languages && data.languages.length > 0) {
          const languageEntries = data.languages.map(language => ({
            application_id: applicationId,
            language
          }));

          const { error: languagesError } = await supabase
            .from('model_languages')
            .insert(languageEntries);

          if (languagesError) {
            console.error('Erreur lors de l\'enregistrement des langues:', languagesError);
          }
        }

        // Enregistrement des compétences
        if (data.special_skills && data.special_skills.length > 0) {
          const skillEntries = data.special_skills.map(skill => ({
            application_id: applicationId,
            skill
          }));

          const { error: skillsError } = await supabase
            .from('model_skills')
            .insert(skillEntries);

          if (skillsError) {
            console.error('Erreur lors de l\'enregistrement des compétences:', skillsError);
          }
        }

        // Enregistrement des événements
        if (data.events_participated && data.events_participated.length > 0) {
          const eventEntries = data.events_participated.map(event_name => ({
            application_id: applicationId,
            event_name
          }));

          const { error: eventsError } = await supabase
            .from('model_events')
            .insert(eventEntries);

          if (eventsError) {
            console.error('Erreur lors de l\'enregistrement des événements:', eventsError);
          }
        }
      }

      // Création et ouverture du lien WhatsApp
      const whatsappLink = createWhatsAppLink(data);
      window.open(whatsappLink, '_blank');
      
      toast.success('Candidature enregistrée et redirection vers WhatsApp');
      onSuccess();
      form.reset();
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleWhatsAppSubmit
  };
};
