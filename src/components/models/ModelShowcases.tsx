
import { ModelShowcase } from '@/types/modelTypes';
import ShowcaseCard from './ShowcaseCard';

interface ModelShowcasesProps {
  showcases: ModelShowcase[];
}

const ModelShowcases = ({ showcases }: ModelShowcasesProps) => {
  if (!showcases || showcases.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-playfair mb-4">Défilés</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showcases.map((showcase) => (
          <ShowcaseCard key={showcase.id} showcase={showcase} />
        ))}
      </div>
    </div>
  );
};

export default ModelShowcases;
