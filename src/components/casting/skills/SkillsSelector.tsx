
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface SkillsSelectorProps {
  form: UseFormReturn<ModelApplication>;
}

const SkillsSelector = ({ form }: SkillsSelectorProps) => {
  const skillOptions = [
    "Danse", "Chant", "Acting", "Sports", "Arts martiaux",
    "Yoga", "Musique", "Cuisine", "Dessin", "Photographie", "Autre"
  ];

  return (
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
  );
};

export default SkillsSelector;
