
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryTheme {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

export interface GalleryImage {
  id: string;
  theme_id: string;
  src: string;
  alt: string | null;
  sequence: number | null;
}

export const useGalleryData = () => {
  return useQuery({
    queryKey: ["gallery-themes"],
    queryFn: async () => {
      try {
        const { data: themes, error: themesError } = await supabase
          .from("gallery_themes")
          .select("*")
          .order("created_at");

        if (themesError) {
          console.error("Erreur lors du chargement des thèmes:", themesError);
          throw themesError;
        }

        const { data: images, error: imagesError } = await supabase
          .from("gallery_images")
          .select("*")
          .order("sequence", { ascending: true });

        if (imagesError) {
          console.error("Erreur lors du chargement des images:", imagesError);
          throw imagesError;
        }

        // Vérification complète de chaque URL d'image
        const validImages = images ? images.map((img: any) => {
          // Valider l'URL de l'image
          let imageSrc = img.src;
          
          // Si l'URL n'est pas valide ou ne commence pas par http/https, on peut ajouter une valeur par défaut
          if (!imageSrc || (!imageSrc.startsWith('http://') && !imageSrc.startsWith('https://'))) {
            console.warn(`URL d'image non valide: ${imageSrc}`);
            // On pourrait remplacer par une image par défaut ici si nécessaire
            // imageSrc = '/placeholder.svg';
          }

          return {
            ...img,
            src: imageSrc
          };
        }) : [];

        console.log("Thèmes chargés:", themes);
        console.log("Images chargées:", validImages);

        return {
          themes: themes as GalleryTheme[],
          images: validImages as GalleryImage[],
        };
      } catch (error) {
        console.error("Erreur lors du chargement de la galerie:", error);
        // Retourner des données vides en cas d'erreur
        return {
          themes: [] as GalleryTheme[],
          images: [] as GalleryImage[],
        };
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
