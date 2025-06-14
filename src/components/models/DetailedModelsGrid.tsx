
import React from 'react';
import { Link } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { DetailedModel } from '@/types/modelTypes';

interface DetailedModelsGridProps {
  models: DetailedModel[];
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
            <Link 
              key={model.id} 
              to={`/model/${model.id}`}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="relative">
                <AspectRatio ratio={3/4} className="h-full">
                  <img
                    src={model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"}
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay avec dégradé et informations */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4">
                    {/* Nom du modèle */}
                    <div className="mb-4">
                      <h3 className="font-playfair text-xl font-bold text-center text-white mb-1">
                        {model.name}
                      </h3>
                      
                      {showAllInfo && model.category && (
                        <div className="text-center">
                          <span className="text-model-gold font-semibold text-sm uppercase tracking-wide">{model.category}</span>
                        </div>
                      )}
                    </div>
                    
                    {showAllInfo && (
                      <div className="space-y-3">
                        {model.experience && (
                          <div className="text-center mb-3">
                            <span className="text-white/90 text-sm">{model.experience}</span>
                          </div>
                        )}

                        {/* Mensurations principales */}
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                          <h4 className="font-semibold text-model-gold mb-3 text-center text-sm uppercase tracking-wider">Mensurations</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center">
                              <div className="text-gray-300 text-xs mb-1">Taille</div>
                              <div className="font-semibold text-white">{model.measurements?.height ? `${model.measurements.height} cm` : '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-300 text-xs mb-1">Pointure</div>
                              <div className="font-semibold text-white">{model.measurements?.shoe_size || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-300 text-xs mb-1">Poitrine</div>
                              <div className="font-semibold text-white">{model.measurements?.bust ? `${model.measurements.bust} cm` : '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-300 text-xs mb-1">Hanches</div>
                              <div className="font-semibold text-white">{model.measurements?.hips ? `${model.measurements.hips} cm` : '-'}</div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-white/20">
                            <div className="text-center">
                              <div className="text-gray-300 text-xs mb-1">Tour de taille</div>
                              <div className="font-semibold text-white">{model.measurements?.waist ? `${model.measurements.waist} cm` : '-'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Apparence */}
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-center">
                              <div className="text-gray-300 text-xs mb-1">Yeux</div>
                              <div className="font-medium text-white">{model.measurements?.eye_color || '-'}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-300 text-xs mb-1">Cheveux</div>
                              <div className="font-medium text-white">{model.measurements?.hair_color || '-'}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="text-center pt-2">
                          <span className="inline-block bg-model-gold/20 text-model-gold px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                            Disponible
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </AspectRatio>
              </div>
            </Link>
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
