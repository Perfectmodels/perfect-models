
import React, { useState, useEffect } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { DetailedModel } from '@/types/modelTypes';

interface ModelImagesProps {
  model: DetailedModel;
}

const ModelImages = ({ model }: ModelImagesProps) => {
  const [selectedImage, setSelectedImage] = useState<string | undefined>();

  useEffect(() => {
    if (model && model.images.length > 0) {
      setSelectedImage(model.images[0]);
    }
  }, [model]);

  if (!model) return null;

  return (
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
  );
};

export default ModelImages;
