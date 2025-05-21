
import { ModelApplication } from "@/types/modelTypes";
import { UseFormReturn } from "react-hook-form";
import NameFields from "./personal/NameFields";
import ContactFields from "./personal/ContactFields";
import GenderCategoryFields from "./personal/GenderCategoryFields";
import DateOfBirthField from "./personal/DateOfBirthField";

export interface PersonalInfoFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const PersonalInfoFields = ({ form }: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-6">
      <NameFields form={form} />
      <ContactFields form={form} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateOfBirthField form={form} />
        <div></div>
      </div>
      <GenderCategoryFields form={form} />
    </div>
  );
};

export default PersonalInfoFields;
