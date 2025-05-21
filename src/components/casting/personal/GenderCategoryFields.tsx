
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModelApplication } from "@/types/modelTypes";
import { UseFormReturn } from "react-hook-form";
import { getModelCategoriesByGroup } from "@/constants/modelCategories";

interface GenderCategoryFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const GenderCategoryFields = ({ form }: GenderCategoryFieldsProps) => {
  const groupedCategories = getModelCategoriesByGroup();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="gender"
        rules={{ required: "Le genre est requis" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Genre</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} required>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre genre" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">Homme</SelectItem>
                <SelectItem value="female">Femme</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category_id"
        rules={{ required: "La catégorie est requise" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catégorie</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} required>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px]">
                {Object.entries(groupedCategories).map(([group, categories]) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default GenderCategoryFields;
