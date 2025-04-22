
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelCategories, setModelCategories] = useState<{id: string, name: string}[]>([]);
  const [emailError, setEmailError] = useState(false);
  
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('model_categories')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error('Error fetching model categories:', error);
          return;
        }
        
        setModelCategories(data || []);
      } catch (err) {
        console.error('Error in fetchCategories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  const handleWhatsAppSubmit = (data: ModelApplication) => {
    const whatsappLink = createWhatsAppLink(data);
    window.open(whatsappLink, '_blank');
    toast.success('Redirection vers WhatsApp pour envoyer votre candidature');
    onSuccess();
    form.reset();
  };

  const onSubmit = async (data: ModelApplication) => {
    setIsSubmitting(true);
    setEmailError(false);
    
    try {
      const { error } = await supabase.from('applications').insert([data]);
      
      if (error) {
        toast.error('Erreur lors de l\'envoi de votre candidature.');
        console.error('Error submitting application:', error);
        return;
      }
      
      const { error: emailError } = await supabase.functions.invoke('send-application-pdf', {
        body: { application: data }
      });
      
      if (emailError) {
        console.error('Error sending email:', emailError);
        setEmailError(true);
        toast.error('Problème avec l\'envoi de l\'email. Essayez via WhatsApp.');
      } else {
        toast.success('Votre candidature a été envoyée avec succès !');
        onSuccess();
        form.reset();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setEmailError(true);
      toast.error('Une erreur s\'est produite. Veuillez essayer via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} modelCategories={modelCategories} />
        <MeasurementsFields form={form} />
        <AdditionalInfoFields form={form} />

        <div className="pt-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-model-gold hover:bg-model-gold/90 text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Soumettre ma candidature"}
          </Button>
          
          <Button 
            type="button" 
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
            onClick={() => handleWhatsAppSubmit(form.getValues())}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Envoyer via WhatsApp
          </Button>
        </div>
        
        {emailError && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
            <p className="text-amber-700 text-sm">
              Problème avec l'envoi de l'email. Vous pouvez utiliser l'option WhatsApp pour envoyer votre candidature directement.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
};

export default CastingForm;
