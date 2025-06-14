
import { Collaboration } from '@/types/modelTypes';
import CollaborationCard from './CollaborationCard';

interface ModelCollaborationsProps {
  collaborations: Collaboration[];
}

const ModelCollaborations = ({ collaborations }: ModelCollaborationsProps) => {
  if (!collaborations || collaborations.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-playfair mb-4">Collaborations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collaborations.map((collaboration) => (
          <CollaborationCard key={collaboration.id} collaboration={collaboration} />
        ))}
      </div>
    </div>
  );
};

export default ModelCollaborations;
