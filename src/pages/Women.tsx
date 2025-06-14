
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';
import { useModels } from '@/hooks/useModels';
import { Skeleton } from '@/components/ui/skeleton';

const Women = () => {
  const { data: models, isLoading, isError } = useModels();
  
  const femaleModels = models?.filter(model => model.gender === 'women');

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-6">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Nos Modèles Femmes</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[400px] w-full rounded-lg" />)}
            </div>
          ) : isError ? (
            <div className="text-center py-10">
              <p className="text-red-500">Erreur lors du chargement des modèles.</p>
            </div>
          ) : (
            <ModelsList models={femaleModels || []} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Women;
