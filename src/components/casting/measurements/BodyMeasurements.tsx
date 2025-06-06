
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface BodyMeasurementsProps {
  form: UseFormReturn<ModelApplication>;
}

const BodyMeasurements = ({ form }: BodyMeasurementsProps) => {
  // Arrays for measurement options with meaningful ranges
  const bustOptions = Array.from({ length: 91 }, (_, i) => i + 60);
  const waistOptions = Array.from({ length: 81 }, (_, i) => i + 40);
  const hipsOptions = Array.from({ length: 91 }, (_, i) => i + 60);
  
  // Get the gender value to conditionally display appropriate labels
  const gender = form.watch("gender");
  const isMale = gender === "male";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormField
        control={form.control}
        name="bust"
        rules={{ required: isMale ? "Le tour de poitrine est requis" : "Le tour de poitrine est requis" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{isMale ? "Tour de poitrine (cm)" : "Tour de poitrine (cm)"}</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une valeur" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {bustOptions.map((bust) => (
                  <SelectItem key={bust} value={bust.toString()}>
                    {bust} cm
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
        name="waist"
        rules={{ required: "Le tour de taille est requis" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tour de taille (cm)</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une valeur" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {waistOptions.map((waist) => (
                  <SelectItem key={waist} value={waist.toString()}>
                    {waist} cm
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
        name="hips"
        rules={{ required: "Le tour de hanches est requis" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tour de hanches (cm)</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une valeur" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {hipsOptions.map((hips) => (
                  <SelectItem key={hips} value={hips.toString()}>
                    {hips} cm
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

export default BodyMeasurements;
