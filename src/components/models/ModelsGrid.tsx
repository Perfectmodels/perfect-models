
import React from 'react';
import { Link } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ModelItem {
  id: number | string;
  name: string;
  image?: string;
  category?: string;
  experience?: string;
}

interface ModelsGridProps {
  models: ModelItem[];
}

const ModelsGrid: React.FC<ModelsGridProps> = ({ models }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {models.map((model) => (
        <Link 
          key={model.id} 
          to={`/model/${model.id}`} 
          state={{ model }}
          className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="relative h-80">
            <AspectRatio ratio={3/4} className="h-full">
              <img
                src={model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"}
                alt={model.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </AspectRatio>
          </div>
          
          <div className="p-4">
            <h3 className="font-playfair text-xl font-semibold mb-3 text-center group-hover:text-model-gold transition-colors duration-300">
              {model.name}
            </h3>
            
            <div className="space-y-3 text-sm">
              {model.category && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Catégorie:</span>
                  <span className="text-model-gold">{model.category}</span>
                </div>
              )}
              
              {model.experience && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Expérience:</span>
                  <span className="text-gray-800">{model.experience}</span>
                </div>
              )}

              {/* Mensurations fictives pour l'affichage */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2 text-center">Mensurations</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Taille:</span>
                    <span className="font-medium">175 cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pointure:</span>
                    <span className="font-medium">40</span>
                  </div>
                  {model.category === 'Femme' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Poitrine:</span>
                        <span className="font-medium">88 cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Hanches:</span>
                        <span className="font-medium">90 cm</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-500">Tour de taille:</span>
                    <span className="font-medium">60 cm</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                  Cliquez pour plus de détails
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
      
      {models.length === 0 && (
        <div className="col-span-full text-center py-10">
          <p className="text-lg text-gray-500">Aucun mannequin disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default ModelsGrid;
