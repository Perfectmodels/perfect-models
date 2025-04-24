
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface MeasurementsFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const MeasurementsFields = ({ form }: MeasurementsFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="age"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Âge</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="25"
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)} 
                  min="10"
                  max="50"
                  {...restField} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="height"
          rules={{ 
            required: "La taille est requise",
            min: {
              value: 50,
              message: "La taille doit être valide"
            },
            max: {
              value: 220,
              message: "La taille doit être valide"
            }
          }}
          render={({ field: { onChange, ...restField } }) => (
            <FormItem>
              <FormLabel>Taille (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="175" 
                  onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                  min="50" 
                  max="220"
                  {...restField} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="bust"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Tour de poitrine (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="85" 
                  value={value || ''} 
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                  min="60"
                  max="150" 
                  {...restField} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="waist"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Tour de taille (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="60" 
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                  min="40"
                  max="120"
                  {...restField} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hips"
          render={({ field: { onChange, value, ...restField } }) => (
            <FormItem>
              <FormLabel>Tour de hanches (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="90" 
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                  min="60"
                  max="150"
                  {...restField} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default MeasurementsFields;
