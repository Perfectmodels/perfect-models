import React from 'react';
import { Service } from '@/types/modelTypes';
interface ServicesListProps {
  services: Service[];
}
const ServicesList: React.FC<ServicesListProps> = ({
  services
}) => {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map(service => <div key={service.id} className="bg-white shadow-md rounded-md overflow-hidden">
          <div className="h-48 overflow-hidden">
            <img src={service.image || "https://via.placeholder.com/600x400?text=Service"} alt={service.name} className="w-full h-full object-scale-down" />
          </div>
          <div className="p-4">
            <h3 className="font-playfair text-xl mb-2">{service.name}</h3>
            <p className="text-gray-700">{service.description}</p>
          </div>
        </div>)}
    </div>;
};
export default ServicesList;