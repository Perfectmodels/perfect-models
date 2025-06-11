
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CastingForm from '@/components/casting/CastingForm';
import SuccessDialog from '@/components/casting/SuccessDialog';
import ModelsList from '@/components/models/ModelsList';
import { availableModels } from '@/data/availableModels';

const Casting = () => {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleFormSuccess = () => {
    setShowSuccessDialog(true);
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
              Vous souhaitez rejoindre notre agence ? Remplissez le formulaire ci-dessous et envoyez votre candidature directement via WhatsApp.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-8">
              <p className="text-green-800 font-medium">
                Complétez tous les champs obligatoires du formulaire ci-dessous pour soumettre votre candidature via WhatsApp. 
                N'oubliez pas de mentionner les événements auxquels vous avez déjà participé.
              </p>
            </div>

            <CastingForm onSuccess={handleFormSuccess} />

            <SuccessDialog
              open={showSuccessDialog}
              onOpenChange={setShowSuccessDialog}
            />
          </div>

          {/* Section des mannequins existants */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl mb-4">Nos Mannequins</h2>
              <div className="w-20 h-0.5 bg-model-gold mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Découvrez les mannequins qui font partie de notre agence et qui participent régulièrement à nos événements de mode.
              </p>
            </div>
            
            <ModelsList models={availableModels} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Casting;
