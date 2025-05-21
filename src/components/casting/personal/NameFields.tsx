
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ModelApplication } from "@/types/modelTypes";
import { UseFormReturn } from "react-hook-form";

interface NameFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const NameFields = ({ form }: NameFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="first_name"
        rules={{ required: "Le prénom est requis" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prénom</FormLabel>
            <FormControl>
              <Input {...field} maxLength={50} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="last_name"
        rules={{ required: "Le nom est requis" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input {...field} maxLength={50} required />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default NameFields;
