
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ModelApplication } from '@/types/modelTypes';
import { MessageSquare } from 'lucide-react';
import PersonalInfoFields from './PersonalInfoFields';
import MeasurementsFields from './MeasurementsFields';
import AdditionalInfoFields from './AdditionalInfoFields';
import { createWhatsAppLink } from '@/utils/whatsappUtils';
import { supabase } from '@/integrations/supabase/client';

interface CastingFormProps {
  onSuccess: () => void;
}

const CastingForm = ({ onSuccess }: CastingFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ModelApplication>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: '',
      category_id: '',
      age: null,
      weight: null,
      height: 0,
      bust: null,
      waist: null,
      hips: null,
      experience: '',
      instagram_url: '',
    },
  });

  const handleSubmit = async (data: ModelApplication) => {
    try {
      setIsLoading(true);
      
      // Vérifier que la catégorie est un UUID valide ou null
      const categoryId = data.category_id ? data.category_id : null;
      
      // 1. Enregistrer les informations de base dans la base de données
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          gender: data.gender,
          category_id: categoryId,
          age: data.age,
          height: data.height,
          weight: data.weight,
          bust: data.bust,
          waist: data.waist,
          hips: data.hips,
          instagram_url: data.instagram_url,
          experience: data.experience
        })
        .select('id')
        .single();

      if (applicationError || !applicationData) {
        console.error('Erreur d\'enregistrement de la candidature:', applicationError);
        toast.error('Erreur lors de l\'enregistrement de la candidature');
        return;
      }

      // 2. Créer et ouvrir le lien WhatsApp
      const whatsappLink = createWhatsAppLink(data);
      window.open(whatsappLink, '_blank');
      
      toast.success('Candidature enregistrée avec succès');
      onSuccess();
      form.reset();
    } catch (err) {
      console.error('Erreur lors de la soumission de la candidature:', err);
      toast.error('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} />
        <MeasurementsFields form={form} />
        <AdditionalInfoFields form={form} />

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <MessageSquare className="h-5 w-5" />
            {isLoading ? "Envoi en cours..." : "Envoyer ma candidature via WhatsApp"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CastingForm;
