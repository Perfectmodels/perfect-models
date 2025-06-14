
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ModelShowcase } from '@/types/modelTypes';

const ShowcaseCard = ({ showcase }: { showcase: ModelShowcase }) => (
  <Card className="overflow-hidden group">
    <div className="h-40 overflow-hidden">
      <AspectRatio ratio={16/9}>
        <img
          src={showcase.images[0] || "https://via.placeholder.com/400x225?text=Défilé"}
          alt={showcase.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </AspectRatio>
    </div>
    <CardContent className="p-4">
      <h4 className="font-medium text-lg">{showcase.title}</h4>
      <div className="flex flex-col gap-1 mt-1">
        {showcase.date && <p className="text-sm text-muted-foreground">{showcase.date}</p>}
        {showcase.location && <p className="text-sm text-muted-foreground">{showcase.location}</p>}
      </div>
    </CardContent>
  </Card>
);

export default ShowcaseCard;
