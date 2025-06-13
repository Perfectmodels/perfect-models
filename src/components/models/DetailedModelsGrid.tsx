
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
              <div className="relative h-96">
                <AspectRatio ratio={3/4} className="h-full">
                  <img
                    src={model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"}
                    alt={model.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay avec dégradé et informations */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                    {/* Nom du modèle */}
                    <h3 className="font-playfair text-xl font-semibold mb-3 text-center text-white">
                      {model.name}
                    </h3>
                    
                    {showAllInfo && (
                      <div className="space-y-2 text-white">
                        {model.category && (
                          <div className="text-center mb-2">
                            <span className="text-model-gold font-semibold text-sm">{model.category}</span>
                          </div>
                        )}
                        
                        {model.experience && (
                          <div className="text-center mb-3">
                            <span className="text-xs opacity-90">{model.experience}</span>
                          </div>
                        )}

                        {/* Mensurations en format compact */}
                        <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                          <h4 className="font-medium text-model-gold mb-2 text-center text-xs">MENSURATIONS</h4>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div className="text-center">
                              <span className="text-gray-300">Taille</span>
                              <div className="font-medium text-white">175 cm</div>
                            </div>
                            <div className="text-center">
                              <span className="text-gray-300">Pointure</span>
                              <div className="font-medium text-white">40</div>
                            </div>
                            {model.category === 'Femme' && (
                              <>
                                <div className="text-center">
                                  <span className="text-gray-300">Poitrine</span>
                                  <div className="font-medium text-white">88 cm</div>
                                </div>
                                <div className="text-center">
                                  <span className="text-gray-300">Hanches</span>
                                  <div className="font-medium text-white">90 cm</div>
                                </div>
                              </>
                            )}
                            <div className="text-center col-span-2">
                              <span className="text-gray-300">Tour de taille</span>
                              <div className="font-medium text-white">60 cm</div>
                            </div>
                          </div>
                        </div>

                        {/* Apparence */}
                        <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg">
                          <div className="grid grid-cols-2 gap-1 text-xs text-center">
                            <div>
                              <span className="text-gray-300">Yeux</span>
                              <div className="font-medium text-white">Marron</div>
                            </div>
                            <div>
                              <span className="text-gray-300">Cheveux</span>
                              <div className="font-medium text-white">Noir</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <p className="text-center text-xs text-model-gold font-medium">
                            Disponible pour castings
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </AspectRatio>
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
