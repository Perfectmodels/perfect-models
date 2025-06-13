
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ModelItem {
  id: number | string;
  name: string;
  image?: string;
  category?: string;
  experience?: string;
}

interface DetailedModelsGridProps {
  models: ModelItem[];
  title?: string;
  showAllInfo?: boolean;
}

const DetailedModelsGrid: React.FC<DetailedModelsGridProps> = ({ 
  models, 
  title = "Nos Mannequins",
  showAllInfo = true 
}) => {
  return (
    <section className="py-20 bg-model-white">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">{title}</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model) => (
            <div 
              key={model.id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64">
                <AspectRatio ratio={3/4} className="h-full">
                  <img
                    src={model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"}
                    alt={model.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </AspectRatio>
              </div>
              
              <div className="p-4">
                <h3 className="font-playfair text-xl font-semibold mb-3 text-center text-model-gold">
                  {model.name}
                </h3>
                
                {showAllInfo && (
                  <div className="space-y-2 text-sm">
                    {model.category && (
                      <div className="text-center">
                        <span className="font-medium text-gray-600">Catégorie: </span>
                        <span className="text-model-gold font-semibold">{model.category}</span>
                      </div>
                    )}
                    
                    {model.experience && (
                      <div className="text-center mb-3">
                        <span className="font-medium text-gray-600">Expérience: </span>
                        <span className="text-gray-800">{model.experience}</span>
                      </div>
                    )}

                    {/* Mensurations en format compact */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-2 text-center text-xs">MENSURATIONS</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-center">
                          <span className="text-gray-500">Taille</span>
                          <div className="font-medium">175 cm</div>
                        </div>
                        <div className="text-center">
                          <span className="text-gray-500">Pointure</span>
                          <div className="font-medium">40</div>
                        </div>
                        {model.category === 'Femme' && (
                          <>
                            <div className="text-center">
                              <span className="text-gray-500">Poitrine</span>
                              <div className="font-medium">88 cm</div>
                            </div>
                            <div className="text-center">
                              <span className="text-gray-500">Hanches</span>
                              <div className="font-medium">90 cm</div>
                            </div>
                          </>
                        )}
                        <div className="text-center col-span-2">
                          <span className="text-gray-500">Tour de taille</span>
                          <div className="font-medium">60 cm</div>
                        </div>
                      </div>
                    </div>

                    {/* Apparence */}
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <div className="grid grid-cols-2 gap-1 text-xs text-center">
                        <div>
                          <span className="text-gray-500">Yeux</span>
                          <div className="font-medium">Marron</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Cheveux</span>
                          <div className="font-medium">Noir</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-center text-xs text-model-gold font-medium">
                        Disponible pour castings et événements
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {models.length === 0 && (
            <div className="col-span-full text-center py-10">
              <p className="text-lg text-gray-500">Aucun mannequin disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DetailedModelsGrid;
