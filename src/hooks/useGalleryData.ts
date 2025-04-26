
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
      const { data: themes, error: themesError } = await supabase
        .from("gallery_themes")
        .select("*")
        .order("created_at");

      if (themesError) throw themesError;

      const { data: images, error: imagesError } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sequence", { ascending: true });

      if (imagesError) throw imagesError;

      // Validez que les images ont des URLs valides
      const validImages = images.map(img => ({
        ...img,
        src: img.src && img.src.startsWith('http') ? img.src : `https://i.ibb.co/${img.src.split('/').pop()}`
      }));

      return {
        themes: themes as GalleryTheme[],
        images: validImages as GalleryImage[],
      };
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
