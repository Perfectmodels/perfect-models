import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CastingForm from '@/components/casting/CastingForm';
import SuccessDialog from '@/components/casting/SuccessDialog';

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
                Complétez le formulaire ci-dessous pour soumettre votre candidature via WhatsApp.
              </p>
            </div>

            <CastingForm onSuccess={handleFormSuccess} />

            <SuccessDialog
              open={showSuccessDialog}
              onOpenChange={setShowSuccessDialog}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Casting;
