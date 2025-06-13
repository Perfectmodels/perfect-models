
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DetailedModelsGrid from '@/components/models/DetailedModelsGrid';
import { availableModels } from '@/data/availableModels';

const Models = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <DetailedModelsGrid 
          models={availableModels} 
          title="Nos Mannequins"
          showAllInfo={true}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Models;
