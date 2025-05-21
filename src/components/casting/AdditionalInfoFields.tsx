
import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormDescription } from '@/components/ui/form';

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

  const eventOptions = [
    "Aucun", 
    "K'Elle Pour elle", 
    "Sabo Fashion", 
    "Fashion ShowChou/Awards de la Mode Gabonaise", 
    "CLOFAS 241", 
    "FEMOGA", 
    "Femmes actives du Gabon", 
    "Perfect Fashion Day", 
    "Autre"
  ];

  const [otherEvent, setOtherEvent] = useState("");

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

      {/* Événements auxquels vous avez participé */}
      <div className="border border-gray-200 rounded-md p-6 bg-gray-50">
        <FormField
          control={form.control}
          name="events_participated"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-medium">Événements auxquels vous avez participé</FormLabel>
              <FormDescription>
                Sélectionnez tous les événements auxquels vous avez participé
              </FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {eventOptions.map((event) => (
                  <FormItem key={event} className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(event)}
                        onCheckedChange={(checked) => {
                          const currentValues = field.value || [];
                          let updatedValues;
                          
                          if (event === "Aucun" && checked) {
                            // If "Aucun" is selected, clear all other selections
                            updatedValues = ["Aucun"];
                          } else if (checked) {
                            // If any other option is selected, remove "Aucun" if it exists
                            const filteredValues = currentValues.filter(v => v !== "Aucun");
                            updatedValues = [...filteredValues, event];
                          } else {
                            updatedValues = currentValues.filter(value => value !== event);
                          }
                          
                          field.onChange(updatedValues);
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      {event}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
              
              {/* Other Event input field appears only when "Autre" is checked */}
              {field.value?.includes("Autre") && (
                <div className="mt-3">
                  <FormLabel htmlFor="other-event" className="text-sm">Veuillez préciser</FormLabel>
                  <Input 
                    id="other-event" 
                    placeholder="Précisez l'événement auquel vous avez participé"
                    value={otherEvent}
                    onChange={(e) => {
                      setOtherEvent(e.target.value);
                      // Update the events_participated array by removing any previous "Autre:" entry
                      // and adding the new one
                      const filteredValues = field.value?.filter(v => !v.startsWith("Autre:")) || [];
                      if (e.target.value) {
                        field.onChange([...filteredValues, `Autre: ${e.target.value}`]);
                      } else {
                        field.onChange([...filteredValues, "Autre"]);
                      }
                    }}
                    className="mt-1"
                  />
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
