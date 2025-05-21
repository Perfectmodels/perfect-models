
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface InstagramFieldProps {
  form: UseFormReturn<ModelApplication>;
}

const InstagramField = ({ form }: InstagramFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="instagram_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Instagram (optionnel)</FormLabel>
          <FormControl>
            <Input placeholder="@votre_instagram" {...field} maxLength={50} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default InstagramField;
