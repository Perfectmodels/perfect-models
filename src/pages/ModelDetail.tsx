import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Instagram, Ruler } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { DetailedModel, Collaboration, ModelShowcase } from '@/types/modelTypes';

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
  const location = useLocation();
  const navigate = useNavigate();
  const { model } = location.state || {};
  
  const showcases: ModelShowcase[] = [
    { 
      id: '1', 
      title: 'CLOFAS 241 2024', 
      date: 'Mars 2024', 
      location: 'Libreville, Gabon', 
      images: ['https://i.ibb.co/BV1HFbft/MG-0695.jpg'] 
    },
    { 
      id: '2', 
      title: 'Fashion Week Gabonaise', 
      date: 'Décembre 2023', 
      location: 'Libreville, Gabon', 
      images: ['https://i.ibb.co/yc1fYcqB/DSC-0261.jpg'] 
    },
    { 
      id: '3', 
      title: 'K\'elle Pour Elle', 
      date: 'Octobre 2023', 
      location: 'Libreville, Gabon', 
      images: ['https://i.ibb.co/78q5My4/PMM0161.jpg'] 
    }
  ];
  
  const collaborations: Collaboration[] = [
    { 
      id: '1', 
      title: 'Campagne Azur Gabon', 
      description: 'Campagne publicitaire pour la marque de cosmétiques Azur', 
      date: 'Février 2024', 
      image: 'https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg' 
    },
    { 
      id: '2', 
      title: 'Magazine Elle Afrique', 
      description: 'Shooting photo pour le magazine Elle Afrique', 
      date: 'Janvier 2024', 
      image: 'https://i.ibb.co/7thKmdTt/DSC-0445.jpg' 
    }
  ];

  if (!model) {
    navigate(-1);
    return null;
  }

  const detailedModel: DetailedModel = {
    id: model.id,
    name: model.name,
    first_name: model.first_name || model.name.split(' ')[0] || '',
    last_name: model.last_name || model.name.split(' ').slice(1).join(' ') || '',
    image: model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir",
    images: [model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"],
    gender: model.gender,
    category: model.category,
    category_id: model.category_id,
    measurements: {
      height: 175,
      bust: model.gender === 'women' ? 88 : undefined,
      waist: 60,
      hips: model.gender === 'women' ? 90 : undefined,
      shoe_size: 40,
      eye_color: 'blue',
      hair_color: 'brown',
    },
    instagram_url: model.instagram_url,
  };

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
            <div className="lg:col-span-1">
              <div className="overflow-hidden h-[600px] w-full bg-gray-100 rounded-lg">
                <AspectRatio ratio={3/4} className="h-full">
                  <img
                    src={detailedModel.images[0]}
                    alt={`${detailedModel.first_name} ${detailedModel.last_name}`}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl mb-2">{detailedModel.first_name} {detailedModel.last_name}</h1>
                
                {detailedModel.instagram_url && (
                  <a 
                    href={detailedModel.instagram_url} 
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
                  {detailedModel.measurements.height && (
                    <div>
                      <p className="text-sm text-gray-500">Taille</p>
                      <p className="font-medium">{detailedModel.measurements.height} cm</p>
                    </div>
                  )}
                  
                  {detailedModel.measurements.bust && (
                    <div>
                      <p className="text-sm text-gray-500">Poitrine</p>
                      <p className="font-medium">{detailedModel.measurements.bust} cm</p>
                    </div>
                  )}
                  
                  {detailedModel.measurements.waist && (
                    <div>
                      <p className="text-sm text-gray-500">Tour de taille</p>
                      <p className="font-medium">{detailedModel.measurements.waist} cm</p>
                    </div>
                  )}
                  
                  {detailedModel.measurements.hips && (
                    <div>
                      <p className="text-sm text-gray-500">Tour de hanches</p>
                      <p className="font-medium">{detailedModel.measurements.hips} cm</p>
                    </div>
                  )}

                  {detailedModel.measurements.shoe_size && (
                    <div>
                      <p className="text-sm text-gray-500">Pointure</p>
                      <p className="font-medium">{detailedModel.measurements.shoe_size}</p>
                    </div>
                  )}

                  {detailedModel.measurements.eye_color && (
                    <div>
                      <p className="text-sm text-gray-500">Couleur des yeux</p>
                      <p className="font-medium">{detailedModel.measurements.eye_color}</p>
                    </div>
                  )}

                  {detailedModel.measurements.hair_color && (
                    <div>
                      <p className="text-sm text-gray-500">Couleur des cheveux</p>
                      <p className="font-medium">{detailedModel.measurements.hair_color}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {showcases && showcases.length > 0 && (
                <div>
                  <h2 className="text-2xl font-playfair mb-4">Défilés</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showcases.map((showcase) => (
                      <ShowcaseCard key={showcase.id} showcase={showcase} />
                    ))}
                  </div>
                </div>
              )}

              {collaborations && collaborations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-playfair mb-4">Collaborations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collaborations.map((collaboration) => (
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
