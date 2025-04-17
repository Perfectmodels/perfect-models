
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
          alt={collaboration.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </AspectRatio>
    </div>
    <CardContent className="p-4">
      <h4 className="font-medium text-lg">{collaboration.name}</h4>
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
          src={showcase.image || "https://via.placeholder.com/400x225?text=Défilé"}
          alt={showcase.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </AspectRatio>
    </div>
    <CardContent className="p-4">
      <h4 className="font-medium text-lg">{showcase.name}</h4>
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
  
  // Données fictives des défilés (en production, cela viendrait d'une API)
  const showcases: ModelShowcase[] = [
    { id: '1', name: 'CLOFAS 241 2024', date: 'Mars 2024', location: 'Libreville, Gabon', image: 'https://i.ibb.co/BV1HFbft/MG-0695.jpg' },
    { id: '2', name: 'Fashion Week Gabonaise', date: 'Décembre 2023', location: 'Libreville, Gabon', image: 'https://i.ibb.co/yc1fYcqB/DSC-0261.jpg' },
    { id: '3', name: 'K\'elle Pour Elle', date: 'Octobre 2023', location: 'Libreville, Gabon', image: 'https://i.ibb.co/78q5My4/PMM0161.jpg' }
  ];
  
  // Données fictives des collaborations (en production, cela viendrait d'une API)
  const collaborations: Collaboration[] = [
    { id: '1', name: 'Campagne Azur Gabon', description: 'Campagne publicitaire pour la marque de cosmétiques Azur', date: 'Février 2024', image: 'https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg' },
    { id: '2', name: 'Magazine Elle Afrique', description: 'Shooting photo pour le magazine Elle Afrique', date: 'Janvier 2024', image: 'https://i.ibb.co/7thKmdTt/DSC-0445.jpg' }
  ];

  // Si nous n'avons pas les informations du modèle, nous revenons à la page précédente
  if (!model) {
    navigate(-1);
    return null;
  }

  // Complétez les informations détaillées du modèle avec les données fictives
  const detailedModel: DetailedModel = {
    ...model,
    height: 175,
    bust: model.gender === 'female' ? 88 : undefined,
    waist: 60,
    hips: model.gender === 'female' ? 90 : undefined,
    shoeSize: 39,
    hairColor: 'Noir',
    eyeColor: 'Brun',
    nationality: 'Gabonaise',
    biography: 'Mannequin professionnelle depuis 2020, spécialisée dans le défilé et les shootings de mode.',
    instagram: model.instagram_url || 'https://instagram.com',
    collaborations: collaborations,
    showcases: showcases,
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
            {/* Image du modèle */}
            <div className="lg:col-span-1">
              <div className="overflow-hidden h-[600px] w-full bg-gray-100 rounded-lg">
                <AspectRatio ratio={3/4} className="h-full">
                  <img
                    src={detailedModel.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"}
                    alt={detailedModel.name}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            </div>

            {/* Informations du modèle */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl mb-2">{detailedModel.name}</h1>
                {detailedModel.category && (
                  <p className="text-model-gold text-xl">{detailedModel.category}</p>
                )}
                
                {detailedModel.biography && (
                  <div className="mt-4">
                    <p className="text-gray-600">{detailedModel.biography}</p>
                  </div>
                )}

                {detailedModel.instagram && (
                  <a 
                    href={detailedModel.instagram} 
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

              {/* Mensurations */}
              <div>
                <div className="flex items-center mb-4">
                  <Ruler className="mr-2 text-model-gold" />
                  <h2 className="text-2xl font-playfair">Mensurations</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {detailedModel.height && (
                    <div>
                      <p className="text-sm text-gray-500">Taille</p>
                      <p className="font-medium">{detailedModel.height} cm</p>
                    </div>
                  )}
                  
                  {detailedModel.bust && (
                    <div>
                      <p className="text-sm text-gray-500">Poitrine</p>
                      <p className="font-medium">{detailedModel.bust} cm</p>
                    </div>
                  )}
                  
                  {detailedModel.waist && (
                    <div>
                      <p className="text-sm text-gray-500">Tour de taille</p>
                      <p className="font-medium">{detailedModel.waist} cm</p>
                    </div>
                  )}
                  
                  {detailedModel.hips && (
                    <div>
                      <p className="text-sm text-gray-500">Tour de hanches</p>
                      <p className="font-medium">{detailedModel.hips} cm</p>
                    </div>
                  )}
                  
                  {detailedModel.shoeSize && (
                    <div>
                      <p className="text-sm text-gray-500">Pointure</p>
                      <p className="font-medium">{detailedModel.shoeSize}</p>
                    </div>
                  )}
                  
                  {detailedModel.hairColor && (
                    <div>
                      <p className="text-sm text-gray-500">Couleur de cheveux</p>
                      <p className="font-medium">{detailedModel.hairColor}</p>
                    </div>
                  )}
                  
                  {detailedModel.eyeColor && (
                    <div>
                      <p className="text-sm text-gray-500">Couleur des yeux</p>
                      <p className="font-medium">{detailedModel.eyeColor}</p>
                    </div>
                  )}
                  
                  {detailedModel.nationality && (
                    <div>
                      <p className="text-sm text-gray-500">Nationalité</p>
                      <p className="font-medium">{detailedModel.nationality}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Défilés */}
              {detailedModel.showcases && detailedModel.showcases.length > 0 && (
                <div>
                  <h2 className="text-2xl font-playfair mb-4">Défilés</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailedModel.showcases.map((showcase) => (
                      <ShowcaseCard key={showcase.id} showcase={showcase} />
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Collaborations */}
              {detailedModel.collaborations && detailedModel.collaborations.length > 0 && (
                <div>
                  <h2 className="text-2xl font-playfair mb-4">Collaborations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailedModel.collaborations.map((collaboration) => (
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
