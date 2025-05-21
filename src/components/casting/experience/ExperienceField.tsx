
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface ExperienceFieldProps {
  form: UseFormReturn<ModelApplication>;
}

const ExperienceField = ({ form }: ExperienceFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="experience"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Expérience (optionnel)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Décrivez votre expérience dans le mannequinat"
              className="min-h-[100px]"
              {...field}
              maxLength={1000}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ExperienceField;
