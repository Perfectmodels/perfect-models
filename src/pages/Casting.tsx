
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '../integrations/supabase/client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModelApplication } from '@/types/modelTypes';

const Casting = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const form = useForm<ModelApplication>({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: '',
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
      const { error } = await supabase.from('applications').insert([data]);
      
      if (error) {
        toast.error('Erreur lors de l\'envoi de votre candidature.');
        console.error('Error submitting application:', error);
      } else {
        setShowSuccessDialog(true);
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-6 pb-16">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Casting</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-center mb-10">
              Vous souhaitez rejoindre notre agence ? Remplissez le formulaire ci-dessous et notre équipe vous recontactera dans les plus brefs délais.
            </p>

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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Candidature envoyée !</DialogTitle>
                  <DialogDescription>
                    Merci pour votre candidature. Notre équipe l'examinera et vous contactera dans les plus brefs délais.
                  </DialogDescription>
                </DialogHeader>
                <Button 
                  onClick={() => setShowSuccessDialog(false)}
                  className="bg-model-gold hover:bg-model-gold/90 text-white"
                >
                  Fermer
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Casting;
