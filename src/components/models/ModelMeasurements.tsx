
import { Ruler } from 'lucide-react';
import { DetailedModel } from '@/types/modelTypes';

interface ModelMeasurementsProps {
  model: DetailedModel;
}

const ModelMeasurements = ({ model }: ModelMeasurementsProps) => {
  const { measurements, gender } = model;

  if (!measurements) return null;

  const measurementItems = [
    { label: 'Taille', value: measurements.height, unit: 'cm' },
    { label: 'Épaules', value: measurements.shoulder, unit: 'cm' },
    { label: 'Poitrine', value: measurements.bust, unit: 'cm' },
    { label: 'Tour de taille', value: measurements.waist, unit: 'cm' },
    { label: 'Tour de hanches', value: measurements.hips, unit: 'cm' },
    { label: 'Pointure', value: measurements.shoe_size, unit: '' },
    { label: 'Couleur des yeux', value: measurements.eye_color, unit: '' },
    { label: 'Couleur des cheveux', value: measurements.hair_color, unit: '' },
  ];

  if (gender === 'men') {
    measurementItems.push(
      { label: 'Tour de manche', value: measurements.sleeve, unit: 'cm' },
      { label: 'Longueur de manche', value: measurements.sleeve_length, unit: 'cm' },
      { label: 'Tour de cuisse', value: measurements.thigh, unit: 'cm' },
      { label: 'Longueur de pantalon', value: measurements.pants_length, unit: 'cm' },
      { label: 'Taille de confection', value: measurements.size, unit: '' }
    );
  }

  const availableMeasurements = measurementItems.filter(
    (item) => item.value !== undefined && item.value !== null && item.value !== ''
  );

  if (availableMeasurements.length === 0) return null;

  return (
    <div>
      <div className="flex items-center mb-4">
        <Ruler className="mr-2 text-model-gold" />
        <h2 className="text-2xl font-playfair">Mensurations</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {availableMeasurements.map(item => (
          <div key={item.label}>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="font-medium">{item.value}{item.unit && ` ${item.unit}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelMeasurements;
