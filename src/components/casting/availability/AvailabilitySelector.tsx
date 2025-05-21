
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface AvailabilitySelectorProps {
  form: UseFormReturn<ModelApplication>;
}

const AvailabilitySelector = ({ form }: AvailabilitySelectorProps) => {
  const availabilityOptions = [
    "Temps plein", "Temps partiel", "Weekends", "Soirées", 
    "Flexible", "Sur demande"
  ];
  
  return (
    <FormField
      control={form.control}
      name="availability"
      rules={{ required: "La disponibilité est requise" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Disponibilité</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez vos disponibilités" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AvailabilitySelector;
