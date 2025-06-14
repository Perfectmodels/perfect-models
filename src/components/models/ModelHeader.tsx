
import { Instagram } from 'lucide-react';
import { DetailedModel } from '@/types/modelTypes';

interface ModelHeaderProps {
  model: DetailedModel;
}

const ModelHeader = ({ model }: ModelHeaderProps) => {
  return (
    <div>
      <h1 className="font-playfair text-4xl md:text-5xl mb-2">{model.first_name} {model.last_name || ''}</h1>
      
      {model.instagram_url && (
        <a 
          href={model.instagram_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center text-model-gold hover:text-gray-800 transition-colors"
        >
          <Instagram className="mr-2 h-5 w-5" />
          Instagram
        </a>
      )}
    </div>
  );
};

export default ModelHeader;
