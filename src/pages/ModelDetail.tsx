import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Instagram, Ruler } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Collaboration, ModelShowcase } from '@/types/modelTypes';
import { detailedModels } from '@/data/modelDetails';
import NotFound from './NotFound';

const CollaborationCard = ({ collaboration }: { collaboration: Collaboration }) => (
  <Card className="overflow-hidden group">
    <div className="h-40 overflow-hidden">
      <AspectRatio ratio={16/9}>
        <img
          src={collaboration.image || "https://via.placeholder.com/400x225?text=Collaboration"}
          alt={collaboration.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </AspectRatio>
    </div>
    <CardContent className="p-4">
      <h4 className="font-medium text-lg">{collaboration.title}</h4>
      {collaboration.date && <p className="text-sm text-muted-foreground">{collaboration.date}</p>}
      {collaboration.description && <p className="text-sm mt-2">{collaboration.description}</p>}
    </CardContent>
  </Card>
);

const ShowcaseCard = ({ showcase }: { showcase: ModelShowcase }) => (
  <Card className="overflow-hidden group">
    <div className="h-40 overflow-hidden">
      <AspectRatio ratio={16/9}>
        <img
          src={showcase.images[0] || "https://via.placeholder.com/400x225?text=Défilé"}
          alt={showcase.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </AspectRatio>
    </div>
    <CardContent className="p-4">
      <h4 className="font-medium text-lg">{showcase.title}</h4>
      <div className="flex flex-col gap-1 mt-1">
        {showcase.date && <p className="text-sm text-muted-foreground">{showcase.date}</p>}
        {showcase.location && <p className="text-sm text-muted-foreground">{showcase.location}</p>}
      </div>
    </CardContent>
  </Card>
);

const ModelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<string | undefined>();

  const model = detailedModels.find(m => m.id === id);

  useEffect(() => {
    if (model) {
      setSelectedImage(model.images[0]);
    }
  }, [model]);
  
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
            <div className="lg:col-span-1 space-y-4">
              <div className="overflow-hidden h-[600px] w-full bg-gray-100 rounded-lg shadow-lg">
                <AspectRatio ratio={3/4} className="h-full">
                  <img
                    src={selectedImage}
                    alt={`${model.first_name} ${model.last_name}`}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                </AspectRatio>
              </div>
              
              {/* Image thumbnails */}
              {model.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {model.images.map((img, index) => (
                    <div 
                      key={index} 
                      className={`cursor-pointer rounded-md overflow-hidden border-2 ${selectedImage === img ? 'border-model-gold' : 'border-transparent'} hover:border-model-gold/50 transition-all`}
                      onClick={() => setSelectedImage(img)}
                    >
                      <AspectRatio ratio={1}>
                        <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </AspectRatio>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl mb-2">{model.first_name} {model.last_name}</h1>
                
                {model.instagram_url && (
                  <a 
                    href={model.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-model-gold hover:text-gray-800 transition-colors"
                  >
                    <Instagram className="mr-2 h-5 w-5" />
                    Instagram
                  </a>
                )}
              </div>

              <Separator />

              <div>
                <div className="flex items-center mb-4">
                  <Ruler className="mr-2 text-model-gold" />
                  <h2 className="text-2xl font-playfair">Mensurations</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {model.measurements.height && (
                    <div>
                      <p className="text-sm text-gray-500">Taille</p>
                      <p className="font-medium">{model.measurements.height} cm</p>
                    </div>
                  )}
                  
                  {model.measurements.bust && (
                    <div>
                      <p className="text-sm text-gray-500">Poitrine</p>
                      <p className="font-medium">{model.measurements.bust} cm</p>
                    </div>
                  )}
                  
                  {model.measurements.waist && (
                    <div>
                      <p className="text-sm text-gray-500">Tour de taille</p>
                      <p className="font-medium">{model.measurements.waist} cm</p>
                    </div>
                  )}
                  
                  {model.measurements.hips && (
                    <div>
                      <p className="text-sm text-gray-500">Tour de hanches</p>
                      <p className="font-medium">{model.measurements.hips} cm</p>
                    </div>
                  )}

                  {model.measurements.shoe_size && (
                    <div>
                      <p className="text-sm text-gray-500">Pointure</p>
                      <p className="font-medium">{model.measurements.shoe_size}</p>
                    </div>
                  )}

                  {model.measurements.eye_color && (
                    <div>
                      <p className="text-sm text-gray-500">Couleur des yeux</p>
                      <p className="font-medium">{model.measurements.eye_color}</p>
                    </div>
                  )}

                  {model.measurements.hair_color && (
                    <div>
                      <p className="text-sm text-gray-500">Couleur des cheveux</p>
                      <p className="font-medium">{model.measurements.hair_color}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {model.showcases && model.showcases.length > 0 && (
                <div>
                  <h2 className="text-2xl font-playfair mb-4">Défilés</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {model.showcases.map((showcase) => (
                      <ShowcaseCard key={showcase.id} showcase={showcase} />
                    ))}
                  </div>
                </div>
              )}

              {model.collaborations && model.collaborations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-playfair mb-4">Collaborations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {model.collaborations.map((collaboration) => (
                      <CollaborationCard key={collaboration.id} collaboration={collaboration} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ModelDetail;
