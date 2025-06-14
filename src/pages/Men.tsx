
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';
import { detailedModels } from '@/data/modelDetails';

const maleModels = detailedModels.filter(model => model.gender === 'men');

const Men = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-6">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Nos Modèles Hommes</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>

          {/* Liste des mannequins */}
          <ModelsList models={maleModels} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Men;
