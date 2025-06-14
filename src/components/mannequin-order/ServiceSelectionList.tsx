
import React from 'react';
import { ServiceTarif } from '@/types/mannequinOrder';
import { serviceTarifs } from '@/data/serviceTarifs';
import ServiceCard from '@/components/mannequin-order/ServiceCard';

interface ServiceSelectionListProps {
  selectedService: ServiceTarif | null;
  onServiceSelect: (service: ServiceTarif) => void;
}

const serviceCategories = [
    { key: 'shooting', title: '📸 Shooting Photo' },
    { key: 'defile', title: '👗 Défilé de Mode' },
    { key: 'evenement', title: '🎉 Événements' },
    { key: 'publicite', title: '📺 Publicité' },
];

const getServicesByCategory = (category: string) => {
    return serviceTarifs.filter(service => service.category === category);
};

const ServiceSelectionList = ({ selectedService, onServiceSelect }: ServiceSelectionListProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-model-white mb-6">Nos Services</h2>
      
      {serviceCategories.map(category => (
          <div key={category.key}>
            <h3 className="text-lg font-semibold text-model-gold mb-3">{category.title}</h3>
            <div className="space-y-3">
              {getServicesByCategory(category.key).map(service => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  isSelected={selectedService?.id === service.id}
                  onSelect={() => onServiceSelect(service)}
                />
              ))}
            </div>
          </div>
      ))}
    </div>
  );
};

export default ServiceSelectionList;
