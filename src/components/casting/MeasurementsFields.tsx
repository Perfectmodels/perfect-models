
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface MeasurementsFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const MeasurementsFields = ({ form }: MeasurementsFieldsProps) => {
  // Arrays for measurement options with meaningful ranges
  const ageOptions = Array.from({ length: 41 }, (_, i) => i + 10);
  const heightOptions = Array.from({ length: 171 }, (_, i) => i + 50);
  const bustOptions = Array.from({ length: 91 }, (_, i) => i + 60);
  const waistOptions = Array.from({ length: 81 }, (_, i) => i + 40);
  const hipsOptions = Array.from({ length: 91 }, (_, i) => i + 60);
  const shoeSizeOptions = Array.from({ length: 21 }, (_, i) => i + 30);
  const hairColors = [
    "Noir", "Brun", "Châtain", "Blond", "Roux", "Gris", "Blanc", 
    "Coloré", "Autre"
  ];
  const eyeColors = [
    "Marron", "Noisette", "Vert", "Bleu", "Gris", "Ambre", 
    "Noir", "Hétérochromie", "Autre"
  ];
  
  // Get the gender value to conditionally display appropriate labels
  const gender = form.watch("gender");
  const isMale = gender === "male";

  return (
    <>
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
    </>
  );
};

export default MeasurementsFields;
