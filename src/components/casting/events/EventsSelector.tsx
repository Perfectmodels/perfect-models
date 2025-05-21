import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface EventsSelectorProps {
  form: UseFormReturn<ModelApplication>;
}

const EventsSelector = ({ form }: EventsSelectorProps) => {
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
  );
};

export default EventsSelector;
