
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../../integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ModelApplication } from '@/types/modelTypes';
import { WhatsappIcon } from 'lucide-react';

interface CastingFormProps {
  onSuccess: () => void;
}

const CastingForm = ({ onSuccess }: CastingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelCategories, setModelCategories] = useState<{id: string, name: string}[]>([]);
  const [emailError, setEmailError] = useState(false);
  
  // Fetch model categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('model_categories')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error('Error fetching model categories:', error);
          return;
        }
        
        setModelCategories(data || []);
      } catch (err) {
        console.error('Error in fetchCategories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  const form = useForm<ModelApplication>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: '',
      category_id: '',
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
  
  const createWhatsAppLink = (data: ModelApplication) => {
    const message = encodeURIComponent(
      `Nouvelle candidature de mannequin:\n
Nom: ${data.first_name} ${data.last_name}\n
Email: ${data.email}\n
Téléphone: ${data.phone}\n
Genre: ${data.gender === 'women' ? 'Femme' : data.gender === 'men' ? 'Homme' : 'Enfant'}\n
Âge: ${data.age || 'Non spécifié'}\n
Taille: ${data.height}cm\n
Poids: ${data.weight || 'Non spécifié'}kg\n
Tour de poitrine: ${data.bust || 'Non spécifié'}cm\n
Tour de taille: ${data.waist || 'Non spécifié'}cm\n
Tour de hanches: ${data.hips || 'Non spécifié'}cm\n
Instagram: ${data.instagram_url || 'Non spécifié'}\n
Expérience: ${data.experience || 'Non spécifié'}`
    );
    
    return `https://wa.me/24107507950?text=${message}`;
  };

  const handleWhatsAppSubmit = (data: ModelApplication) => {
    const whatsappLink = createWhatsAppLink(data);
    window.open(whatsappLink, '_blank');
    toast.success('Redirection vers WhatsApp pour envoyer votre candidature');
    onSuccess();
    form.reset();
  };

  const onSubmit = async (data: ModelApplication) => {
    setIsSubmitting(true);
    setEmailError(false);
    
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
      
      // Send application details via email
      const { error: emailError } = await supabase.functions.invoke('send-application-pdf', {
        body: { application: formattedData }
      });
      
      if (emailError) {
        console.error('Error sending email:', emailError);
        setEmailError(true);
        toast.error('Problème avec l\'envoi de l\'email. Essayez via WhatsApp.');
      } else {
        toast.success('Votre candidature a été envoyée avec succès !');
        onSuccess();
        form.reset();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setEmailError(true);
      toast.error('Une erreur s\'est produite. Veuillez essayer via WhatsApp.');
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
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modelCategories.length === 0 && (
                      <SelectItem value="default" disabled>Chargement des catégories...</SelectItem>
                    )}
                    {modelCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="pt-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-model-gold hover:bg-model-gold/90 text-white" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Envoi en cours..." : "Soumettre ma candidature"}
          </Button>
          
          <Button 
            type="button" 
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
            onClick={() => handleWhatsAppSubmit(form.getValues())}
          >
            <WhatsappIcon className="mr-2 h-5 w-5" />
            Envoyer via WhatsApp
          </Button>
        </div>
        
        {emailError && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
            <p className="text-amber-700 text-sm">
              Problème avec l'envoi de l'email. Vous pouvez utiliser l'option WhatsApp pour envoyer votre candidature directement.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
};

export default CastingForm;
