
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DetailedModelsGrid from '@/components/models/DetailedModelsGrid';
import { useModels } from '@/hooks/useModels';
import { Skeleton } from '@/components/ui/skeleton';

const Models = () => {
  const { data: models, isLoading, isError } = useModels();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {isLoading ? (
          <div className="container mx-auto px-6 py-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[500px] w-full rounded-lg" />)}
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-red-500">Erreur lors du chargement des mannequins.</p>
          </div>
        ) : (
          <DetailedModelsGrid 
            models={models || []} 
            title="Nos Mannequins"
            showAllInfo={true}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Models;
