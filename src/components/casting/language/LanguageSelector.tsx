
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface LanguageSelectorProps {
  form: UseFormReturn<ModelApplication>;
}

const LanguageSelector = ({ form }: LanguageSelectorProps) => {
  const languageOptions = [
    "Français", "Anglais", "Espagnol", "Italien", "Allemand",
    "Arabe", "Portugais", "Russe", "Chinois", "Japonais", "Autre"
  ];

  return (
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
  );
};

export default LanguageSelector;
