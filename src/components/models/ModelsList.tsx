
import React from 'react';
import { Link } from 'react-router-dom';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ModelItem {
  id: number | string;
  name: string;
  image?: string;
  category?: string;
}

interface ModelsListProps {
  models: ModelItem[];
}

const ModelsList: React.FC<ModelsListProps> = ({ models }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {models.map((model) => (
        <div key={model.id} className="group">
          <div className="overflow-hidden h-[400px] w-full">
            <AspectRatio ratio={3/4} className="h-full">
              <img
                src={model.image || "https://via.placeholder.com/400x600?text=Photo+à+venir"}
                alt={model.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </AspectRatio>
          </div>
          <div className="mt-4 text-center">
            <h3 className="font-playfair text-xl group-hover:text-model-gold transition-colors duration-300">
              {model.name}
            </h3>
            {model.category && (
              <p className="text-medium-gray text-sm mt-1">{model.category}</p>
            )}
          </div>
        </div>
      ))}
      {models.length === 0 && (
        <div className="col-span-full text-center py-10">
          <p className="text-lg text-gray-500">Aucun modèle disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default ModelsList;
