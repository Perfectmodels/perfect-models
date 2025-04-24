
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

  const handleWhatsAppSubmit = (data: ModelApplication) => {
    try {
      setIsLoading(true);
      const whatsappLink = createWhatsAppLink(data);
      window.open(whatsappLink, '_blank');
      toast.success('Redirection vers WhatsApp pour envoyer votre candidature');
      onSuccess();
      form.reset();
    } catch (err) {
      console.error('Error creating WhatsApp link:', err);
      toast.error('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleWhatsAppSubmit)} className="space-y-6">
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

