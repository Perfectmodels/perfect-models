
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import WeightSelector from './weights/WeightSelector';
import InstagramField from './social/InstagramField';
import AvailabilitySelector from './availability/AvailabilitySelector';
import LanguageSelector from './language/LanguageSelector';
import SkillsSelector from './skills/SkillsSelector';
import EventsSelector from './events/EventsSelector';
import ExperienceField from './experience/ExperienceField';

interface AdditionalInfoFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const AdditionalInfoFields = ({ form }: AdditionalInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WeightSelector form={form} />
        <InstagramField form={form} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AvailabilitySelector form={form} />
        <LanguageSelector form={form} />
        <SkillsSelector form={form} />
      </div>

      <EventsSelector form={form} />
      <ExperienceField form={form} />
    </>
  );
};

export default AdditionalInfoFields;
