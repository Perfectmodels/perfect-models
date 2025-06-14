
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Collaboration } from '@/types/modelTypes';

const CollaborationCard = ({ collaboration }: { collaboration: Collaboration }) => (
  <Card className="overflow-hidden group">
    <div className="h-40 overflow-hidden">
      <AspectRatio ratio={16/9}>
        <img
          src={collaboration.image || "https://via.placeholder.com/400x225?text=Collaboration"}
          alt={collaboration.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </AspectRatio>
    </div>
    <CardContent className="p-4">
      <h4 className="font-medium text-lg">{collaboration.title}</h4>
      {collaboration.date && <p className="text-sm text-muted-foreground">{collaboration.date}</p>}
      {collaboration.description && <p className="text-sm mt-2">{collaboration.description}</p>}
    </CardContent>
  </Card>
);

export default CollaborationCard;
