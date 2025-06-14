
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {models.map((model) => (
        <Link 
          key={model.id} 
          to={`/model/${model.id}`} 
          state={{ model }}
          className="group relative block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <AspectRatio ratio={3/4}>
            <img
              src={model.image || "https://via.placeholder.com/400x600?text=Photo"}
              alt={model.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </AspectRatio>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
            <div className="p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
              <h3 className="font-playfair text-xl text-white font-semibold">
                {model.name}
              </h3>
            </div>
          </div>
        </Link>
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
