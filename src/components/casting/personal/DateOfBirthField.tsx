
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateOfBirthFieldProps {
  form: UseFormReturn<ModelApplication>;
}

const DateOfBirthField: React.FC<DateOfBirthFieldProps> = ({ form }) => {
  const convertToDate = (value: string | Date): Date | undefined => {
    if (!value) return undefined;
    
    if (value instanceof Date) {
      return isValid(value) ? value : undefined;
    }
    
    if (typeof value === 'string') {
      try {
        const parsed = parseISO(value);
        return isValid(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    }
    
    return undefined;
  };

  return (
    <FormField
      control={form.control}
      name="date_of_birth"
      render={({ field }) => {
        const dateValue = convertToDate(field.value);
        
        return (
          <FormItem className="flex flex-col">
            <FormLabel>Date de naissance *</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !dateValue && "text-muted-foreground"
                    )}
                  >
                    {dateValue ? (
                      format(dateValue, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionnez une date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => {
                    field.onChange(date);
                    
                    // Calculer l'âge automatiquement
                    if (date) {
                      const today = new Date();
                      const age = today.getFullYear() - date.getFullYear();
                      const monthDiff = today.getMonth() - date.getMonth();
                      
                      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                        form.setValue('age', age - 1);
                      } else {
                        form.setValue('age', age);
                      }
                    }
                  }}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default DateOfBirthField;
