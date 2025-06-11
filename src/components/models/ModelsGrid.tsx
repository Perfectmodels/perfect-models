
import React from 'react';
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
        <div key={model.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="relative h-80">
            <AspectRatio ratio={3/4} className="h-full">
              <img
                src={model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"}
                alt={model.name}
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
          
          <div className="p-4">
            <h3 className="font-playfair text-xl font-semibold mb-2 text-center">
              {model.name}
            </h3>
            
            <div className="space-y-2 text-sm">
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
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                  Contactez-nous pour plus de détails
                </p>
              </div>
            </div>
          </div>
        </div>
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
