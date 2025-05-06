
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const AdditionalInfoFields = ({ form }: AdditionalInfoFieldsProps) => {
  const availabilityOptions = [
    "Temps plein", "Temps partiel", "Weekends", "Soirées", 
    "Flexible", "Sur demande"
  ];
  
  const languageOptions = [
    "Français", "Anglais", "Espagnol", "Italien", "Allemand",
    "Arabe", "Portugais", "Russe", "Chinois", "Japonais", "Autre"
  ];

  const skillOptions = [
    "Danse", "Chant", "Acting", "Sports", "Arts martiaux",
    "Yoga", "Musique", "Cuisine", "Dessin", "Photographie", "Autre"
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <FormField
          control={form.control}
          name="languages"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Langues parlées (optionnel)</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const newValue = field.value ? [...field.value, value] : [value];
                  field.onChange(newValue);
                }}
                value=""
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter une langue" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((lang, index) => (
                    <div 
                      key={index} 
                      className="bg-primary-50 border border-primary-200 text-primary-700 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {lang}
                      <button 
                        type="button"
                        className="ml-1 text-primary-500 hover:text-primary-700"
                        onClick={() => {
                          const newValue = field.value?.filter((_, i) => i !== index);
                          field.onChange(newValue);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="special_skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compétences spéciales (optionnel)</FormLabel>
              <Select 
                onValueChange={(value) => {
                  const newValue = field.value ? [...field.value, value] : [value];
                  field.onChange(newValue);
                }}
                value=""
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter une compétence" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {skillOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.value && field.value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((skill, index) => (
                    <div 
                      key={index} 
                      className="bg-primary-50 border border-primary-200 text-primary-700 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {skill}
                      <button 
                        type="button"
                        className="ml-1 text-primary-500 hover:text-primary-700"
                        onClick={() => {
                          const newValue = field.value?.filter((_, i) => i !== index);
                          field.onChange(newValue);
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                maxLength={1000}
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
