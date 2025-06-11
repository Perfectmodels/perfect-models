import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { ModelApplication, modelApplicationSchema } from '@/types/modelTypes'; // Ajoute un schéma Zod ici
import PersonalInfoFields from './PersonalInfoFields';
import MeasurementsFields from './MeasurementsFields';
import AdditionalInfoFields from './AdditionalInfoFields';
import SubmitButton from './submit/SubmitButton';
import { useCastingSubmit } from '@/hooks/useCastingSubmit';

interface CastingFormProps {
  onSuccess: () => void;
}

const CastingForm = ({ onSuccess }: CastingFormProps) => {
  const form = useForm<ModelApplication>({
    resolver: zodResolver(modelApplicationSchema), // Utilise Zod pour la validation
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: '',
      category_id: '',
      date_of_birth: undefined,
      age: null,
      weight: null,
      height: 0,
      bust: null,
      waist: null,
      hips: null,
      shoe_size: null,
      hair_color: '',
      eye_color: '',
      experience: '',
      instagram_url: '',
      availability: '',
      languages: [],
      special_skills: [],
      events_participated: [],
    },
    mode: 'onBlur', // Validation au blur pour UX
  });

  const { isLoading, handleWhatsAppSubmit } = useCastingSubmit({
    form,
    onSuccess: () => {
      form.reset(); // Remettre à zéro le formulaire après succès
      onSuccess();
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleWhatsAppSubmit)}
        className="space-y-6"
        aria-label="Formulaire de candidature casting"
      >
        <PersonalInfoFields form={form} />
        <MeasurementsFields form={form} />
        <AdditionalInfoFields form={form} />

        {/* Affichage global d'erreur si besoin */}
        {form.formState.isSubmitSuccessful && (
          <div className="text-green-600">Votre candidature a été envoyée avec succès !</div>
        )}
        {form.formState.errors.root && (
          <div className="text-red-600">{form.formState.errors.root.message}</div>
        )}

        <div className="pt-4">
          <SubmitButton isLoading={isLoading} disabled={!form.formState.isValid || isLoading} />
        </div>
      </form>
    </Form>
  );
};

export default CastingForm;
