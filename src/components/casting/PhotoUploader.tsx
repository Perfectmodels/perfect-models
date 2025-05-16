
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { ModelApplication } from '@/types/modelTypes';

interface PhotoUploaderProps {
  form: UseFormReturn<ModelApplication>;
}

const PhotoUploader = ({ form }: PhotoUploaderProps) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newPreviews: string[] = [];
    const uploadedImages: string[] = [];

    Array.from(files).forEach(file => {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);

      // Convert to base64 for WhatsApp
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const base64String = e.target.result.toString();
          uploadedImages.push(base64String);
          
          // Update form value when all files are processed
          if (uploadedImages.length === files.length) {
            const currentImages = form.getValues('portfolio_images') || [];
            form.setValue('portfolio_images', [...currentImages, ...uploadedImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Update previews
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);

    const currentImages = form.getValues('portfolio_images') || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue('portfolio_images', newImages);
  };

  return (
    <FormField
      control={form.control}
      name="portfolio_images"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Photos de portfolio (optionnel, max 3 photos)</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Upload button */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex gap-2"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={previews.length >= 3}
                >
                  <Upload size={18} />
                  Ajouter des photos
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={previews.length >= 3}
                />
                <span className="text-sm text-gray-500">
                  {previews.length}/3 photos
                </span>
              </div>
              
              {/* Preview area */}
              {previews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Empty state */}
              {previews.length === 0 && (
                <div className="border border-dashed rounded-md p-8 text-center text-gray-500">
                  <div className="flex justify-center">
                    <ImageIcon className="h-12 w-12 opacity-30" />
                  </div>
                  <p className="mt-2">Aucune photo téléchargée</p>
                  <p className="text-sm">Formats acceptés: JPG, PNG (max 5MB par photo)</p>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PhotoUploader;
