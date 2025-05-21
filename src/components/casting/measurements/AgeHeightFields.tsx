
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface AgeHeightFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const AgeHeightFields = ({ form }: AgeHeightFieldsProps) => {
  // Arrays for age and height options
  const ageOptions = Array.from({ length: 41 }, (_, i) => i + 10);
  const heightOptions = Array.from({ length: 171 }, (_, i) => i + 50);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="age"
        rules={{ required: "L'âge est requis" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Âge</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre âge" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ageOptions.map((age) => (
                  <SelectItem key={age} value={age.toString()}>
                    {age} ans
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="height"
        rules={{ required: "La taille est requise" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Taille (cm)</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre taille" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {heightOptions.map((height) => (
                  <SelectItem key={height} value={height.toString()}>
                    {height} cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AgeHeightFields;
