
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadModelApplicationImages = async (
  files: File[],
  type: 'portrait' | 'full_body',
  applicationId: string
): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  const uploadedUrls: string[] = [];

  try {
    for (const file of files) {
      // Créer un nom de fichier unique basé sur le type, ID de candidature et timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${uuidv4()}.${fileExt}`;
      const filePath = `applications/${applicationId}/${fileName}`;

      // Téléverser le fichier vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('model-applications')
        .upload(filePath, file);

      if (error) {
        console.error(`Erreur lors du téléversement de ${file.name}:`, error);
        continue;
      }

      // Obtenir l'URL publique du fichier
      const { data: publicUrlData } = supabase.storage
        .from('model-applications')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl);
        
        // Enregistrer l'image dans la table application_images
        await supabase.from('application_images').insert({
          application_id: applicationId,
          image_url: publicUrlData.publicUrl,
          image_type: type
        });
      }
    }

    return uploadedUrls;
  } catch (error) {
    console.error('Erreur lors du téléversement des images:', error);
    return [];
  }
};
