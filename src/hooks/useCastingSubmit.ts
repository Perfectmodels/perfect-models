
import { useState } from 'react';
import { toast } from 'sonner';
import { ModelApplication } from '@/types/modelTypes';
import { createWhatsAppLink } from '@/utils/whatsappUtils';
import { UseFormReturn } from 'react-hook-form';

interface UseCastingSubmitProps {
  form: UseFormReturn<ModelApplication>;
  onSuccess: () => void;
}

export const useCastingSubmit = ({ form, onSuccess }: UseCastingSubmitProps) => {
  const [isLoading, setIsLoading] = useState(false);

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

  return {
    isLoading,
    handleWhatsAppSubmit
  };
};
