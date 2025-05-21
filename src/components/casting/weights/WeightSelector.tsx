
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface WeightSelectorProps {
  form: UseFormReturn<ModelApplication>;
}

const WeightSelector = ({ form }: WeightSelectorProps) => {
  return (
    <FormField
      control={form.control}
      name="weight"
      render={({ field: { onChange, value, ...restField } }) => (
        <FormItem>
          <FormLabel>Poids (kg)</FormLabel>
          <Select onValueChange={(value) => onChange(parseInt(value))} value={value?.toString()}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre poids" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Array.from({ length: 91 }, (_, i) => i + 30).map((weight) => (
                <SelectItem key={weight} value={weight.toString()}>
                  {weight} kg
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

export default WeightSelector;
