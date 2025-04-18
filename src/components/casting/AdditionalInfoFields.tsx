
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const AdditionalInfoFields = ({ form }: AdditionalInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="weight"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Poids (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="60" 
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)} 
                  {...restField} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="instagram_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="@votre_instagram" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default AdditionalInfoFields;
