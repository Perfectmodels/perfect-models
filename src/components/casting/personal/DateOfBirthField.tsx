
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { fr } from 'date-fns/locale';
import { ModelApplication } from "@/types/modelTypes";
import { UseFormReturn } from "react-hook-form";

interface DateOfBirthFieldProps {
  form: UseFormReturn<ModelApplication>;
}

const DateOfBirthField = ({ form }: DateOfBirthFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="date_of_birth"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Date de naissance</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(typeof field.value === 'string' ? new Date(field.value) : field.value, "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionnez votre date de naissance</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={typeof field.value === 'string' ? new Date(field.value) : field.value}
                onSelect={field.onChange}
                disabled={(date) => 
                  date > new Date() || 
                  date < new Date(new Date().setFullYear(new Date().getFullYear() - 100))
                }
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateOfBirthField;
