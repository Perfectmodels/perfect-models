
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { ServiceTarif } from '@/types/mannequinOrder';

interface ServiceCardProps {
  service: ServiceTarif;
  isSelected: boolean;
  onSelect: () => void;
}

const ServiceCard = ({ service, isSelected, onSelect }: ServiceCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-model-gold bg-model-gold/5' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          {service.recommended && (
            <Badge className="bg-model-gold text-model-black">
              <Star className="w-3 h-3 mr-1" />
              Recommandé
            </Badge>
          )}
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-model-gold">
            {service.basePrice.toLocaleString('fr-FR')} FCFA
          </span>
          <span className="text-sm text-gray-500">{service.duration}</span>
        </div>
        <div className="space-y-1">
          {service.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-3 h-3 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
