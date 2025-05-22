
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import { useEffect, useState } from 'react';

interface EventsSelectorProps {
  form: UseFormReturn<ModelApplication>;
}

const EventsSelector = ({ form }: EventsSelectorProps) => {
  const [eventOptions, setEventOptions] = useState<string[]>([
    "Fashion Week Paris", "Fashion Week Milan", "Fashion Week New York",
    "Défilé Haute Couture", "Shooting Editorial", "Campagne Publicitaire",
    "Salon du Mariage", "Salon de la Mode", 
    // Événements ajoutés selon la demande
    "K'elle Pour Elle", "FEMOGA", "Fashion ShowChou", "CLOFAS 241", 
    "Perfect Fashion Day", "Sabo Fashion", "Défilé Edele A", 
    "Défilé Ecole de Mode de Nzeng Ayong", "Kultur Fashion Show", 
    "Issée Fashion Show", "EMPREINTE", "Femmes Actives du Gabon", 
    "Festival de l'Independance", "Défile Olga'O", "Pink Women Show",
    "Autre"
  ]);

  // S'assurer que le champ events_participated est initialisé comme un tableau vide s'il est undefined
  useEffect(() => {
    if (form.getValues('events_participated') === undefined) {
      form.setValue('events_participated', [], { shouldValidate: false });
    }
  }, [form]);

  return (
    <FormField
      control={form.control}
      name="events_participated"
      render={({ field }) => {
        // S'assurer que field.value est toujours un tableau
        const events = Array.isArray(field.value) ? field.value : [];
        
        return (
          <FormItem className="w-full">
            <FormLabel>Événements auxquels vous avez participé (optionnel)</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <Select 
                  onValueChange={(value) => {
                    if (!events.includes(value)) {
                      const newValues = [...events, value];
                      field.onChange(newValues);
                    }
                  }}
                  value=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ajouter un événement" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Affichage des événements sélectionnés */}
                {events.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {events.map((event, index) => (
                      <div 
                        key={index} 
                        className="bg-primary-50 border border-primary-200 text-primary-700 px-2 py-1 rounded-md text-sm flex items-center"
                      >
                        {event}
                        <button 
                          type="button"
                          className="ml-1 text-primary-500 hover:text-primary-700"
                          onClick={() => {
                            const newValues = events.filter((_, i) => i !== index);
                            field.onChange(newValues);
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default EventsSelector;
