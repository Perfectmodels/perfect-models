
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsGrid from '@/components/models/ModelsGrid';
import { availableModels } from '@/data/availableModels';

const Models = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-6 pb-16">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Nos Mannequins</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>

          <div className="text-center mb-12">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les mannequins qui font partie de notre agence et qui participent régulièrement à nos événements de mode.
            </p>
          </div>
          
          <ModelsGrid models={availableModels} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Models;
