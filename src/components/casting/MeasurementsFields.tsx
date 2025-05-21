
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import AgeHeightFields from './measurements/AgeHeightFields';
import BodyMeasurements from './measurements/BodyMeasurements';
import AppearanceFields from './measurements/AppearanceFields';

interface MeasurementsFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const MeasurementsFields = ({ form }: MeasurementsFieldsProps) => {
  return (
    <div className="space-y-6">
      <AgeHeightFields form={form} />
      <BodyMeasurements form={form} />
      <AppearanceFields form={form} />
    </div>
  );
};

export default MeasurementsFields;
