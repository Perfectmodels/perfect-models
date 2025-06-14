
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { detailedModels } from '@/data/modelDetails';
import NotFound from './NotFound';
import ModelImages from '@/components/models/ModelImages';
import ModelHeader from '@/components/models/ModelHeader';
import ModelMeasurements from '@/components/models/ModelMeasurements';
import ModelShowcases from '@/components/models/ModelShowcases';
import ModelCollaborations from '@/components/models/ModelCollaborations';

const ModelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const model = detailedModels.find(m => m.id === id);
  
  if (!model) {
    return <NotFound />;
  }

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-6">
          <Button 
            variant="ghost" 
            onClick={goBack} 
            className="mb-6 hover:bg-transparent p-0 flex items-center text-model-gold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ModelImages model={model} />

            <div className="lg:col-span-2 space-y-8">
              <ModelHeader model={model} />
              <Separator />
              <ModelMeasurements model={model} />
              
              {model.showcases && model.showcases.length > 0 && <Separator />}
              <ModelShowcases showcases={model.showcases || []} />
              
              {model.collaborations && model.collaborations.length > 0 && !(model.showcases && model.showcases.length > 0) && <Separator />}
              <ModelCollaborations collaborations={model.collaborations || []} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModelDetail;
