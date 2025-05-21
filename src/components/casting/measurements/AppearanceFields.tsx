
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface AppearanceFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const AppearanceFields = ({ form }: AppearanceFieldsProps) => {
  const shoeSizeOptions = Array.from({ length: 21 }, (_, i) => i + 30);
  const hairColors = [
    "Noir", "Brun", "Châtain", "Blond", "Roux", "Gris", "Blanc", 
    "Coloré", "Autre"
  ];
  const eyeColors = [
    "Marron", "Noisette", "Vert", "Bleu", "Gris", "Ambre", 
    "Noir", "Hétérochromie", "Autre"
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormField
        control={form.control}
        name="shoe_size"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pointure</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre pointure" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {shoeSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
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
        name="hair_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Couleur de cheveux</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une couleur" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {hairColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
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
        name="eye_color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Couleur des yeux</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une couleur" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {eyeColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
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

export default AppearanceFields;
