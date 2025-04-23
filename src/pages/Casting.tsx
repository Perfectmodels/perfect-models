import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CastingForm from '@/components/casting/CastingForm';
import SuccessDialog from '@/components/casting/SuccessDialog';

const modelCategories = [
  { id: "1", name: "Mannequin de défilé / Runway model" },
  { id: "2", name: "Mannequin photo / Fashion model" },
  { id: "3", name: "Mannequin commercial / Commercial model" },
  { id: "4", name: "Mannequin lingerie & maillot / Lingerie & swimsuit model" },
  { id: "5", name: "Mannequin showroom" },
  { id: "6", name: "Mannequin artistique / Art model" },
  { id: "7", name: "Mannequin de détails / Parts model" },
  { id: "8", name: "Mannequin publicitaire / Advertising model" },
  { id: "9", name: "Mannequin haute couture" },
  { id: "10", name: "Mannequin petite taille / Petite model" },
  { id: "11", name: "Mannequin grande taille / Plus-size model" },
  { id: "12", name: "Mannequin fitness / Fitness model" },
  { id: "13", name: "Mannequin senior / Mature model" },
  { id: "14", name: "Mannequin enfant / Child model" },
  { id: "15", name: "Mannequin adolescent / Teen model" },
  { id: "16", name: "Mannequin influenceur" },
  { id: "17", name: "Mannequin alternatif / Alternative model" },
  { id: "18", name: "Mannequin ethnique / Ethnic model" },
  { id: "19", name: "Mannequin androgynes" },
]

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

            <CastingForm onSuccess={handleFormSuccess} modelCategories={modelCategories} />

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
