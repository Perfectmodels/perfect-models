
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EventsSelectorProps {
  form: UseFormReturn<ModelApplication>;
}

const EventsSelector = ({ form }: EventsSelectorProps) => {
  const [eventOptions, setEventOptions] = useState<string[]>([
    "Fashion Week Paris", "Fashion Week Milan", "Fashion Week New York",
    "Défilé Haute Couture", "Shooting Editorial", "Campagne Publicitaire",
    "Salon du Mariage", "Salon de la Mode", "Autre"
  ]);

  useEffect(() => {
    // Cette fonction pourrait être utilisée pour récupérer des événements depuis Supabase
    const fetchEvents = async () => {
      try {
        // Exemple de comment récupérer des événements depuis Supabase dans le futur
        // const { data, error } = await supabase
        //   .from('events')
        //   .select('name')
        //   .order('name', { ascending: true });
        
        // if (!error && data) {
        //   setEventOptions(data.map(event => event.name));
        // }
      } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
      }
    };
    
    // Désactivé pour l'instant car nous utilisons des valeurs statiques
    // fetchEvents();
  }, []);

  return (
    <FormField
      control={form.control}
      name="events_participated"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Événements auxquels vous avez participé (optionnel)</FormLabel>
          <Select 
            onValueChange={(value) => {
              const newValue = field.value ? [...field.value, value] : [value];
              field.onChange(newValue);
            }}
            value=""
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Ajouter un événement" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {eventOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.value && field.value.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.value.map((event, index) => (
                <div 
                  key={index} 
                  className="bg-primary-50 border border-primary-200 text-primary-700 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {event}
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

export default EventsSelector;
