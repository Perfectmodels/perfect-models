
import { ModelApplication } from "@/types/modelTypes";
import { UseFormReturn } from "react-hook-form";
import NameFields from "./personal/NameFields";
import ContactFields from "./personal/ContactFields";
import GenderCategoryFields from "./personal/GenderCategoryFields";

export interface PersonalInfoFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const PersonalInfoFields = ({ form }: PersonalInfoFieldsProps) => {
  return (
    <div className="space-y-6">
      <NameFields form={form} />
      <ContactFields form={form} />
      <GenderCategoryFields form={form} />
    </div>
  );
};

export default PersonalInfoFields;
