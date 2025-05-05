
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FileInput } from '@/components/ui/file-input';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';
import { useState } from 'react';

interface PhotosUploadFieldsProps {
  form: UseFormReturn<ModelApplication>;
}

const PhotosUploadFields = ({ form }: PhotosUploadFieldsProps) => {
  const [portraitImages, setPortraitImages] = useState<File[]>([]);
  const [fullBodyImages, setFullBodyImages] = useState<File[]>([]);

  const handlePortraitImagesChange = (files: File[]) => {
    setPortraitImages(files);
    form.setValue('portrait_images', files);
  };

  const handleFullBodyImagesChange = (files: File[]) => {
    setFullBodyImages(files);
    form.setValue('full_body_images', files);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
        <p className="text-amber-800 font-medium">
          Photos de haute qualité recommandées. Format: JPG ou PNG. Taille maximale: 5 MB par image.
        </p>
      </div>

      <FormField
        control={form.control}
        name="portrait_images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Photos portrait (5 maximum)</FormLabel>
            <FormControl>
              <FileInput 
                acceptedTypes="image/jpeg,image/png,image/jpg"
                maxFiles={5}
                onFileChange={handlePortraitImagesChange}
                existingFiles={portraitImages}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="full_body_images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Photos en pied / corps entier (5 maximum)</FormLabel>
            <FormControl>
              <FileInput 
                acceptedTypes="image/jpeg,image/png,image/jpg"
                maxFiles={5}
                onFileChange={handleFullBodyImagesChange}
                existingFiles={fullBodyImages}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PhotosUploadFields;
