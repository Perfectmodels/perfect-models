
import React from 'react';
import { ServiceTarif } from '@/types/mannequinOrder';

interface PricingInfoProps {
  selectedService: ServiceTarif | null;
  selectedModelsCount: number;
  eventDate: string;
  calculateTotal: () => number;
}

const PricingInfo = ({ selectedService, selectedModelsCount, eventDate, calculateTotal }: PricingInfoProps) => {
  if (!selectedService) return null;

  const total = calculateTotal();
  const originalPrice = selectedService.basePrice * Math.max(1, selectedModelsCount);
  const hasDiscount = total < originalPrice;

  return (
    <div className="bg-model-gold/10 border border-model-gold/30 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-model-black mb-2">Service sélectionné:</h3>
      <p className="text-model-black">{selectedService.name}</p>
      <p className="text-sm text-gray-600">{selectedService.description}</p>
      <div className="mt-2">
        <span className="text-lg font-bold text-model-gold">
          {total.toLocaleString('fr-FR')} FCFA
        </span>
        {hasDiscount && (
          <span className="ml-2 text-sm line-through text-gray-500">
            {originalPrice.toLocaleString('fr-FR')} FCFA
          </span>
        )}
      </div>
      {selectedModelsCount > 0 && (
        <div className="mt-2">
          <span className="text-sm text-gray-600">
            {selectedModelsCount} mannequin(s) sélectionné(s)
          </span>
        </div>
      )}
    </div>
  );
};

export default PricingInfo;
