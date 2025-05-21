
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { ModelApplication } from '@/types/modelTypes';
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
  });

  const { isLoading, handleWhatsAppSubmit } = useCastingSubmit({ form, onSuccess });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleWhatsAppSubmit)} className="space-y-6">
        <PersonalInfoFields form={form} />
        <MeasurementsFields form={form} />
        <AdditionalInfoFields form={form} />

        <div className="pt-4">
          <SubmitButton isLoading={isLoading} />
        </div>
      </form>
    </Form>
  );
};

export default CastingForm;
