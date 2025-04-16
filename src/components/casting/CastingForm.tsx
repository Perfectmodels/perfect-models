
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ModelApplication } from '@/types/modelTypes';

interface CastingFormProps {
  onSuccess: () => void;
}

const CastingForm = ({ onSuccess }: CastingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ModelApplication>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: '',
      age: null,
      weight: null,
      height: 0,
      bust: null,
      waist: null,
      hips: null,
      experience: '',
      instagram_url: '',
    },
  });

  const onSubmit = async (data: ModelApplication) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting data:', data);
      
      // S'assurer que les champs numériques sont bien des nombres
      const formattedData = {
        ...data,
        height: Number(data.height) || 0,
        age: data.age ? Number(data.age) : null,
        weight: data.weight ? Number(data.weight) : null,
        bust: data.bust ? Number(data.bust) : null,
        waist: data.waist ? Number(data.waist) : null,
        hips: data.hips ? Number(data.hips) : null,
      };
      
      // Insert data into Supabase
      const { error } = await supabase.from('applications').insert([formattedData]);
      
      if (error) {
        toast.error('Erreur lors de l\'envoi de votre candidature.');
        console.error('Error submitting application:', error);
        return;
      }
      
      // Send data as PDF via email function
      const { error: emailError } = await supabase.functions.invoke('send-application-pdf', {
        body: { application: formattedData }
      });
      
      if (emailError) {
        toast.error('Erreur lors de l\'envoi de l\'email.');
        console.error('Error sending email:', emailError);
      } else {
        toast.success('Votre candidature a été envoyée avec succès !');
        onSuccess();
        form.reset();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            rules={{ required: "Le prénom est requis" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Votre prénom" {...field} />
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
                  <Input placeholder="Votre nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            rules={{ 
              required: "L'email est requis",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Adresse email invalide"
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="votre@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            rules={{ required: "Le téléphone est requis" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+33 6 12 34 56 78" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="gender"
            rules={{ required: "Le genre est requis" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="women">Femme</SelectItem>
                    <SelectItem value="men">Homme</SelectItem>
                    <SelectItem value="children">Enfant</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            rules={{ 
              min: {
                value: 1,
                message: "L'âge doit être valide"
              }
            }}
            render={({ field: { onChange, value, ...restField } }) => (
              <FormItem>
                <FormLabel>Âge</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="25"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)} 
                    {...restField} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="height"
            rules={{ 
              required: "La taille est requise",
              min: {
                value: 50,
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
                    {...restField} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight"
            render={({ field: { onChange, value, ...restField } }) => (
              <FormItem>
                <FormLabel>Poids (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="60" 
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)} 
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
                    {...restField} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instagram_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="@votre_instagram" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-model-gold hover:bg-model-gold/90 text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Soumettre ma candidature"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CastingForm;
